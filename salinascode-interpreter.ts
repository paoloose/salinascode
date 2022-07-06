
async function readSourceLines(fileName: string) {

    try {
        const sourceContent = await Deno.readTextFile(fileName);
        return sourceContent.split("\n");
        
    } catch {
        console.log(`Salinascode: error: '${fileName}' no encontrado`);
        console.log("  Esta seguro de que existe el artokenivo?... JOVEN?\n");
        console.log("Uso correcto: salinascode <filename>.salinas\n");
        Deno.exit(-1);
    }
}

interface token_object {
    type: string;
    value: string;
}

function tokenizer(line: string) {
    const tokens = Array<token_object>();
    console.log(`\nTokenizing: ${line}, ${line.length}`);

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
            console.log("(");
            continue;
        }
        if (token == ')') {
            tokens.push({type: "paren", value: ")"});
            current++;
            console.log(")");
            continue;
        }
        if (token == '+') {
            tokens.push({type: "operator", value: "+"});
            current++;
            console.log("operator+");
            continue;
        }
        if (token == '-') {
            tokens.push({type: "operator", value: "-"});
            console.log("operator-");
            current++;
            continue;
        }
        if (token == ',') {
            tokens.push({type: "comma", value: ","});
            console.log(",");
            current++;
            continue;
        }
        if (token == '←') {
            tokens.push({type: "assignation", value: "←"});
            console.log("←");
            current++;
            continue;
        }
        if (token == '"' || token == '“' || token == '”') {
            let str = "";
            while (line[++current] != '"' && line[current] != '”' && line[current] != '“') {
                str += line[current];
            }
            console.log(`string: ${str}`);
            tokens.push({type: "string", value: str});
            current++;
            continue;
        }
        if (isNumber(token)) {
            let num = "";
            do {
                num += line[current];
                current++;
            } while (isNumber(line[current]));
            console.log(`number: ${num}`);
            tokens.push({type: "number", value: num});
            continue;
        }
        if (isAlpha(token)) {
            let identifierName = "";
            do {
                identifierName += line[current];
                current++;
            } while (isAlpha(line[current]) || isNumber(line[current]));
            console.log("identifier: ", identifierName);
            tokens.push({type: "identifier", value: identifierName});
            continue;
        }

        console.log(`unknown token: ${token}`);
        current++;
    }
}


async function main() {

    if (Deno.args.length === 0) {
        console.log("Salinascode: error: Artokenivo sin nombre\n");
        console.log("  Falta nombre de artokenivo. No sabe leer?\n");
        console.log("Uso correcto: salinascode <filename>.salinas\n");
        Deno.exit(-1);
    }

    const fileName = Deno.args[0];

    for (const line of await readSourceLines(fileName) || []) {
        tokenizer(line);
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
