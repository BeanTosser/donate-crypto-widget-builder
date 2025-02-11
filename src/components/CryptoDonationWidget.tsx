import React, {useState, useRef, useEffect} from "react";
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

type CryptoDonationWidgetProps = {
    addresses: string[],
    tickers: string[],
    images: string[],
}

let qrImageSources: string[] = [] as string[];
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
    let [currentCoinIndex, setcurrentCoinIndex] = useState(0);
    let coin1ImageURL = useRef(EMPTY_COIN_IMAGE);
    let coin2ImageURL = useRef(EMPTY_COIN_IMAGE);
    let oldTickersList = useRef([] as string[]);
    let [currentCoinShift, setCurrentCoinShift] = useState(0.0);
    let [isShiftingLeft, setIsShiftingLeft] = useState<boolean>(false);
    let [qrImageSources, setQrImageSources] = useState<string[]>([] as string[]);
    let [coinImageSources, setCoinImageSources] = useState<string[]>([] as string[]);
    let testVar: string = "it might not work.";

    // The following function obtained (and modified) from:
    //https://stackoverflow.com/questions/9736804/find-missing-element-by-comparing-2-arrays-in-javascript
    //Thanks to ninjagecko
    function firstElemNotIn(newArray: string[], oldArray: string[]) {
        /*
            returns the first element in currentArray that 
              is not in also in previousArray, 
              or undefined if no such element exists
            
            We declare two elements are equal here if they are === or both NaN.
            See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#comparing_equality_methods
        */        const difArray = oldArray.filter(function(ticker) {
            let test = !newArray.includes(ticker);            
            return !newArray.includes(ticker);
        })        
        return oldArray.indexOf(difArray[0]);

    }

    // If we were on the last coin in the list and that coin was removed, decrement currentCoinIndex to prevent errors
    useEffect(() => {
        // check to see if a ticker was removed
        if(oldTickersList.current.length > 0){
            let e = firstElemNotIn(props.tickers, oldTickersList.current);

            if (e > -1){
                if(e>0 && currentCoinIndex === e){
                    setcurrentCoinIndex(oldCoinIndex => (oldCoinIndex - 1) | 0);
                    resetImageSources();
                    coin1ImageURL.current = tempCoinImageSources[currentCoinIndex - 1];
                    coin2ImageURL.current = tempCoinImageSources[currentCoinIndex - 1];
                    oldTickersList.current = props.tickers;
                    return;
                } else if (e === 0 && currentCoinIndex === 0){
                    resetImageSources();
                    coin1ImageURL.current = tempCoinImageSources[0];
                    coin2ImageURL.current = tempCoinImageSources[0];
                }
            }
        }        oldTickersList.current = props.tickers;
        resetImageSources();
        


    }, [props.tickers])

    let tempCoinImageSources: string[] = [] as string[];

    function resetImageSources() {
        let newQrImageSources = [] as string[];
        props.tickers.forEach((ticker, index) => {
            let supportedCoinIndex: number = SUPPORTED_COINS.indexOf(ticker);
            //Check if this coin is supported
            if(supportedCoinIndex < 0){
                //The coin is not supported. 
                if (imageSourceIndex < props.images.length){
                    tempCoinImageSources.push(props.images[imageSourceIndex]);
                    imageSourceIndex++;
                } else {
                    tempCoinImageSources.push(EMPTY_COIN_IMAGE);
                }            } else {
                tempCoinImageSources.push(SUPPORTED_COIN_IMAGES[SUPPORTED_COINS.indexOf(ticker)]);            }
            if(index === currentCoinIndex){
                coin1ImageURL.current = tempCoinImageSources[index];
            }
        })

        newQrImageSources = props.addresses.map(address => {
            return stringToQrImage(address);
        })        
        setCoinImageSources(tempCoinImageSources);
        setQrImageSources(newQrImageSources);
    }

    function initialize(){

        //First make sure there are enough supplied custom coin images to 
        resetImageSources();

        coin1Element = document.getElementById("coin1") as HTMLImageElement;
        coin2Element = document.getElementById("coin2") as HTMLImageElement;
        qrElement = document.getElementById("qr") as HTMLImageElement;    
        coinsContainer = document.getElementById("coins-container") as HTMLDivElement;
        coinsContainer.style.width = (COIN_SIZE + COIN_SPACE).toString() + "em";
        coinsContainer.style.transform = "translateX(" + INITIAL_COIN_CONTAINER_POSITION_X.toString() + "em)";
        coin1ImageURL.current = tempCoinImageSources[currentCoinIndex];
        coin2ImageURL.current = tempCoinImageSources[currentCoinIndex + 1];

        document.documentElement.style.setProperty("--coin-2-opacity", "0.0");
        document.documentElement.style.setProperty("--coin-1-opacity", "1.0");
        document.documentElement.style.setProperty("--coins-container-left-position", (17.0 / 2.0 - COIN_SIZE - COIN_SPACE / 2.0).toString());        setcurrentCoinIndex(0);
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
            if(newCoinShift > 0){
                newCoinShift = 0;
            } else if (newCoinShift < -COINS_SHIFT_AMOUNT){
                newCoinShift = -COINS_SHIFT_AMOUNT;
            }
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
            if(progressPercentage >= 1.0){                clearInterval(interval);
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
            setAddressDisplayIsVisible(false);
        } else {
            setAddressDisplayIsVisible(true);        }
    }
    
    const copyAddress = async () => {
      try {
        await navigator.clipboard.writeText(props.addresses[currentCoinIndex]);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
    
    function clickRight(){
        if(props.tickers.length < 2){
            return;
        }

        setIsShiftingLeft(true);
        let oldCoinIndex = currentCoinIndex;
        let newCoinIndex: number;        if(currentCoinIndex === coinImageSources.length-1){
            setcurrentCoinIndex(0);
            newCoinIndex = 0;
        } else {
            setcurrentCoinIndex((lastCoinIndex) => lastCoinIndex + 1);
            newCoinIndex = oldCoinIndex + 1;
        }

        //First, reassign images
        coin1ImageURL.current = coinImageSources[oldCoinIndex];
        coin2ImageURL.current = coinImageSources[newCoinIndex];        //set initial transparencies
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
        resetAddressAndQr();
        
    }
    
    function clickLeft(){
        if(props.tickers.length < 2){
            return;
        }
        setIsShiftingLeft(false);
        let oldCoinIndex = currentCoinIndex;
        let newCoinIndex: number;
        if(currentCoinIndex === 0){
            setcurrentCoinIndex(coinImageSources.length - 1);
            newCoinIndex = coinImageSources.length - 1;                                                       
        } else {
            setcurrentCoinIndex(currentCoinIndex-1);
            newCoinIndex = oldCoinIndex - 1;
        }
        //First, reassign images
        //(coin1Element as HTMLImageElement).src=coinImageSources[currentCoinIndex];
        coin1ImageURL.current = coinImageSources[newCoinIndex];
        //(coin2Element as HTMLImageElement).src=coinImageSources[oldCoinIndex];
        coin2ImageURL.current = coinImageSources[oldCoinIndex];
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
        },10);
        resetAddressAndQr();
    }
    
    function resetAddressAndQr(){
        document.documentElement.style.setProperty("value", props.addresses[currentCoinIndex]);
    }
    const addressDisplayClassName = addressDisplayIsVisible ? "" : "address-hidden";
    let rightArrowClassName = "right-arrow change-coin-arrow";
    let leftArrowClassName = "left-arrow change-coin-arrow";

    if(props.tickers.length < 2){
        rightArrowClassName += " disabled";
        leftArrowClassName += " disabled";
    }
    let widgetJSX = (
        <div className="donate-crypto-widget">
            <div className="coin-chooser">
                <div className={leftArrowClassName} onClick={clickLeft}></div>
                <div className="arrow-divider"></div>
                <div id="coins-container">
                    <img className="coin-logo coin1" alt="coin 1" onClick={toggleAddressDisplay} src={coin1ImageURL.current} id="coin1"/>
                    <img className="coin-logo coin2" alt="coin 2" onClick={toggleAddressDisplay} src={coin2ImageURL.current} id="coin2"/>
                </div>
                <div className={rightArrowClassName} onClick={clickRight}></div>
            </div>
            <div id="address-display" className={addressDisplayClassName}>
                <input type="text" id="address-text" className="address-display" onClick={copyAddress} value={props.addresses[currentCoinIndex]} readOnly />
                <img alt="qr" id="qr" className="address-display" src={qrImageSources[currentCoinIndex]}/>
            </div>
        </div>
    )

    return widgetJSX;
}