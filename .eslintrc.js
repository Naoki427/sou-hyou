module.exports = {
  rules: {
    // 使っていない変数を禁止
    'no-unused-vars': ['error'],

    // 中身が空の関数を禁止
    'no-empty-function': ['error'],

    // 不要なセミコロンを禁止
    'no-extra-semi': 'error',

    // 複数のスペースを禁止（インデント以外）
    'no-multi-spaces': 'error',

    // 連続する空行を最大1行まで許可
    'no-multiple-empty-lines': ['error', { max: 1 }],

    // 1行に複数の文を書くのを禁止
    'max-statements-per-line': ['error', { max: 1 }],

    // ブロックの前後に空行を入れない
    'padded-blocks': ['error', 'never'],

    // ファイルの最後に必ず改行を入れる
    'eol-last': ['error', 'always'],

    // インデント幅をスペース4つに統一
    indent: ['error', 4],

    // 文字列はシングルクォートで統一（エスケープが必要な場合は例外）
    quotes: ['error', 'single', { avoidEscape: true }],

    // 文末のセミコロンを禁止
    semi: ['error', 'never'],
  },
}