// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Contrato {
    // Estructura para almacenar el hash y timestamp
    struct DataRecord {
        uint256 timestamp; // Fecha de updatedAt en segundos Unix
        bytes32 dataHash; // Hash calculado de name + currentAttributes + updatedAt
    }

    // Mapeo desde el ObjectId (12 bytes) al registro de datos
    mapping(bytes12 => DataRecord) public records;

    // Evento para registrar el guardado de hash
    event DataHashStored(
        bytes12 indexed oid,
        uint256 timestamp,
        bytes32 dataHash
    );

    /**
     * @notice Almacena el hash de un registro a partir de su ObjectId de MongoDB
     * @param oid 12 bytes correspondientes al ObjectId
     * @param timestamp Fecha de updatedAt en Unix seconds
     * @param dataHash Hash calculado off-chain de name + currentAttributes + updatedAt
     */
    function storeHash(
        bytes12 oid,
        uint256 timestamp,
        bytes32 dataHash
    ) external {
        records[oid] = DataRecord({timestamp: timestamp, dataHash: dataHash});
        emit DataHashStored(oid, timestamp, dataHash);
    }

    /**
     * @notice Recupera el registro almacenado para un ObjectId dado
     * @param oid 12 bytes correspondientes al ObjectId
     * @return timestamp Fecha almacenada
     * @return dataHash   Hash almacenado
     */
    function getHash(
        bytes12 oid
    ) external view returns (uint256 timestamp, bytes32 dataHash) {
        DataRecord storage rec = records[oid];
        return (rec.timestamp, rec.dataHash);
    }
}
