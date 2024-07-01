import React from "react";
import {SUPPORTED_COINS, ADDRESS_LINE_CHARS} from "../constants";
import "../css/CoinSlot.css";


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
    coinImage?: JSX.Element,
    address?: string,
}

interface RequiredCoinSlotProps{
    coinTicker: string,
    addressEntryIsOpen: boolean,
    id: number,
    availableCoins: number[],
    addressIsValid: boolean,
    isCustom: boolean,
    onChangeCoin: (id: number, coin: string) => void,
    onChangeAddress: (id: number, address: string, ticker: string) => void,
    onRemoveCoinSlot: (id: number) => void,
    toggleAddressEntryArea: (id: number) => void,
    lines: number
}

interface CoinSlotProps extends OptionalCoinSlotProps, RequiredCoinSlotProps {};

const CoinSlot = function(props: CoinSlotProps){
    console.log("coin image: " + props.coinImage);
    let coinOptions: JSX.Element[];

    coinOptions = [
        <option value={props.coinTicker}>{props.coinTicker}</option>
    ]
    coinOptions = [...coinOptions, ...props.availableCoins.map((ticker) => {
        console.log("select ticker: " + ticker);
        return(
            <option value={SUPPORTED_COINS[ticker]}>{SUPPORTED_COINS[ticker]}</option>
        )
    })]

    const toggleAddressEntryArea = function(){
        console.log("address entry area toggled");
        props.toggleAddressEntryArea(props.id);
    }

    const onChangeCoin = function(event: React.ChangeEvent<HTMLSelectElement>){
        props.onChangeCoin(props.id, event.target.value);
    }

    const onChangeAddress = function(event: React.ChangeEvent<HTMLTextAreaElement>){
        props.onChangeAddress(props.id, event.target.value, props.coinTicker);
    }

    console.log("Address is valid: " + props.addressIsValid.toString());

    const onRemoveCoinSlot = function(){
        props.onRemoveCoinSlot(props.id)
    }

    console.log("AddressEntryIsOpen? " + props.addressEntryIsOpen)

    let addressEntryOpenClassName = "address-entry-container";
    if(!props.addressEntryIsOpen){
        addressEntryOpenClassName += " closed";
    }
    console.log("addressEntryClass: " + addressEntryOpenClassName);

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

console.log("Does this coin have a valid address? " + props.addressIsValid);

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
        </div>
    )
}

export default CoinSlot;