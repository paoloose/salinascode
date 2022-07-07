import { readSourceLines } from "./readSourceLines.ts";
import { tokenizer } from "./tokenizer.ts";
import { parser } from "./parser.ts";


async function main() {

    if (Deno.args.length === 0) {
        console.log("Salinascode: error: Archivo sin nombre\n");
        console.log("  Falta nombre de archivo. No sabe leer?\n");
        console.log("Uso correcto: salinascode <filename>.salinas\n");
        Deno.exit(-1);
    }
    const fileName = Deno.args[0];

    const sourceLines = await readSourceLines(fileName);

    // Tokenize source code
    console.log("\nTokenizing:");
    const linesTokens = tokenizer(sourceLines);
    console.log(linesTokens);

    // Translate tokens and create the Abstract Syntax Tree Program
    console.log("\nParsing to AST:");
    const ast = parser(linesTokens);
    console.log(JSON.stringify(ast, null, 2));

    Deno.exit(0);
}

main();
