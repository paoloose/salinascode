import builtins from "./builtins.json" assert { type: "json"};

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

export function initialValueFromType(typeName: string) {
    return builtins.nativeTypes.find(type => (
        type.identifier === typeName
    ))?.initialValue ?? {
        type: "Unknown",
        value: "Unknown"
    };
}
