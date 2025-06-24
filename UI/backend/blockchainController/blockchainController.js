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
function computeMasterHash(name, currentAttributes, unixTs) {
  const payload = name + JSON.stringify(currentAttributes) + unixTs
  return keccak256(toUtf8Bytes(payload))
}


/**
 * Calcula el versionHash con los campos name + currentAttributes + updatedAt (Unix) + version.
 * @param {string} name
 * @param {object} currentAttributes
 * @param {number} unixTs
 * @returns {bytes32}
 */
function computeVersionHash(name, currentAttributes, unixTs, version) {
  const payload = name + JSON.stringify(currentAttributes) + unixTs + version;
  return keccak256(toUtf8Bytes(payload))
}


/**
 * Calcula el dynamicHash con los campos masterHash + versionHashes + unixTs.
 * @param {string} masterHash
 * @param {object} versionHashes
 * @param {number} unixTs
 * @returns {bytes32}
 */
function computeDynamicHash(masterHash, versionHashes, unixTs) {
  const payload = masterHash + JSON.stringify(versionHashes) + unixTs;
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
 * @param {object} dpp  El objeto json con información del DPP.
 * @returns {Promise<bytes32>}  El oid del DPP como bytes32.
 */
async function saveMasterHash(dpp) {
  const contract = await getContract();
  const oidHex = dpp._id.$oid;
  const oid12 = hexToBytes12(oidHex);
  const unixTs = toUnixTimestamp(dpp.updatedAt.$date);
  const dataHash = computeMasterHash(
    dpp.name,
    dpp.currentAttributes,
    unixTs
  );

  const tx = await contract.storeMasterHash(oid12, unixTs, dataHash);
  await tx.wait();
  console.log(`✔ Data Hash stored: ${dataHash} for OID: ${oid12}`);
  return dataHash;
}

/**
 * Recupera el registro (timestamp y hash) de la blockchain.
 * @param {string} oidHex  El ObjectID del DPP como string hex de 24 chars.
 * @returns {Promise<{ timestamp: number, dataHash: string }>}
 */
async function getMasterHash(oidHex) {
  const contract = await getContract();

  // Convertimos el ObjectId a bytes12
  const oidBytes12 = hexToBytes12(oidHex);

  const [timestampRaw, dataHash] = await contract.getMasterHash(oidBytes12);
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


async function getDynamicHash(oidHex) {
  const contract = await getContract();

  // Convertimos el ObjectId a bytes12
  const oidBytes12 = hexToBytes12(oidHex);

  const dynamicHash = await contract.getDynamicHash(oidBytes12);
  console.log(`✔ Dynamic Hash retrieved: ${dynamicHash} for OID (bytes12): ${oidBytes12}`);
  return dynamicHash;
}

async function saveDynamicHash(dpp) {
  const contract = await getContract();
  const oidHex = dpp._id.$oid;
  const oid12 = hexToBytes12(oidHex);
  console.log(`Guardando Dynamic Hash para OID: ${oid12}`);
  console.log(`Fecha de actualización: ${dpp.updatedAt.$date}`);
  console.log(`Atributos actuales: ${JSON.stringify(dpp.currentAttributes)}`);
  console.log(`Nombre del DPP: ${dpp.name}`);
  const dynamicHash = computeDynamicHash(
    dpp.masterHash,
    dpp.versions.reduce((acc, version) => {
      acc[version.version] = version.versionHash;
      return acc;
    }, {}),

    toUnixTimestamp(dpp.updatedAt.$date)
  );
  const tx = await contract.storeDynamicHash(oid12, dynamicHash);
  await tx.wait();
  console.log(`✔ Dynamic Hash stored: ${dynamicHash} for OID: ${oid12}`);
  return dynamicHash;
}


async function saveVersionHash(dpp, version) {
  const contract = await getContract();
  const oidHex = dpp._id.$oid;
  const oid12 = hexToBytes12(oidHex);
  const unixTs = toUnixTimestamp(dpp.updatedAt.$date);
  console.log(`Guardando Version Hash para OID: ${oid12}, versión: ${version.version}`);
  console.log(`Fecha de actualización: ${dpp.updatedAt.$date}`);
  console.log(`Atributos actuales: ${JSON.stringify(dpp.currentAttributes)}`);
  console.log(`Nombre del DPP: ${dpp.name}`);
  console.log(`unixTs: ${unixTs}`);
  const dataVersionHash = computeVersionHash(
    dpp.name,
    dpp.currentAttributes,
    unixTs,
    version.version
  );

  console.log(`Data Version Hash: ${dataVersionHash}`);

  const tx = await contract.storeVersionHash(oid12, unixTs, dataVersionHash, version);
  await tx.wait();
  console.log(`✔ Data Hash stored: ${dataHash} for OID: ${oid12}`);
  return dataHash;
}

async function getVersionHash(oidHex, versionNumber) {
  const contract = await getContract();
  // Convertimos el ObjectId a bytes12
  const oidBytes12 = hexToBytes12(oidHex);
  const versionHash = await contract.getVersionHash(oidBytes12, versionNumber);
  console.log(`✔ Version Hash retrieved: ${versionHash} for OID (bytes12): ${oidBytes12}, version: ${versionNumber}`);
  return versionHash;
}

async function getVersionHashes(oidHex) {
  const contract = await getContract();
  // Convertimos el ObjectId a bytes12
  const oidBytes12 = hexToBytes12(oidHex);
  const versionHashes = await contract.getVersionHashes(oidBytes12);
  console.log(`✔ Version Hashes retrieved for OID (bytes12): ${oidBytes12}`);
  return versionHashes;
}

module.exports = {
  saveMasterHash,
  saveVersionHash,
  saveDynamicHash,
  getMasterHash,
  getVersionHash,
  getVersionHashes,
  getDynamicHash,
  computeMasterHash,
  computeVersionHash,
  computeDynamicHash,
  toUnixTimestamp
};
