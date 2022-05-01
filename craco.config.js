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
            resolve: {
                fallback: {
                    "buffer": require.resolve("buffer/")
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
          },
    },
    babel: {
        plugins: [
            ["@babel/plugin-transform-typescript"],
            ["@babel/plugin-proposal-decorators", { legacy: true }]
        ]
    },
}
