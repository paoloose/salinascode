import { token } from "./types.ts";

function isNumber(token: string) {
    return (token >= '0' && token <= '9');
}

function isAlpha(token: string) {
    return (token >= 'a' && token <= 'z') || (token >= 'A' && token <= 'Z' || token === '_');
}

export function tokenizer(lines: Array<string>) {
    let tokens = Array<token>();
    for (const line of lines) {
        tokens = tokens.concat(tokenize(line));
    }
    return tokens;
}

function tokenize(line: string): Array<token> {
    const tokens = Array<token>();

    let current = 0;
    while (current < line.length) {

        const token = line[current];

        if (token === ' ') {
            current++;
            continue;
        }
        if (token === '(') {
            tokens.push({type: "paren", value: "("});
            current++;
            continue;
        }
        if (token === ')') {
            tokens.push({type: "paren", value: ")"});
            current++;
            continue;
        }
        if (token === '+') {
            tokens.push({type: "operator", value: "+"});
            current++;
            continue;
        }
        if (token === '-') {
            tokens.push({type: "operator", value: "-"});
            current++;
            continue;
        }
        if (token === ',') {
            tokens.push({type: "comma", value: ","});
            current++;
            continue;
        }
        if (token === '←') {
            tokens.push({type: "assignation", value: "←"});
            current++;
            continue;
        }
        if (token === '"' || token === '“' || token === '”') {
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