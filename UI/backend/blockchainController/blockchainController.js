require("dotenv").config();
const { ethers } = require("ethers");
const path = require("path");

// Cargar el ABI del contrato 
const contractABI = require(path.join(
    __dirname,
    "x"
)).abi;

// Dirección del contrato desplegado
const contractAddress = "x";
const privateKey = "x";

// Configuración del proveedor y el contrato
const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Almacenar un dataHash.
 * @param {number} a - Identificador del campo.
 * @param {number} b - Identificador de producción.
 * @param {number} c - Marca de tiempo (en segundos).
 * @param {string} d - Hash de datos (bytes32).
 */
async function storeDataHash(a, b, c, d) {
    const tx = await contract.storeDataHash(a, b, c, d);
    await tx.wait();
    console.log(`[Blockchain] DataHash saved ${a}: ${b}`);
}

/**
 * Obtener un dataHash individual.
 * @param {number} a - Identificador del campo.
 * @param {number} b - Identificador de producción.
 * @param {number} c - Marca de tiempo (en segundos).
 * @returns {Promise<string>} El dataHash almacenado.
 */
async function getDataHash(a, b, c) {
    const hash = await contract.getDataHash(a, b, c);
    console.log(`[Blockchain] DataHash received ${c}: ${hash}`);
    return hash;
}

module.exports = {
    storeDataHash,
    getDataHash,
};