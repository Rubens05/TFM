const hre = require("hardhat");

async function main() {
    // Obtener el contrato
    const Contrato = await hre.ethers.getContractFactory("Contrato");

    // Desplegar el contrato
    const contrato = await Contrato.deploy();

    // Esperar a que la transacción de despliegue sea confirmada
    await contrato.deploymentTransaction().wait();

    console.log("Contrato deployed to:", contrato.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});