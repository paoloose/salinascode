import { readSourceLines } from "./readSourceLines.ts";
import { tokenizer } from "./tokenizer.ts";
import { parser } from "./parser.ts";
import { VirtualMachine } from "./interpreter.ts";


async function main() {

    if (Deno.args.length === 0) {
        console.log("salinascode: error: Archivo sin nombre");
        console.log("  Falta nombre de archivo. No sabe leer?");
        console.log("Uso correcto: salinascode <filename>.salinas");
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

    // Execute the Abstract Syntax Tree Program
    console.log("\nExecuting AST:");
    const vm = new VirtualMachine(ast);
    vm.run();

    Deno.exit(0);
}

main();
