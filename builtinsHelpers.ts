import builtins from "./builtins.json" assert { type: "json"};
import { literal } from "./types.ts";

export function parseValue(typename: string, value: string): string | number | boolean {
    if (typename === "CADENA") {
        return value;
    }
    else if (typename === "ENTERO") {
        return Number(value);
    }
    else if (typename === "BOOLEANO") {
        return value === "true";
    }
    else {
        throw new Error("Unknown type: " + typename);
    }
}

export function isNativeType(typename: string) {
    return builtins.nativeTypes.findIndex(type => (
        type.identifier === typename
    )) !== -1;
}

export function isControlStatement(typename: string) {
    return builtins.isControlStatements.includes(typename);
}

export function isKeyword(name: string) {
    return isNativeType(name)
        || isControlStatement(name)
        || name === "VERDADERO"
        || name === "FALSO"
} // TODO: Support other keywords like RETURN, BREAK, CONTINUE, ...

export function initialValueFromType(typeName: string): literal {
    return builtins.nativeTypes.find(type => (
        type.identifier === typeName
    ))?.initialValue ?? {
        type: "Unknown",
        value: "Unknown"
    };
}
