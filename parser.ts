import { tokenized_line, variable, ast_object, statement_block } from "./types.ts";
import { isNativeType, isControlStatement, initialValueFromType } from "./builtinsHelpers.ts";

export function parser(lines: Array<tokenized_line>) {

    let currentLine = 0;

    function walkLine() {
    
        const tokensLine = lines[currentLine];
        let currentToken = 0;
        const parsedLine: Array<ast_object> = Array<ast_object>();
    
        function walkToken() : ast_object {
            let token = tokensLine[currentToken];
    
            if (token.type === "number") {
                currentToken++;
                return {
                    type: "NumberLiteral",
                    value: Number(token.value)
                };
            }
            if (token.type === "string") {
                currentToken++;
                return {
                    type: "StringLiteral",
                    value: token.value
                };
            }
            // Check for variable or fuction call
            if (token.type === "identifier") {
    
                if (isControlStatement(token.value)) {
                    if (token.value === "SI") {
                        currentToken++; // Skip SI to get the condition
                        currentLine++;  // Skip the line with the condition
                        let endOnTrueBlock = false;
                        const statementNode = {
                            type: "IfStatement",
                            condition: walkToken(),
                            onTrue: {
                                type: "StatementBlock",
                                statements: Array<Array<ast_object>>()
                            } as statement_block,
                            // on false block with type StatementBlock with optional statements
                            onFalse: {
                                type: "StatementBlock",
                                statements: Array<Array<ast_object>>()
                            } as statement_block
                        };
                        while (lines[currentLine][0].value !== "FIN_SI") {
                            if (lines[currentLine][0].value === "SINO") {
                                endOnTrueBlock = true;
                                currentLine++;
                            }
                            if (endOnTrueBlock) {
                                statementNode.onFalse.statements.push(walkLine());
                            }
                            else {
                                statementNode.onTrue.statements.push(walkLine());
                            }
                            currentLine++;
                        }
                        return statementNode;
                    }
                }
                if (isNativeType(token.value)) {
    
                    const variableType = token.value;
                    const initialValue = initialValueFromType(variableType);
    
                    const node = {
                        type: "VariableDefinitions",
                        variableType: variableType,
                        definitions: Array<variable>()
                    }
                    currentToken++;
                    while (currentToken < tokensLine.length) {
    
                        token = tokensLine[currentToken];
                        // variable name
                        if (token.type === "comma") {
                            currentToken++;
                            continue;
                        }
                        else if (token.type === "identifier") {
                            // last variable
                            if (currentToken === tokensLine.length - 1) {
                                const variableName = token.value;
                                node.definitions.push({
                                    name: variableName,
                                    value: initialValue
                                });
                                currentToken++;
                                break;
                            }
                            else if (tokensLine[currentToken+1].type === "assignation") {
                                const variableName = token.value;
                                currentToken+=2;
                                node.definitions.push({
                                    name: variableName,
                                    value: walkToken()
                                });
                                currentToken++;
                            }
                            else if (tokensLine[currentToken+1].type === "comma") {
                                node.definitions.push({
                                    name: tokensLine[currentToken].value,
                                    value: initialValue
                                });
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
                        token = tokensLine[currentToken];
                    }
                    currentToken++;
                    return node;
                }
                else {
                    currentToken++;
                    return {
                        type: "Identifier",
                        value: token.value
                    };
                }
            }
            if (token.type === "paren" && token.value === "(") {
    
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
                return node;
            }
            if (token.type === "operator") {
                currentToken++;
                return {
                    type: "BinaryOperator",
                    value: token.value
                };
            }
            if (token.type === "comma") {
                currentToken++;
                return walkToken();
            }
            if (token.type === "assignation") {
                currentToken++;
                return {
                    type: "Assignation",
                    value: token.value
                };
            }
    
            throw TypeError(`Parser: unknown token type: ${token.type} = ${token.value}`);
        }
    
        while (currentToken < tokensLine.length) {
            parsedLine.push(walkToken());
        }
        console.log("Walking line and returning", parsedLine);
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
        currentLine++;
    }
    return ast;
}

