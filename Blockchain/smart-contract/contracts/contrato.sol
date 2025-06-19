// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Contrato {
    // Estructura para almacenar el hash y timestamp
    struct DataRecord {
        uint256 timestamp;   // Fecha de updatedAt en segundos Unix
        bytes32 dataHash;    // Hash calculado de name + currentAttributes + updatedAt
    }

    // Mapeo desde una clave única (por ejemplo, keccak256 del _id del JSON) al registro de datos
    mapping(bytes32 => DataRecord) public records;

    // Eventos para registrar el guardado de hash
    event DataHashStored(
        bytes32 indexed recordKey,
        uint256 timestamp,
        bytes32 dataHash
    );

    /**
     * @notice Almacena el hash de un registro a partir de un identificador y timestamp
     * @param recordKey Clave única del registro (por ejemplo, keccak256(abi.encodePacked(_id)))
     * @param timestamp Fecha de updatedAt en Unix seconds
     * @param dataHash Hash calculado off-chain de name + currentAttributes + updatedAt
     */
    function storeHash(
        bytes32 recordKey,
        uint256 timestamp,
        bytes32 dataHash
    ) external {
        // Guardamos el registro
        records[recordKey] = DataRecord({
            timestamp: timestamp,
            dataHash: dataHash
        });

        // Emitimos evento
        emit DataHashStored(recordKey, timestamp, dataHash);
    }

    /**
     * @notice Recupera el registro almacenado para una clave dada
     * @param recordKey Clave única del registro
     * @return timestamp Fecha almacenada
     * @return dataHash Hash almacenado
     */
    function getHash(bytes32 recordKey)
        external
        view
        returns (uint256 timestamp, bytes32 dataHash)
    {
        DataRecord storage rec = records[recordKey];
        return (rec.timestamp, rec.dataHash);
    }
}
