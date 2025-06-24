// server/routes/passportRoutes.js
const express = require('express');
const router = express.Router();
const Passport = require('../models/Passport');

const fs = require('fs');
const path = require('path');

// Importart interface Blockchain
// Importamos la interfaz blockchain
const { saveDataRecord, saveMasterHash, saveVersionHash, saveDynamicHash } = require('../blockchainController/blockchainController');
const { version } = require('os');

// Crear un nuevo DPP (versión 1)
// Se espera que "attributes" venga como objeto de secciones,
// por ejemplo: { Origen: { pais: "España", ciudad: "Madrid", datasets: [...] }, Logística: { transporte: "Camión", datasets: [...] } }
router.post('/', async (req, res) => {
  try {
    const { name, attributes, datasets, photo, relatedPassportVersions } = req.body;
    console.log("POST /api/passports - req.body:", req.body);
    // En este nuevo formato, se asume que los datasets pueden estar incluidos dentro de cada sección;
    // Si además se envía un array datasets global, se usará para la versión global.
    const initialDatasets = datasets || [];
    const initialPhoto = photo || null;
    const initialVersion = {
      version: 1,
      attributes: attributes,
      datasets: initialDatasets,
      photo: initialPhoto,
      // Si no se envía, ponemos array vacío
      relatedPassportVersions: relatedPassportVersions || [],
    };
    // Crear el DPP inicial
    const newPassport = new Passport({
      name,
      currentAttributes: attributes,
      versions: [initialVersion],
    });
    console.log("Nuevo DPP creado:", newPassport);
    console.log("Related passports:", relatedPassportVersions);
    // Guardar el DPP en la base de datos
    await newPassport.save();

    //Debugear antes de blockchain
    console.log("DPP guardado en la base de datos:", newPassport);

    // Integración blockchain: guardamos el masterHash del DPP
    const hash = await saveMasterHash({
      _id: { $oid: newPassport._id },
      name: newPassport.name,
      currentAttributes: newPassport.currentAttributes,
      updatedAt: { $date: newPassport.updatedAt.toISOString() }
    });
    console.log("Hash guardado en blockchain:", hash);
    newPassport.masterHash = hash;
    await newPassport.save();

    // Guardar el hash de la versión inicial en blockchain
    const versionHash = await saveVersionHash({
      _id: { $oid: newPassport._id },
      name: newPassport.name,
      currentAttributes: newPassport.currentAttributes,
      updatedAt: { $date: newPassport.updatedAt.toISOString() },
      version: initialVersion.version
    });
    // Asignar el hash de la versión al DPP
    initialVersion.versionHash = versionHash;
    newPassport.versions[0] = initialVersion; // Actualizar la primera versión con

    console.log("Hash de la versión guardado en blockchain:", versionHash);
    // Guardar el hash dinámico del DPP
    await newPassport.save();

    const dynamicHash = await saveDynamicHash({
      _id: { $oid: newPassport._id },
      masterHash: newPassport.masterHash,
      versions: newPassport.versions.reduce((acc, version) => {
        acc[version.version] = version.versionHash;
        return acc;
      }, {}),
      updatedAt: { $date: newPassport.updatedAt.toISOString() }
    });
    console.log("Hash dinámico guardado en blockchain:", dynamicHash);

    // Guardar el dynamicHash en el DPP
    newPassport.dynamicHash = dynamicHash;
    await newPassport.save();


    return res.status(201).json(newPassport);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Actualizar (editar) un DPP: se añade una nueva versión
router.put('/:id', async (req, res) => {
  try {
    const { attributes, datasets, photo, relatedPassportVersions } = req.body;
    // "attributes" es el objeto final con secciones.
    // "datasets" es el array global final (si se usa) y
    // "photo" es el objeto de la foto a utilizar (puede ser null).
    const passport = await Passport.findById(req.params.id);
    if (!passport) {
      return res.status(404).json({ error: 'DPP no encontrado' });
    }

    // Actualizar currentAttributes
    passport.currentAttributes = attributes;
    // En este ejemplo, la foto se guarda por versión, así que no se actualiza globalmente

    // Crear la nueva versión
    const newVersionNumber = passport.versions.length + 1;

    // Guardar el hash de la versión en blockchain
    const newVersionHash = await saveVersionHash({
      _id: { $oid: passport._id.toString() },
      name: passport.name,
      currentAttributes: passport.currentAttributes,
      updatedAt: { $date: passport.updatedAt.toISOString() },
      version: newVersionNumber
    });

    // Estructurar la nueva versión
    const newVersion = {
      version: newVersionNumber,
      attributes: attributes,
      datasets: datasets || [],
      photo: photo || null,
      createdAt: new Date(),
      relatedPassportVersions: relatedPassportVersions || [],
      versionHash: newVersionHash,
    };

    // Insertar la nueva versión
    passport.versions.push(newVersion);

    // Actualizar el hash dinámico del DPP
    const newDynamicHash = await saveDynamicHash({
      _id: { $oid: passport._id.toString() }
    });

    // Guardar el dynamicHash en el DPP
    passport.dynamicHash = newDynamicHash;
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

// Obtener un DPP por ID
router.get('/:id', async (req, res) => {
  try {
    const passport = await Passport.findById(req.params.id);
    if (!passport) {
      return res.status(404).json({ error: 'DPP no encontrado' });
    }
    res.json(passport);
  } catch (error) {
    console.error("Error al obtener DPP:", error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un DPP, sus datasets y fotos
// Se asume que los archivos de datasets se almacenan en "../docs" y las imágenes en "../imgs"
router.delete('/:id', async (req, res) => {
  try {
    const passport = await Passport.findById(req.params.id);
    if (!passport) {
      return res.status(404).json({ error: 'DPP no encontrado' });
    }

    // Recorrer cada versión y eliminar archivos asociados
    for (const version of passport.versions) {
      // 1. Eliminar archivos del array global de datasets (si existe)
      if (version.datasets && Array.isArray(version.datasets)) {
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
      }
      // 2. Recorrer cada sección en attributes y, si la sección tiene propiedad "datasets", eliminar esos archivos
      if (version.attributes && typeof version.attributes === 'object') {
        for (const sectionKey of Object.keys(version.attributes)) {
          const section = version.attributes[sectionKey];
          if (section.datasets && Array.isArray(section.datasets)) {
            for (const ds of section.datasets) {
              const filePath = path.join(__dirname, '../docs', ds.filename);
              if (fs.existsSync(filePath)) {
                try {
                  await fs.promises.unlink(filePath);
                  console.log(`Archivo eliminado en sección "${sectionKey}": ${filePath}`);
                } catch (err) {
                  console.error(`Error eliminando archivo en sección "${sectionKey}": ${filePath}`, err);
                }
              }
            }
          }
        }
      }
      // 3. Eliminar la foto (si existe)
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
      // 4. Eliminar el QR (si existe)
      if (passport.qrCode) {
        const qrCodePath = path.join(__dirname, '../qrcodes', `${passport._id}.png`);
        if (fs.existsSync(qrCodePath)) {
          try {
            await fs.promises.unlink(qrCodePath);
            console.log(`QR eliminado: ${qrCodePath}`);
          } catch (err) {
            console.error(`Error eliminando QR: ${qrCodePath}`, err);
          }
        }
      }
    }

    // Finalmente, eliminar el documento de MongoDB
    await Passport.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Passport y archivos asociados eliminados' });
  } catch (error) {
    console.error("Error en la eliminación:", error);
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/passports/:id/qr
router.patch('/:id/qr', async (req, res) => {
  try {
    const { qrCode } = req.body;
    const passport = await Passport.findById(req.params.id);
    if (!passport) return res.status(404).json({ error: 'DPP no encontrado' });

    // extraemos el base64
    const match = qrCode.match(/^data:image\/png;base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'QR mal formado' });

    const buffer = Buffer.from(match[1], 'base64');
    const dir = path.join(__dirname, '..', 'qrcodes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `${passport._id}.png`;
    fs.writeFileSync(path.join(dir, filename), buffer);

    passport.qrCode = `/qrcodes/${filename}`;
    await passport.save();

    res.json(passport);
  } catch (error) {
    console.error('Error guardando QR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
