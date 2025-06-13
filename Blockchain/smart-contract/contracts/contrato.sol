// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Contrato {
    // Estructura para almacenar el hash de datos
    struct DataRecord {
        uint256 timestamp;
        bytes32 dataHash;
    }
    // Mapeo para almacenar el hash individual. La llave se genera a partir de (parcelId, prodId, timestamp)
    mapping(bytes32 => bytes32) public dataHashes;

    // Eventos para registrar las operaciones de guardado
    event DataHashStored(
        uint256 indexed parcelId,
        uint256 indexed prodId,
        uint256 timestamp,
        bytes32 dataHash
    );

    /// @notice Función interna para obtener la llave de un registro individual a partir de parcelId, prodId y timestamp
    function _getIndividualKey(
        uint256 parcelId,
        uint256 prodId,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(parcelId, prodId, timestamp));
    }

    /// @notice (1) Almacena un hash de datos.
    /// Se recibe: parcelId, prodId, timestamp y el hash de los datos.
    /// Además, se agrupa el registro en un array para poder recuperar todos los hashes de un día.
    function storeDataHash(
        uint256 parcelId,
        uint256 prodId,
        uint256 timestamp,
        bytes32 dataHash
    ) external {
        // Almacena el hash individual
        bytes32 key = _getIndividualKey(parcelId, prodId, timestamp);
        dataHashes[key] = dataHash;

        // Emite un evento para registrar la operación
        emit DataHashStored(parcelId, prodId, timestamp, dataHash);
    }

    /// @notice (2) Recupera un hash individual.
    /// Se pasa parcelId, prodId y timestamp.
    function getDataHash(
        uint256 parcelId,
        uint256 prodId,
        uint256 timestamp
    ) external view returns (bytes32) {
        bytes32 key = _getIndividualKey(parcelId, prodId, timestamp);
        return dataHashes[key];
    }
}
