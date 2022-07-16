import { token } from "./types.ts";
import { isKeyword} from "./builtinsHelpers.ts";

function isNumber(token: string) {
    return (token >= '0' && token <= '9');
}

function isValidVariableName(name: string) {
    return /^\p{L}|_/gu.test(name);
}

function isAlpha(token: string) {
    return /\p{L}|_/u.test(token); // unicode set
}

export function tokenizer(lines: Array<string>) {
    const tokens = Array<Array<token>>();
    for (const line of lines) {
        if (line.trim().length > 0) {
            const tokenizedLine = tokenize(line);
            if (tokenizedLine.length !== 0) {
                tokens.push(tokenizedLine);
            }

        }
    }
    return tokens;
}

function tokenize(line: string): Array<token> {
    const tokens = Array<token>();

    let currentChar = 0;
    while (currentChar < line.length) {

        const token = line[currentChar];

        if (token === ' ') {
            currentChar++;
            continue;
        }
        else if (token === '(') {
            tokens.push({type: "paren", value: "("});
            currentChar++;
            continue;
        }
        else if (token === ')') {
            tokens.push({type: "paren", value: ")"});
            currentChar++;
            continue;
        }
        else if (token === '+') {
            tokens.push({type: "operator", value: "+"});
            currentChar++;
            continue;
        }
        else if (token === '-') {
            tokens.push({type: "operator", value: "-"});
            currentChar++;
            continue;
        }
        else if (token === '/') {
            if (line[currentChar + 1] === '/') {
                // Found a comment, skipping the rest of the line
                break;
            }
            else {
                tokens.push({type: "operator", value: "/"});
                currentChar++;
                continue;
            }
        }
        else if (token === ',') {
            tokens.push({type: "comma", value: ","});
            currentChar++;
            continue;
        }
        else if (token === '←') {
            tokens.push({type: "assignation", value: "←"});
            currentChar++;
            continue;
        }
        else if (token === '"' || token === '“' || token === '”') {
            let str = "";
            while (line[++currentChar] != '"' && line[currentChar] != '”' && line[currentChar] != '“') {
                str += line[currentChar];
            }
            tokens.push({type: "string", value: str});
            currentChar++;
            continue;
        }
        // /\p{L}|_/u
        else if (isAlpha(token)) {
            let identifierName = "";
            do {
                identifierName += line[currentChar];
                currentChar++;
            } while ((isAlpha(line[currentChar]) || isNumber(line[currentChar]))
                    && currentChar <  line.length);

            if (isKeyword(identifierName)) {
                tokens.push({type: "keyword", value: identifierName});
            }
            else {
                tokens.push({type: "identifier", value: identifierName});
            }
            continue;
        }
        else if (isNumber(token) || token === ".") {
            let num = "";

            do {
                num += line[currentChar];
                currentChar++;
            } while (isNumber(line[currentChar]) ||  line[currentChar] === ".");

            if (Number.isNaN(Number(num))) {
                console.log(`Tokenizer error: Can't interpret '${num}' as a number`);
                Deno.exit(-1);
            }

            tokens.push({type: "number", value: num});
            continue;
        }
        else {
            console.log(`Tokenizer error: unknown token '${token}' (maybe not supported yet)`);
            Deno.exit(-1);
        }
    }
    return tokens;
}
