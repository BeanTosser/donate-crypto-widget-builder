import React, {useState} from "react";
import CoinSlot from "./components/CoinSlot";
import {SUPPORTED_COINS} from "./constants";
import './App.css';
import generateQrs from './WriteHtml';

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
  rank: number
}

function App() {

  let [availableCoins, setAvailableCoins] = useState<number[]>([1,2,3,4]);
  const SUPPORTED_COIN_IMAGES = [
    <img src={btcImage} alt="btc logo"></img>,
    <img src={xmrImage} alt="xmr logo"></img>,
    <img src={usdcImage} alt="usdc logo"></img>,
    <img src={dogeImage} alt="doge logo"></img>,
    <img src={ethImage} alt="eth logo"></img>
  ]

  const onGenerateQrs = function(){
    generateQrs(coinsData.map(coin => {return coin.ticker}), coinsData.map(coin => {return coin.address}), coinsData.map(coin => {return coinImageSources[coin.rank]}));
  }

  const onChangeCoin = function(id: number, coin: string){
    // ID is the index of the coin in the existing coin slot array
    // coin is the index of the new coin/ticker to switch to in SUPPORTED_COINS

    let coinRank = SUPPORTED_COINS.indexOf(coin);

    let coinsDataCopy = [...coinsData];
    let availableCoinsCopy = [...availableCoins];

    coinsDataCopy[id].ticker = SUPPORTED_COINS[coinRank];
    coinsDataCopy[id].addressIsValid = false;
    coinsDataCopy[id].image = SUPPORTED_COIN_IMAGES[coinRank];

    // Need to 
    // 1. Find the index of the current coin in the available coins array
    //   1a. array[array.indexOf(rank)] = coin
    // 2. swap out the value of the element at that index with "coin"
    let newCoinRank = SUPPORTED_COINS.indexOf(coin);
    console.log("The rank of the newly chosen coin is " + newCoinRank.toString());
    console.log("The old rank is: " + coinsDataCopy[id].rank);
    console.log("The index in availableCoins to swap out is " + availableCoins.indexOf(newCoinRank));
    console.log("The value before the swap at that index is: " + availableCoins[availableCoins.indexOf(newCoinRank)].toString() + " and it should be replaced with " + coinsDataCopy[id].rank);
    availableCoinsCopy[availableCoins.indexOf(newCoinRank)] = coinsDataCopy[id].rank;
    coinsDataCopy[id].rank = coinRank;
    setCoinsData(coinsDataCopy);
    console.log("available coins after change: " + JSON.stringify(availableCoinsCopy));
    setAvailableCoins(availableCoinsCopy);
  }

  const onChangeAddress = function(id: number, address: string, ticker: string) {
    let coinsDataCopy = [...coinsData];
    coinsDataCopy[id].address = address;
    coinsDataCopy[id].addressIsValid = validator.validate(address, ticker.toUpperCase(), "prod");
    setCoinsData(coinsDataCopy);
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
  
  let [coinsData, setCoinsData] = useState<CoinData[]>([
    {
      address: "",
      ticker: SUPPORTED_COINS[0],
      addressIsValid: false,
      image: SUPPORTED_COIN_IMAGES[0],
      rank: 0
    } as CoinData
  ]);

  const onRemoveCoinSlot = function(id: number){
    if(coinsData.length > 1){
      console.log("Removing coin");
      let coinsDataCopy = [...coinsData];
      let availableCoinsCopy = [...availableCoins]
      availableCoinsCopy.push(SUPPORTED_COINS.indexOf(coinsDataCopy[id].ticker))
      coinsDataCopy.splice(id, 1);
      setCoinsData(coinsDataCopy);
      setAvailableCoins(availableCoinsCopy);
    }
  }

  let coinList = coinsData.map((coin, index) => {
    return(
      <CoinSlot 
        id={index}
        coinTicker={coin.ticker}
        availableCoins={availableCoins}
        coinImage={coin.image}
        address={coin.address}
        addressIsValid={coin.addressIsValid}
        isCustom={false}
        onChangeCoin={onChangeCoin}
        onChangeAddress={onChangeAddress}
        onRemoveCoinSlot={onRemoveCoinSlot}
      />
    )
  })

  const onAddCoinSlot = function(){
    let coinsDataCopy = [...coinsData];
    let availableCoinsCopy = [...availableCoins];

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

    setCoinsData(coinsDataCopy);
    setAvailableCoins(availableCoinsCopy);
  }

  return (

    <div className="App">
      <div className="app-box">
        <h1>Build your cryptocurrency donation widget</h1>
        <div className="coin-list">
          <AddButton onAddCoinSlot={onAddCoinSlot}/>
          {coinList}
        </div>
        <button onClick={onGenerateQrs} value="generate qr codes"></button>
      </div>
    </div>
  );
}

export default App;
