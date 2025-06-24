// blockchainInterface.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const router = express.Router();
const Passport = require('../models/Passport');

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
 * Calcula el dynamicHash con los campos:
 *   masterHash + cada versionHash + unixTs
 * @param {string} masterHash      Hex string "0x..." bytes32
 * @param {string[]} versionArr    Array de hashes hex (0x... bytes32)
 * @param {number} unixTs          Timestamp en segundos
 * @returns {string}               bytes32 hex "0x..."
 */
function computeDynamicHash(masterHash, versionArr, unixTs) {
  // 1) Concatenamos como strings
  let payload = masterHash;
  for (const h of versionArr) {
    payload += h;
  }
  payload += unixTs.toString();

  // 2) Hasheamos UTF8(packed)
  return keccak256(toUtf8Bytes(payload));
}


/**
 * Toma un hex string de 24 caracteres (MongoDB ObjectId), o un ObjectId,
 * y lo convierte a bytes12 ("0x" + 24 hex = 12 bytes).
 * @param {string|object} input  e.g. "507f1f77bcf86cd799439011" 
 *                              o "0x507f1f77bcf86cd799439011"
 *                              o un ObjectId de Mongoose
 * @returns {string}             e.g. "0x507f1f77bcf86cd799439011"
 */
function hexToBytes12(input) {
  // 1) Extrae un string con el hex puro
  let hex;
  if (typeof input === 'string') {
    hex = input.trim();
  } else if (input && typeof input.toString === 'function') {
    hex = input.toString().trim();
  } else {
    throw new Error(`ObjectId debe ser un string o tener método toString(), recibido tipo ${typeof input}`);
  }

  // 2) Quita comillas si viniera algo como '"507f..."'
  if (hex.startsWith('"') && hex.endsWith('"')) {
    hex = hex.slice(1, -1);
  }

  // 3) Quita prefijo 0x si existe
  if (hex.toLowerCase().startsWith('0x')) {
    hex = hex.slice(2);
  }

  // 4) Validación: ahora debe quedar exactamente 24 caracteres hex
  if (!/^[0-9a-fA-F]{24}$/.test(hex)) {
    throw new Error(
      `ObjectId debe ser un string hex de 24 caracteres (sin '0x'), recibido '${input}'`
    );
  }

  // 5) Devuelve en minúsculas y con 0x delante
  return '0x' + hex.toLowerCase();
}


/**
 * Guarda en blockchain el hash correspondiente al DPP recibido.
 * @param {object} dpp  El objeto json con información del DPP.
 * @returns {Promise<bytes32>}  El oid del DPP como bytes32.
 */
async function saveMasterHash(dpp) {
  const contract = await getContract();
  const oidHex = dpp._id;
  const oid12 = hexToBytes12(oidHex);
  const unixTs = toUnixTimestamp(dpp.updatedAt.$date);
  const dataHash = computeMasterHash(
    dpp.name,
    dpp.currentAttributes,
    unixTs
  );

  const tx = await contract.storeMasterHash(oid12, unixTs, dataHash);
  await tx.wait();
  console.log(`✔ MasterHash stored: ${dataHash} for OID: ${oid12}`);
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

  const [timestampRaw, masterHash] = await contract.getMasterHash(oidBytes12);
  // Convierte a number
  const tsNumber = Number(timestampRaw);
  // Crea la fecha (multiplicamos por 1000 porque JS Date usa milisegundos)
  const date = new Date(tsNumber * 1000).toISOString();
  console.log(`✔ MasterHash & timestamp retrieved: ${masterHash}, ${date} for OID (bytes12): ${oidBytes12}`);
  return {
    date,
    masterHash
  };
}

