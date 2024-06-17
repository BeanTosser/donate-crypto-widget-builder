const indexHtml = `<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="./css/main.css" />
        <script type="text/javascript" src="./index.js"></script>
    </head>
    <body onload="initialize()">
        <div class="test-thing">
            &nbsp;
        </div>
        <div class="donate-crypto-widget">
            <div class="coin-chooser">
                <div class="left-arrow change-coin-arrow" onclick="clickLeft()"></div>
                <div class="arrow-divider"></div>
                <div id="coins-container">
                    <img class="coin-logo" alt="coin 1" onclick="toggleAddressDisplay()"/>
                    <img class="coin-logo" alt="coin 2" onclick="toggleAddressDisplay()"/>
                </div>
                <div class="right-arrow change-coin-arrow" onclick="clickRight()"></div>
            </div>
            <div id="address-display" class="hidden">
                <input type="text" id="address-text" class="address-display" onclick = "copyAddress()" readonly />
                <img alt="qr" id="qr" class="address-display"/>
            </div>
        </div>
    </body>
</html>
`

const indexJs = `
<!--let coins = document.getElementsByClassName("coin-logo");
let acceptedCoins = instructions.map((coin, index) => {
    return coin.ticker;
});
let coinsContainer;
let currentCoinIndex = 0;
let currentCoinShift = 0;

const COIN_SIZE = 3.9;
const WIDGET_WIDTH = 17;
const COIN_SPACE = 7;
const COINS_SHIFT_AMOUNT = COIN_SPACE;
const INITIAL_COIN_CONTAINER_POSITION_X = WIDGET_WIDTH / 2.0 - COIN_SIZE / 2.0;
const TRANSLATION_FROM_CENTER_AMOUNT = COIN_SIZE / 2.0 + COIN_SPACE / 2.0; 

let addressDisplay;
let addressDisplayIsVisible = false;
let addressBox;
let coinImages = [];
let qrImages = [];
let addressDisplayItems = [];

let qrElement;

function initialize(){
    acceptedCoins.forEach((coin, index) => {
        let imageFilePath = "./img/" + coin + "ButtonLogo.png";
        console.log("image file patH: " + imageFilePath);
        coinImages.push(imageFilePath);
        imageFilePath = "./img/qr" + index.toString() + ".png";
        qrImages.push(imageFilePath);
    })

    coinsContainer = document.getElementById("coins-container");
    addressDisplay = document.getElementById("address-display");
    qrElement = document.getElementById("qr");

    addressDisplayItems = addressDisplay.childNodes;
    addressBox = addressDisplay.children[0];
    addressBox.setAttribute("value", instructions[0].address);
    qrElement.src = qrImages[0];

    coinsContainer.style.width = (COIN_SIZE + COIN_SPACE).toString() + "em";
    coinsContainer.style.transform = "translateX(" + INITIAL_COIN_CONTAINER_POSITION_X.toString() + "em)";

    coins = document.getElementsByClassName("coin-logo");
    coins[0].src = coinImages[currentCoinIndex];
    coins[1].src = coinImages[currentCoinIndex + 1];
    coins[1].style.opacity = 0.0;
    coinsContainer.style.left = 17.0 / 2.0 - COIN_SIZE - COIN_SPACE / 2.0;
}

function toggleAddressDisplay(){
    if(addressDisplayIsVisible){
        addressDisplayIsVisible = false;
        addressDisplay.className = "hidden";
        addressDisplayItems.forEach(item => {
            item.className = "address-display hidden";
            console.log("raising display item");
        })
        console.log("hiding");
    } else {
        addressDisplayIsVisible = true;
        addressDisplay.style.display = "flex";
        addressDisplay.className = ""
        addressDisplayItems.forEach(item => {
            item.className = "address-display";
            console.log("lowering display item");
        })
        console.log("showing");
    }
}

const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(walletAddress);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

function clickRight(){
    let oldCoinIndex = currentCoinIndex;
    if(currentCoinIndex === coinImages.length-1){
        currentCoinIndex = 0;
    } else {
        currentCoinIndex++;
    }
    console.log("New coin index: " + currentCoinIndex);
    //First, reassign images
    let referenceCoinIndex = 0;
    coins[0].src=coinImages[oldCoinIndex];
    coins[1].src = coinImages[currentCoinIndex];
    //set initial transparencies
    coins[0].style.opacity = 1;
    coins[1].style.opacity = 0;
    //Shift all the coins left one coin
    //currentCoinShift = COINS_SHIFT_AMOUNT;
    currentCoinShift = 0;
    //Place the container such that coin1 is in the center of the widget
    coinsContainer.style.transform = "translateX( " + (currentCoinShift + INITIAL_COIN_CONTAINER_POSITION_X).toString() + "em";
    let interval = setInterval(() => {
        coinsContainer.style.transform = "translateX( " + (currentCoinShift + INITIAL_COIN_CONTAINER_POSITION_X).toString() + "em";
        currentCoinShift-= 0.566;
        let progressPercentage = -currentCoinShift / COINS_SHIFT_AMOUNT;
        coins[0].style.opacity =  1 - progressPercentage;
        coins[1].style.opacity = progressPercentage;
        if(currentCoinShift <= -COINS_SHIFT_AMOUNT){
            clearInterval(interval);
            coinsContainer.style.transform = "translateX(" + (INITIAL_COIN_CONTAINER_POSITION_X + COINS_SHIFT_AMOUNT).toString() + ")";
            coins[0].style.opacity = 0.0;
            coins[1].style.opacity = 1.0;
        }
    }, 10)
    resetAddressAndQr();
    
}

function clickLeft(){
    let oldCoinIndex = currentCoinIndex;
    if(currentCoinIndex === 0){
        currentCoinIndex = coins.length - 1;
    } else {
        currentCoinIndex--;
    }
    //First, reassign images
    coins[0].src=coinImages[currentCoinIndex];
    coins[1].src=coinImages[oldCoinIndex];
    //set initial transparencies
    coins[0].style.opacity = 0;
    coins[1].style.opacity = 1;
    //Shift all the coins left one coin
    currentCoinShift = -COINS_SHIFT_AMOUNT;
    coinsContainer.style.transform = "translateX( " + (currentCoinShift + INITIAL_COIN_CONTAINER_POSITION_X).toString() + "em";
    let interval = setInterval(() => {
        coinsContainer.style.transform = "translateX( " + (currentCoinShift + INITIAL_COIN_CONTAINER_POSITION_X).toString() + "em";
        currentCoinShift+=0.566;
        let progressPercentage = -currentCoinShift / COINS_SHIFT_AMOUNT;
        coins[0].style.opacity = 1-progressPercentage;
        coins[1].style.opacity = progressPercentage;
        if(currentCoinShift >= 0){
            clearInterval(interval);
            coins[0].style.opacity = 1.0;
            coins[1].style.opacity = 0.0;
            coinsContainer.style.transform = "translateX( " + INITIAL_COIN_CONTAINER_POSITION_X + ")";
        }
    },10)
    resetAddressAndQr();
}

function resetAddressAndQr(){
    addressBox.setAttribute("value", instructions[currentCoinIndex].address);
    qrElement.src = qrImages[currentCoinIndex];
}-->
`

