// server/routes/passportRoutes.js
const express = require('express');
const router = express.Router();
const Passport = require('../models/Passport');

const fs = require('fs');
const path = require('path');

// Crear un nuevo DPP (versión 1)
router.post('/', async (req, res) => {
  try {
    const { name, serialNumber, attributes, datasets, photo } = req.body;
    console.log(req.body);
    const initialDatasets = datasets || [];
    const initialPhoto = photo || null;
    const initialVersion = {
      version: 1,
      attributes: attributes,
      datasets: initialDatasets,
      photo: initialPhoto,
    };
    const newPassport = new Passport({
      name,
      serialNumber,
      currentAttributes: attributes,
      versions: [initialVersion],
      datasets: initialDatasets,
      photo: initialPhoto,
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
    const { attributes, datasets, photo } = req.body;
    // "datasets" es el array final (sin los que se quitaron y con los que se añadieron)

    const passport = await Passport.findById(req.params.id);
    if (!passport) {
      return res.status(404).json({ error: 'DPP no encontrado' });
    }

    // Actualiza atributos actuales
    passport.currentAttributes = attributes;

    // Actualiza la foto de la versión actual
    if (photo) {
      console.log(photo);

      passport.photo = photo;
    }

    // Crea la nueva versión
    const newVersionNumber = passport.versions.length + 1;
    const newVersion = {
      version: newVersionNumber,
      attributes: attributes,
      datasets: datasets || [], // uso literal del array que llega
      photo: photo || null,
      createdAt: new Date()
    };

    // Insertar la nueva versión al final
    passport.versions.push(newVersion);

    // (Opcional) Si usabas un passport.datasets global, puedes quitarlo 
    // o setearlo a lo que quieras, pero ya NO hagas merges con lo viejo
    // passport.datasets = datasets; // si tu schema lo requiere

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
    res.json(passports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un DPP, sus datasets y fotos 
router.delete('/:id', async (req, res) => {
  try {
    const passport = await Passport.findById(req.params.id);
    if (!passport) {
      return res.status(404).json({ error: 'DPP no encontrado' });
    }

    // Recorrer cada versión y cada dataset para eliminar el archivo de forma síncrona
    for (const version of passport.versions) {
      // Eliminar los archivos de cada dataset
      for (const ds of version.datasets) {
        const filePath = path.join(__dirname, '../docs', ds.filename);
        if (fs.existsSync(filePath)) {
          try {
            await fs.promises.unlink(filePath);
            console.log(`Archivo eliminado: ${filePath}`);
          } catch (err) {
            console.error(`Error eliminando archivo: ${filePath}`, err);
          }
        }
      }

      // Eliminar la foto de la versión
      if (version.photo) {
        const photoPath = path.join(__dirname, '../imgs', version.photo.filename);
        if (fs.existsSync(photoPath)) {
          try {
            await fs.promises.unlink(photoPath);
            console.log(`Foto eliminada: ${photoPath}`);
          } catch (err) {
            console.error(`Error eliminando foto: ${photoPath}`, err);
          }
        }
      }

    }

    // Eliminar el documento después de borrar los archivos
    await Passport.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Passport y archivos asociados eliminados' });
  } catch (error) {
    console.error("Error en la eliminación:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;