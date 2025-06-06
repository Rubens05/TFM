// client/src/components/DPPDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Styles from './Styles.js';

export default function DPPDetailPage() {
    // Sacamos los params de la ruta: id del DPP y versión
    const { id, version } = useParams();

    // Estado para el DPP completo (passport)
    const [passport, setPassport] = useState(null);
    // Estado para la versión específica (un solo objeto) o null si no existe
    const [thisVersion, setThisVersion] = useState(null);
    // Estado para controlar errores (por ejemplo, DPP no encontrado o versión no hallada)
    const [error, setError] = useState('');

    useEffect(() => {
        // Cada vez que cambian id o version, volvemos a cargar
        setPassport(null);
        setThisVersion(null);
        setError('');
        // Hacemos GET del DPP completo
        axios
            .get(`/api/passports/${id}`)
            .then((res) => {
                const data = res.data;
                setPassport(data);

                // Buscamos en data.versions la que coincida con el parámetro "version"
                // Lo convertimos a número por si la ruta trae un string
                const versionNum = Number(version);
                if (Number.isNaN(versionNum)) {
                    setError('Versión inválida en la URL.');
                    return;
                }

                const found = Array.isArray(data.versions)
                    ? data.versions.find((v) => Number(v.version) === versionNum)
                    : null;

                if (found) {
                    setThisVersion(found);
                } else {
                    setError(`No se encontró la versión ${versionNum} para este DPP.`);
                }
            })
            .catch((err) => {
                console.error(err);
                setError('No se pudo cargar el DPP (ID inválido o error de servidor).');
            });
    }, [id, version]);

    // Si hay error, lo mostramos
    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    // Mientras no tengamos cargado el DPP o la versión, mostramos un loading
    if (!passport || !thisVersion) {
        return <p style={{ padding: '20px' }}>Cargando DPP…</p>;
    }

    // A estas alturas tenemos:
    // - passport: el objeto completo del DPP (incluye .versions, .name, etc.)
    // - thisVersion: el objeto de la versión exacta que queremos mostrar

    // Preparar URL de foto (si existe) y QR (si existe)
    const photoUrl = thisVersion.photo
        ? `/imgs/${thisVersion.photo.filename}`
        : '/defaultimg.png';

    const qrCodeUrl = passport.qrCode ? `${passport.qrCode}` : '/defaultqr.png';

    // Extraemos atributos y datasets de esta versión
    const attributesObj = thisVersion.attributes || {};
    // relatedPassportVersions original (si quieres mostrarlos en detalle)
    const relatedOriginal = Array.isArray(thisVersion.relatedPassportVersions)
        ? thisVersion.relatedPassportVersions
        : [];

    return (
        <div style={{ maxWidth: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>
            <h2>
                Detalle de DPP: <em>{passport.name}</em> (v{thisVersion.version})
            </h2>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    paddingBottom: '8px',
                }}
            >
                {/* Foto / Imagen del DPP */}
                <div style={{ textAlign: 'center' }}>
                    <img
                        src={photoUrl}
                        alt="Passport Photo"
                        style={Styles.imageStyle}
                        title="Click para ver en tamaño completo"
                        onClick={() => {
                            window.open(photoUrl, '_blank');
                        }}
                    />
                </div>

                {/* Fecha de creación de esta versión */}
                <div style={{ textAlign: 'center' }}>
                    <strong>
                        Fecha: {new Date(thisVersion.createdAt).toLocaleString()}
                    </strong>
                </div>

                {/* Atributos y documentos secciones */}
                <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>
                    <h3>Atributos y Documentos</h3>
                    {Object.keys(attributesObj).length > 0 ? (
                        <div>
                            {Object.entries(attributesObj).map(([sectionName, sectionData]) => {
                                // Cada sección: tenemos sectionData.attributes (campo dinámico) y sectionData.datasets
                                const { datasets: sectionDatasets, ...sectionAttributes } = sectionData;
                                return (
                                    <div key={sectionName} style={Styles.sectionBox}>
                                        <h4>{sectionName}</h4>
                                        {/* Mostrar cada atributo dentro de la sección */}
                                        <ul style={{ marginLeft: '16px' }}>
                                            {Object.entries(sectionAttributes).map(
                                                ([attrName, attrValue]) => (
                                                    <li
                                                        key={attrName}
                                                        style={{
                                                            overflowWrap: 'break-word',
                                                            wordBreak: 'break-word',
                                                        }}
                                                    >
                                                        <strong>{attrName}:</strong> {attrValue}
                                                    </li>
                                                )
                                            )}
                                        </ul>

                                        {/* Mostrar documentos asociados a esta sección */}
                                        {sectionDatasets && sectionDatasets.length > 0 && (
                                            <div style={{ marginTop: '8px' }}>
                                                <strong>Documentos:</strong>
                                                <ul style={{ marginLeft: '16px' }}>
                                                    {sectionDatasets.map((ds, i) => (
                                                        <li key={i}>
                                                            <a
                                                                href={`/docs/${ds.filename}`}
                                                                download={ds.originalname}
                                                                style={Styles.datasetLinkStyle}
                                                            >
                                                                {ds.originalname}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p>No hay datos de secciones disponibles.</p>
                    )}
                </div>

                {/* Si quieres mostrar los related passports ya relacionados en esta versión */}
                {relatedOriginal.length > 0 && (
                    <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px' }}>
                        <h3>Related Passports (v{thisVersion.version})</h3>
                        <ul style={{ marginLeft: '16px' }}>
                            {relatedOriginal.map((rel, idx) => (
                                <li key={idx}>
                                    {/* Para mostrar nombre, puedes buscar en un array global “passports” si lo tienes en props */}
                                    {/* En este ejemplo asumimos que “thisVersion.relatedPassportVersions” ya trae un campo “name”. */}
                                    <strong>{rel.name || rel.passport}</strong> (v{rel.version})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Si quieres mostrar el QR code (toggle opcional) */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <h3>QR Code</h3>
                    <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        style={{ width: '150px', height: '150px', cursor: 'pointer' }}
                        onClick={() => window.open(qrCodeUrl, '_blank')}
                    />
                </div>
            </div>
        </div>
    );
}