const mainCss = `:root{
    --widget-width: 17em;
    --coin-size: 3.9em;
    --widget-color: #EFEFEF;
    --address-display-area-spacing: 1.25em;
}

.donate-crypto-widget{
    width: var(--widget-width);
    height: calc(var(--coin-size) + 0.5em);
    background-color: var(--widget-color);
}

.coin-chooser{
    position: relative;
    width: var(--widget-width);
    height: calc(var(--coin-size) + 0.5em);
    display: grid;
    flex-direction: row;
    grid-template-columns: 1fr 4fr 1fr;
}

#address-display{
    background-color: var(--widget-color);
    display: none;
    flex-direction: column;
    justify-content: space-around;
     

}

.left-arrow{
    width: 0;
    height: 0;
    border-top: 1em solid transparent;
    border-bottom: 1em solid transparent;
    border-right: 1em solid grey;
    margin-right: 3em;
    margin-left: 0.75em;
}

.right-arrow{
    width: 0;
    height: 0;
    border-top: 1em solid transparent;
    border-bottom: 1em solid transparent;
    border-left: 1em solid grey;
    margin-right: 0.75em;
    margin-left: 3em;
}

#coin1{
    left: 0;
}
#coin2{
    right: 0;
}

.change-coin-arrow{
    transform: translateY(1em);
    z-index: 2;
}
.change-coin-arrow:hover{
    cursor: pointer;
}
.coin-logo{
    margin-top: 0.25em;
    margin-bottom: 0.25em;
    position: relative;
    width: var(--coin-size);
    height: var(--coin-size);
}

#arrow-divider{
    width: 14em;
}

#coins-container{
    position: absolute;
    width: 15em;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

#address-text{
    margin: 0 auto;
    margin-top: var(--address-display-area-spacing);
    margin-bottom: var(--address-display-area-spacing);
    width: 15em;
}

#qr{
    margin: 0 auto;
    margin-bottom: var(--address-display-area-spacing);
    width: 12em;
}

#address-display{
    overflow: hidden;
}

/* The animation code */
@keyframes dropBox {
    from {height: 0;}
    to {height: 17em;}
}
@keyframes reverseDropBox {
    from {height: 17em;}
    to {height: 0;}
}

#address-display.hidden{
    animation: reverseDropBox 0.2s ease-out 0s 1 normal forwards;
}

#address-display:not(.hidden){
    animation: dropBox 0.2s ease-out 0s 1 normal forwards;
}

.address-display{
    display: block;
    height: auto;
    position: relative;
}

@keyframes lower{
    from{top: -18em;}
    to{top: 0em;}
}
@keyframes raise{
    from{top: 0em;}
    to{top: -18em;}
}

.address-display.hidden{
    animation: raise 0.2s ease-out 0s 1 normal forwards;
}
.address-display:not(.hidden){
    animation: lower 0.2s ease-out 0s 1 normal forwards;
}
`
export {indexHtml};
export {indexJs};
export {mainCss};