// send_funds.js
require('dotenv').config();
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.IpcProvider('/home/ec2-user/geth_data/geth.ipc', require('net')));

var from = process.env.BANK_ADDRESS;
var to = process.argv[2];
var amount = process.argv[3];

// Assuming you have the keystore file
var keystore = require(process.env.KEYSTORE_PATH);
var password = process.env.KEYSTORE_PWD;

web3.eth.accounts.wallet.decrypt(keystore, password);

web3.eth.sendTransaction({
    from: from,
    to: to,
    value: web3.utils.toWei(amount, 'ether')
}).then(function(receipt) {
    console.log('Transaction successful:', receipt);
}).catch(function(error) {
    console.log('Transaction error:', error);
});
