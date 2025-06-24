require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");

module.exports = {
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200, // Optimiza el código para mayor rendimiento
            },
        },
    },
    networks: {
        besu: {
            url: "http://localhost:8545", // URL de tu nodo Besu
            accounts: ["0x0d84394cd5d0ce70c78402c7485c8e625ffc7c3e24b13c52bfd0e09148f21467"], // Clave privada
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            timeout: 1800000, // 30 minutos de espera para evitar desconexión
        },
    },
    mocha: {
        timeout: 300000, // 5 minutos de espera para los tests
    },
    defaultNetwork: "localhost",
};