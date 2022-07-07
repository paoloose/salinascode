
export async function readSourceLines(fileName: string) {

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