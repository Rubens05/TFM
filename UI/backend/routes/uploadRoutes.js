const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configurar almacenamiento de archivos con Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Guarda los archivos en la carpeta "uploads"
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Genera un nombre único para el archivo (por ejemplo, file-<timestamp>.csv)
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
});

// Filtro para aceptar solo archivos CSV
const fileFilter = (req, file, cb) => {
    // Verifica que el tipo MIME corresponda a CSV
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Por favor, sube un archivo CSV.'), false);
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

// Ruta POST para subir el archivo CSV
// El campo "file" debe coincidir con el que envías desde el frontend
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }
    res.status(200).json({
        message: 'Archivo subido correctamente.',
        file: req.file,
    });
});

module.exports = router;
