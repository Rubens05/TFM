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
    getVersionHashes: _getVersionHashes,
    verifyMasterHash: _verifyMasterHash,
    verifyVersionHash: _verifyVersionHash,
    verifyDynamicHash: _verifyDynamicHash
} = require('./blockchainController');


/***Save hashes***/
// Save master hash
router.post('/saveMasterHash', async (req, res) => {
    try {
        const json = req.body;
        // aquí podrías hacer validaciones de json...
        const masterHash = await _saveMasterHash(json);
        res.status(201).json({ masterHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Save version hash
router.post('/saveVersionHash', async (req, res) => {
    try {
        const json = req.body; // dpp es el objeto completo y version es un numero
        const versionHash = await _saveVersionHash(json);
        res.status(201).json({ versionHash });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// Save dynamic hash
router.post('/saveDynamicHash', async (req, res) => {
    try {
        const json = req.body; // dpp es el objeto completo
        const dynamicHash = await _saveDynamicHash(json);
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
        const masterHash = await _getMasterHash(oid);
        res.json(masterHash);
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
        const {timestamps, versionHash, vers} = await _getVersionHash(oid, version);
        res.json({ timestamps, versionHash, vers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get version hashes (all versions)
router.get('/getVersionHashes/:oid', async (req, res) => {
    try {
        const oid = req.params.oid;
        const { timestamps, versionHashes, versions } = await _getVersionHashes(oid);
        res.json({ timestamps, versionHashes, versions });
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



/*** Hashes verification ***/
// Verify master hash
router.post('/verifyMasterHash', async (req, res) => {
    try {
        const { dppData, offChainHash } = req.body;
        if (!dppData || !offChainHash) {
            return res.status(400).json({ error: 'Debe enviar dppData y offChainHash.' });
        }
        const result = await _verifyMasterHash(dppData, offChainHash);
        res.json(result);
    } catch (err) {
        console.error('[verifyMasterHash] ', err);
        res.status(500).json({ error: err.message });
    }
});

// Verify version hash
router.post('/verifyVersionHash', async (req, res) => {
    try {
        const { dppData, offChainVersionHash, version } = req.body;
        if (!dppData || !offChainVersionHash || typeof version !== 'number') {
            return res.status(400).json({ error: 'Debe enviar dppData, offChainVersionHash y version.' });
        }
        const result = await _verifyVersionHash(dppData, offChainVersionHash, version);
        res.json(result);
    } catch (err) {
        console.error('[verifyVersionHash] ', err);
        res.status(500).json({ error: err.message });
    }
});

// Verify dynamic hash
router.post('/verifyDynamicHash', async (req, res) => {
    try {
        const { dppData, offChainDynamicHash } = req.body;
        if (!dppData || !offChainDynamicHash) {
            return res.status(400).json({ error: 'Debe enviar dppData y offChainDynamicHash.' });
        }
        const result = await _verifyDynamicHash(dppData, offChainDynamicHash);
        res.json(result);
    } catch (err) {
        console.error('[verifyDynamicHash] ', err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
