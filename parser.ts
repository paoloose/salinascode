import { tokenized_line, variable, ast_object } from "./types.ts";
import { isNativeType, isControlStructure, initialValueFromType } from "./builtinsHelpers.ts";

export function parser(tokens: Array<tokenized_line>) {
    const ast = {
        type: "Program",
        body: Array<Array<ast_object>>()
    }
    for (const line of tokens) {
        ast.body.push(parseLine(line));
    }
    return ast;
}

function parseLine(tokens: tokenized_line) {

    let current = 0;
    const parsedLine: Array<ast_object> = Array<ast_object>();

    function walk() : ast_object {
        let token = tokens[current];

        if (token.type === "number") {
            current++;
            return {
                type: "NumberLiteral",
                value: Number(token.value)
            };
        }
        if (token.type === "string") {
            current++;
            return {
                type: "StringLiteral",
                value: token.value
            };
        }
        // Check for variable or fuction call
        if (token.type === "identifier") {

            if (isControlStructure(token.value)) {
                if (token.value === "SI") {
                    current++;
                    const nodeStruct = {
                        type: "IfStatement",
                        condition: walk(),

                    }
                    return nodeStruct;
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
                current++;
                while (current < tokens.length) {

                    token = tokens[current];
                    // variable name
                    if (token.type === "comma") {
                        current++;
                        continue;
                    }
                    else if (token.type === "identifier") {
                        // last variable
                        if (current === tokens.length - 1) {
                            const variableName = token.value;
                            node.definitions.push({
                                name: variableName,
                                value: initialValue
                            });
                            current++;
                            break;
                        }
                        else if (tokens[current+1].type === "assignation") {
                            const variableName = token.value;
                            current+=2;
                            node.definitions.push({
                                name: variableName,
                                value: walk()
                            });
                            current++;
                        }
                        else if (tokens[current+1].type === "comma") {
                            node.definitions.push({
                                name: tokens[current].value,
                                value: initialValue
                            });
                            current++;
                        }
                        else {
                            console.log(`Parsing error: Unexpected token '${tokens[current+1].value}' at declaration`)
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
            else if (tokens[current+1]?.value === "(") {

                const node = {
                    type: "CallExpression",
                    name: token.value,
                    arguments: Array<ast_object>()
                };
                token = tokens[current+=2]
                
                while (token.value !== ")") {
                    node.arguments.push(walk());
                    token = tokens[current];
                }
                current++;
                return node;
            }
            else {
                current++;
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
            token = tokens[++current];
            while (token.value !== ")") {
                node.arguments.push(walk());
                token = tokens[current];
            }
            current++;
            return node;
        }
        if (token.type === "operator") {
            current++;
            return {
                type: "BinaryOperator",
                value: token.value
            };
        }
        if (token.type === "comma") {
            current++;
            return walk();
        }
        if (token.type === "assignation") {
            current++;
            return {
                type: "Assignation",
                value: token.value
            };
        }

        throw TypeError(`Parser: unknown token type: ${token.type} = ${token.value}`);
    }

    while (current < tokens.length) {
        parsedLine.push(walk());
    }
    return parsedLine;
}
