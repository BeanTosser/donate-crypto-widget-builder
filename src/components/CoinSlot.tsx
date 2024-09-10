import React from "react";
import {SUPPORTED_COINS, ADDRESS_LINE_CHARS} from "../constants";
import "../css/CoinSlot.css";
import "../index.css";


/*
type AddButtonProps = {
  onAddCoinSlot: () => void;
}

const AddButton = function (props: AddButtonProps) {
  return(
    <input type="button" onClick = {props.onAddCoinSlot} value="+"></input>
  )
}
*/

interface OptionalCoinSlotProps{
    address?: string,
    customTicker?: string
}

interface RequiredCoinSlotProps{
    coinTicker: string,
    id: number,
    availableCoins: number[],
    addressIsValid: boolean,
    isCustom: boolean,
    coinImage: string,
    onChangeCoin: (id: number, coin: string) => void,
    onChangeAddress: (id: number, address: string, ticker: string) => void,
    onRemoveCoinSlot: (id: number) => void,
    onChangeLogo: (id: number, event: React.ChangeEvent<HTMLInputElement>) => void,
    toggleAddressEntryArea: (id: number) => void,
    moveCoinSlot: (id: number) => void,
    lines: number
}

interface CoinSlotProps extends OptionalCoinSlotProps, RequiredCoinSlotProps {};

const CoinSlot = function(props: CoinSlotProps){

    const onChangeCoin = function(event: React.ChangeEvent<HTMLInputElement>){
        props.onChangeCoin(props.id, event.target.value);
    }

    const onChangeAddress = function(event: React.ChangeEvent<HTMLTextAreaElement>){
        console.log("Propogating address: " + event.target.value);
        props.onChangeAddress(props.id, event.target.value, props.coinTicker);
    }

    const onChangeLogo = function(event: React.ChangeEvent<HTMLInputElement>){
        props.onChangeLogo(props.id, event);
    }

    const onRemoveCoinSlot = function(){
        props.onRemoveCoinSlot(props.id)
    }

let addressTextEntryClassName = "address-entry";
if(!props.addressIsValid){
    addressTextEntryClassName += " invalid-address";
}

let maxLines: number;
if(props.isCustom){
    maxLines = 7;
} else {
    maxLines = 9;
}

let addressEntryElement = (
    <textarea
        className={addressTextEntryClassName}
        onChange={onChangeAddress}
        // @ts-ignore
        value={props.address}
        rows={Math.min(props.lines, maxLines)}
        cols={ADDRESS_LINE_CHARS}
    >
    </textarea>
)

let fileInputIsDisabled: boolean;
if(props.isCustom){
    fileInputIsDisabled = false;
} else {
    fileInputIsDisabled = true;
}

// @ts-ignore
    return(
        <div className="coin-slot-inner-container">
            <input
                type="button"
                className="remove-button"
                onClick = {onRemoveCoinSlot}
                value="X" 
            />
            <input
                type="text"
                value={props.coinTicker || ""}
                className = "ticker-entry"
                onChange={onChangeCoin} 
            />
            <input
                type="file"
                id={"logo-chooser-" + props.id.toString()}
                className="logo-chooser"
                onChange={onChangeLogo} 
                disabled={fileInputIsDisabled}
            />
            <img
                src={props.coinImage}
                id="background-image"
                alt="coin">
            </img>
            {addressEntryElement}
        </div>
    )
}

export default CoinSlot;