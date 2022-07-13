import { tokenized_line, variable_info, ast_object, literal, identifier, statement_block, ast } from "./types.ts";
import { isNativeType, isControlStatement, initialValueFromType } from "./builtinsHelpers.ts";

export function parser(lines: Array<tokenized_line>): ast {

    let currentLine = 0;

    function walkLine(): Array<ast_object> {
    
        let tokensLine = lines[currentLine];
        let currentToken = 0;
        const parsedLine: Array<ast_object> = Array<ast_object>();
        console.log(" Calling walkLine() to line", currentLine+1, ":", lines[currentLine], "at token:", currentToken, "\n");
    
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
            else if (token.type === "string") {
                currentToken++;
                console.log("Found string:", token.value);
                return {
                    type: "StringLiteral",
                    value: token.value
                } as literal;
            }
            else if (token.type === "keyword") {
                if (token.value === "VERDADERO" || token.value === "FALSO") {
                    currentToken++;
                    return {
                        type: "BooleanLiteral",
                        value: (token.value === "VERDADERO") ? true : false
                    } as literal;
                }
                else if (isControlStatement(token.value)) {
                    if (token.value === "SI") {
                        currentToken++; // Skip SI to get the condition
                        // if no condition exist, this will trhow an error
                        const ifCondition = walkToken();
                        currentLine++; // Skip the SI line
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
                        currentToken = tokensLine.length;
                        return statementNode;
                    }
                    else if (token.value === "MIENTRAS") {
                        currentToken++; // Skip MIENTRAS to get the condition
                        console.log("Walking the condition:\n");
                        const condition = walkToken();
                        // currentToken = 0; // Reset the token position
                        console.log("Pushing condition:", condition, currentToken, "\n");
                        currentLine++; // Skip the MIENTRAS line
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
                        console.log("Pushing while statement:", statementNode, "with line", currentLine, "\n");
    
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
                        return statementNode;
                    }
                }
                else if (isNativeType(token.value)) {
    
                    const variableType = token.value;
                    const initialValue = initialValueFromType(variableType);
    
                    const node = {
                        type: "VariableDefinitions",
                        variableType: variableType,
                        definitions: Array<variable_info>()
                    }
                    currentToken++; // Skip the type
                    while (currentToken < tokensLine.length) {
                        token = tokensLine[currentToken];
    
                        if (token.type === "comma") {
                            currentToken++;
                            continue;
                        }
                        else if (token.type === "identifier") {
                            // reading last variable
                            if (currentToken === tokensLine.length-1) {
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
                                // currentToken++; 🫂 🫂 🫂 🫂 
                            }
                            else if (tokensLine[currentToken+1].type === "comma") {
                                node.definitions.push({
                                    name: tokensLine[currentToken].value,
                                    value: initialValue
                                } as variable_info);
                                currentToken++;
                            }
                            else {
                                console.log(`Parsing error: Unexpected token '${tokensLine[currentToken+1].value}' at declaration in line`, currentLine+1);
                                Deno.exit(-1);
                            }
                        }
                        else {
                            console.log(`Parsing error: Unexpected token while declaration: '${tokensLine[currentToken].value} at line `, currentLine+1);
                            Deno.exit(-1);
                        }
                    } // while loop for variable declaration end here
                    //currentLine++;
                    return node;
                }
            }

            // Check for variable or fuction call
            else if (token.type === "identifier") {

                // Check for function call
                if (tokensLine[currentToken+1]?.value === "(") {
                    const node = {
                        type: "CallExpression",
                        name: token.value,
                        arguments: Array<ast_object>()
                    };
                    token = tokensLine[currentToken+=2];

                    console.log("Looping arguments:", token ,"\n");
                    
                    while (tokensLine[currentToken].value !== ")") {
                        node.arguments.push(walkToken());
                    }
                    currentToken++;
                    return node;
                }
                else {
                    currentToken++;
                    return {
                        type: "UserDefinedVariable",
                        name: token.value
                    } as identifier;
                }
            }
            else if (token.type === "paren" && token.value === "(") {
                
                console.log("Parsing parenthesis");
                const node = {
                    type: "ParenExpressionGroup",
                    arguments: Array<ast_object>()
                };
                token = tokensLine[++currentToken];
                while (tokensLine[currentToken].value !== ")") {
                    node.arguments.push(walkToken());
                }
                console.log(`Closing parenthesis on token ${currentToken+1} of ${tokensLine.length} (line ${currentLine})`);
                currentToken++;
                return node;
            }
            else if (token.type === "operator") {
                currentToken++;
                return {
                    type: "Operator",
                    value: token.value
                } as literal; // TODO: parse operators as function calls
            }
            else if (token.type === "comma") {
                currentToken++;
                return walkToken();
            }

            throw TypeError(`Parser: unknown token type: ${token.type} -> '${token.value}' at line ${currentLine+1}`);
        }
    
        while (currentToken < tokensLine.length) {
            console.log("🫂 Walking to token:", currentToken+1, "of", tokensLine.length, `(line ${currentLine+1})` , "\n");
            const walkedToken = walkToken();
            console.log("👍️ Walked token until token", currentToken+1 , `(line ${currentLine+1})\n`);
            parsedLine.push(walkedToken);
        }
        console.log("Exiting from line", currentLine+1, "and returning", parsedLine);
        currentLine++;
        return parsedLine;
    }

    const ast = {
        type: "Program",
        name: Deno.args[0],
        body: {
            type: "StatementBlock",
            statements: Array<Array<ast_object>>()
        } as statement_block
    } as ast;

    while (currentLine < lines.length) {
        console.log("💀 Walking to line:", currentLine+1, "of", lines.length, "\n");
        ast.body.statements.push(walkLine());
        console.log("🦴 Walked line until line", currentLine+1, "\n");
    }
    return ast;
}

