// server/routes/passportRoutes.js
const express = require('express');
const router = express.Router();
const Passport = require('../models/Passport');

// Crear un nuevo DPP (versión 1)
router.post('/', async (req, res) => {
  try {
    const { name, serialNumber, attributes, datasets } = req.body;
    const initialDatasets = datasets || [];
    const initialVersion = {
      version: 1,
      attributes: attributes,
      datasets: initialDatasets,
    };
    const newPassport = new Passport({
      name,
      serialNumber,
      currentAttributes: attributes,
      versions: [initialVersion],
      datasets: initialDatasets,
    });
    await newPassport.save();
    return res.status(201).json(newPassport);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});



// Actualizar (editar) un DPP: se añade una nueva versión
router.put('/:id', async (req, res) => {
  try {
    const { name, serialNumber, attributes, datasets } = req.body; // "datasets" son los nuevos archivos subidos en esta actualización
    const passport = await Passport.findById(req.params.id);
    if (!passport) {
      return res.status(404).json({ error: 'DPP no encontrado' });
    }
    // Fusionar los datasets existentes con los nuevos (si hay)
    const newDatasets = passport.datasets.concat(datasets || []);
    passport.datasets = newDatasets;
    passport.name = name;
    passport.serialNumber = serialNumber;
    passport.currentAttributes = attributes;
    // Crear la nueva versión
    const newVersionNumber = passport.versions.length + 1;
    const newVersion = {
      version: newVersionNumber,
      attributes: attributes,
      datasets: newDatasets,
    };
    passport.versions.push(newVersion);
    await passport.save();
    return res.status(200).json(passport);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Obtener todos los DPPs
router.get('/', async (req, res) => {
  try {

    const passports = await Passport.find();

    // Filtras los campos sensibles en la respuesta (sin modificar la BD)
    passports.forEach((p) => {
      p.versions.forEach((v) => {
        v.datasets.forEach((ds) => {
          // Eliminas lo que no quieras exponer
          delete ds.path;
          delete ds.destination;
          // Podrías eliminar también ds.filename si no quieres mostrarlo
        });
      });
    });

    res.json(passports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un DPP
router.delete('/:id', async (req, res) => {
  try {
    await Passport.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Passport eliminado' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;


module.exports = router;
