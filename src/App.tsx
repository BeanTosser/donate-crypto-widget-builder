import React, {useState, useEffect} from "react";
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

import CryptoDonationWidget from "donate-crypto-widget-react";

import {interleaveArrays} from "./utilities";

console.log("btcImage: " + btcImage);

console.log("The imported SVG image data: " + btcImage);

type AddButtonProps = {
  onAddCoinSlot: () => void;
}

type SwapButtonProps = {
  onSwapCoinSlots: (id: number) => void;
  id: number;
}

type CoinsListItemProps = {
  children: React.ReactNode,
  bordered?: boolean,
  swapButton?: boolean
}

const AddButton = function (props: AddButtonProps) {
  return(
    <>
      <input type="button" onClick = {props.onAddCoinSlot} value="+" id="add-button"></input>
    </>
  )
}

const SwapButton = function(props: SwapButtonProps){
  return (
    <>
      <input 
        type="button"
        onClick={props.onSwapCoinSlots.bind(this, props.id)}
        value="swap"
        className="center"
      ></input>
    </>
  )
}

const CoinsListItem = (props: CoinsListItemProps) => {
  let borderedClassName = props.bordered ? " bordered" : "";
  let isSwapButtonClassName = props.swapButton ? " coin-slot-button" : "";
  return(
    <div className={"coin-slot" + borderedClassName + " " + isSwapButtonClassName}>
      {props.children}
    </div>
  )
}

type CoinData = {
  address: string,
  ticker: string,
  addressIsValid: boolean,
  image: string,
  imageSource: string,
  addressEntryIsOpen: boolean,
  rank: number,
  lines: number
}

