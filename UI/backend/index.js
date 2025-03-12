// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importamos las rutas de passport
const passportRoutes = require('./routes/passportRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB (reemplaza <tu_uri> con la cadena de conexión, por ejemplo, 'mongodb://localhost:27017/dpp')
mongoose
  .connect('mongodb://localhost:27017/dpp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar con MongoDB:', err));

// Rutas
app.use('/api/passports', passportRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
