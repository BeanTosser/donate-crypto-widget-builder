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
      rank: 0,
      addressEntryIsOpen: false,
    } as CoinData
  ]);
  let coinsDataCopy = [...coinsData];
  let availableCoinsCopy = [...availableCoins];

  const onChangeLogo = function(id: number, event: React.ChangeEvent<HTMLInputElement>){
    // Get the file from the file input element
    coinsDataCopy[id].image = <img src={URL.createObjectURL(event.target.files[0])} alt="btc logo" className="coin-image"></img>
    console.log("The newly created image: " + JSON.stringify(coinsDataCopy[id].image));
    update();
  }

  const onChangeTicker = function(id: number, ticker: string){
    coinsDataCopy[id].customTicker = ticker;
    update();
  }

  const onGenerateQrs = function(){
    generateQrs(coinsData.map(coin => {return coin.customTicker}), coinsData.map(coin => {return coin.address}), coinsData.map(coin => {return coinImageSources[coin.rank]}));
  }

  const onToggleAddressEntry = function(id: number){
    coinsDataCopy[id].addressEntryIsOpen = !coinsDataCopy[id].addressEntryIsOpen;
    update();
  }

  const checkIfAddressesAreValid = function(){
    console.log("Running checkIfAddressesAreValid");
    for(let i = 0; i < coinsDataCopy.length; i++){
      if(!coinsDataCopy[i].addressIsValid) {
        console.log("FOund a coin that does NOT HAVE a valid address")
        return false;
      }
    }
    console.log("All coins have a valid address.")
    return true;
  }

  const onChangeCoin = function(id: number, coin: string){
    // ID is the index of the coin in the existing coin slot array
    // coin is the index of the new coin/ticker to switch to in SUPPORTED_COINS
    console.log("The coin to changed to: " + coin);

    console.log("AVCoins: removing " + SUPPORTED_COINS[SUPPORTED_COINS.indexOf(coin)]);
    console.log("AVCoins: adding " + SUPPORTED_COINS[coinsDataCopy[id].rank]);

    // First, see if this slot is now a custom currency
    let oldCoinRank, newCoinRank: number;
    oldCoinRank = coinsDataCopy[id].rank;

    if(coin !== "custom"){
      newCoinRank = SUPPORTED_COINS.indexOf(coin);
      console.log("Switching coin from " + SUPPORTED_COINS[oldCoinRank] + " to " + SUPPORTED_COINS[newCoinRank]);
      coinsDataCopy[id].ticker = SUPPORTED_COINS[newCoinRank];
      coinsDataCopy[id].customTicker = SUPPORTED_COINS[newCoinRank];
      coinsDataCopy[id].addressIsValid = false;
      coinsDataCopy[id].image = SUPPORTED_COIN_IMAGES[newCoinRank];
      availableCoinsCopy[availableCoinsCopy.indexOf(newCoinRank)] = oldCoinRank;
    } else {
      newCoinRank = -1;
      coinsDataCopy[id].ticker = "custom";
      coinsDataCopy[id].customTicker = "TKR";
      coinsDataCopy[id].addressIsValid = true;
      coinsDataCopy[id].image = EMPTY_COIN_IMAGE_ELEMENT;
      availableCoinsCopy = [...[oldCoinRank], ...availableCoinsCopy];
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
    
    if(coinsDataCopy.length > 1){
      if(coinsDataCopy[id].rank !== -1){
        console.log("Removing coin");
        let newAvailableCoin = SUPPORTED_COINS.indexOf(coinsDataCopy[id].ticker);
        console.log("AVCoins: adding " + SUPPORTED_COINS[coinsDataCopy[id].rank]);
        availableCoinsCopy.push(newAvailableCoin);
      }
      coinsDataCopy.splice(id, 1);
      update();
    }
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
      //This coin only be a custom coin
      coinRank = -1;
    } else {
      coinRank = coinsDataCopy.length;
    }

    let newTicker: string;
    let newImage: JSX.Element;
    if(coinRank !== -1){
      newTicker = SUPPORTED_COINS[availableCoins[0]];
      newImage = SUPPORTED_COIN_IMAGES[availableCoins[0]];
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
        rank: coinRank
      } as CoinData
    )
    
    // Only want to remove the coin from "available coins" if not custom.
    if(coinRank !== -1){
      console.log("AVCoins: removing " + SUPPORTED_COINS[availableCoinsCopy[0]]);
      availableCoinsCopy = availableCoins.slice(1);
    }
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
    console.log("Joppy: Running update");
    setGenerationIsDisabled(!checkIfAddressesAreValid())
    setCoinsData(coinsDataCopy);
    setAvailableCoins(availableCoinsCopy);
  }
  console.log("Generation disabled? " + generationIsDisabled);
  //console.log("Generation disabled COINDATA: " + JSON.stringify(coinsData));

  return (

    <div className="App">
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
