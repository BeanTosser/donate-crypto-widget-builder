import React, {useState, useEffect} from "react";
import {stringToQrImage} from "../utilities";
import {SUPPORTED_COINS} from "../constants";
import "../css/CryptoDonationWidget.css";

import btcImage from '../img/bitcoin-btc-logo.svg';
import xmrImage from '../img/monero-xmr-logo.svg';
import usdcImage from '../img/usd-coin-usdc-logo.svg';
import dogeImage from '../img/dogecoin-doge-logo.svg';
import ethImage from '../img/ethereum-eth-logo.svg';
import EMPTY_COIN_IMAGE from '../img/empty-coin-logo.svg';

const SUPPORTED_COIN_IMAGES = [
    btcImage,
    xmrImage,
    usdcImage,
    dogeImage,
    ethImage
  ]
/* The original HTML

<html>
    <head>
        <link rel="stylesheet" href="./css/donationWidget.css" />
        <script type="text/javascript" src="./donationWidget.js"></script>
    </head>
    <body onload="initialize()">
        <div class="test-thing">
            &nbsp;
        </div>
        <div class="donate-crypto-widget">
            <div class="coin-chooser">
                <div class="left-arrow change-coin-arrow" onclick="clickLeft()"></div>
                <div class="arrow-divider"></div>
                <div id="coins-container">
                    <img class="coin-logo" alt="coin 1" onclick="toggleAddressDisplay()"/>
                    <img class="coin-logo" alt="coin 2" onclick="toggleAddressDisplay()"/>
                </div>
                <div class="right-arrow change-coin-arrow" onclick="clickRight()"></div>
            </div>
            <div id="address-display" class="hidden">
                <input type="text" id="address-text" class="address-display" onclick = "copyAddress()" readonly />
                <img alt="qr" id="qr" class="address-display"/>
            </div>
        </div>
    </body>
</html>

*/

type CryptoDonationWidgetProps = {
    addresses: string[],
    tickers: string[],
    images: string[],
}

let qrImageSources: string[] = [] as string[];
let coinImageSources: string[] = [] as string[];
let coinsContainer: HTMLDivElement;
let coin1Element: HTMLImageElement;
let coin2Element: HTMLImageElement;
let qrElement: HTMLImageElement;
let addressElement: HTMLInputElement;

let interval: NodeJS.Timeout;

