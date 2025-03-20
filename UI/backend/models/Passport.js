// server/models/Passport.js
const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  attributes: { type: Object, required: true },
  datasets: { type: [Object], default: [] }, // Cada versión con su propio array de datasets
  photo: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now },
});

const passportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    serialNumber: { type: String, required: true },
    // currentAttributes: si lo usas para reflejar la versión "activa"
    currentAttributes: { type: Object, default: {} },
    // "versions" almacena el historial de cambios (v1, v2, etc.)
    versions: [versionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Passport', passportSchema);
