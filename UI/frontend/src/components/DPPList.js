// client/src/components/DPPList.js
import React from 'react';

function DPPList({ passports, selectedVersions, setSelectedVersions, onEdit, onDelete }) {
  return (
    <div>
      <h2>Lista de DPPs</h2>
      {passports.length === 0 ? (
        <p>No hay DPPs creados todavía.</p>
      ) : (
        <ul>
          {passports.map((passport) => {
            // Se toma por defecto la última versión
            const defaultVersion = passport.versions[passport.versions.length - 1];
            const selectedVersion = selectedVersions[passport._id] || defaultVersion;
            const displayedAttributes = { ...selectedVersion.attributes };
            // Eliminar "datasets" de los atributos a mostrar
            delete displayedAttributes.datasets;
            // Eliminar "photo" de los atributos a mostrar
            delete displayedAttributes.photo;


            return (
              <li key={passport._id} style={{ marginBottom: '16px' }}>
                <strong>{passport.name} - {passport.serialNumber}</strong>
                <br />
                <label>Versión: </label>
                <select
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
                <br />

                {/* 1. Muestra la foto si exiset, si no existe, muestra una foto plantilla */}
                {selectedVersion.photo ? (
                  <img
                    src={`http://localhost:5000/imgs/${selectedVersion.photo.filename}`}
                    style={{ maxWidth: '200px', marginTop: '8px' }}
                  />
                ) : (
                  <img
                    src="/defaultimg.png"
                    alt="Foto del producto"
                    style={{ maxWidth: '200px', marginTop: '8px' }}
                  />
                )}



                {/* 2. Muestra atributos sin "datasets"*/}
                <div>
                  <strong>Atributos (v{selectedVersion.version}):</strong>
                  <pre>{JSON.stringify(displayedAttributes, null, 2)}</pre>
                </div>
                <br />

                {/* 3. Sección para mostrar los datasets asociados a esta versión */}
                {selectedVersion.datasets && selectedVersion.datasets.length > 0 && (
                  <div>
                    <strong>Datasets:</strong>
                    <ul>
                      {selectedVersion.datasets.map((ds, idx) => (
                        <li key={idx}>
                          {/* 
                Suponiendo que guardas "filename" para descarga y 
                "originalname" para mostrar el nombre real.
              */}
                          <a
                            href={`http://localhost:5000/docs/${ds.filename}`}
                            download={ds.originalname}
                          >
                            {ds.originalname}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <br />

                {/* Botones de Editar/Eliminar */}
                <button onClick={() => onEdit(passport)}>Editar</button>
                <button onClick={() => onDelete(passport._id)}>Eliminar</button>
                <hr />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default DPPList;
