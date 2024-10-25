import JSZip from 'jszip';
import dataURItoBlob from './base64-to-binary';
import {indexHtml, indexJs, mainCss} from './websiteTemplateStrings';
//@ts-ignore
import indexJsRaw from './template/index.txt?raw';
import {stringToQrImage, dataURIToBlob} from './utilities';
import qrcode from 'qrcode-generator';
/* eslint import/no-webpack-loader-syntax: off */
//import css from './template/css/main.css?raw'
const filesaver = require('file-saver');

console.log("raw indexJs: " + indexJsRaw.default);

type coinInstruction = {
    ticker: string,
    address: string
}

/*
const base64String = 'your_base64_string';
const byteCharacters = atob(base64String);
const byteArray = new Uint8Array(byteCharacters.length);
for (let i = 0; i < byteCharacters.length; i++) {
  byteArray[i] = byteCharacters.charCodeAt(i);
}
const blob = new Blob([byteArray], { type: 'application/octet-stream' });
*/

async function getImageDataUrl(url: string): Promise<string> {
    const img = new Image();
    return new Promise(resolve => {
        img.onload = async () => {
            console.log("Pasty: The image loaded");
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            resolve(canvas.toDataURL("image/png"));
        };
        img.src = url;
    })
  }

export default async function WriteHtml(tickers: string[], addresses: string[], imageSources: string[]){
    var zip = new JSZip();
    zip.folder('/src/img');
    zip.folder('/src/css');

    zip.file('/src/css/donationWidget.css', mainCss);
    zip.file('/src/donationWidget.html', indexHtml);

    let instructions: coinInstruction[] = [] as coinInstruction[];

    // The contents of this string will hold all the instructions that the output widget's index.js will use to create the widget in the browser
    // It will be a .csv file with the following format:
    // [ticker1],[address1];
    // [ticker2],[address2];
    // ...
    // [tickern],[addressn];

    async function loopTickers(){
        let index = 0;
        for(const ticker of tickers) {
            // get the image file path
            let filePath = "/src/img/" + ticker + "ButtonLogo.png";
            let imageData = imageSources[index];
            let binaryImageData: Blob = (dataURItoBlob(await getImageDataUrl(imageData)));
    
            zip.file(filePath, binaryImageData, {binary: true});
            let address = addresses[index] || "";
    
            //QRCode
            let qrBinary = dataURIToBlob(stringToQrImage(address));
            zip.file("/src/img/qr" + index.toString() + ".png", qrBinary, {binary: true});
            instructions.push({address: address, ticker: ticker})
            index++;
        }
    }

    await loopTickers();

    let instructionsString = JSON.stringify({instructions});
    //instructionsString = instructionsString.substring(instructionsString.indexOf("["), instructionsString.indexOf("]") + 1);
    instructionsString = instructionsString.replace('{"instructions":', "let instructions = ");
    instructionsString = instructionsString.replace('}]}', '}]')
    // Add the instructions to the top of indexJs
    console.log("indexJs length? " + indexJs.length);
    let newIndexJs: string;
    try {
        newIndexJs = indexJs.substring(indexJs.indexOf("<!--") + 4, indexJs.length - 4);
    } catch(e){
        console.log("found the failing length line. Reason for failure: " + e)
    }
    newIndexJs = instructionsString.concat("\n", newIndexJs);
    zip.file("/src/donationWidget.js", newIndexJs);
    zip.generateAsync({type: 'blob'}).then(function(content) {
        filesaver.saveAs(content, "cryptoWidget");
    })
}