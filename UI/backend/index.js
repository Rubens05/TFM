const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


// Importamos las rutas de passport
const passportRoutes = require('./routes/passportRoutes');
const uploadDocRoutes = require('./routes/docRoutes'); // Nuevo nombre para documentos
const uploadImgRoutes = require('./routes/imgRoutes'); // Nueva ruta para imágenes

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect('mongodb://localhost:27017/dpp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar con MongoDB:', err));

// Rutas
app.use('/api/passports', passportRoutes);
app.use('/api/upload/doc', uploadDocRoutes); // Ruta para documentos
app.use('/api/upload/img', uploadImgRoutes); // Ruta para imágenes

// Servir archivos estáticos
app.use('/uploadDoc', express.static('uploadDoc')); // Archivos de documentos
app.use('/uploadImg', express.static('uploadImg')); // Archivos de imágenes
app.use('/imgs', express.static(path.join(__dirname, 'imgs')));
app.use('/docs', express.static(path.join(__dirname, 'docs')));


// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
