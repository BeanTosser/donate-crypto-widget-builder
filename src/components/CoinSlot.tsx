import React, {MouseEventHandler} from "react";
import {SUPPORTED_COINS} from "../constants";

type RemoveButtonProps = {
    onRemoveCoinSlot: MouseEventHandler<HTMLInputElement>
}

const RemoveButton = function(props: RemoveButtonProps) {
    return(
        <input type="button" onClick = {props.onRemoveCoinSlot} value="X"></input>
    )
}
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
    id: number,
    availableCoins: number[],
    addressIsValid: boolean,
    isCustom: boolean,
    onChangeCoin: (id: number, coin: string) => void,
    onChangeAddress: (id: number, address: string, ticker: string) => void,
    onRemoveCoinSlot: (id: number) => void
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

    const onChangeCoin = function(event: React.ChangeEvent<HTMLSelectElement>){
        props.onChangeCoin(props.id, event.target.value);
    }

    const onChangeAddress = function(event: React.ChangeEvent<HTMLInputElement>){

        props.onChangeAddress(props.id, event.target.value, props.coinTicker);
    }

    console.log("Address is valid: " + props.addressIsValid.toString());

    const onRemoveCoinSlot = function(){
        props.onRemoveCoinSlot(props.id)
    }

    return(
        <div className="coin-slot">
            <RemoveButton onRemoveCoinSlot={onRemoveCoinSlot}/>
            <select value={props.coinTicker || ""} onChange={onChangeCoin}>
                {coinOptions}
            </select>
            <input 
                type="text" 
                value={props.address}
                className={"address-entry" + props.addressIsValid ? "" : " invalid-address"} 
                onChange={onChangeAddress}
            ></input>
            {props.coinImage}
        </div>
    )
}

export default CoinSlot;