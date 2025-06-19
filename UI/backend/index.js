const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


// Importamos las rutas de passport
const passportRoutes = require('./routes/passportRoutes');
const uploadDocRoutes = require('./routes/docRoutes'); // Nuevo nombre para documentos
const uploadImgRoutes = require('./routes/imgRoutes'); // Nueva ruta para imágenes
const uploadQRCodeRoutes = require('./routes/qrCodeRoutes'); // Nueva ruta para qrCodes

// Nueva ruta para blockchain
const blockchainRoutes = require('../backend/blockchainController/smartContractRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const { MONGO_URI, PORT } = process.env;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar con MongoDB:', err));

// Rutas
app.use('/api/passports', passportRoutes);
app.use('/api/upload/doc', uploadDocRoutes); // Ruta para documentos
app.use('/api/upload/img', uploadImgRoutes); // Ruta para imágenes
app.use('/api/upload/qrcode', uploadQRCodeRoutes); // Ruta para qrcodes

// Servir archivos estáticos
app.use('/imgs', express.static(path.join(__dirname, 'imgs')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));
app.use('/qrcodes', express.static(path.join(__dirname, 'qrcodes')));

// Ruta para blockchain
// POST   /api/data/saveDataRecord      { …JSON… }
// GET    /api/data/getDataRecord/:key
app.use('/api/data', blockchainRoutes);

// Servir React en producción
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// si ninguna ruta respondió:
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// manejador de errores:
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

