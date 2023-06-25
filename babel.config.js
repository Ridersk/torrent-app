module.exports = {
  presets: ["module:metro-react-native-babel-preset"],
  plugins: [
    [
      "@babel/plugin-syntax-import-assertions",
      {
        deprecatedAssertSyntax: true,
      },
    ],
  ],
};