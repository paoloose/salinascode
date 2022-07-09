import { tokenized_line, variable_info, ast_object, literal, identifier, statement_block } from "./types.ts";
import { isNativeType, isControlStatement, initialValueFromType } from "./builtinsHelpers.ts";

export function parser(lines: Array<tokenized_line>) {

    let currentLine = 0;

    function walkLine(): Array<ast_object> {
    
        let tokensLine = lines[currentLine];
        let currentToken = 0;
        const parsedLine: Array<ast_object> = Array<ast_object>();
        console.log("Walking LINE with line:", lines[currentLine], "and token:", tokensLine[currentToken], currentLine, currentToken, "\n");
    
        function walkToken() : ast_object {
            tokensLine = lines[currentLine];
            let token = tokensLine[currentToken];
            
            if (token.type === "number") {
                currentToken++;
                return {
                    type: "NumberLiteral",
                    value: Number(token.value)
                } as literal;
            }
            if (token.type === "string") {
                currentToken++;
                return {
                    type: "StringLiteral",
                    value: token.value
                } as literal;
            }
            // Check for variable or fuction call
            if (token.type === "identifier") {
    
                if (isControlStatement(token.value)) {
                    if (token.value === "SI") {
                        currentToken++; // Skip SI to get the condition
                        // if no condition exist, this will trhow an error
                        const ifCondition = walkToken();
                        currentLine++;  // Skip the line with the condition
                        let endOnTrueBlock = false;
                        const statementNode = {
                            type: "IfStatement",
                            condition: ifCondition,
                            onTrueBody: {
                                type: "StatementBlock",
                                statements: Array<Array<ast_object>>()
                            } as statement_block,
                            // on false block with type StatementBlock with optional statements
                            onFalseBody: {
                                type: "StatementBlock",
                                statements: Array<Array<ast_object>>()
                            } as statement_block
                        };
                        while (lines[currentLine][0].value !== "FIN_SI") {
                            if (lines[currentLine][0].value === "SINO") {
                                endOnTrueBlock = true;
                                currentLine++;
                            }
                            else if (endOnTrueBlock) {
                                statementNode.onFalseBody.statements.push(walkLine());
                            }
                            else {
                                statementNode.onTrueBody.statements.push(walkLine());
                            }
                            tokensLine = lines[currentLine];
                        }
                        currentLine++; // Skip the FIN_SI
                        currentToken = tokensLine.length;
                        return statementNode;
                    }
                    else if (token.value === "MIENTRAS") {
                        currentToken++; // Skip MIENTRAS to get the condition
                        console.log("Walking the condition:\n");
                        const condition = walkToken();
                        currentLine++;  // Skip the statement 
                        currentToken = 0; // Reset the token position
                        console.log("Pushing condition:", condition, "\n");
                        const statementNode = {
                            type: "WhileStatement",
                            condition: condition,
                            body: {
                                type: "StatementBlock",
                                statements: Array<Array<ast_object>>()
                            } as statement_block,
                        };
                        while (lines[currentLine][0].value !== "FIN_MIENTRAS") {
                            statementNode.body.statements.push(walkLine());
                        }
                        currentLine++;

                        return statementNode;
                    }
                    else if (token.value === "HACER") {
                        const statementNode = {
                            type: "DoWhileStatement",
                            condition: {} as ast_object,
                            body: {
                                type: "StatementBlock",
                                statements: Array<Array<ast_object>>()
                            } as statement_block,
                        };
                        currentLine++;  // Skip the HACER line
                        while (lines[currentLine][0].value !== "MIENTRAS") {
                            statementNode.body.statements.push(walkLine());
                        }
                        /// Now in the line with the condition
                        currentToken = 1; // Update tokenIndex to point to the condition
                        statementNode.condition = walkToken();
                        currentLine++; // Skip the MIENTRAS line
                        return statementNode;
                    }
                }
                if (isNativeType(token.value)) {
    
                    const variableType = token.value;
                    const initialValue = initialValueFromType(variableType);
    
                    const node = {
                        type: "VariableDefinitions",
                        variableType: variableType,
                        definitions: Array<variable_info>()
                    }
                    currentToken++;
                    while (currentToken < tokensLine.length) {
    
                        token = tokensLine[currentToken];

                        if (token.type === "comma") {
                            currentToken++;
                            continue;
                        }
                        else if (token.type === "identifier") {
                            // reading last variable
                            if (currentToken === tokensLine.length - 1) {
                                const variableName = token.value;
                                node.definitions.push({
                                    name: variableName,
                                    value: initialValue
                                } as variable_info);
                                currentToken++;
                                break;
                            }
                            else if (tokensLine[currentToken+1].type === "assignation") {
                                const variableName = token.value;
                                currentToken+=2;
                                node.definitions.push({
                                    name: variableName,
                                    value: walkToken()
                                } as variable_info);
                                currentToken++;
                            }
                            else if (tokensLine[currentToken+1].type === "comma") {
                                node.definitions.push({
                                    name: tokensLine[currentToken].value,
                                    value: initialValue
                                } as variable_info);
                                currentToken++;
                            }
                            else {
                                console.log(`Parsing error: Unexpected token '${tokensLine[currentToken+1].value}' at declaration`)
                                Deno.exit(-1);
                            }
                        }
                        else {
                            console.log(`Parsing error: Unexpected token while declaration: '${token.value}'`);
                            Deno.exit(-1);
                        }
    
                    } // while loop for variable declaration end here
                    currentLine++;
                    return node;
                }
                // Check for function
                else if (tokensLine[currentToken+1]?.value === "(") {
                    const node = {
                        type: "CallExpression",
                        name: token.value,
                        arguments: Array<ast_object>()
                    };
                    token = tokensLine[currentToken+=2]
                    
                    while (token.value !== ")") {
                        node.arguments.push(walkToken());
                    }
                    currentToken++;
                    currentLine++; // Skip function call line
                    return node;
                }
                else {
                    currentToken++;
                    return {
                        type: "Identifier",
                        name: token.value
                    } as identifier;
                }
            }
            if (token.type === "paren" && token.value === "(") {
                
                console.log("Parsing parenthesis");
                const node = {
                    type: "ParenExpressionGroup",
                    arguments: Array<ast_object>()
                };
                token = tokensLine[++currentToken];
                while (token.value !== ")") {
                    node.arguments.push(walkToken());
                    token = tokensLine[currentToken];
                }
                currentToken++;
                console.log("Closing parenthesis");
                return node;
            }
            if (token.type === "operator") {
                currentToken++;
                return {
                    type: "Operator",
                    value: token.value
                } as literal; // TODO: parse operators as function calls
            }
            if (token.type === "comma") {
                currentToken++;
                return walkToken();
            }

            throw TypeError(`Parser: unknown token type: ${token.type} -> ${token.value}`);
        }
    
        while (currentToken < tokensLine.length) {
            parsedLine.push(walkToken());
        }
        console.log("Exiting from line", currentLine, "and returning", parsedLine);
        return parsedLine;
    }

    const ast = {
        type: "Program",
        name: Deno.args[0],
        body: {
            type: "StatementBlock",
            statements: Array<Array<ast_object>>()
        } as statement_block
    }

    while (currentLine < lines.length) {
        ast.body.statements.push(walkLine());
        console.log("💀 Current line: ", currentLine, "of", lines.length, "\n");
    }
    return ast;
}