async function saveDynamicHash(dpp) {
  const contract = await getContract();
  const oidHex = dpp._id;
  const oid12 = hexToBytes12(oidHex);
  const unixTs = toUnixTimestamp(dpp.updatedAt.$date);

  // console.log(`Guardando Dynamic Hash para OID: ${oid12}`);
  // console.log(`Fecha de actualización: ${dpp.updatedAt.$date}`);
  
 // 1) Recupera masterHash
  const [ , masterHash ] = await contract.getMasterHash(oid12);
  // console.log("masterHash:", masterHash);

  // 2) Recupera todas las versiones: [timestamps, hashes, versionNumbers]
  const [ , versionHashesArr, ] = await contract.getVersionHashes(oid12);
  // console.log("version hashes (arr):", versionHashesArr);


  // 3) Calcula el dynamicHash
  const dynamicHash = computeDynamicHash(masterHash, versionHashesArr, unixTs);
  // console.log("dynamicHash calculado:", dynamicHash);

  // 5) Lo almacena en la blockchain junto al timestamp
  const tx = await contract.storeDynamicHash(oid12, unixTs, dynamicHash);
  await tx.wait();

  console.log(`✔ DynamicHash stored: ${dynamicHash} for OID: ${oid12}`);
  return dynamicHash;
}

async function getDynamicHash(oidHex) {
  const contract = await getContract();

  // Convertimos el ObjectId a bytes12
  const oidBytes12 = hexToBytes12(oidHex);

  const [timestampRaw, dynamicHash] = await contract.getDynamicHash(oidBytes12);
   // Convierte a number
  const tsNumber = Number(timestampRaw);
  // Crea la fecha (multiplicamos por 1000 porque JS Date usa milisegundos)
  const date = new Date(tsNumber * 1000).toISOString();
  console.log(`✔ DynamicHash & timestamp retrieved: ${dynamicHash}, ${date} for OID (bytes12): ${oidBytes12}`);
  return dynamicHash;
}


async function saveVersionHash(dpp) {
  const contract = await getContract();
  const unixTs = toUnixTimestamp(dpp.updatedAt.$date);

  // console.log("Info del dpp:", dpp._id, dpp.name, unixTs, dpp.currentAttributes);
  // console.log("Info de la versión:", dpp.version);


  const oidHex = dpp._id;
  const oid12 = hexToBytes12(oidHex);
 
  // console.log(`Guardando Version Hash para OID: ${oid12}, versión: ${dpp.version}`);
  // console.log(`Fecha de actualización: ${dpp.updatedAt.$date}`);
  // console.log(`Atributos actuales: ${JSON.stringify(dpp.currentAttributes)}`);
  // console.log(`Nombre del DPP: ${dpp.name}`);
  // console.log(`unixTs: ${unixTs}`);
  const dataVersionHash = computeVersionHash(
    dpp.name,
    dpp.currentAttributes,
    unixTs,
    dpp.version
    );

  // console.log(`Data Version Hash: ${dataVersionHash}`);

  const tx = await contract.storeVersionHash(oid12, unixTs, dataVersionHash, dpp.version);
  await tx.wait();
  console.log(`✔ Data Hash stored: ${dataVersionHash} for OID: ${oid12}`);
  return dataVersionHash;
}

async function getVersionHash(oidHex, versionNumber) {
  const contract = await getContract();
  // Convertimos el ObjectId a bytes12
  const oidBytes12 = hexToBytes12(oidHex);
  const [timestampRaw,versionHash, version] = await contract.getVersionHash(oidBytes12, versionNumber);
   // Convierte a number
  const tsNumber = Number(timestampRaw);
  // Crea la fecha (multiplicamos por 1000 porque JS Date usa milisegundos)
  const date = new Date(tsNumber * 1000).toISOString();
  console.log(`✔ VersionHash & timestamp retrieved: ${versionHash}, ${date}, version ${version} for OID (bytes12): ${oidBytes12}`);
  return {date, versionHash, version};
}

async function getVersionHashes(oidHex) {
  const contract = await getContract();
  // Convertimos el ObjectId a bytes12
  const oidBytes12 = hexToBytes12(oidHex);
  const [timestampsRaw, versionHashesRaw, versionsRaw] = await contract.getVersionHashes(oidBytes12);
  // Normaliza BigInt a number y deja los hashes como strings
  const timestamps = timestampsRaw.map(ts => Number(ts));        // de BigInt a number
  const versions   = versionsRaw.map(v  => Number(v));          // de BigInt a number
  const versionHashes = versionHashesRaw.map(h => h.toString()); // bytes32 hex string
  console.log(`✔ VersionHashes retrieved for OID (bytes12): ${oidBytes12}`);

  return { timestamps, versionHashes, versions };
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
