import JSZip from 'jszip';
import dataURItoBlob from './base64-to-binary';
import {indexHtml, indexJs, mainCss} from './websiteTemplateStrings';
//@ts-ignore
import indexJsRaw from './template/index.txt?raw';
import qrcode from 'qrcode-generator';
/* eslint import/no-webpack-loader-syntax: off */
//import css from './template/css/main.css?raw'
const filesaver = require('file-saver');

console.log("raw indexJs: " + indexJsRaw.default);

type coinInstruction = {
    ticker: string,
    address: string
}

export default async function WriteHtml(tickers: string[], addresses: string[], imageSources: string[]){

    var zip = new JSZip();
    zip.folder('/src/img');
    zip.folder('/src/css');

    zip.file('/src/css/main.css', mainCss);
    zip.file('/src/index.html', indexHtml);

    let instructions: coinInstruction[] = [] as coinInstruction[];

    // The contents of this string will hold all the instructions that the output widget's index.js will use to create the widget in the browser
    // It will be a .csv file with the following format:
    // [ticker1],[address1];
    // [ticker2],[address2];
    // ...
    // [tickern],[addressn];

    tickers.forEach(async (ticker, index) => {
        // get the image file path
        let filePath = "/src/img/" + ticker + "ButtonLogo.png";
        let imageData = imageSources[index];

        let binaryImageData = dataURItoBlob(imageData);
        zip.file(filePath, binaryImageData, {binary: true});

        let address = addresses[index];
        
        //QRCode

        let qr = qrcode(0, 'M');
        qr.addData(address);
        qr.make();
        let qrURL = qr.createDataURL(6);
        let qrBinary = dataURItoBlob(qrURL);
        zip.file("/src/img/qr" + index.toString() + ".png", qrBinary, {binary: true});

        instructions.push({address: address, ticker: ticker})
    })
    let instructionsString = JSON.stringify({instructions});
    //instructionsString = instructionsString.substring(instructionsString.indexOf("["), instructionsString.indexOf("]") + 1);
    instructionsString = instructionsString.replace('{"instructions":', "let instructions = ");
    instructionsString = instructionsString.replace('}]}', '}]')
    console.log("The instructions: " + instructionsString);
    console.log("indexjs: " + indexJs);
    // Add the instructions to the top of indexJs
    let newIndexJs = indexJs.substring(indexJs.indexOf("<!--") + 4, indexJs.length - 4);
    newIndexJs = instructionsString.concat("\n", newIndexJs);
    console.log("newIndexJs: " + newIndexJs);
    zip.file("/src/index.js", newIndexJs);
    zip.generateAsync({type: 'blob'}).then(function(content) {
        filesaver.saveAs(content, "cryptoWidget");
    })
}