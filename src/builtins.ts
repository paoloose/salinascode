export const BUILTINS = {
  "nativeTypes": [
      {
          "identifier": "ENTERO",
          "initialValue": {
              "type": "NumberLiteral",
              "value": 0
          }
      },
      {
          "identifier": "REAL",
          "initialValue": {
              "type": "NumberLiteral",
              "value": 0.0
          }
      },
      {
          "identifier": "CARACTER",
          "initialValue": {
              "type": "StringLiteral",
              "value": ""
          }
      },
      {
          "identifier": "CADENA",
          "initialValue": {
              "type": "StringLiteral",
              "value": ""
          }
      },
      {
          "identifier": "BOOLEANO",
          "initialValue": {
              "type": "BooleanLiteral",
              "value": false
          }
      }
  ],
  "functions": [
      "MAX",
      "MIN",
      "LEER",
      "ESCRIBIR",

      "SUMAR",
      "RESTAR",
      "MULTIPLICAR",
      "DIVIDIR",
      "MODULO",
      "POTENCIA",

      "SEN",
      "COS",
      "TANGENTE",
      "RAIZ",
      "LOG"
  ],
  "logic": [
      "Y",
      "O",
      ">",
      "<",
      ">=",
      "<=",
      "=",
      "≠"
  ],
  "operators": [
      "+",
      "-",
      "*",
      "**",
      "/"
  ],
  "punctuators": [
      "(",
      ")",
      "[",
      "]",
      ","
  ],
  "isControlStatements": [
      "SI",
      "SINO",
      "HACER",
      "MIENTRAS",
      "PARA"
  ]
} as const;
