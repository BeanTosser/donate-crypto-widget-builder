import React, {useState} from "react";
import CoinSlot from "./components/CoinSlot";
import {SUPPORTED_COINS} from "./constants";
import './App.css';
import generateQrs from './WriteHtml';
import {ADDRESS_LINE_CHARS, COIN_TEST_ADDRESSES} from './constants';

import btcImage from './img/bitcoin-btc-logo.svg';
import xmrImage from './img/monero-xmr-logo.svg';
import usdcImage from './img/usd-coin-usdc-logo.svg';
import dogeImage from './img/dogecoin-doge-logo.svg';
import ethImage from './img/ethereum-eth-logo.svg';
import EMPTY_COIN_IMAGE from './img/empty-coin-logo.svg';
import validator from "multicoin-address-validator";

try{
console.log("btc image source: " + btcImage);
} catch(e) {
  console.log("btcImage: " + btcImage);
}
const CSS_ROOT: HTMLElement = document.querySelector(':root');

type AddButtonProps = {
  onAddCoinSlot: () => void;
}

const AddButton = function (props: AddButtonProps) {
  return(
    <input type="button" onClick = {props.onAddCoinSlot} value="+"></input>
  )
}

type CoinData = {
  address: string,
  ticker: string,
  customTicker: string,
  addressIsValid: boolean,
  image: string,
  imageSource: string,
  addressEntryIsOpen: boolean,
  rank: number,
  lines: number
}

