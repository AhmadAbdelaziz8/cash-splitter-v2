module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin", // Required by expo-router
      [
        "module-resolver",
        {
          alias: {
            "@": "./",
          },
        },
      ],
    ],
  };
};
