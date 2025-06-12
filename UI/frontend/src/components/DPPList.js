// client/src/components/DPPList.js
import Styles from './Styles.js';
import Select from 'react-select';
import DropdownMultiselect from './DropdownVersion.js'; // Assuming this is the correct path to your DropdownVersion component
import React, { useState } from 'react';


function DPPList({ passports, selectedVersions, setSelectedVersions, onEdit, onDelete }) {
  // map para saber, por cada passport._id, si mostramos el QR o la foto
  const [showQRMap, setShowQRMap] = useState({});
  // Estado para controlar qué DPPs están expandidos
  const [expandedItems, setExpandedItems] = useState({});
  // Filtros de busqueda y ordenación
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [filterKeyword, setFilterKeyword] = useState('');


  const toggleShowQR = (id) => {
    setShowQRMap(prev => ({ ...prev, [id]: !prev[id] }));
  };


  // Alterna el estado de expansión de un DPP por su id
  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  // Filtrar por nombre, fechas y palabra clave
  const filteredPassports = passports
    .filter(p => p.name.toLowerCase().includes(filterName.toLowerCase()))
    .filter(p => {
      const created = new Date(p.createdAt);
      if (filterStartDate && created < new Date(filterStartDate)) return false;
      if (filterEndDate && created > new Date(filterEndDate)) return false;
      return true;
    })
    .filter(p => {
      if (!filterKeyword) return true;
      const text = JSON.stringify(p).toLowerCase();
      return text.includes(filterKeyword.toLowerCase());
    })
    .sort((a, b) => {
      const diff = new Date(b.createdAt) - new Date(a.createdAt);
      return sortOrder === 'recent' ? diff : -diff;
    });


  return (
    <div style={{ maxWidth: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>
      {/*Filtro para buscar DPPs por nombre, fecha, ordenar segun campo etc...*/}
      {/* Zona de filtros */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Search by keyword..."
          value={filterKeyword}
          onChange={e => setFilterKeyword(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <label>
          From:&nbsp;
          <input
            type="date"
            value={filterStartDate}
            onChange={e => setFilterStartDate(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label>
          To:&nbsp;
          <input
            type="date"
            value={filterEndDate}
            onChange={e => setFilterEndDate(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="recent">Most recent</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {filteredPassports.length === 0 ? (
        <p style={{ color: 'red' }}>No results found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {/* Iterar sobre los pasaportes filtrados y mostrar la información de cada uno */}
          {filteredPassports.map(passport => {
            const showQR = showQRMap[passport._id] || false;
            const selectedPassportVersions =
              (selectedVersions[passport._id] && selectedVersions[passport._id].length > 0)
                ? selectedVersions[passport._id]
                : passport.versions;
            const qrCodeUrl = passport.qrCode || '/defaultimg.png';

            // Retornar todos los DPPs sin mostrar la información de un DPP, solo el nombre y una foto de preview
            return (
              <li key={passport._id} style={Styles.cardStyle}>

                <div style={{ ...Styles.headerStyle, cursor: 'pointer' }}
                  onClick={() => toggleExpand(passport._id)}
                >
                  {/* Mostrar el nombre del pasaporte */}
                  <h2 style={Styles.titleStyle}>{passport.name}</h2>
                </div>

                {/* Mostrar las versiones seleccionadas horizontalmente */}
                {expandedItems[passport._id] && (
                  <>

                    <div style={{
                      display: 'flex', flexDirection: 'row', gap: '16px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'thin', msOverflowStyle: 'auto',
                    }}>

                      {  /* Iterar sobre las versiones seleccionadas y mostrar la información de cada una, pero solo de los DPPs que se hayan clickado para desplegar la información HACER AJUSTE AQUÍ*/}
                      {selectedPassportVersions.map((selectedVersion, idx) => {
                        const attributesObj = selectedVersion.attributes || {};
                        const photoUrl = selectedVersion.photo
                          ? `/imgs/${selectedVersion.photo.filename}`
                          : '/defaultimg.png';

                        // Si se ha desgplegado el DPP mostrar la información
                        return (
                          <div key={idx} style={{ border: '1px solid #ccc', padding: '10px', minWidth: '30.5%', maxWidth: '30.5%', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
                            <strong style={{
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              marginTop: '10px',
                            }}>(v{selectedVersion.version})</strong>
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
                            }}>{new Date(selectedVersion.createdAt).toLocaleString()}</strong>

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
                  </>
                )}

                {/* Botón para alternar la visualización del QR o la foto */}
              </li>

            );
          })}
        </ul>
      )}
    </div>
  );
}


export default DPPList;
