import { useState, createContext, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
// @ts-ignore
import * as nearAPI from 'near-api-js';

import Whitelist from "./views/Whitelist";
import "./index.css";
import { getConfig } from './config';

const NEARContext = createContext({});

export type NEARType = { 
    hall: nearAPI.Contract,
    nft: nearAPI.Contract,
    totalSupply: number,
    userBalance: number,
    config: {
        stage: "OPEN" | "PRIVATE" | "SOON"
    },
    currentUser: {
        accountId: any, 
        balance: string,
    } | undefined,
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
    authorized: boolean,
} | {
    loaded: false,
    authorized: boolean,
};

async function initContract(): Promise<NEARType> {
    const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const near = await nearAPI.connect({ keyStore, ...nearConfig, headers: {} });
    const walletConnection = new nearAPI.WalletConnection(near, "exv");
    let currentUser;
    if (walletConnection.getAccountId()) {
        currentUser = {
            accountId: walletConnection.getAccountId(),
            balance: (await walletConnection.account().state()).amount,
        };
    }
    console.log("we have user data");
    console.log(currentUser);

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
    let totalSupply = 0;
    let userBalance = 0;
    if (walletConnection.isSignedIn()) {
        [status, totalSupply] = await Promise.all([
            // @ts-ignore
            hall.status({ account_id: currentUser?.accountId }),
            // @ts-ignore
            nft.nft_total_supply(),
        ]);
        userBalance = status.sold;
        config = status.config;
    } else {
        // @ts-ignore
        [config, totalSupply] = await Promise.all([
            // @ts-ignore
            hall.config(),
            // @ts-ignore
            nft.nft_total_supply(),
        ]);
    }
    console.log(config);
    return { 
        hall,
        nft,
        config,
        totalSupply,
        userBalance,
        currentUser,
        nearConfig,
        walletConnection,
        authorized: walletConnection.isSignedIn(),
        loaded: true 
    };
}


export default function App() {
    const [near, setNear] = useState({ authorized: false, loaded: false } as NEARType);

    useEffect(() => {
        initContract().then((context) => {
            setNear(context);
        });
    }, []);

    return (
        <NEARContext.Provider value={near}>
            <Routes>
                <Route path="/" element={<Whitelist near={near} />} />
                <Route path="/test/:mode" element={<Whitelist near={near} />} />
                <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
        </NEARContext.Provider>
    );
}
