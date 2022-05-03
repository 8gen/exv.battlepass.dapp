import { useState, createContext, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Connectors } from 'web3-react'
import Web3Provider from 'web3-react'
import Web3 from 'web3';

// @ts-ignore
import * as nearAPI from 'near-api-js';

import ethAbi from './abi.json';
import Whitelist from "./views/Whitelist";
import "./index.css";
import { getConfig } from './config';

const NEARContext = createContext({});
const { InjectedConnector } = Connectors
const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] })
const connectors = { MetaMask }


export type NEARType = { 
    hall: nearAPI.Contract,
    nft: nearAPI.Contract,
    userBalance: number,
    config: {
        stage: "OPEN" | "PRIVATE" | "SOON"
    },
    currentUser: {
        accountId: any, 
        balance: string,
    },
    ethConfig: {
        contract: string,
    },
    ethContract: any,
    nearConfig: {
        networkId: string,
        nodeUrl: string,
        nftContractName: string,
        hallContractName: string,
        walletUrl: string,
        helperUrl: string,
    },
    walletConnection: nearAPI.WalletConnection,
    loaded: true,
    authorized: true,
} | {
    hall: nearAPI.Contract,
    nft: nearAPI.Contract,
    userBalance: 0,
    config: {
        stage: "OPEN" | "PRIVATE" | "SOON"
    },
    currentUser: undefined,
    ethConfig: {
        contract: string,
    },
    ethContract: any,
    nearConfig: {
        networkId: string,
        nodeUrl: string,
        nftContractName: string,
        hallContractName: string,
        walletUrl: string,
        helperUrl: string,
    },
    walletConnection: nearAPI.WalletConnection,
    loaded: true,
    authorized: false,
} | {
    loaded: false,
    authorized: false,
};

async function initNEARContract(): Promise<NEARType> {
    const _config = getConfig(process.env.NEAR_ENV || 'testnet');
    const nearConfig = _config.near;
    const ethConfig = _config.eth;
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const near = await nearAPI.connect({ keyStore, ...nearConfig, headers: {} });
    const walletConnection = new nearAPI.WalletConnection(near, "exv");
    const nft = new nearAPI.Contract(
        walletConnection.account(),
        nearConfig.nftContractName,
        {
            changeMethods: [],
            viewMethods: ['nft_total_supply', 'nft_supply_for_owner'],
        }
    );
    const hall = new nearAPI.Contract(
        walletConnection.account(),
        nearConfig.hallContractName,
        {
            viewMethods: ['status', 'config'],
            changeMethods: ['sacrifice'],
        }
    );
    let config;
    let status;
    const web3 = new Web3(Web3.givenProvider);
    //@ts-ignore
    let ethContract = new web3.eth.Contract(ethAbi, ethConfig.contract);
    let base = {
        hall,
        nft,
        nearConfig,
        ethConfig,
        ethContract,
        walletConnection,
    };
    if (walletConnection.isSignedIn()) {
        let currentUser = {
            accountId: walletConnection.getAccountId(),
            balance: (await walletConnection.account().state()).amount,
        };
        [status] = await Promise.all([
            // @ts-ignore
            hall.status({ account_id: currentUser?.accountId }),
            // @ts-ignore
        ]);
        return { 
            userBalance: status.sold,
            config: status.config,
            currentUser,
            authorized: true,
            loaded: true,
            ...base,
        };
    } else {
        // @ts-ignore
        [config] = await Promise.all([
            // @ts-ignore
            hall.config(),
            // @ts-ignore
        ]);
        return { 
            userBalance: 0,
            config,
            currentUser: undefined,
            authorized: false,
            loaded: true,
            ...base,
        };
    }
}


export default function App() {
    const [near, setNear] = useState({ authorized: false, loaded: false } as NEARType);

    useEffect(() => {
        initNEARContract().then(setNear);
    }, []);

    return (
    <Web3Provider connectors={connectors} libraryName={'ethers.js'}>
        <NEARContext.Provider value={near}>
            <Routes>
                <Route path="/" element={<Whitelist near={near} />} />
                <Route path="/test/:mode" element={<Whitelist near={near} />} />
                <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
        </NEARContext.Provider>
    </Web3Provider>
    );
}
