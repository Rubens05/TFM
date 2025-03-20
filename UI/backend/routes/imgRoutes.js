const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Definir el directorio de almacenamiento
const uploadDir = path.join(__dirname, '../imgs'); // Asegurar ruta absoluta

// Crear la carpeta si no existe
if (!fs.existsSync(uploadDir)) {
    console.log('Creando carpeta imgs/');
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento de imágenes con Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Utilizamos la carpeta creada
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes.'), false);
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

// Ruta POST para subir imágenes
router.post('/', upload.single('image'), (req, res) => {
    console.log('Subiendo imagen...');
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo.' });
    }
    res.status(200).json({
        message: 'Imagen subida correctamente.',
        file: req.file,
    });
});

module.exports = router;
