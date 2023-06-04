/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      // Polyfills for node libraries
      // path: require.resolve("path-browserify"),
      fs: require.resolve("browserify-fs"),
      net: require.resolve("net-browserify"),
      dgram: require.resolve("dgram-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      tls: require.resolve("tls-browserify"),
      zlib: require.resolve("browserify-zlib"),
    },
  },
};
