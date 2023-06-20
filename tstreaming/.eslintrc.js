module.exports = {
  root: true,
  extends: ["@react-native-community", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": 0,
  },
  ignorePatterns: ["node_modules/", "ios/", "android/", "vendor/"],
};
