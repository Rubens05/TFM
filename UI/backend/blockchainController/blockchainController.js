// blockchainInterface.js
require('dotenv').config();
const path = require('path');
// Importa lo que v6 realmente exporta:
const {  JsonRpcProvider,  Wallet,  Contract,  keccak256,  toUtf8Bytes} = require('ethers')
const contractJson = require(path.resolve(__dirname, '../../../Blockchain/smart-contract/artifacts/contracts/contrato.sol/Contrato.json'));


const {
  NETWORK_URL,
  PRIVATE_KEY,
  CONTRACT_ADDRESS
} = process.env;

// Inicializa proveedor y signer
const provider = new JsonRpcProvider(NETWORK_URL)
const signer   = new Wallet(PRIVATE_KEY, provider)
const abi      = contractJson.abi

// Instancia del contrato
async function getContract() {
  return new Contract(CONTRACT_ADDRESS, abi, signer)
}

/**
 * Calcula la clave única del registro a partir del _id.$oid del JSON.
 * @param {string} oid MongoDB ObjectID string
 * @returns {bytes32} recordKey
 */
function computeRecordKey(oid) {
   return keccak256(toUtf8Bytes(oid))
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
 * Guarda en blockchain el DataRecord correspondiente al DPP recibido.
 * @param {object} json  El objeto completo tal como lo devuelve el DPP
 * @returns {Promise<bytes32>}  El recordKey usado
 */
async function saveDataRecord(json) {
  console.log(`Storing DataRecord for ${json}`);
  console.log(`  - _id: ${json._id.$oid}`);
  console.log(`  - name: ${json.name}`);
  console.log(`  - updatedAt: ${json.updatedAt.$date}`);
  console.log(`  - currentAttributes: ${JSON.stringify(json.currentAttributes)}`);
  const contract   = await getContract();
  const oid        = json._id.$oid;
  const recordKey  = computeRecordKey(oid);
  const unixTs     = toUnixTimestamp(json.updatedAt.$date);
  const dataHash   = computeDataHash(
    json.name,
    json.currentAttributes,
    unixTs
  );

  // Envía la tx
  const tx = await contract.storeHash(recordKey, unixTs, dataHash);
  const receipt = await tx.wait();
  console.log(`✔ Data Hash stored`);
  return recordKey;
}

/**
 * Recupera el registro (timestamp y hash) de la blockchain.
 * @param {string|bytes32} recordKey  El mismo que devolvió saveDataRecord
 * @returns {Promise<{ timestamp: number, dataHash: string }>}
 */
async function getDataRecord(recordKey) {
  const contract = await getContract();
  const [ timestamp, dataHash ] = await contract.getHash(recordKey);
  // timestamp viene como BigNumber
  return {
    timestamp: timestamp.toNumber(),
    dataHash
  };
}

module.exports = {
  saveDataRecord,
  getDataRecord,
  computeRecordKey,
  computeDataHash,
  toUnixTimestamp
};
