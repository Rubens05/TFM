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
            accounts: ["0x2ae0194554397d9adaa910197b9b74b3d08107d023bcb4194dcae9727f354090"], // Clave privada
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