function App() {

  useEffect(() => {
      }, [])

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

  // swap the places of coinsDataCopy[id] and coinsDataCopy[id+1] in the coinsData array.
  const moveCoinSlot = function(id: number){
    let arrayHead = [] as CoinData[];
    let arrayTail = [] as CoinData[];

    if(id > 0){
      arrayHead = coinsDataCopy.slice(0,id);
    }
    if(id < coinsDataCopy.length - 2){
      arrayTail = coinsDataCopy.slice(id+2, coinsDataCopy.length);
    }

    coinsDataCopy = [...arrayHead, ...[coinsDataCopy[id + 1]], ...[coinsDataCopy[id]], ...arrayTail];
    console.log("coinsDataCOpy after swap: " + coinsDataCopy.length);
    update();
    return;
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

  const onGenerateQrs = function(){
    console.log("The addresses being sent to writeHtml: " + JSON.stringify(coinsData.map(coin => {return coin.address})));
    generateQrs(coinsData.map(coin => {return coin.ticker}), coinsData.map(coin => {return coin.address}), coinsData.map(coin => {return coin.imageSource}));
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

    // Check to see if the coin is supported out-of-the-box
    newCoinRank = SUPPORTED_COINS.indexOf(coin);
    //First, remove the NEW coin from availableCoins (if not custom)
    if(newCoinRank !== -1){
      //First make sure the coin isn't already in the widget. Duplicates are not allowed
      availableCoinsCopy.splice(availableCoins.indexOf(newCoinRank), 1);
    } 

    makeCoinAvailable(oldCoinRank);

    // replace the old coin with the new in the coin slot
    if(newCoinRank !== -1){
      coinsDataCopy[id].ticker = coin;
      coinsDataCopy[id].addressIsValid = false;
      coinsDataCopy[id].image = SUPPORTED_COIN_IMAGES[newCoinRank];
    } else {
      newCoinRank = -1;
      coinsDataCopy[id].ticker = coin;
      coinsDataCopy[id].addressIsValid = true;
      coinsDataCopy[id].image = EMPTY_COIN_IMAGE_ELEMENT.props.src;
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
        update();
  }

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
        addressIsValid: coinRank === -1 ? true : false,
        image: newImage,
        imageSource: newImage,
        rank: coinRank,
        lines: 1
      } as CoinData
    )

    console.log("image source for the newly-added coin: " + coinsDataCopy[coinsDataCopy.length - 1].imageSource);

    update();
  }

  const makeAllAddressesValid = function() {
    coinsDataCopy.forEach((coin, index) => {
      if(coin.rank !== -1){
        onChangeAddress(index, COIN_TEST_ADDRESSES[SUPPORTED_COINS.indexOf(coin.ticker)], coin.ticker);
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
  
  //Add a blank coin slot; this will hold the "add" button
  let coinList = coinsData.map((coin, index) => {
    console.log("Attempting to map coin with index: " + index);
    let listItem: JSX.Element;
      listItem = 
        <CoinsListItem bordered={true}>
          <CoinSlot 
            id={index}
            coinTicker={coin.ticker}
            availableCoins={availableCoins}
            coinImage={coin.image}
            address={coin.address}
            addressIsValid={coin.addressIsValid}
            isCustom={coin.rank === -1 ? true : false}
            onChangeCoin={onChangeCoin}
            onChangeAddress={onChangeAddress}
            onChangeLogo={onChangeLogo}
            onRemoveCoinSlot={onRemoveCoinSlot}
            toggleAddressEntryArea={onToggleAddressEntry}
            moveCoinSlot={moveCoinSlot}
            lines={coin.lines}
          />
        </CoinsListItem>
    return listItem;
  })

  //Add in the switch buttons
  let swapButtonElements = ([...new Array(coinsDataCopy.length - 1)] as JSX.Element[]).map((element, index) => {return( 
    <CoinsListItem swapButton = {true}>
      <SwapButton id={index} onSwapCoinSlots={moveCoinSlot.bind(this, index)}/>
    </CoinsListItem>
  )})
  if(swapButtonElements.length > 0){
    coinList = interleaveArrays(coinList, swapButtonElements);
  }
  coinList = [...coinList, <CoinsListItem swapButton={true}><AddButton onAddCoinSlot={onAddCoinSlot} /></CoinsListItem>];

  const openHelpModal = function(){
    let modal = document.getElementById("help-modal") as HTMLDialogElement;
    modal.showModal();
  }

  return (

    <div className="App">
      <dialog id="help-modal">
        <div id="help-modal-inner-div">
          This application exports a .zip file containing all of the components necessary for a standalone web page containing only a donation widget.  To incorporate the widget into your own web page:
          <ol>
            <li>Extract the contents of the .zip file</li>
            <li>Copy the contents of the "src" folder to the the same directory as the .html file you want the widget to appear in. If you aleady have folders named "img" or "css" at this location, you will be asked whether you want to merge or overwrite the folders. Choose the option to merge them. <br />If your site's "src" directory already contains files with names that matchthose of any files in the donation widget directory (donationWidget.html, for instance), you must rename them and change any references to them within your existing .html and .js files accordingly</li>
            <li>
              Copy the following HTML snippet:<br /><br />
              <code>&lt;iframe src="./donationWidget.html" frameborder="0"&rt;&lt;/iframe&rt;</code><br /> <br />
              and paste it where you want your widget to appear within your .html file document.
            </li>
          </ol>
          <button onClick={() => {
          (document.getElementById("help-modal") as HTMLDialogElement).close();
          }}>X</button>
        </div>
      </dialog>
      <div className="debug">
      </div>
      <div className="app-box">
      <button onClick={openHelpModal}>Help!</button>
        <h1>Multi-crypto donation widget builder</h1>
        <div className="coin-list-container">
          <div className="coin-list">
            {coinList}
          </div>
        </div>
        <button onClick={onGenerateQrs} value="Get widget" disabled={generationIsDisabled}>Get widget</button>
        <button onClick={makeAllAddressesValid} value="Make addresses valid (for testing)">Make Addresses Valid</button>
      </div>
      <div>
      <CryptoDonationWidget 
            addresses={["btcAddress", "customAddress", "ethAddress"]}
            images = {[EMPTY_COIN_IMAGE]}
            tickers={['btc', 'cust', 'eth']}
      />
      </div>
    </div>
  );
}

export default App;
