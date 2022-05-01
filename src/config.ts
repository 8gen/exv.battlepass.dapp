export function getConfig(env: string) {
  switch(env) {
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        nftContractName: 'dev-1651263315820-70733957088383',
        hallContractName: 'dev-1651263327588-21336933924141',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org'
      };
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        nftContractName: 'dev-1651263315820-70733957088383',
        hallContractName: 'dev-1651263327588-21336933924141',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org'
      };
    default:
      throw Error(`Unconfigured environment '${env}'. Can be configured in src/config.js.`);
  }
}
