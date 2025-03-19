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
    const { attributes, datasets } = req.body; 
    // "datasets" es el array final (sin los que se quitaron, con los que se añadieron)

    const passport = await Passport.findById(req.params.id);
    if (!passport) {
      return res.status(404).json({ error: 'DPP no encontrado' });
    }

    // Actualiza atributos actuales
    passport.currentAttributes = attributes;

    // Crea la nueva versión
    const newVersionNumber = passport.versions.length + 1;
    const newVersion = {
      version: newVersionNumber,
      attributes: attributes,
      datasets: datasets || [], // uso literal del array que llega
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

// Eliminar un DPP y sus datasets asociados
router.delete('/:id', async (req, res) => {
  try {
    const passport = await Passport.findById(req.params.id);
    if (!passport) {
      return res.status(404).json({ error: 'DPP no encontrado' });
    }

    // Recorrer cada versión y cada dataset para eliminar el archivo
    passport.versions.forEach((version) => {
      version.datasets.forEach((ds) => {
        const filePath = path.join(__dirname, '../../uploads', ds.filename);
        // Comprobar que el archivo existe antes de intentar borrarlo
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error eliminando archivo:", filePath, err);
          });
        }
      });
    });

    await Passport.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Passport y archivos asociados eliminados' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;