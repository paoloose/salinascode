
export interface token {
    type: string;
    value: string;
}

export interface ast_object {
    type: string;
    value?: string | number;
    arguments?: Array<ast_object>;
}
