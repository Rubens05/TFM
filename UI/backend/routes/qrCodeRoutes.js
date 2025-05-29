const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 1) Directorio de almacenamiento en public/qrcodes
const uploadDir = path.join(__dirname, '../qrcodes');
if (!fs.existsSync(uploadDir)) {
    console.log('Creando carpeta qrcodes/');
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2) Configuración de Multer
const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => {
        // forzamos extensión .png si viene base64 u otro nombre
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `qr-${Date.now()}${ext}`);
    }
});

// Aceptamos sólo PNG o JPEG (ajusta si necesitas sólo PNG)
const fileFilter = (_, file, cb) => {
    if (['image/png', 'image/jpeg'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes PNG/JPEG.'), false);
    }
};

const upload = multer({ storage, fileFilter });

// 3) Ruta POST para subir el QR
//    El campo del form debe llamarse "qrCode"
router.post('/', upload.single('qrCode'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún QR.' });
    }
    res.status(200).json({
        message: 'QR subido correctamente.',
        file: req.file // contiene { filename, path, mimetype, ... }
    });
});

module.exports = router;
