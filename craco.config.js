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
    babel: {
        plugins: [
            ["@babel/plugin-transform-typescript"],
            ["@babel/plugin-proposal-decorators", { legacy: true }]
        ]
    },
}
