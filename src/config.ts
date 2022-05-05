export function getConfig(env: string) {
    switch(env) {
        case 'mainnet':
            return {
                near: {
                    networkId: 'mainnet',
                    nodeUrl: 'https://rpc.mainnet.near.org',
                    nftContractName: 'battlepass.exverse.near',
                    hallContractName: 'mint.exverse.near',
                    walletUrl: 'https://wallet.near.org',
                    helperUrl: 'https://helper.mainnet.near.org',
                },
                eth: {
                    contract: "0x5428a611192c4fce14ef56eff8ee7dab93b8de86",
                }
            };
        case 'testnet':
            return {
                near: {
                    networkId: 'testnet',
                    nodeUrl: 'https://rpc.testnet.near.org',
                    nftContractName: 'dev-1651761135719-43111996206024',
                    hallContractName: 'dev-1651761183049-87289918789867',
                    walletUrl: 'https://wallet.testnet.near.org',
                    helperUrl: 'https://helper.testnet.near.org'
                },
                eth: {
                    contract: "0xc957A9A9AB55D435b796ACF8D7c7ca2b790D2B25",
                }
            };
        default:
            throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
    }
}
