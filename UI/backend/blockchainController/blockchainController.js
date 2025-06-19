// blockchainInterface.js
require('dotenv').config();
const path = require('path');
// Importa lo que v6 realmente exporta:
const { JsonRpcProvider, Wallet, Contract, keccak256, toUtf8Bytes } = require('ethers')
const contractJson = require(path.resolve(__dirname, '../../../Blockchain/smart-contract/artifacts/contracts/contrato.sol/Contrato.json'));


const {
  NETWORK_URL,
  PRIVATE_KEY,
  CONTRACT_ADDRESS
} = process.env;

// Inicializa proveedor y signer
const provider = new JsonRpcProvider(NETWORK_URL)
const signer = new Wallet(PRIVATE_KEY, provider)
const abi = contractJson.abi

// Instancia del contrato
async function getContract() {
  console.log(`Conectando al contrato en: ${CONTRACT_ADDRESS}`);
  return new Contract(CONTRACT_ADDRESS, abi, signer)
}

/**
 * Convierte la fecha ISO de updatedAt a segundos Unix.
 * @param {string} isoDate
 * @returns {number}
 */
function toUnixTimestamp(isoDate) {
  return Math.floor(new Date(isoDate).getTime() / 1000);
}

/**
 * Calcula el hash de los campos name + currentAttributes + updatedAt (Unix).
 * @param {string} name
 * @param {object} currentAttributes
 * @param {number} unixTs
 * @returns {bytes32}
 */
function computeDataHash(name, currentAttributes, unixTs) {
  const payload = name + JSON.stringify(currentAttributes) + unixTs
  return keccak256(toUtf8Bytes(payload))
}

/**
 * Toma un hex string de 24 caracteres (MongoDB ObjectId) y lo convierte a bytes12 (0x + 24 hex = 12 bytes).
 * @param {string} hex24 e.g. "507f1f77bcf86cd799439011"
 * @returns {string} e.g. "0x507f1f77bcf86cd799439011"
 */
function hexToBytes12(hex24) {
  console.log(`Convirtiendo ObjectId a bytes12: ${hex24}`);
  if (!/^([0-9a-fA-F]{24})$/.test(hex24)) {
    throw new Error('ObjectId debe ser un string hex de 24 caracteres');
  }
  return '0x' + hex24;
}

/**
 * Guarda en blockchain el hash correspondiente al DPP recibido.
 * @param {object} json  El objeto json con información del DPP.
 * @returns {Promise<bytes32>}  El oid del DPP como bytes32.
 */
async function saveDataRecord(dpp) {
  const contract = await getContract();
  const oidHex = dpp._id.$oid;
  const oid12 = hexToBytes12(oidHex);
  const unixTs = toUnixTimestamp(dpp.updatedAt.$date);
  const dataHash = computeDataHash(
    dpp.name,
    dpp.currentAttributes,
    unixTs
  );

  const tx = await contract.storeHash(oid12, unixTs, dataHash);
  await tx.wait();
  console.log(`✔ Data Hash stored: ${dataHash} for OID: ${oid12}`);
  return dataHash;
}

/**
 * Recupera el registro (timestamp y hash) de la blockchain.
 * @param {string} oidHex  El ObjectID del DPP como string hex de 24 chars.
 * @returns {Promise<{ timestamp: number, dataHash: string }>}
 */
async function getDataRecord(oidHex) {
  const contract = await getContract();

  // Convertimos el ObjectId a bytes12
  const oidBytes12 = hexToBytes12(oidHex);

  const [timestampRaw, dataHash] = await contract.getHash(oidBytes12);
  // Convierte a number
  const tsNumber = Number(timestampRaw);
  // Crea la fecha (multiplicamos por 1000 porque JS Date usa milisegundos)
  const date = new Date(tsNumber * 1000).toISOString();
  console.log(`✔ Data Hash & timestamp retrieved: ${dataHash}, ${date} for OID (bytes12): ${oidBytes12}`);
  return {
    date,
    dataHash
  };
}


module.exports = {
  saveDataRecord,
  getDataRecord,
  computeDataHash,
  toUnixTimestamp
};
