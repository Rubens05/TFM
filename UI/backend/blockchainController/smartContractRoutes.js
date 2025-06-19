const express = require('express');
const app = express.Router();
const blockchainController = require('./blockchainController');

app.post('/records', blockchainController.saveDataRecord);
app.get('/records/:key', blockchainController.getDataRecord);


module.exports = app;