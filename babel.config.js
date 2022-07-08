module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      "module-resolver",
      {
        root: ["./js"],
        extensions: [".js", ".ts", ".tsx", ".ios.js", ".android.js"]
      }
    ],
    "@babel/plugin-transform-runtime"
  ],
};
