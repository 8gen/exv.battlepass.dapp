const webpack = require("webpack")


module.exports = {
    devServer: {
        client: {
            webSocketURL: "auto://0.0.0.0/ws",
        }
    },
    jest: {
        babel: {
            addPresets: true, /* (default value) */
            addPlugins: true  /* (default value) */
        },
        configure: (jestConfig, { env, paths, resolve, rootDir }) => { return jestConfig; }
    },
    webpack: {
        configure: {
            plugins: [
                // Work around for Buffer is undefined:
                // https://github.com/webpack/changelog-v5/issues/10
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer'],
                }),
                new webpack.ProvidePlugin({
                    process: 'process/browser',
                }),
            ],

            resolve: {
                fallback: {
                    assert: require.resolve('assert'),
                    buffer: require.resolve('buffer'),
                    crypto: require.resolve('crypto-browserify'),
                    events: require.resolve('events'),
                    url: require.resolve('url'),
                    util: require.resolve('util'),
                    stream: require.resolve("stream-browserify"),
                    https: require.resolve("https-browserify"),
                    os: require.resolve('os-browserify/browser'),
                    "http": require.resolve("stream-http"),
                },
            },
        }
    },
    resolve: {
          fallback: {
              assert: require.resolve('assert'),
              buffer: require.resolve('buffer'),
              events: require.resolve('events'),
              url: require.resolve('url'),
              util: require.resolve('util'),
              stream: require.resolve("stream-browserify"),
          },
    },
    babel: {
        plugins: [
            ["@babel/plugin-transform-typescript"],
            ["@babel/plugin-proposal-decorators", { legacy: true }]
        ]
    },
}
