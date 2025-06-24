// smartContractRoutes.js
const express = require('express');
const router = express.Router();
const {
    saveMasterHash: _saveMasterHash,
    getMasterHash: _getMasterHash,
    getDynamicHash: _getDynamicHash,
    saveDynamicHash: _saveDynamicHash,
    saveVersionHash: _saveVersionHash,
    getVersionHash: _getVersionHash,
    getVersionHashes: _getVersionHashes
} = require('./blockchainController');


/***Save hashes***/
// Save master hash
router.post('/saveMasterHash', async (req, res) => {
    try {
        const json = req.body;
        // aquí podrías hacer validaciones de json...
        const dataHash = await _saveMasterHash(json);
        res.status(201).json({ dataHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Save version hash
router.post('/saveVersionHash', async (req, res) => {
    try {
        const { dpp, version } = req.body; // dpp es el objeto completo y version es un numero
        const versionHash = await _saveVersionHash(dpp, version);
        res.status(201).json({ versionHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// Save dynamic hash
router.post('/saveDynamicHash', async (req, res) => {
    try {
        const dpp = req.body; // dpp es el objeto completo
        const dynamicHash = await _saveDynamicHash(dpp);
        res.status(201).json({ dynamicHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

/*** Get hashes***/
router.get('/getMasterHash/:oid', async (req, res) => {
    try {
        const oid = req.params.oid;             // esto es un string, no un objeto
        const record = await _getMasterHash(oid);
        res.json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get version hash
router.get('/getVersionHash/:oid/:version', async (req, res) => {
    try {
        const oid = req.params.oid;
        const version = parseInt(req.params.version, 10);
        const versionHash = await _getVersionHash(oid, version);
        res.json({ versionHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get version hashes (all versions)
router.get('/getVersionHashes/:oid', async (req, res) => {
    try {
        const oid = req.params.oid;
        const versionHashes = await _getVersionHashes(oid); // null para obtener todos los hashes
        res.json({ versionHashes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get dynamic hash
router.get('/getDynamicHash/:oid', async (req, res) => {
    try {
        const oid = req.params.oid;
        const dynamicHash = await _getDynamicHash(oid);
        res.json({ dynamicHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
