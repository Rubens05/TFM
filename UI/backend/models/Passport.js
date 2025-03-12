// server/models/Passport.js
const mongoose = require('mongoose');

const passportSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nombre del Partner
  serialNumber: { type: String, required: true },
  attributes: { type: Object, default: {} }, // Documento JSON con los atributos del DPP
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Passport', passportSchema);
