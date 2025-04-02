// client/src/components/DPPList.js
import React from 'react';
import DPPListStyles from './DPPListStyles';

function DPPList({ passports, selectedVersions, setSelectedVersions, onEdit, onDelete }) {
  return (
    <div>
      <h2>DPP List</h2>
      {passports.length === 0 ? (
        <p> No DPPs found. </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {passports.map((passport) => {
            // Tomamos por defecto la última versión
            const defaultVersion = passport.versions[passport.versions.length - 1];
            const selectedVersion = selectedVersions[passport._id] || defaultVersion;
            const attributesObj = selectedVersion.attributes || {};

            // Definir URL de la foto, usando imagen por defecto si no hay foto.
            const photoUrl = selectedVersion.photo
              ? `http://localhost:5000/imgs/${selectedVersion.photo.filename}`
              : '/defaultimg.png';

            return (
              <li key={passport._id} style={DPPListStyles.cardStyle}>
                <div style={DPPListStyles.headerStyle}>
                  <img
                    src={photoUrl}
                    alt="Product image"
                    style={DPPListStyles.imageStyle}
                  />
                  <h3 style={DPPListStyles.titleStyle}>{passport.name}</h3>
                  <select
                    style={DPPListStyles.selectStyle}
                    value={selectedVersion.version}
                    onChange={(e) => {
                      const verNum = parseInt(e.target.value, 10);
                      const ver = passport.versions.find((v) => v.version === verNum);
                      setSelectedVersions((prev) => ({
                        ...prev,
                        [passport._id]: ver,
                      }));
                    }}
                  >
                    {passport.versions.map((v) => (
                      <option key={v.version} value={v.version}>
                        {`v${v.version} - ${new Date(v.createdAt).toLocaleString()}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <strong style={{ paddingLeft: '16px' }}> {passport.name} Information (v{selectedVersion.version}):</strong>
                  {Object.keys(attributesObj).length > 0 ? (
                    <div style={{ marginLeft: '16px' }}>
                      {Object.entries(attributesObj).map(([sectionName, sectionData]) => {
                        // Extraer datasets de la sección, si existen.
                        const { datasets: sectionDatasets, ...sectionAttributes } = sectionData;
                        return (
                          <div key={sectionName} style={DPPListStyles.sectionStyle}>
                            <h4 style={{ margin: '4px 0' }}>{sectionName} Section</h4>    
                            <a style={{ paddingLeft: '16px' }}>
                              {Object.entries(sectionAttributes).map(([attrName, attrValue]) => (
                                <li key={attrName}>
                                  <strong>{attrName}:</strong> {attrValue}
                                </li>
                              ))}
                            </a>                        
                          
                            {sectionDatasets && sectionDatasets.length > 0 && (
                              <div style={{ marginLeft: '16px', marginTop: '4px' }}>
                                <strong>Documents</strong>
                                <a style={{ paddingLeft: '16px' }}>
                                  {sectionDatasets.map((ds, idx) => (
                                    <li key={idx}>
                                      <a
                                        href={`http://localhost:5000/docs/${ds.filename}`}
                                        download={ds.originalname}
                                        style={DPPListStyles.datasetLinkStyle}
                                      >
                                        {ds.originalname}
                                      </a>
                                    </li>
                                  ))}
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p> No section data available for this version. </p>
                  )}
                </div>

                <div style={DPPListStyles.footerStyle}>
                  <button onClick={() => onEdit(passport)}>Edit</button>
                  <button onClick={() => onDelete(passport._id)}>Delete</button>
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
