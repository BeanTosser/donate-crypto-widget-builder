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
    addressEntryIsOpen: boolean,
    id: number,
    availableCoins: number[],
    addressIsValid: boolean,
    isCustom: boolean,
    coinImage: JSX.Element,
    onChangeCoin: (id: number, coin: string) => void,
    onChangeAddress: (id: number, address: string, ticker: string) => void,
    onRemoveCoinSlot: (id: number) => void,
    onChangeLogo: (id: number, event: React.ChangeEvent<HTMLInputElement>) => void,
    onChangeTicker: (id: number, ticker: string) => void,
    toggleAddressEntryArea: (id: number) => void,
    lines: number
}

interface CoinSlotProps extends OptionalCoinSlotProps, RequiredCoinSlotProps {};

const CoinSlot = function(props: CoinSlotProps){
    let coinOptions: JSX.Element[];


    let coinsToList: number[];
    if(props.isCustom){
        coinsToList = props.availableCoins.slice(0, props.availableCoins.length - 1);
    } else {
        coinsToList = props.availableCoins;
    }

    coinOptions = [
        <option value={props.coinTicker}>{props.coinTicker}</option>
    ]
    coinOptions = [...coinOptions, ...coinsToList.map((ticker) => {
        if(ticker === -1){
            return(
                <option value="custom">custom</option>
            )
        }
        return(
            <option value={SUPPORTED_COINS[ticker]}>{SUPPORTED_COINS[ticker]}</option>
        )
    })]

    const toggleAddressEntryArea = function(){
        props.toggleAddressEntryArea(props.id);
    }

    const onChangeCoin = function(event: React.ChangeEvent<HTMLSelectElement>){
        props.onChangeCoin(props.id, event.target.value);
    }

    const onChangeAddress = function(event: React.ChangeEvent<HTMLTextAreaElement>){
        props.onChangeAddress(props.id, event.target.value, props.coinTicker);
    }

    const onChangeLogo = function(event: React.ChangeEvent<HTMLInputElement>){
        props.onChangeLogo(props.id, event);
    }

    const onChangeTicker= function(event: React.ChangeEvent<HTMLInputElement>){
        props.onChangeTicker(props.id, event.target.value);
    }


    const onRemoveCoinSlot = function(){
        props.onRemoveCoinSlot(props.id)
    }

    let addressEntryOpenClassName = "address-entry-container";
    if(!props.addressEntryIsOpen){
        addressEntryOpenClassName += " closed";
    }

    let arrowClassName = "arrow ";
    if(props.addressEntryIsOpen){
        arrowClassName += "down";
    } else {
        arrowClassName += "right";
    }

let addressTextEntryClassName = "address-entry";
if(!props.addressIsValid){
    addressTextEntryClassName += " invalid-address";
}


let addressEntryElement = (
    <textarea
        className={addressTextEntryClassName}
        onChange={onChangeAddress}
        // @ts-ignore
        value={props.address}
        rows={props.lines}
        cols={ADDRESS_LINE_CHARS}
    >
    </textarea>
)


let customCoinOptionsClassName = "hidden";

if(props.isCustom){
    customCoinOptionsClassName = "custom";
} 


// @ts-ignore
    return(
        <div className="coin-slot">
            <div className="select-area">
                <input type="button" className="remove-button" onClick = {onRemoveCoinSlot} value="X"></input>
                <select value={props.coinTicker || ""} className = "dropdown-menu" onChange={onChangeCoin}>
                    {coinOptions}
                </select>
                {props.coinImage}
            </div>
            <div className="address-entry-area">
                <div className="address-label-area">
                    <i className={arrowClassName}></i>
                    <div className="address-entry-label" onClick={toggleAddressEntryArea}>Address</div>
                </div>
                
                <div className={addressEntryOpenClassName}>
                {addressEntryElement}

                </div>
            </div>
            <div className={customCoinOptionsClassName}>
                <input type="text" onChange={onChangeTicker} value={props.customTicker}></input>
                <input type="file" id={"logo-chooser-" + props.id.toString()} onChange={onChangeLogo}></input>
            </div>
        </div>
    )
}

export default CoinSlot;