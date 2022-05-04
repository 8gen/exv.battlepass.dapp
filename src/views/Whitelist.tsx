import axios from 'axios';
import Web3 from 'web3';
import { useEffect, useRef, useState } from 'react';
import { useWeb3Context } from 'web3-react'
import { Link, useParams } from 'react-router-dom';
import moment from "moment-timezone"
import { parseNearAmount } from 'near-api-js/lib/utils/format';

import { NEARType } from '../App';


enum Stage {
    Close,
    Whitelist,
    Open,
    SoldOut,
}
const web3 = new Web3(Web3.givenProvider);
let formatNumber = (number: number) => number.toString().padStart(2, '0');
const initTime = moment();
const publicDate = "May 7, 2022 01:00 AM UTC"; 
global.moment = moment;

function guessStage(mode: string|undefined) {
    const now = moment();
    const tz = "America/New_York";
    let whitelistOn: string;
    let publicOn = publicDate;
    let soldout = false;
    let next_deadline;
    let minting = true;
    let animationStyle = "";
    let stage = Stage.Close;
    let formatted;

    if (mode === "blink") {
        whitelistOn = initTime.clone().add(2, "h").format();
    } else if (mode === "blink-faster") {
        whitelistOn = initTime.clone().add(59, "m").format();
    } else if (mode === "blink-aaaa") {
        whitelistOn = initTime.clone().add(1, "m").format();
    } else if (mode === "live") {
        whitelistOn = initTime.clone().format();
    } else if (mode === "public") {
        whitelistOn = publicOn = initTime.clone().format();
    } else if (mode === "soldout") {
        whitelistOn = publicOn = initTime.clone().format();
        soldout = true;
    } else {
        whitelistOn = "May 6, 2022 01:00 PM UTC";
    }

    const deadline_public = moment(publicOn).tz(tz);
    const deadline_whitesale = moment(whitelistOn).tz(tz);

    if (soldout) {
        stage = Stage.SoldOut;
        next_deadline = deadline_public;
        minting = false;
    } else if (deadline_whitesale > now ) {
        next_deadline = deadline_whitesale;
        stage = Stage.Close;
        minting = false;
    } else if (deadline_public > now) {
        stage = Stage.Whitelist;
        next_deadline = deadline_public;

    } else {
        stage = Stage.Open;
        next_deadline = null;
    }
    if(next_deadline) {
        const duration = moment.duration(next_deadline.diff(now));

        if(duration.days() > 0) {
            formatted =`${formatNumber(duration.days())}d ${formatNumber(duration.hours())}h ${formatNumber(duration.minutes())}m`;
        } else if (duration.hours() > 0)  {
            formatted =`${formatNumber(duration.hours())}h ${formatNumber(duration.minutes())}m ${formatNumber(duration.seconds())}s`;
        } else {
            formatted =`${formatNumber(duration.minutes())}m ${formatNumber(duration.seconds())}s`;
        };

        if(duration.days() === 0) {
            if(duration.hours() > 0) {
                animationStyle = "blink";
            } else if(duration.minutes() > 0) {
                animationStyle = "blink-faster";
            } else {
                animationStyle = "blink-aaaaaaaaaaaa";
            }
        }
    }
    return {
        formatted,
        stage,
        soldout,
        animationStyle,
        minting,
        whitelist: deadline_whitesale,
        public: deadline_public,
    }
}


const Mint = ({ error, active, maxValue, balance, defaultValue, onClick }: {error?: string, active: boolean, maxValue: number, balance: number, defaultValue: number, onClick: Function }) => { const ref = useRef(null);
    const [amount, setAmount] = useState(defaultValue);
    if ( balance >= maxValue ) {
        return (
            <span>
                <div className="content__count--box">
                    <div className={`content__count--text`}>
                        You already have {balance} of {maxValue} possible. Our respect!
                    </div>
                </div>
            </span>
        );

    }
    return (
        <span>
            <div className="content__count--box">
                <div className={`content__count--inc${!active ? "--disabled" : ""}`} onClick={
                    () => { 
                        if(amount > 0) {
                            setAmount(amount - 1)
                        }
                    }
                }>-</div>
                <input value={amount} ref={ref} disabled={!active} onChange={(event) => { let val = parseInt(event.target.value);setAmount(val >= 0 && val <= maxValue ? val : defaultValue) }} className='input content__count--input' />
                <div className={`content__count--inc${!active ? "--disabled" : ""}`} onClick={
                    () => {
                        if(amount < maxValue) { 
                            setAmount(amount + 1)
                        }
                    }
                }>+</div>
            </div>

            <button className={`button second__button content__count--button`} onClick={(target) => {onClick(ref.current ? parseInt((ref.current as HTMLInputElement).value) : 0) }} >
            {(() => {
                if(error) {
                    return error;
                }
                if(active) {
                    return "Mint"
                }
                return "Connect wallet"
            })()}
            </button>
        </span>
    );
}