function App() {

  const SUPPORTED_COIN_IMAGES = [
    btcImage,
    xmrImage,
    usdcImage,
    dogeImage,
    ethImage
  ]

  const EMPTY_COIN_IMAGE_ELEMENT = <img src={EMPTY_COIN_IMAGE} alt="empty-coin-logo" className="coin-image"></img>

  let [availableCoins, setAvailableCoins] = useState<number[]>([1,2,3,4,-1]);
  let [generationIsDisabled, setGenerationIsDisabled] = useState<boolean>(true);
  let [coinsData, setCoinsData] = useState<CoinData[]>([
    {
      address: "Address",
      ticker: SUPPORTED_COINS[0],
      customTicker: "",
      addressIsValid: false,
      image: SUPPORTED_COIN_IMAGES[0],
      imageSource: SUPPORTED_COIN_IMAGES[0],
      rank: 0,
      addressEntryIsOpen: false,
      lines: 1
    } as CoinData
  ]);
  let coinsDataCopy = [...coinsData];
  let availableCoinsCopy = [...availableCoins];

  const moveCoinSlot = function(shouldMoveLeft: boolean, id: number){
    let targetSlot = shouldMoveLeft ? id - 1 : id + 1;
    if(targetSlot < coinsDataCopy.length && targetSlot > -1){
      if(shouldMoveLeft){
        coinsDataCopy = [...coinsDataCopy.slice(0, targetSlot), ...[coinsDataCopy[id]], ...[coinsDataCopy[targetSlot]], ...coinsDataCopy.slice(id+1, coinsDataCopy.length)];
      } else { 
        coinsDataCopy = [...coinsDataCopy.slice(0, id), ...[coinsDataCopy[targetSlot]], ...[coinsDataCopy[id]], ...coinsDataCopy.slice(targetSlot+1, coinsDataCopy.length)];
      }
      update();
      return;
    }
    console.log("coinsDataCopy not updated");
  }

  const onChangeLogo = async function(id: number, event: React.ChangeEvent<HTMLInputElement>){
    // Get the file from the file input element
    const reader = new FileReader();
    reader.onloadend = () => {
        let imageSource = reader.result;
        if(typeof imageSource === "string"){
          coinsDataCopy[id].image = imageSource;
          coinsDataCopy[id].imageSource = imageSource;
          update();
        }
    };
    await reader.readAsDataURL(event.target.files[0]);

  }

  const onChangeTicker = function(id: number, ticker: string){
    coinsDataCopy[id].customTicker = ticker;
    update();
  }

  const onGenerateQrs = function(){
    console.log("The addresses being sent to writeHtml: " + JSON.stringify(coinsData.map(coin => {return coin.address})));
    generateQrs(coinsData.map(coin => {return coin.customTicker}), coinsData.map(coin => {return coin.address}), coinsData.map(coin => {return coin.imageSource}));
  }

  const onToggleAddressEntry = function(id: number){
    coinsDataCopy[id].addressEntryIsOpen = !coinsDataCopy[id].addressEntryIsOpen;
    update();
  }

  const checkIfAddressesAreValid = function(){
    for(let i = 0; i < coinsDataCopy.length; i++){
      if(!coinsDataCopy[i].addressIsValid) {
        return false;
      }
    }
    return true;
  }

  const makeCoinAvailable = function(oldCoinRank: number){
    if(oldCoinRank !== -1){
      for(let index=0; index < availableCoinsCopy.length; index++) {
        let availableCoinRank = availableCoinsCopy[index];
        if(availableCoinRank === -1){
          availableCoinsCopy.splice(index, 0, oldCoinRank);
          return;
        } else if(availableCoinRank > oldCoinRank){
          if(index === 0){
            //insert the coin at the beginning of the array)
            availableCoinsCopy.unshift(oldCoinRank);
            return;
          } else {
            //insert the coin before the current availableCoin
            availableCoinsCopy.splice(index, 0, oldCoinRank);
            return;
          }
        }
      }
    }
    return;
  }

  const onChangeCoin = function(id: number, coin: string){
    // ID is the index of the coin in the existing coin slot array
    // coin is the index of the new coin/ticker to switch to in SUPPORTED_COINS
    let oldCoinRank = coinsDataCopy[id].rank;
    let newCoinRank: number;

    if(coin === "custom"){
      newCoinRank = -1;
    } else {
      newCoinRank = SUPPORTED_COINS.indexOf(coin);
    }

    //First, remove the NEW coin from availableCoins (if not custom)

    if(newCoinRank !== -1){
      availableCoinsCopy.splice(availableCoins.indexOf(newCoinRank), 1);
    } else {
    }

    makeCoinAvailable(oldCoinRank);

    // replace the old coin with the new in the coin slot
    if(newCoinRank !== -1){
      coinsDataCopy[id].ticker = SUPPORTED_COINS[newCoinRank];
      coinsDataCopy[id].customTicker = SUPPORTED_COINS[newCoinRank];
      coinsDataCopy[id].addressIsValid = false;
      coinsDataCopy[id].image = SUPPORTED_COIN_IMAGES[newCoinRank];
      //availableCoinsCopy[availableCoinsCopy.indexOf(newCoinRank)] = oldCoinRank;
    } else {
      newCoinRank = -1;
      coinsDataCopy[id].ticker = "custom";
      coinsDataCopy[id].customTicker = "TKR";
      coinsDataCopy[id].addressIsValid = true;
      coinsDataCopy[id].image = EMPTY_COIN_IMAGE_ELEMENT.props.src;
      //availableCoinsCopy = [...[oldCoinRank], ...availableCoinsCopy];
    }
    coinsDataCopy[id].imageSource = coinsDataCopy[id].image;

    coinsDataCopy[id].rank = newCoinRank;
    console.log("image source for the newly-swapped-in coin: " + coinsDataCopy[id].imageSource);
    update();
  }

  const onChangeAddress = function(id: number, address: string, ticker: string) {
    // Don't allow whitespace characters
    let match: number = address.search(/\s/);
    if(match === -1){
      let numLines = Math.trunc(address.length / ADDRESS_LINE_CHARS) + (address.length % ADDRESS_LINE_CHARS === 0 ? 0 : 1);
      coinsDataCopy[id].address = address;
      coinsDataCopy[id].lines = numLines;
      console.log("Setting coin address for coin " + coinsDataCopy[id].customTicker + " to " + address);
      if(coinsDataCopy[id].rank === -1){
        coinsDataCopy[id].addressIsValid = true;
      } else {
        coinsDataCopy[id].addressIsValid = validator.validate(address, ticker.toUpperCase());
      }
    }
    update();
  }


  /*
    id: number,
    coinTicker: string,
    availableCoins: string[],
    coinImage: JSX.Element,
    address: string,
    addressIsValid: boolean,
    isCustom: boolean,
    onChangeCoin: (coinId: number) => void,
    onChangeAddress: (id: number, address: string) => void
  */

  const onRemoveCoinSlot = function(id: number){
    makeCoinAvailable(coinsDataCopy[id].rank);
    coinsDataCopy.splice(id, 1);
    setNumColumns();
    update();
  }

  let coinList = coinsData.map((coin, index) => {
    return(
      <CoinSlot 
        id={index}
        coinTicker={coin.ticker}
        addressEntryIsOpen={coin.addressEntryIsOpen}
        availableCoins={availableCoins}
        coinImage={coin.image}
        address={coin.address}
        addressIsValid={coin.addressIsValid}
        isCustom={coin.rank === -1 ? true : false}
        onChangeCoin={onChangeCoin}
        onChangeAddress={onChangeAddress}
        onChangeLogo={onChangeLogo}
        onChangeTicker={onChangeTicker}
        onRemoveCoinSlot={onRemoveCoinSlot}
        toggleAddressEntryArea={onToggleAddressEntry}
        moveCoinSlot={moveCoinSlot}
        lines={coin.lines}
      />
    )
  })

  const onAddCoinSlot = function(){

    let coinRank: number;

    if(availableCoinsCopy.length === 1){
      //This can only be a custom coin
      coinRank = -1;
    } else {
      coinRank = availableCoinsCopy[0];
      //Remove this coin from the list of available coins
      availableCoinsCopy = availableCoins.slice(1);
    }

    let newTicker: string;
    let newImage: string;
    if(coinRank !== -1){
      newTicker = SUPPORTED_COINS[coinRank];
      newImage = SUPPORTED_COIN_IMAGES[coinRank];
    } else {
      newTicker = "custom";
      newImage = EMPTY_COIN_IMAGE_ELEMENT.props.src;
    }

    coinsDataCopy.push(
      {
        address: "Address",
        ticker: newTicker,
        customTicker: newTicker,
        addressIsValid: coinRank === -1 ? true : false,
        image: newImage,
        imageSource: newImage,
        rank: coinRank,
        lines: 1
      } as CoinData
    )

    setNumColumns();

    console.log("image source for the newly-added coin: " + coinsDataCopy[coinsDataCopy.length - 1].imageSource);

    update();
  }
  const setNumColumns = function() {
    //adjust number of columns is needed
    if(coinsDataCopy.length < SUPPORTED_COINS.length){
      CSS_ROOT.style.setProperty("--num-columns", coinsDataCopy.length.toString());
    } else {
      CSS_ROOT.style.setProperty("--num-columns", SUPPORTED_COINS.length.toString());
    }

    console.log("There should now be " + CSS_ROOT.style.getPropertyValue("--num-columns"));
  }

  const makeAllAddressesValid = function() {
    coinsDataCopy.forEach((coin, index) => {
      if(coin.rank !== -1){
        onChangeAddress(index, COIN_TEST_ADDRESSES[SUPPORTED_COINS.indexOf(coin.ticker)], coin.customTicker);
        coin.addressIsValid = true;
      }
    })
    update();
  }

  const update = function(){
    setGenerationIsDisabled(!checkIfAddressesAreValid())
    setCoinsData(coinsDataCopy);
    setAvailableCoins(availableCoinsCopy);
    console.log("spooky: The addresses at update: " + coinsData.map(coin => {return coin.address}));
  }

  console.log("spooky: The addresses at render: " + coinsData.map(coin => {return coin.address}));

  return (

    <div className="App">
      <div className="debug">
      </div>
      <div className="app-box">
        <h1>Cryptowidget Builder</h1>
        <div className="coin-list-container">
          <AddButton onAddCoinSlot={onAddCoinSlot}/>
          <div className="coin-list">
            {coinList}
          </div>
        </div>
        <button onClick={onGenerateQrs} value="Get widget" disabled={generationIsDisabled}>Get widget</button>
        <button onClick={makeAllAddressesValid} value="Make addresses valid (for testing)">Make Addresses Valid</button>
      </div>
    </div>
  );
}

export default App;
