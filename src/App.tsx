import React, {useState} from "react";
import CoinSlot from "./components/CoinSlot";
import {SUPPORTED_COINS} from "./constants";
import './App.css';
import generateQrs from './WriteHtml';
import {ADDRESS_LINE_CHARS, COIN_TEST_ADDRESSES} from './constants';

import btcImage from './img/btcButtonLogo.png';
import xmrImage from './img/xmrButtonLogo.png';
import usdcImage from './img/usdcButtonLogo.png';
import dogeImage from './img/dogeButtonLogo.png';
import ethImage from './img/ethButtonLogo.png';
import EMPTY_COIN_IMAGE from './img/emptyButtonLogo.png';
import validator from "multicoin-address-validator";


let coinImageSources = [
  btcImage,
  xmrImage,
  usdcImage,
  dogeImage,
  ethImage
]

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
  image: JSX.Element,
  imageSource: string,
  addressEntryIsOpen: boolean,
  rank: number,
  lines: number
}

function App() {

  const SUPPORTED_COIN_IMAGES = [
    <img src={btcImage} alt="btc logo" className="coin-image"></img>,
    <img src={xmrImage} alt="xmr logo" className="coin-image"></img>,
    <img src={usdcImage} alt="usdc logo" className="coin-image"></img>,
    <img src={dogeImage} alt="doge logo" className="coin-image"></img>,
    <img src={ethImage} alt="eth logo" className="coin-image"></img>
  ]

  const EMPTY_COIN_IMAGE_ELEMENT = <img src={EMPTY_COIN_IMAGE} alt="btc logo" className="coin-image"></img>

  let [availableCoins, setAvailableCoins] = useState<number[]>([1,2,3,4,-1]);
  let [generationIsDisabled, setGenerationIsDisabled] = useState<boolean>(true);
  let [coinsData, setCoinsData] = useState<CoinData[]>([
    {
      address: "",
      ticker: SUPPORTED_COINS[0],
      customTicker: "",
      addressIsValid: false,
      image: SUPPORTED_COIN_IMAGES[0],
      imageSource: SUPPORTED_COIN_IMAGES[0].props.src,
      rank: 0,
      addressEntryIsOpen: false,
    } as CoinData
  ]);
  let coinsDataCopy = [...coinsData];
  let availableCoinsCopy = [...availableCoins];

  const onChangeLogo = async function(id: number, event: React.ChangeEvent<HTMLInputElement>){
    // Get the file from the file input element
    const reader = new FileReader();
    reader.onloadend = () => {
        let imageSource = reader.result;
        if(typeof imageSource === "string"){
          coinsDataCopy[id].image = <img src={imageSource} alt="btc logo" className="coin-image"></img>
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
      coinsDataCopy[id].image = EMPTY_COIN_IMAGE_ELEMENT;
      //availableCoinsCopy = [...[oldCoinRank], ...availableCoinsCopy];
    }

    coinsDataCopy[id].rank = newCoinRank;
    update();
  }

  const onChangeAddress = function(id: number, address: string, ticker: string) {
    let numLines = Math.trunc(address.length / ADDRESS_LINE_CHARS) + (address.length % ADDRESS_LINE_CHARS === 0 ? 0 : 1);
    coinsDataCopy[id].address = address;
    coinsDataCopy[id].lines = numLines;
    if(coinsDataCopy[id].rank === -1){
      coinsDataCopy[id].addressIsValid = true;
    } else {
      coinsDataCopy[id].addressIsValid = validator.validate(address, ticker.toUpperCase());
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
    let newImage: JSX.Element;
    if(coinRank !== -1){
      newTicker = SUPPORTED_COINS[coinRank];
      newImage = SUPPORTED_COIN_IMAGES[coinRank];
    } else {
      newTicker = "custom";
      newImage = EMPTY_COIN_IMAGE_ELEMENT;
    }

    coinsDataCopy.push(
      {
        address: "",
        ticker: newTicker,
        customTicker: newTicker,
        addressIsValid: coinRank === -1 ? true : false,
        image: newImage,
        imageSource: newImage.props.src,
        rank: coinRank
      } as CoinData
    )

    update();
  }

  const makeAllAddressesValid = function() {
    coinsDataCopy.forEach((coin, index) => {
      coin.address = COIN_TEST_ADDRESSES[SUPPORTED_COINS.indexOf(coin.ticker)];
      coin.addressIsValid = true;
    })
    update();
  }

  const update = function(){
    setGenerationIsDisabled(!checkIfAddressesAreValid())
    setCoinsData(coinsDataCopy);
    setAvailableCoins(availableCoinsCopy);
  }

  return (

    <div className="App">
      <div className="debug">
        Supported: {SUPPORTED_COINS.join(", ")} <br/>
        Available: {availableCoins.map(coin => {return <>{coin} </>})}
      </div>
      <div className="app-box">
        <h1>Build your cryptocurrency donation widget</h1>
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
