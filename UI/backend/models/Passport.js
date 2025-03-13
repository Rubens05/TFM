// server/models/Passport.js
const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: { type: Number, required: true },
  attributes: { type: Object, required: true },
  datasets: { type: [Object], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const passportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    serialNumber: { type: String, required: true },
    currentAttributes: { type: Object, default: {} },
    versions: [versionSchema],
    // Aquí se acumulan todos los datasets subidos a lo largo del tiempo
    datasets: { type: [Object], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Passport', passportSchema);