const App = ({ near }: { near: NEARType }) => {
    const eth = useWeb3Context();
    const params = useParams();
    let [stage, updateStage] = useState(guessStage(params.mode));
    let [ethTotalSupply, setEthTotalSupply] = useState(0);
    let [ethUserBalance, setEthUserBalance] = useState(0);
    let [nearTotalSupply, setNearTotalSupply] = useState(0);
    let [permittedEthAddress, setPermittedEthAddress] = useState(false);
    let [permittedNearAddress, setPermittedNearAddress] = useState(false);
    let [loadingNear, setLoaderNear] = useState(true);
    let [loadingEth, setLoaderEth] = useState(true);

    useEffect(() => {
        // eth.setFirstValidConnector(['MetaMask']) // Or on your choice
    }, [eth])

    useEffect(() => {
        if(!near.loaded) return;
        let refresh = async () => {
            let apiResponse, ethUserBalance, ethTotalSupply;
            if(!eth.account) {
                [ethTotalSupply] = await Promise.all([
                    near.ethContract.methods.totalSupply().call(),
                ]);
            } else {
                [apiResponse, ethUserBalance, ethTotalSupply] = await Promise.all([
                    axios.get(`/api/v1/ethsign/${eth.account}`),
                    near.ethContract.methods.balanceOf(eth.account).call(),
                    near.ethContract.methods.totalSupply().call(),
                ]);
                setPermittedEthAddress(apiResponse.status===200);
                setEthUserBalance(ethUserBalance);
                setLoaderEth(false);
            }
            setEthTotalSupply(ethTotalSupply);
        };
        let interval = setInterval(refresh, 10000);
        refresh();
        return () => {
            clearInterval(interval);
        };
    }, [near.loaded, eth.account]);

    useEffect(() => {
        if(!near.loaded) return;
        let refresh = async () => {
            let apiResponse, totalSupply;
            if(near.currentUser) {
                [apiResponse, totalSupply] = await Promise.all([
                    axios.get(`/api/v1/sign/${near.currentUser.accountId}`),
                    //@ts-ignore
                    near.nft.nft_total_supply(),
                ]);
                setPermittedNearAddress(apiResponse.status===200);
                setLoaderNear(false);
            } else {
                [totalSupply] = await Promise.all([
                    //@ts-ignore
                    near.nft.nft_total_supply(),
                ]);
            }
            setNearTotalSupply(totalSupply);
        };
        refresh();
        let interval = setInterval(refresh, 10000);
        return () => {
            clearInterval(interval);
        };
    }, [near.loaded]);

    useEffect(() => {
        let interval = setInterval(() => {
            let stage = guessStage(params.mode);
            updateStage(stage);
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [near.loaded, params.mode]);

    if(!near.loaded) {
        return <></>;
    }

    const onETHActivate = async () => {
        eth.setFirstValidConnector(['MetaMask']) // Or on your choice
        // @ts-ignore
        const accounts = await web3.eth.requestAccounts();
    };

    const onETH = async (amount: number) => {
        const accounts = await web3.eth.requestAccounts();
        if(accounts && accounts.length > 0) {
            web3.eth.defaultAccount = accounts[0];
            let method;
            let cost = web3.utils.toWei((amount * 0.1).toString());
            if(stage.stage === Stage.Whitelist) {
                let response = await axios.get(`/api/v1/ethsign/${accounts[0]}`);
                let { signature } = response.data.data;
                method = near.ethContract.methods.whitelistMint(amount, signature);
            } else {
                method = near.ethContract.methods.mint(amount);
            }
            let response = await method
                .send({
                    from: web3.eth.defaultAccount,
                    gas: 150_000,
                    value: cost,
                });
        } else {
        }
    };

    const onNEAR = async (amount: number) => {
        if(near.authorized) {
            let payload;
            if(stage.stage === Stage.Whitelist) {
                let response = await axios.get(`/api/v1/sign/${near.currentUser.accountId}`);
                let { signature, permitted_amount } = response.data.data;
                payload = { amount, signature, permitted_amount };
            } else {
                payload = { amount };
            }
            // @ts-ignore
            await near.hall.sacrifice(
                payload,
                45_000_000_000_000 + 15_000_000_000_000 + 10_000_000_000_000 * amount,
                parseNearAmount((17.5 * amount + 0.0125 * amount + 0.1).toString())
            );
        } else {
            near.walletConnection.requestSignIn(near.nearConfig.hallContractName, 'NEAR :: Exverse mint');
        }
    };
    return(
        <>
            <header className="header">
                <div className="container">
                    <div className="header__inner">
                        <Link to="/" className="header__logo">
                            <img className="img" src="/assets/img/logo.png" alt="Logo" />
                        </Link>

                        <p className="content__text mobile__text">
                            To get the best experience we suggest you to mint Exverse Pass in your desktop browser
                        </p>
                        {null?
                        <div className="header__wrapper">
                            <Link to="/" className="header__link">
                                How to mint
                            </Link>

                            <button className="button second__button">
                                Connect Wallet
                            </button>
                        </div>:''}

                        <div className="header__wrapper">
                            <a href="https://www.instagram.com/exverse.io/" className="footer__social--link">
                                <img className="img" src="/assets/img/insta.png" alt="Icon" />
                            </a>

                            <a href="https://www.youtube.com/channel/UCoLUQy20bMJLwI1KT1NVBZw" className="footer__social--link">
                                <img className="img" src="/assets/img/youtube.png" alt="Icon" />
                            </a>

                            <a href="https://twitter.com/exverse_io" className="footer__social--link">
                                <img className="img" src="/assets/img/twiter.png" alt="Icon" />
                            </a>

                            <a href="https://t.me/exverse" className="footer__social--link">
                                <img className="img" src="/assets/img/telegram.png" alt="Icon" />
                            </a>

                            <a href="https://discord.com/invite/exverse" className="footer__social--link">
                                <img className="img" src="/assets/img/discord.png" alt="Icon" />
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div className="content">
                <div className="container">
                    <div className="content__inner">
                        <div className="content__wrapper content__title">
                            <span className="purple">Exverse</span> Pass
                        </div>

                        <div className="content__time">
                            {(() => {
                                if(stage.soldout) {
                                    return <span>Sold out!</span>;
                                } else if (stage.stage === Stage.Open) {
                                    return <span>Public is live too</span>;
                                } else if (stage.stage === Stage.Whitelist) {
                                    return <span>Whitelist is live</span>;
                                } else {
                                    return <span>mint in <span className={`white bold ${stage.animationStyle}`}>{stage.formatted}</span></span>
                                }
                            })()}

                        </div>

                        <p className="content__text" style={{textAlign: "left"}}>
                            1 pass on ETH per transaction (1 per address) <br/>
                            2 passes on NEAR per transaction (2 per address)
                        </p>

                        <div className="content__img--inner">
                            <img className="content__img" src="/assets/img/artefact.png" alt="picture" />
                            <div className="content__img--circle"></div>
                            <div className="content__img--circle big"></div>
                            <img className="content__img--out" src="/assets/img/circle.png" alt="picture" />
                        </div>
                        {stage.minting?
                        <div className="content__count--inner">
                            <div className="content__count">
                                <div className="content__count--val">
                                    <img className="content__count--icon" src="/assets/img/eth.png" alt="eth" />
                                    ethereum
                                </div>

                                <p className="content__count--text">
                                    ETH {ethTotalSupply}/2000
                                </p>
                                <Mint error={(() => {
                                    if(!(window as any).ethereum || !eth.active) {
                                        return "Metamask is required 🦊";
                                    }
                                    if (loadingEth) {
                                        return "Loading ... 💤";
                                    }
                                    if(stage.stage === Stage.Whitelist && !permittedEthAddress) {
                                        return "Not permitted 😔";
                                    }
                                    return undefined;
                                })()} defaultValue={1} maxValue={1} active={eth.active} balance={ethUserBalance} onClick={eth.active ? onETH : onETHActivate }/>
                            </div>

                            <div className="content__count">
                                <div className="content__count--val">
                                    <img className="content__count--icon" src="/assets/img/near.png" alt="eth" />
                                    near
                                </div>

                                <p className="content__count--text">
                                    NEAR {nearTotalSupply}/1000
                                </p>

                                <Mint error={(() => {
                                    if (!near.authorized) return;
                                    if (loadingNear) {
                                        return "Loading ... 💤";
                                    }
                                    if(stage.stage === Stage.Whitelist && !permittedNearAddress) {
                                        return "Not permitted 😔";
                                    }
                                    return undefined;
                                })()} defaultValue={2} maxValue={2} active={near.authorized} balance={near.userBalance} onClick={onNEAR} />
                            </div>
                        </div>:
                            <span></span>
                        }

                        <div className="content__wrapper content__text--inner">
                            <div className="content__text--val white" style={{textDecoration: (stage.stage >= Stage.Open ? "line-through" : "")}}>
                                <span className="purple" >Whitelist Sale:</span> {stage.whitelist.format("YYYY/MM/DD hh:mm A z")}
                            </div>

                            <div className="content__text--val white" style={{textDecoration: (stage.stage > Stage.Open ? "line-through" : "")}}>
                                <span className="purple">Public Sale:</span> {stage.public.format("Y/MM/DD hh:mm A z")}</div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <div className="container">
                    <div className="footer__inner">
                        <a href={"https://exverse.io"}><button className="button default__button">Go Home Page</button></a>

                        <div className="footer__social--inner">
                            <a href="https://www.instagram.com/exverse.io/" className="footer__social--link">
                                <img className="img" src="/assets/img/insta.png" alt="Icon" />
                            </a>

                            <a href="https://www.youtube.com/channel/UCoLUQy20bMJLwI1KT1NVBZw" className="footer__social--link">
                                <img className="img" src="/assets/img/youtube.png" alt="Icon" />
                            </a>

                            <a href="https://twitter.com/exverse_io" className="footer__social--link">
                                <img className="img" src="/assets/img/twiter.png" alt="Icon" />
                            </a>

                            <a href="https://t.me/exverse" className="footer__social--link">
                                <img className="img" src="/assets/img/telegram.png" alt="Icon" />
                            </a>

                            <a href="https://discord.com/invite/exverse" className="footer__social--link">
                                <img className="img" src="/assets/img/discord.png" alt="Icon" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default App;
