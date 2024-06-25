import React, {useState} from "react";
import CoinSlot from "./components/CoinSlot";
import {SUPPORTED_COINS} from "./constants";
import './App.css';
import generateQrs from './WriteHtml';
import {ADDRESS_LINE_CHARS} from './constants';

import btcImage from './img/btcButtonLogo.png';
import xmrImage from './img/xmrButtonLogo.png';
import usdcImage from './img/usdcButtonLogo.png';
import dogeImage from './img/dogeButtonLogo.png';
import ethImage from './img/ethButtonLogo.png';
import validator from "multicoin-address-validator";

let coinImageSources = [
  btcImage,
  xmrImage,
  usdcImage,
  dogeImage,
  ethImage
]

console.log("btcImage: " + btcImage);

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

  let [availableCoins, setAvailableCoins] = useState<number[]>([1,2,3,4]);
  let [generationIsDisabled, setGenerationIsDisabled] = useState<boolean>(true);
  let [coinsData, setCoinsData] = useState<CoinData[]>([
    {
      address: "",
      ticker: SUPPORTED_COINS[0],
      addressIsValid: false,
      image: SUPPORTED_COIN_IMAGES[0],
      rank: 0,
      addressEntryIsOpen: false,
    } as CoinData
  ]);
  let coinsDataCopy = [...coinsData];
  let availableCoinsCopy = [...availableCoins];

  const onGenerateQrs = function(){
    generateQrs(coinsData.map(coin => {return coin.ticker}), coinsData.map(coin => {return coin.address}), coinsData.map(coin => {return coinImageSources[coin.rank]}));
  }

  const onToggleAddressEntry = function(id: number){
    coinsDataCopy[id].addressEntryIsOpen = !coinsDataCopy[id].addressEntryIsOpen;
    update();
  }

  const checkIfAddressesAreValid = function(){
    console.log("Running checkIfAddressesAreValid");
    for(let i = 0; i < coinsData.length; i++){
      if(!coinsData[i].addressIsValid) {
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

    let coinRank = SUPPORTED_COINS.indexOf(coin);

    coinsDataCopy[id].ticker = SUPPORTED_COINS[coinRank];
    coinsDataCopy[id].addressIsValid = false;
    coinsDataCopy[id].image = SUPPORTED_COIN_IMAGES[coinRank];

    // Need to 
    // 1. Find the index of the current coin in the available coins array
    //   1a. array[array.indexOf(rank)] = coin
    // 2. swap out the value of the element at that index with "coin"
    let newCoinRank = SUPPORTED_COINS.indexOf(coin);
    availableCoinsCopy[availableCoins.indexOf(newCoinRank)] = coinsDataCopy[id].rank;
    coinsDataCopy[id].rank = coinRank;
    update();
  }

  const onChangeAddress = function(id: number, address: string, ticker: string) {
    let numLines = Math.trunc(address.length / ADDRESS_LINE_CHARS) + (address.length % ADDRESS_LINE_CHARS === 0 ? 0 : 1);
    coinsDataCopy[id].address = address;
    coinsDataCopy[id].lines = numLines;
    console.log("Testing address: " + address + "; ticker: " + ticker.toUpperCase());
    coinsDataCopy[id].addressIsValid = validator.validate(address, ticker.toUpperCase());
    if (coinsDataCopy[id].addressIsValid){
      console.log("The address is valid!")
    } else {
      console.log("The address is not valid!")
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
    if(coinsData.length > 1){
      console.log("Removing coin");
      availableCoinsCopy.push(SUPPORTED_COINS.indexOf(coinsDataCopy[id].ticker))
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
        isCustom={false}
        onChangeCoin={onChangeCoin}
        onChangeAddress={onChangeAddress}
        onRemoveCoinSlot={onRemoveCoinSlot}
        toggleAddressEntryArea={onToggleAddressEntry}
        lines={coin.lines}
      />
    )
  })

  const onAddCoinSlot = function(){

    coinsDataCopy.push(
      {
        address: "",
        ticker: SUPPORTED_COINS[availableCoins[0]],
        addressIsValid: false,
        image: SUPPORTED_COIN_IMAGES[availableCoins[0]],
        rank: coinsData.length
      } as CoinData
    )
    availableCoinsCopy = availableCoins.slice(1);
    console.log("Available coins before adding a new one: " + JSON.stringify(availableCoins));
    console.log("Available coins after adding a new one: " + JSON.stringify(availableCoinsCopy));
    console.log("Joppy: Length of coinsDataCopy after adding a coin: " + coinsDataCopy.length);
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
      </div>
    </div>
  );
}

export default App;
