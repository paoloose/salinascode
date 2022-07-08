
export interface token {
    type: string;
    value: string;
}
export type tokenized_line = Array<token>;

export interface ast_object {
    type: string;
    value?: string | number | boolean;
    arguments?: Array<ast_object>;
}

export interface statement_block {
    type: "StatementBlock";
    statements: Array<Array<ast_object>>;
}

export interface variable {
    name: string;
    value: string | number | boolean | ast_object;
}

export interface ast {
    type: string;
    body: Array<Array<ast_object>>;
}
