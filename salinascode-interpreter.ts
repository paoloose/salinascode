
async function readSourceLines(fileName: string) {

    try {
        const sourceContent = await Deno.readTextFile(fileName);
        return sourceContent.split("\n");
        
    } catch {
        console.log(`Salinascode: error: '${fileName}' no encontrado`);
        console.log("  Esta seguro de que existe el archivo?... JOVEN?\n");
        console.log("Uso correcto: salinascode <filename>.salinas\n");
        Deno.exit(-1);
    }
}

interface token {
    type: string;
    value: string;
}

function tokenizer(line: string) {
    const tokens = Array<token>();

    let current = 0;
    while (current < line.length) {

        const token = line[current];

        if (token == ' ') {
            current++;
            continue;
        }
        if (token == '(') {
            tokens.push({type: "paren", value: "("});
            current++;
            continue;
        }
        if (token == ')') {
            tokens.push({type: "paren", value: ")"});
            current++;
            continue;
        }
        if (token == '+') {
            tokens.push({type: "operator", value: "+"});
            current++;
            continue;
        }
        if (token == '-') {
            tokens.push({type: "operator", value: "-"});
            current++;
            continue;
        }
        if (token == ',') {
            tokens.push({type: "comma", value: ","});
            current++;
            continue;
        }
        if (token == '←') {
            tokens.push({type: "assignation", value: "←"});
            current++;
            continue;
        }
        if (token == '"' || token == '“' || token == '”') {
            let str = "";
            while (line[++current] != '"' && line[current] != '”' && line[current] != '“') {
                str += line[current];
            }
            tokens.push({type: "string", value: str});
            current++;
            continue;
        }
        if (isAlpha(token)) {
            let identifierName = "";
            do {
                identifierName += line[current];
                current++;
            } while (isAlpha(line[current]) || isNumber(line[current]));
            tokens.push({type: "identifier", value: identifierName});
            continue;
        }
        if (isNumber(token)) {
            let num = "";
            do {
                num += line[current];
                current++;
            } while (isNumber(line[current]));
            tokens.push({type: "number", value: num});
            continue;
        }

        console.log(`unknown token: ${token}`);
        current++;
    }
    return tokens;
}

interface ast_object {
    type: string;
    value?: string | number;
    arguments?: Array<ast_object>;
}

function parser(tokens: Array<token>) {

    let current = 0;
    const nodesTree = Array<ast_object>();

    function walk() : ast_object {
        let token = tokens[current];

        if (token.type == "number") {
            current++;
            return {
                type: "NumberLiteral",
                value: Number(token.value)
            };
        }
        if (token.type == "string") {
            current++;
            return {
                type: "StringLiteral",
                value: token.value
            };
        }
        // Check for variable or fuction call
        if (token.type == "identifier") {
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
        if (token.type == "operator") {
            current++;
            return {
                type: "BinaryOperator",
                value: token.value
            };
        }
        if (token.type == "comma") {
            current++;
            return walk();
        }
        if (token.type == "assignation") {
            current++;
            return {
                type: "Assignation",
                value: token.value
            };
        }

        throw TypeError(`Parser: unknown token type: ${token.type} = ${token.value}`);
    }

    while (current < tokens.length) {
        nodesTree.push(walk());
    }
    return nodesTree;
}


async function main() {

    if (Deno.args.length === 0) {
        console.log("Salinascode: error: Archivo sin nombre\n");
        console.log("  Falta nombre de archivo. No sabe leer?\n");
        console.log("Uso correcto: salinascode <filename>.salinas\n");
        Deno.exit(-1);
    }

    const fileName = Deno.args[0];

    for (const line of await readSourceLines(fileName) || []) {
        if (line.trim().length > 0) {
            console.log(`\nLine: ${line}`);

            console.log("\nTokenizing:");
            const tokens = tokenizer(line);
            console.log(tokens);

            console.log("\nParsing to AST:");
            const ast = parser(tokens);
            console.log(JSON.stringify(ast, null, 2));

            console.log("\n--------------------------------------------");
        }
    }

    Deno.exit(0);
}


function isNumber(token: string) {
    return (token >= '0' && token <= '9');
}

function isAlpha(token: string) {
    return (token >= 'a' && token <= 'z') || (token >= 'A' && token <= 'Z' || token == '_');
}

main();
