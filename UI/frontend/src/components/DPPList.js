// client/src/components/DPPList.js
import React from 'react';
import Styles from './Styles.js';
import Select from 'react-select';
import DropdownMultiselect from './DropdownVersion.js'; // Assuming this is the correct path to your DropdownVersion component

function DPPList({ passports, selectedVersions, setSelectedVersions, onEdit, onDelete }) {
  return (
    <div style={{ maxWidth: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h2>DPP List</h2>
      {passports.length === 0 ? (
        <p>No DPPs found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {passports.map((passport) => {
            const selectedPassportVersions = selectedVersions[passport._id] || [];

            const versionOptions = passport.versions.map((v) => ({
              value: v.version,
              label: `v${v.version} - ${new Date(v.createdAt).toLocaleString()}`,
            }));


            // Si no hay versiones seleccionadas, seleccionamos la última
            if (selectedPassportVersions.length === 0) {
              selectedPassportVersions.push(passport.versions[passport.versions.length - 1]);
            }

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
                }}>                  {selectedPassportVersions.map((selectedVersion, idx) => {
                  const attributesObj = selectedVersion.attributes || {};
                  const photoUrl = selectedVersion.photo
                    ? `http://localhost:5000/imgs/${selectedVersion.photo.filename}`
                    : '/defaultimg.png';

                  return (
                    <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', minWidth: '350px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '16px' }}>
                      <img
                        src={photoUrl}
                        alt="Product image"
                        style={Styles.imageStyle}
                      />
                      <strong style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>{passport.name} (v{selectedVersion.version}) Date: {new Date(selectedVersion.createdAt).toLocaleString()}</strong>

                      {Object.keys(attributesObj).length > 0 ? (
                        <div>
                          {Object.entries(attributesObj).map(([sectionName, sectionData]) => {
                            const { datasets: sectionDatasets, ...sectionAttributes } = sectionData;
                            return (
                              <div key={sectionName} style={Styles.sectionStyle}>
                                <h4>{sectionName} Section</h4>
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
                                          href={`http://localhost:5000/docs/${ds.filename}`}
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
                  </div>

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
