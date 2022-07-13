import { ast, ast_object, variable_info } from "./types.ts";

class Frame {
    statements: ast_object[][];
    hash: string;
    stack: any[] = [];
    return_value: any;

    constructor(statements: ast_object[][]) {
        this.statements = statements;
        this.hash = "####"
    }
}

export class VirtualMachine {
    frames: Frame[] = [];
    mainFrame: Frame;

    constructor(astTree: ast) {
        this.frames = [];
        this.mainFrame = new Frame(astTree.body.statements);
    }

    run_frame(frame: Frame): any {
        console.log("\nRunning frame:", frame.hash);
        this.frames.push(frame);

        function evaluate(statement: ast_object) {
            if (statement.type === "NumberLiteral") return statement.value;
            if (statement.type === "StringLiteral") return statement.value;
            if (statement.type === "BooleanLiteral") return statement.value;
            if (statement.type === "ParenExpressionGroup") {
                return statement
            }
        }
        frame.statements.forEach(statementGroup => {
            const statement = statementGroup[0]

            if (statement.type === "VariableDefinitions") {

                statement.definitions.forEach((definition: variable_info) => {
                    frame.stack.push({
                        key: definition.name,
                        value: definition.value,
                    });
                });
            }
            else if (statement.type === "IfStatement") {
                const condition = evaluate(statement.condition);
                console.log("Checking condition");
                if (condition) {
                    this.run_frame(new Frame(statement.onTrueBody.statements));
                }
                else {
                    this.run_frame(new Frame(statement.onFalseBody.statements));
                }
            }
            else {
                console.log("Statement", statement.type, "not supported yet")
            }
        });
        console.log("Removing frame", this.frames.pop()?.hash, "returning", frame.return_value);
        return frame.return_value;
    }

    run(): void {
        this.run_frame(this.mainFrame);
        console.log("End", this.frames);
    }
}

