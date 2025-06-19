// smartContractRoutes.js
const express = require('express');
const router = express.Router();
const {
    saveDataRecord: _saveDataRecord,
    getDataRecord: _getDataRecord
} = require('./blockchainController');

router.post('/saveDataRecord', async (req, res) => {
    try {
        const json = req.body;
        // aquí podrías hacer validaciones de json...
        const dataHash = await _saveDataRecord(json);
        res.status(201).json({ dataHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/getDataRecord/:oid', async (req, res) => {
    try {
        const oid = req.params.oid;             // esto es un string, no un objeto
        const record = await _getDataRecord(oid);
        res.json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
