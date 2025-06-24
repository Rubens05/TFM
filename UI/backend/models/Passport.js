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
  // Campo que relaciona con una versión concreta de otro passport
  relatedPassportVersions: [
    {
      passport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passport',
        required: true
      },
      version: {
        type: Number,
        required: true
      },
      name: { type: String, required: true } // Nombre del DPP relacionado
    }
  ],
  // hash de la versión
  versionHash: {
    type: String,
    default: null,
    description: 'Hash de la versión calculado con name+currentAttributes+timestamp+version'
  },
});

const passportSchema = new mongoose.Schema(
  {
    // id del pasaporte (ObjectId)
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    // nombre del dpp
    name: { type: String, required: true },
    // currentAttributes contendrá la versión "activa" (última)
    currentAttributes: { type: Object, default: {} },
    // versions almacena el historial de cambios (v1, v2, etc.)
    versions: [versionSchema],
    // qrCode almacena la ruta al código QR asociado al pasaporte (/qrcode/id.png)
    qrCode: { type: String, default: null },
    // hash original del DPP en la blockchain
    masterHash: {
      type: String,
      default: null,
      description: 'Hash original calculado con name+currentAttributes+timestamp'
    },
    dynamicHash: {
      type: String,
      default: null,
      description: 'Hash dinámico calculado con los hashes de las versiones y el masterHash'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Passport', passportSchema);
