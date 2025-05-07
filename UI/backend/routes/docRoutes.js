const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configurar almacenamiento de archivos con Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Si no existe, crea la carpeta "uploads"
        const dir = path.join(__dirname, '../docs');
        if (!fs.existsSync(dir)) {
            console.log('Creando carpeta docs/');
            fs.mkdirSync(dir);
        }

        // Guarda los archivos en la carpeta "docs"
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Genera un nombre único para el archivo (por ejemplo, file-<timestamp>.csv)
        const ext = path.extname(file.originalname);
        // Poner el dia de hoy como nombre del archivo con el nombre original y la extensión
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];
        const newFileName = `${formattedDate}-${file.originalname.replace(ext, '')}${ext}`;
        cb(null, newFileName);
    },
});

// Filtro para aceptar cualquier tipo de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = /csv|pdf|docx|xlsx|png|jpg|jpeg/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
        return cb(null, true);
    }

    // Acepta videos (validación de tamaño se hace con 'limits')
    if (mime.startsWith('video/')) {
        return cb(null, true);
    }

    return cb(new Error('Tipo de archivo no permitido.'));
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
