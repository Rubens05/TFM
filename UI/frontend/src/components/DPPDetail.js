// client/src/components/DPPDetail.js
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


    if (!passport) return <p>Cargando DPP…</p>;

    // UI idéntica a tu return de DPPList, pero solo un elemento
    return (
        <div style={{ maxWidth: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>


            <ul style={{ listStyle: 'none', padding: 0 }}>
                {([passport]).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((passport) => {
                    const selectedPassportVersions =
                        (selectedVersions[passport._id] && selectedVersions[passport._id].length > 0)
                            ? selectedVersions[passport._id]
                            : passport.versions;

                    const qrCodeUrl = passport.qrCode
                        ? `${passport.qrCode}`
                        : '/defaultqr.png';

                    return (
                        <li key={passport._id} style={Styles.cardStyle}>
                            <div style={Styles.headerStyle}>
                                <h2 style={Styles.titleStyle}>{passport.name}</h2>
                            </div>


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
                                        <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', minWidth: '30.5%', maxWidth: '30.5%', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
                                            <strong style={{
                                                whiteSpace: 'pre-wrap',
                                                wordWrap: 'break-word',
                                                overflowWrap: 'break-word',
                                                marginTop: '10px',
                                            }}>(v{selectedVersion.version})</strong>
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
                                            }}>{new Date(selectedVersion.createdAt).toLocaleString()}</strong>

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
                                                                <div style={Styles.sectionStyle}>
                                                                    <h4>Related Passports</h4>
                                                                    {selectedVersion.relatedPassportVersions && selectedVersion.relatedPassportVersions.length > 0 ? (

                                                                        selectedVersion.relatedPassportVersions.map((related, index) => (
                                                                            <li key={index}>
                                                                                <strong>
                                                                                    <a
                                                                                        href={`http://localhost:5000/dpp/${related.passport}/${related.version}`}
                                                                                        style={{ color: '#007BFF', textDecoration: 'underline' }}

                                                                                    >{related.name} (v{related.version})

                                                                                    </a></strong>
                                                                            </li>
                                                                        ))

                                                                    ) : (
                                                                        <p>No related passports.</p>
                                                                    )}
                                                                </div>
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
