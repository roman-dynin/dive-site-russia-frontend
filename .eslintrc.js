module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs'
  ],
  plugins: [
    'vue'
  ],
  rules: {
    semi: [2, 'never'],
    'no-console': 'off'
  }
}
