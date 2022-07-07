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

main();
