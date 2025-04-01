// server/models/Passport.js
const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  // attributes ahora será un objeto con secciones, por ejemplo:
  // { Origen: { pais: "España", ciudad: "Madrid" }, Logística: { transporte: "Camión" } }
  attributes: { type: Object, required: true },
  datasets: { type: [Object], default: [] }, // Cada versión con su propio array de datasets
  photo: { type: Object, default: null },      // Objeto con los datos de la foto (originalname, encoding, mimetype, size, filename)
  createdAt: { type: Date, default: Date.now },
});

const passportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // currentAttributes contendrá la versión "activa" (última)
    currentAttributes: { type: Object, default: {} },
    // versions almacena el historial de cambios (v1, v2, etc.)
    versions: [versionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Passport', passportSchema);
