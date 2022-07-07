import { token, ast_object } from "./types.ts";

export function parser(tokens: Array<token>) {

    let current = 0;
    const ast = {
        type: "Program",
        body: Array<ast_object>()
    }

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
            if (tokens[current+1]?.value === "(") {

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
        ast.body.push(walk());
    }
    return ast;
}
