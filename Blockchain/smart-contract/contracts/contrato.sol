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
        bytes32 versionHash; // Hash calculado de name + currentAttributes + updatedAt
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
    // Para un mismo ObjectId, se pueden almacenar múltiples versiones
    mapping(bytes12 => VersionHash[]) public versionRecords;

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
        bytes32 versionHash
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
     * @notice Almacena una versión del hash de un registro a partir de su ObjectId de MongoDB
     * @param oid 12 bytes correspondientes al ObjectId
     * @param timestamp Fecha de updatedAt en Unix seconds
     * @param versionHash Hash calculado off-chain de name + currentAttributes + updatedAt + version
     */
    function storeVersionHash(
        bytes12 oid,
        uint256 timestamp,
        bytes32 versionHash
    ) external {
        versionRecords[oid].push(
            VersionHash({timestamp: timestamp, versionHash: versionHash})
        );
        emit VersionHashStored(oid, timestamp, versionHash);
    }

    /**
     * @notice Recupera el versionHash de la versión especificada para un ObjectId dado
     * @param oid   12 bytes correspondientes al ObjectId
     * @return timestamp
     * @return versionHash
     */

    function getVersionHash(
        bytes12 oid,
        uint256 versionIndex
    ) external view returns (uint256 timestamp, bytes32 versionHash) {
        VersionHash[] storage versions = versionRecords[oid];
        require(versionIndex < versions.length, "Version index out of bounds");
        VersionHash storage version = versions[versionIndex];
        return (version.timestamp, version.versionHash);
    }

    /**
     * @notice Recupera todas las versiones almacenadas para un ObjectId dado
     * @param oid 12 bytes correspondientes al ObjectId
     * @return timestamps Array de fechas almacenadas
     * @return versionHashes Array de hashes almacenados
     */
    function getVersionHashes(
        bytes12 oid
    )
        external
        view
        returns (uint256[] memory timestamps, bytes32[] memory versionHashes)
    {
        VersionHash[] storage versions = versionRecords[oid];
        uint256 length = versions.length;
        timestamps = new uint256[](length);
        versionHashes = new bytes32[](length);
        for (uint256 i = 0; i < length; i++) {
            timestamps[i] = versions[i].timestamp;
            versionHashes[i] = versions[i].versionHash;
        }
        return (timestamps, versionHashes);
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
