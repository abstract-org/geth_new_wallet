// send_funds.js
require('dotenv').config();
var Web3 = require('web3');
var fs = require('fs');
var web3 = new Web3(new Web3.providers.IpcProvider('/home/ec2-user/geth_data/geth.ipc', require('net')));

var from = process.env.BANK_ADDRESS;
var to = process.argv[2];
var amount = process.argv[3];
var privateKey = process.env.PRIVATE_KEY;

// Make sure the private key has the '0x' prefix
if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
}

// Create an account object using the private key
var account = web3.eth.accounts.privateKeyToAccount(privateKey);

async function sendSignedTransaction() {
    try {
        const nonce = await web3.eth.getTransactionCount(from);
        const gasPrice = await web3.eth.getGasPrice();
        const value = web3.utils.toWei(amount, 'ether');

        const rawTransaction = {
            from: from,
            to: to,
            value: value,
            gas: 21000, // You can adjust the gas limit depending on the transaction
            nonce: nonce,
            gasPrice: gasPrice,
        };

        const signedTx = await account.signTransaction(rawTransaction);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log('Transaction successful:', receipt);
        process.stdout.write('Transaction successful');
    } catch (error) {
        console.log('Transaction error:', error);
    }
}

sendSignedTransaction();
