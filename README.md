#Cryptocurrency donation widget tool

##Overview

This is a browser-based tool for building a multi-currency donation widget for web pages. It supports a handful of tokens out-of-the-box, and it also allows manually adding unsupported tokens. 

##Supported currencies

* Bitcoin
* Ethereum
* Monero
* Doge
* USDC

##Usage

These instructions are provided for completeness only, as the tool is designed to be intuitive and self-explanatory.

###Adding a new token

Click the "+" button at the bottom of the token list to add a new cryptocurrency.

###Removing a token

Click the "x" button at the top left of the token slot you want to remove.

###Changing a token

Click in the "ticker" text field in the top right of the coin slot you want to change and type in the ticker for the token you want to switch to.

###Changing a token's address

Click in the "address" field, located below the "ticker" field, and type in the public address of the destination wallet.

###Uploading a token logo (for unsupported tokens only)

Click the "choose file" button in the bottom-left corner of the coin slot and select an image file.

###Exporting a widget

Click the "Get widget" button at the bottom of the application to download a .zip file of the wiget you created.

##Incorporating a widget into an existing website

This application exports a .zip file containing all of the components for a standalone web page containing only a donation widget.  To incorporate the widget into your own web page:

1. Extract the contents of the .zip file into any arbitray location on your computer
2. Copy the contents of the "src" folder to the the same directory as the .html file you want the widget to appear in. If you aleady have folders named "img" or "css" at this location, you will be asked whether you want to merge or overwrite the folders. Choose the option to merge them. **Furthermore, if you already have any files matching the names of any files in the donation widget directory (donationWidget.html, for instance), you will have to rename them and change any references to them within your existing .html and .js files accordingly**
3. Copy the following HTML snippet:
`<iframe src="./donationWidget.html" frameborder="0"></iframe>`
and paste it where you want it to appear within your .html file document.


