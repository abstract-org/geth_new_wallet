require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('wallets.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the wallets database.');
});

db.run('CREATE TABLE IF NOT EXISTS wallets (address TEXT UNIQUE)', (err) => {
  if (err) {
    console.error(err.message);
  }
});

app.post('/new_wallet', (req, res) => {
  const account = req.body.account;

  if (!account) {
    const noAddrErr = `Must specify receiver address`
    console.error(noAddrErr)
    res.status(500).send(noAddrErr);
  }

  db.get('SELECT address FROM wallets WHERE address = ?', [account], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else if (!row) {
      // Wallet is not registered yet, add it to the database
      db.run('INSERT INTO wallets (address) VALUES (?)', [account], (err) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Internal server error');
        } else {
          // Execute the script to send and authorize funds to the new wallet
          exec('node src/send_funds.js ' + account, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              res.status(500).send('Internal server error');
            } else {
              console.log(`stdout: ${stdout}`);
              res.status(200).send('Funds sent');
            }
          });
        }
      });
    } else {
      res.status(200).send('Wallet already registered');
    }
  });
});

app.listen(process.env.LISTEN_PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${process.env.LISTEN_PORT ?? '3000'}`);
});