export default function CrytoDonationWidget(props: CryptoDonationWidgetProps){

    const COIN_SIZE = 3.9;
    const WIDGET_WIDTH = 17;
    const COIN_SPACE = 7;
    const COINS_SHIFT_AMOUNT = COIN_SPACE;
    const COINS_SHIFT_INTERVAL = 0.566;
    const INITIAL_COIN_CONTAINER_POSITION_X = WIDGET_WIDTH / 2.0 - COIN_SIZE / 2.0;
    let imageSourceIndex: number = 0;

    let [addressDisplayIsVisible, setAddressDisplayIsVisible] = useState(false);
    let [currentCoinIndex, setCurrentCoinIndex] = useState(0);
    let [coin1ImageURL, setCoin1ImageURL] = useState(EMPTY_COIN_IMAGE);
    let [coin2ImageURL, setCoin2ImageURL] = useState(EMPTY_COIN_IMAGE);
    let [currentCoinShift, setCurrentCoinShift] = useState(0.0);
    let [qrImageSource, setQrImageSource] = useState<string>("");
    let [isShiftingLeft, setIsShiftingLeft] = useState<boolean>(false);

    console.log("Spanky: currentCoinShift: " + currentCoinShift);

    function initialize(){

        //First make sure there are enough supplied custom coin images to 
        console.log("starting loop for adding coinImage");
        props.tickers.forEach((ticker) => {
            console.log("adding coinImage")
            console.log("Ticker: " + ticker);
            console.log("Tickers test: " + props.tickers[0]);
            let supportedCoinIndex: number = SUPPORTED_COINS.indexOf(ticker);
            //Check if this coin is supported
            if(supportedCoinIndex < 0){
                //The coin is not supported. 
                if (imageSourceIndex < props.images.length){
                    coinImageSources.push(props.images[imageSourceIndex]);
                    imageSourceIndex++;
                } else {
                    coinImageSources.push(EMPTY_COIN_IMAGE);
                }
                console.log("The coin is NOT supported");
            } else {
                coinImageSources.push(SUPPORTED_COIN_IMAGES[SUPPORTED_COINS.indexOf(ticker)]);
                console.log("The coin is supported; image url: " + SUPPORTED_COIN_IMAGES[SUPPORTED_COINS.indexOf(ticker)]);            }
        })


        coin1Element = document.getElementById("coin1") as HTMLImageElement;
        console.log("coin1Element: " + coin1Element);
        coin2Element = document.getElementById("coin2") as HTMLImageElement;
        console.log("coin2Element: " + coin2Element);


        qrElement = document.getElementById("qr") as HTMLImageElement;
        console.log("qrElement: " + qrElement);

        qrImageSources = props.addresses.map(address => {
            return stringToQrImage(address);
        })
    
        coinsContainer = document.getElementById("coins-container") as HTMLDivElement;
        console.log("coinsContainer: " + coinsContainer);
        coinsContainer.style.width = (COIN_SIZE + COIN_SPACE).toString() + "em";
        coinsContainer.style.transform = "translateX(" + INITIAL_COIN_CONTAINER_POSITION_X.toString() + "em)";
    
        let coins = document.getElementsByClassName("coin-logo");
        let test = coins.item(0)
        console.log(test);
        console.log("coin1ImageUrl: " + coin1ImageURL);
        console.log("coin2ImageUrl: " + coin2ImageURL);
        setCoin1ImageURL(coinImageSources[currentCoinIndex]);
        setCoin2ImageURL(coinImageSources[currentCoinIndex + 1]);

        document.documentElement.style.setProperty("--coin-2-opacity", "0.0");
        document.documentElement.style.setProperty("--coin-1-opacity", "1.0");
        document.documentElement.style.setProperty("--coins-container-left-position", (17.0 / 2.0 - COIN_SIZE - COIN_SPACE / 2.0).toString());
        console.log("qr imageurl: " + qrImageSources[0]);
        setQrImageSource(qrImageSources[0]);
        setCurrentCoinIndex(0);
    }

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        let shiftIsNegativeMultiplier: number;
        if(currentCoinShift !== 0){
            if(isShiftingLeft){
                shiftIsNegativeMultiplier = -1;
            } else {
                shiftIsNegativeMultiplier = 1;
            }
            let newCoinShift = currentCoinShift + (shiftIsNegativeMultiplier * COINS_SHIFT_INTERVAL);
            coinsContainer.style.transform = "translateX( " + (newCoinShift + INITIAL_COIN_CONTAINER_POSITION_X).toString() + "em";
            let progressPercentage: number;
            if(isShiftingLeft){
                progressPercentage = -newCoinShift / COINS_SHIFT_AMOUNT;
            } else {
                progressPercentage = (COINS_SHIFT_AMOUNT + newCoinShift) / COINS_SHIFT_AMOUNT;
            }

            let progress1: number;
            let progress2: number;
            if(isShiftingLeft){
                progress1 = 1 - progressPercentage;
                progress2 = progressPercentage;
            } else {
                progress1 = progressPercentage;
                progress2 = 1 - progressPercentage;
            }

            document.documentElement.style.setProperty("--coin-1-opacity", progress1.toString());
            document.documentElement.style.setProperty("--coin-2-opacity", progress2.toString());
            if(progressPercentage >= 1.0){
                console.log("Clearing interval");
                clearInterval(interval);
                document.documentElement.style.setProperty("--coin-1-opacity", isShiftingLeft ? "0.0" : "1.0");
                document.documentElement.style.setProperty("--coin-2-opacity", isShiftingLeft ? "1.0" : "0.0");
                if(isShiftingLeft){
                    coinsContainer.style.transform = "translateX( " + INITIAL_COIN_CONTAINER_POSITION_X + ")";
                } else {
                    coinsContainer.style.transform = "translateX( " + (INITIAL_COIN_CONTAINER_POSITION_X + COINS_SHIFT_AMOUNT) + ")";
                }
            }
        } else {
            return;
        }
    }, [currentCoinShift, isShiftingLeft])
    
    function toggleAddressDisplay(){
        if(addressDisplayIsVisible){
            console.log("add: Making adress section invisible");
            setAddressDisplayIsVisible(false);
        } else {
            setAddressDisplayIsVisible(true);
            console.log("add: Making adress section visible");
        }
    }
    
    const copyAddress = async () => {
      try {
        await navigator.clipboard.writeText(props.addresses[currentCoinIndex]);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
    
    function clickRight(){
        setIsShiftingLeft(true);
        let oldCoinIndex = currentCoinIndex;
        console.log("coinImageSources.length: " + coinImageSources.length);
        if(currentCoinIndex === coinImageSources.length-1){
            setCurrentCoinIndex(0);
        } else {
            setCurrentCoinIndex((lastCoinIndex) => lastCoinIndex + 1);
        }
        console.log("New coin index: " + currentCoinIndex);
        //First, reassign images
        setCoin1ImageURL(coinImageSources[oldCoinIndex]);
        setCoin2ImageURL(coinImageSources[currentCoinIndex]);
        //set initial transparencies
        document.documentElement.style.setProperty("--coin-1-opacity", "1");
        document.documentElement.style.setProperty("--coin-2-opacity", "0");
        //Shift all the coins left one coin
        //currentCoinShift = COINS_SHIFT_AMOUNT;
        setCurrentCoinShift(0);
        //Place the container such that coin1 is in the center of the widget
        coinsContainer.style.transform = "translateX( " + (INITIAL_COIN_CONTAINER_POSITION_X).toString() + "em";
        interval = setInterval(() => {
            setCurrentCoinShift(oldCoinShift => oldCoinShift - COINS_SHIFT_INTERVAL);
        }, 10)
    
        console.log("currentCoinIndex: " + currentCoinIndex);
        console.log("oldCoinIndex: " + oldCoinIndex);
    
        resetAddressAndQr();
        
    }
    
    function clickLeft(){
        setIsShiftingLeft(false);
        let oldCoinIndex = currentCoinIndex;
        if(currentCoinIndex === 0){
            setCurrentCoinIndex(coinImageSources.length - 1);
        } else {
            setCurrentCoinIndex(lastCoinIndex => lastCoinIndex-1);
        }
        //First, reassign images
        //(coin1Element as HTMLImageElement).src=coinImageSources[currentCoinIndex];
        setCoin1ImageURL(coinImageSources[currentCoinIndex]);
        //(coin2Element as HTMLImageElement).src=coinImageSources[oldCoinIndex];
        setCoin2ImageURL(coinImageSources[oldCoinIndex]);
        //set initial transparencies
        //(coin1Element as HTMLImageElement).style.opacity = (0).toString();
        document.documentElement.style.setProperty("--coin-1-opacity", "0");
        //(coin2Element as HTMLImageElement).style.opacity = (1).toString();
        document.documentElement.style.setProperty("--coin-2-opacity", ("1"));
        //Shift all the coins left one coin
        let newCoinShift = currentCoinShift + COINS_SHIFT_INTERVAL;
        setCurrentCoinShift(-COINS_SHIFT_AMOUNT);
        coinsContainer.style.transform = "translateX( " + (newCoinShift + INITIAL_COIN_CONTAINER_POSITION_X).toString() + "em";
        interval = setInterval(() => {
            setCurrentCoinShift(oldCoinShift => oldCoinShift + COINS_SHIFT_INTERVAL);
        },10)
        console.log("currentCoinIndex: " + currentCoinIndex);
        console.log("oldCoinIndex: " + oldCoinIndex);
        resetAddressAndQr();
    }
    
    function resetAddressAndQr(){
        console.log("coin index: " + currentCoinIndex.toString());
        document.documentElement.style.setProperty("value", props.addresses[currentCoinIndex]);
        setQrImageSource(qrImageSources[currentCoinIndex]);
    }

    console.log("redrawing");

    const addressDisplayClassName = addressDisplayIsVisible ? "" : "address-hidden";

    let widgetJSX = (
        <div className="donate-crypto-widget">
            <div className="coin-chooser">
                <div className="left-arrow change-coin-arrow" onClick={clickLeft}></div>
                <div className="arrow-divider"></div>
                <div id="coins-container">
                    <img className="coin-logo coin1" alt="coin 1" onClick={toggleAddressDisplay} src={coin1ImageURL} id="coin1"/>
                    <img className="coin-logo coin2" alt="coin 2" onClick={toggleAddressDisplay} src={coin2ImageURL} id="coin2"/>
                </div>
                <div className="right-arrow change-coin-arrow" onClick={clickRight}></div>
            </div>
            <div id="address-display" className={addressDisplayClassName}>
                <input type="text" id="address-text" className="address-display" onClick={copyAddress} value={props.addresses[currentCoinIndex]} readOnly />
                <img alt="qr" id="qr" className="address-display" src={qrImageSources[currentCoinIndex]}/>
            </div>
        </div>
    )

    return widgetJSX;
}