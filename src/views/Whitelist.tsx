import { Link, useParams } from 'react-router-dom';
import moment from "moment-timezone"
import {useEffect, useState} from 'react';


enum Stage {
    Close,
    Whitelist,
    Open,
    SoldOut,
}

let formatNumber = (number: number) => number.toString().padStart(2, '0');
const initTime = moment();
const publicDate = "May 6, 2022 2:00 AM EST";
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
        whitelistOn = "May 5, 2022 2:00 PM EST";
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


const App = () => {
    const params = useParams();
    let [stage, updateStage] = useState(guessStage(params.mode));
    useEffect(() => {
        setTimeout(() => {
            let stage = guessStage(params.mode);
            updateStage(stage);
        }, 1000);
    });
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
                                    2 ETH minted 1/2000
                                </p>

                                <div className="content__count--box">
                                    <div className="content__count--inc minus">
                                        -
                                    </div>

                                    <input className="input content__count--input" />

                                    <div className="content__count--inc plus">
                                        +
                                    </div>
                                </div>

                                <button className="button second__button content__count--button">
                                    Mint
                                </button>
                            </div>

                            <div className="content__count">
                                <div className="content__count--val">
                                    <img className="content__count--icon" src="/assets/img/near.png" alt="eth" />
                                    near
                                </div>

                                <p className="content__count--text">
                                    2 NEAR minted 1/2000
                                </p>

                                <div className="content__count--box">
                                    <div className="content__count--inc minus">
                                        -
                                    </div>

                                    <input className="input content__count--input" />

                                    <div className="content__count--inc plus">
                                        +
                                    </div>
                                </div>

                                <button className="button second__button content__count--button">
                                    Mint
                                </button>
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
