import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Styles from './Styles.js';

export default function DPPDetailVersionPage() {
    const { id, version } = useParams();

    const [passport, setPassport] = useState(null);
    const [thisVersion, setThisVersion] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setPassport(null);
        setThisVersion(null);
        setError('');

        axios.get(`/api/passports/${id}`)
            .then(res => {
                const data = res.data;
                setPassport(data);

                const versionNum = Number(version);
                if (Number.isNaN(versionNum)) {
                    setError('Versión inválida en la URL.');
                    return;
                }

                const found = Array.isArray(data.versions)
                    ? data.versions.find(v => Number(v.version) === versionNum)
                    : null;

                if (found) {
                    setThisVersion(found);
                } else {
                    setError(`No se encontró la versión ${versionNum} para este DPP.`);
                }
            })
            .catch(err => {
                console.error(err);
                setError('No se pudo cargar el DPP (ID inválido o error de servidor).');
            });
    }, [id, version]);

    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!passport || !thisVersion) {
        return <p style={{ padding: '20px' }}>Cargando DPP…</p>;
    }

    const photoUrl = thisVersion.photo
        ? `/imgs/${thisVersion.photo.filename}`
        : '/defaultimg.png';

    const attributesObj = thisVersion.attributes || {};

    return (
        <div style={{ maxWidth: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', alignContent: 'center', justifyContent: 'center' }}>
                <li key={passport._id} style={Styles.cardStyledPPVersion}>
                    <div style={Styles.headerStyle}>
                        <h2 style={Styles.titleStyle}>{passport.name}</h2>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '16px',
                            overflowX: 'auto',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                border: '1px solid #ccc',
                                padding: '10px',
                                width: '100%',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                textAlign: 'center',
                                marginTop: '1rem',
                            }}
                        >
                            <strong>(v{thisVersion.version})</strong>
                            <br />
                            <img
                                src={photoUrl}
                                alt="Passport Photo"
                                style={Styles.imageStyle}
                                title="Click para ver en tamaño completo"
                                onClick={() => window.open(photoUrl, '_blank')}
                            />
                            <br />
                            <strong>{new Date(thisVersion.createdAt).toLocaleString()}</strong>

                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                {Object.keys(attributesObj).length > 0 ? (
                                    Object.entries(attributesObj).map(([sectionName, sectionData]) => {
                                        const { datasets: sectionDatasets, ...sectionAttributes } = sectionData;
                                        return (
                                            <div key={sectionName} style={Styles.sectionStyle}>
                                                <h4>{sectionName}</h4>
                                                <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '8px' }}>
                                                    {Object.entries(sectionAttributes).map(([attrName, attrValue]) => (
                                                        <li key={attrName} style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                                            <strong>{attrName}:</strong> {attrValue}
                                                        </li>
                                                    ))}
                                                </ul>
                                                {sectionDatasets && sectionDatasets.length > 0 && (
                                                    <div style={{ marginTop: '8px' }}>
                                                        <strong>Documents:</strong>
                                                        <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '8px' }}>
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
                                    })
                                ) : (
                                    <p>No hay datos de secciones disponibles.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    );
}
