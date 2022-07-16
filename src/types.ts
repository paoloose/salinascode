
export interface Token {
    type: string;
    value: string;
}
export type TokenizedLine = Array<Token>;

export interface Identifier {
    name: string;
}
export interface Literal {
    type: "NumberLiteral" | "StringLiteral" | "BooleanLiteral" | "Unkown"
    value: string | number | boolean | undefined;
}
export interface ParenExpressionGroup {
    type: "ParenExpressionGroup"
    arguments: Array<ASTObject>
}
export interface CallExpression {
    type: "CallExpression";
    name: string;
    arguments: Array<ASTObject>;
}
export interface VariableInfo {
    name: string;
    value: Literal | CallExpression | ASTObject;
}
export interface VariableDefinitions {
    type: "VariableDefinitions";
    variableType: string;
    definitions: Array<VariableInfo>;
}

export interface StatementBlock {
    type: "StatementBlock";
    statements: Array<Array<ASTObject>>;
}

export interface IfStatement {
    type: "IfStatement";
    condition: ASTObject;
    onTrueBody: StatementBlock;
    onFalseBody: StatementBlock | null;
}

export interface WhileStatement {
    type: "WhileStatement";
    condition: ASTObject;
    body: StatementBlock;
}

export interface DoWhileStatement {
    type: "DoWhileStatement";
    condition: ASTObject;
    body: StatementBlock;
}

export interface BinaryOperator {
    type: "BinaryOperator";
    operator: string;
    left: ASTObject;
    right: ASTObject;
}

export interface UnaryOperator {
    type: "UnaryOperator";
    operator: string;
    argument: ASTObject;
}

type Statement = IfStatement | WhileStatement | DoWhileStatement;

export type ASTObject = Identifier
    | ParenExpressionGroup
    | Literal
    | CallExpression
    | VariableInfo
    | VariableDefinitions
    | Statement
    | BinaryOperator
    | UnaryOperator;

export interface AST {
    type: "Program";
    name: string;
    body: StatementBlock;
}
