// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Contrato {
    // Estructura para almacenar el hash y timestamp
    struct MasterHash {
        uint256 timestamp; // Fecha de updatedAt en segundos Unix
        bytes32 masterHash; // Hash calculado de name + currentAttributes + updatedAt
    }
    // Estructura para almacenar el hash y timestamp
    struct VersionHash {
        uint256 timestamp; // Fecha de updatedAt en segundos Unix
        bytes32 versionHash; // Hash calculado de name + currentAttributes + updatedAt + version
        uint256 version; // Número de versión asociado
    }
    // Estructura para almacenar el hash y timestamp
    struct DynamicHash {
        uint256 timestamp; // Fecha de updatedAt en segundos Unix
        bytes32 dynamicHash; // Hash calculado de name + currentAttributes + updatedAt
    }

    // Para un mismo ObjectId, se almacena el hash maestro (solo una única vez)
    mapping(bytes12 => MasterHash) public records;
    // Para un mismo ObjetcId, se almacena el hash dinámico (se sobreescribe cada vez que se actualiza)
    mapping(bytes12 => DynamicHash) public dynamicRecords;
    // Mapping para múltiples versiones por OID y por número de versión
    mapping(bytes12 => mapping(uint256 => VersionHash)) public versionRecords;
    // Listado de versiones existentes por OID
    mapping(bytes12 => uint256[]) private versionList;
    // Evento para registrar el guardado de masterHash
    event MasterHashStored(
        bytes12 indexed oid,
        uint256 timestamp,
        bytes32 masterHash
    );

    // Evento para registrar el guardado de dynamicHash
    event DynamicHashStored(
        bytes12 indexed oid,
        uint256 timestamp,
        bytes32 dynamicHash
    );

    // Evento para registrar el guardado de versionHash
    event VersionHashStored(
        bytes12 indexed oid,
        uint256 timestamp,
        bytes32 versionHash,
        uint256 version
    );
    

    /**
     * @notice Almacena el hash de un registro a partir de su ObjectId de MongoDB
     * @param oid 12 bytes correspondientes al ObjectId
     * @param timestamp Fecha de updatedAt en Unix seconds
     * @param masterHash Hash calculado off-chain de name + currentAttributes + updatedAt
     */
    function storeMasterHash(
        bytes12 oid,
        uint256 timestamp,
        bytes32 masterHash
    ) external {
        records[oid] = MasterHash({
            timestamp: timestamp,
            masterHash: masterHash
        });
        emit MasterHashStored(oid, timestamp, masterHash);
    }

    /**
     * @notice Recupera el registro almacenado para un ObjectId dado
     * @param oid 12 bytes correspondientes al ObjectId
     * @return timestamp Fecha almacenada
     * @return dataHash   Hash almacenado
     */
    function getMasterHash(
        bytes12 oid
    ) external view returns (uint256 timestamp, bytes32 dataHash) {
        MasterHash storage rec = records[oid];
        return (rec.timestamp, rec.masterHash);
    }

    /**
     * @notice Almacena un versionHash para un número de versión específico
     */
    function storeVersionHash(
        bytes12 oid,
        uint256 timestamp,
        bytes32 versionHash,
        uint256 dppVersion
    ) external {
        // Si es la primera vez que se añade esta versión, guardamos índice
        if (versionRecords[oid][dppVersion].timestamp == 0) {
            versionList[oid].push(dppVersion);
        }
        versionRecords[oid][dppVersion] = VersionHash(timestamp, versionHash, dppVersion);
        emit VersionHashStored(oid, timestamp, versionHash, dppVersion);
    }

    /**
     * @notice Recupera el versionHash para una versión específica
     */
    function getVersionHash(
        bytes12 oid,
        uint256 dppVersion
    ) external view returns (uint256 timestamp, bytes32 versionHash, uint256 version) {
        VersionHash storage v = versionRecords[oid][dppVersion];
        return (v.timestamp, v.versionHash, v.version);
    }

    /**
     * @notice Recupera todas las versiones almacenadas para un ObjectId dado
     * @param oid 12 bytes correspondientes al ObjectId
     * @return timestamps Array de fechas almacenadas
     * @return versionHashes Array de hashes almacenados
     * @return versions Array de números de versión
     */
    function getVersionHashes(
        bytes12 oid
    ) external view returns (
        uint256[] memory timestamps,
        bytes32[] memory versionHashes,
        uint256[] memory versions
    ) {
        uint256[] storage list = versionList[oid];
        uint256 len = list.length;
        timestamps = new uint256[](len);
        versionHashes = new bytes32[](len);
        versions = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            uint256 vNum = list[i];
            VersionHash storage v = versionRecords[oid][vNum];
            timestamps[i] = v.timestamp;
            versionHashes[i] = v.versionHash;
            versions[i] = v.version;
        }
        return (timestamps, versionHashes, versions);
    }


    /**
     * @notice Almacena el hash dinámico de un registro a partir de su ObjectId de MongoDB
     * @param oid 12 bytes correspondientes al ObjectId
     * @param timestamp Fecha de updatedAt en Unix seconds
     * @param dynamicHash Hash calculado off-chain de maserHash + array de versiones + updatedAt
     */
    function storeDynamicHash(
        bytes12 oid,
        uint256 timestamp,
        bytes32 dynamicHash
    ) external {
        dynamicRecords[oid] = DynamicHash({
            timestamp: timestamp,
            dynamicHash: dynamicHash
        });
        emit DynamicHashStored(oid, timestamp, dynamicHash);
    }

    /**
     * @notice Recupera el registro dinámico almacenado para un ObjectId dado
     * @param oid 12 bytes correspondientes al ObjectId
     * @return timestamp Fecha almacenada
     * @return dataHash   Hash almacenado
     */
    function getDynamicHash(
        bytes12 oid
    ) external view returns (uint256 timestamp, bytes32 dataHash) {
        DynamicHash storage rec = dynamicRecords[oid];
        return (rec.timestamp, rec.dynamicHash);
    }
}
