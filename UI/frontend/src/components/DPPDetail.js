// client/src/components/DPPDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Styles from './Styles.js';
import DropdownMultiselect from './DropdownVersion.js';

export default function DPPDetailPage() {
    const { id } = useParams();

    // Estado para el pasaporte único
    const [passport, setPassport] = useState(null);
    // Igual que en DPPList, lista de versiones seleccionadas
    const [selectedVersions, setSelectedVersions] = useState({});
    // Para toggle foto/QR por pasaporte (aquí solo uno)
    const [showQRMap, setShowQRMap] = useState({});

    useEffect(() => {
        // Carga el DPP por id
        axios.get(`/api/passports/${id}`)
            .then(res => {
                setPassport(res.data);
                // por defecto mostramos todas las versiones
                setSelectedVersions({ [res.data._id]: res.data.versions });
            })
            .catch(console.error);
    }, [id]);

    const toggleShowQR = (_) => {
        setShowQRMap(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (!passport) return <p>Cargando DPP…</p>;

    // UI idéntica a tu return de DPPList, pero solo un elemento
    return (
        <div style={{ maxWidth: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>
            <h2>DPP Detail</h2>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {([passport]).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((passport) => {
                    const showQR = showQRMap[passport._id] || false;
                    const selectedPassportVersions =
                        (selectedVersions[passport._id] && selectedVersions[passport._id].length > 0)
                            ? selectedVersions[passport._id]
                            : passport.versions;

                    const qrCodeUrl = passport.qrCode
                        ? `${passport.qrCode}`
                        : '/defaultqr.png';

                    return (
                        <li key={passport._id} style={Styles.cardStyle}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '16px',
                                overflowX: 'auto',
                                paddingBottom: '8px',
                                scrollbarWidth: 'thin',
                                msOverflowStyle: 'auto',
                            }}>
                                {selectedPassportVersions.map((selectedVersion, idx) => {
                                    const attributesObj = selectedVersion.attributes || {};
                                    const photoUrl = selectedVersion.photo
                                        ? `/imgs/${selectedVersion.photo.filename}`
                                        : '/defaultimg.png';

                                    return (
                                        <div key={idx} style={{
                                            border: '1px solid #ccc',
                                            padding: '10px',
                                            minWidth: '350px',
                                            backgroundColor: '#fff',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                            textAlign: 'center',
                                            marginBottom: '16px'
                                        }}>
                                            <strong style={{
                                                whiteSpace: 'pre-wrap',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                marginTop: '10px',
                                            }}>{passport.name} (v{selectedVersion.version})</strong>
                                            <br />

                                            <img
                                                cursor="pointer"
                                                src={photoUrl}
                                                alt="Passport Photo"
                                                style={Styles.imageStyle}
                                                title={"Click to see full photo"}
                                                onClick={() => {
                                                    window.open(photoUrl, '_blank');
                                                }}

                                            />
                                            <br />
                                            <strong style={{
                                                whiteSpace: 'pre-wrap',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                marginTop: '10px',
                                            }}>Date: {new Date(selectedVersion.createdAt).toLocaleString()}</strong>

                                            {Object.keys(attributesObj).length > 0 ? (
                                                <div>
                                                    {Object.entries(attributesObj).map(([sectionName, sectionData]) => {
                                                        const { datasets: sectionDatasets, ...sectionAttributes } = sectionData;
                                                        return (
                                                            <div key={sectionName} style={Styles.sectionStyle}>
                                                                <h4>{sectionName}</h4>
                                                                {Object.entries(sectionAttributes).map(([attrName, attrValue]) => (
                                                                    <li key={attrName} style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                                                        <strong>{attrName}:</strong> {attrValue}
                                                                    </li>
                                                                ))}
                                                                {sectionDatasets && sectionDatasets.length > 0 && (
                                                                    <div>
                                                                        <strong>Documents:</strong>
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
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p>No section data available.</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={Styles.headerStyle}>
                                {/* Aquí podrías omitir los botones de Edit/Delete o reutilizarlos si quieres */}
                                <DropdownMultiselect
                                    options={passport.versions.map((v) => ({
                                        value: v.version,
                                        label: `v${v.version} - ${new Date(v.createdAt).toLocaleString()}`
                                    }))}
                                    selectedValues={(selectedVersions[passport._id] || []).map(v => v.version)}
                                    onChange={(newSelectedVersionNums) => {
                                        const selectedVers = passport.versions.filter((v) =>
                                            newSelectedVersionNums.includes(v.version)
                                        );
                                        setSelectedVersions((prev) => ({
                                            ...prev,
                                            [passport._id]: selectedVers
                                        }));
                                    }}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
