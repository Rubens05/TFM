// ignition/modules/Agrisol.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ContratoModule", (m) => {
    // Crear el contrato Agrisol sin parámetros (no los necesita según el código actual)
    const contrato = m.contract("Agrisol");

    return { contrato };
});