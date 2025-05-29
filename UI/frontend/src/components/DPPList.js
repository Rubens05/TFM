// client/src/components/DPPList.js
import Styles from './Styles.js';
import Select from 'react-select';
import DropdownMultiselect from './DropdownVersion.js'; // Assuming this is the correct path to your DropdownVersion component
import React, { useState } from 'react';


function DPPList({ passports, selectedVersions, setSelectedVersions, onEdit, onDelete }) {
  // map para saber, por cada passport._id, si mostramos el QR o la foto
  const [showQRMap, setShowQRMap] = useState({});

  const toggleShowQR = (id) => {
    setShowQRMap(prev => ({ ...prev, [id]: !prev[id] }));
  };
  return (
    <div style={{ maxWidth: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h2>DPP List</h2>
      {passports.length === 0 ? (
        <p>No DPPs found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {/* Mostrar los pasaportes más recientes primero */}
          {passports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((passport) => {
            const showQR = showQRMap[passport._id] || false;


            // Mostrar todas las versiones si no hay ninguna seleccionada
            const selectedPassportVersions =
              (selectedVersions[passport._id] && selectedVersions[passport._id].length > 0)
                ? selectedVersions[passport._id]
                : passport.versions;

            // Generar el QR code URL para el pasaporte
            const qrCodeUrl = passport.qrCode
              ? `${passport.qrCode}`
              : '/defaultqr.png'; // Ruta por defecto si no hay QR code

            return (
              <li key={passport._id} style={Styles.cardStyle}>


                {/* Mostrar las versiones seleccionadas horizontalmente */}
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
                      <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', minWidth: '350px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '16px' }}>
                        <strong style={{
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          marginTop: '10px',
                        }}>{passport.name} (v{selectedVersion.version})</strong>
                        <br />

                        {/* Mostrar la foto o el QR code del producto */}

                        <img
                          src={showQR ? photoUrl : qrCodeUrl}
                          alt={showQR ? "Product Photo" : "Product QR Code"}
                          style={showQR ? Styles.imageStyle : Styles.qrCodeStyle}
                          title={showQR ? "Click to see full photo" : "Click to see full QR"}
                          onClick={() => { showQR ? window.open(photoUrl, '_blank') : window.open(qrCodeUrl, '_blank'); }}
                          cursor="pointer"

                        />
                        <br />

                        <button onClick={() => toggleShowQR(passport._id)}
                          style={{
                            marginBottom: '10px',
                            backgroundColor: '#007BFF',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s',
                            display: 'inline-block',
                            textAlign: 'center',
                            textDecoration: 'none',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          {showQR ? 'Show QR' : 'Show Photo'}
                        </button>





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
                                  <h4>{sectionName} </h4>
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

                  {/*Si el nombre del pasaporte es "Lithium Battery" no se muestran los botones de editar y eliminar*/}
                  {passport.name !== "Lithium Battery" && (
                    <div style={Styles.footerStyle}>
                      <button onClick={() => onEdit(passport)}
                        style={{
                          backgroundColor: '#007BFF',
                          color: 'white',
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginLeft: '10px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          transition: 'background-color 0.3s',
                          display: 'inline-block',
                          textAlign: 'center',
                          textDecoration: 'none',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}>Edit</button>
                      <button onClick={() => onDelete(passport._id)}
                        style={{
                          backgroundColor: 'red',
                          color: 'white',
                          padding: '10px 20px',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginLeft: '10px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          transition: 'background-color 0.3s',
                          display: 'inline-block',
                          textAlign: 'center',
                          textDecoration: 'none',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}>Delete</button>
                    </div>)}

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
      )}
    </div>
  );
}


export default DPPList;
