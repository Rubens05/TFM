const express = require('express');
const router = express.Router();
const Passport = require('../models/Passport');

// Endpoint para crear un nuevo Passport (DPP)
router.post('/', async (req, res) => {
  try {
    const { name, serialNumber, attributes } = req.body;
    const newPassport = new Passport({ name, serialNumber, attributes });
    await newPassport.save();
    return res.status(201).json(newPassport);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener todos los Passports
router.get('/', async (req, res) => {
  try {
    const passports = await Passport.find();
    return res.status(200).json(passports);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
