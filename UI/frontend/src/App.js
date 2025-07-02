// client/src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DPPDetail from './components/DPPDetail';
import DPPDetailVersion from './components/DPPDetailVersion';
import axios from 'axios';
import DPPForm from './components/DPPForm';
import DPPList from './components/DPPList';
import QRCode from 'qrcode';



function App() {
  const [passports, setPassports] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState({});
  const [initialFormData, setInitialFormData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchPassports = async () => {
    try {
      const res = await axios.get('/api/passports');
      setPassports(res.data);
    } catch (error) {
      console.error('Error al obtener los DPPs:', error);
    }
  };

  useEffect(() => {
    fetchPassports();
  }, []);

  useEffect(() => {
    if (passports.length > 0) {
      const newSelected = { ...selectedVersions };

      let needsUpdate = false;

      passports.forEach((passport) => {
        // Si aún no hay selección para este passport,
        // asignamos todas las versiones
        if (!newSelected[passport._id]) {
          newSelected[passport._id] = passport.versions;
          needsUpdate = true;
        }
      });

      if (needsUpdate) {
        setSelectedVersions(newSelected);
      }
    }
  }, [passports]);


  // Se invoca desde el formulario para crear o actualizar un DPP
  const handleFormSubmit = async (formData) => {
    try {
      let created;
      if (editingId) {
        await axios.put(`/api/passports/${editingId}`, formData);
      } else {
        const createRes = await axios.post('/api/passports', formData);
        created = createRes.data;

        // Generar el código QR para el nuevo DPP
        // La URL debe ser la IP pública del servidor http://XXXXXXXX:5000

        const publicUrl = `http://XXXXXXXXXX:5000/dpp/${created._id}`;
        const qrDataUrl = await QRCode.toDataURL(publicUrl, {
          margin: 2,
          width: 300
        });

        // Enviar el código QR al backend
        await axios.patch(`/api/passports/${created._id}/qr`, {
          qrCode: qrDataUrl
        });

      }
      // Después de enviar, reiniciamos el modo edición y actualizamos la lista
      setEditingId(null);
      setIsCreating(false);
      setInitialFormData(null);
      fetchPassports();
    } catch (error) {
      alert('Falló al crear/actualizar el DPP o al guardar el QR.');
    }
  };

  const handleDelete = async (id) => {
    // Confirmación antes de eliminar
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este DPP?');
    if (!confirmDelete) return;
    // Si se confirma, se procede a eliminar
    // y se actualiza la lista de DPPs
    try {
      await axios.delete(`/api/passports/${id}`);
      fetchPassports();
    } catch (error) {
      console.error('Error al eliminar el DPP:', error);
    }
  };

  const handleEdit = (passport) => {
    setEditingId(passport._id);
    setInitialFormData(passport);
  };

  // dentro de App.js
  const handleVerifyIntegrity = async (passport) => {
    try {
      // 1) Verificar masterHash // Funciona
      const { data: masterRes } = await axios.post(
        `/api/data/verifyMasterHash`,
        {
          dppData: {
            _id: passport._id,
            name: passport.name,
            currentAttributes: passport.versions[0].attributes,
            timestamp: { $date: passport.createdAt }
          },
          offChainHash: passport.masterHash
        }
      );
      const masterValid = masterRes.valid;


      // 2) Verificar cada versionHash de todas las versiones
      const versionChecks = await Promise.all(
        passport.versions.map(async (verObj) => {
          // usa createdAt de la versión o fallback al createdAt del documento
          const verDate = verObj.createdAt
            ? new Date(verObj.createdAt)
            : new Date(passport.createdAt);

          const { data: vRes } = await axios.post(
            `/api/data/verifyVersionHash`,
            {
              dppData: {
                _id: passport._id,
                name: passport.name,
                currentAttributes: verObj.attributes,
                timestamp: { $date: verDate.toISOString() }
              },
              offChainVersionHash: verObj.versionHash,
              version: verObj.version
            }
          );
          return { version: verObj.version, valid: vRes.valid };
        })
      );

      // 3) Verificar dynamicHash
      const { data: dynRes } = await axios.post(
        `/api/data/verifyDynamicHash`,
        {
          dppData: {
            _id: passport._id
          },
          offChainDynamicHash: passport.dynamicHash
        }
      );
      const dynValid = dynRes.valid;

      // 4) Mostrar resultados
      let msg = `🔒 Integridad DPP ${passport._id}:\n\n`;
      msg += `• MasterHash: ${masterValid ? '✅ OK' : '❌ MISMATCH'}\n`;
      versionChecks.forEach(({ version, valid }) => {
        msg += `• Version ${version}: ${valid ? '✅ OK' : '❌ MISMATCH'}\n`;
      });
      msg += `• DynamicHash: ${dynValid ? '✅ OK' : '❌ MISMATCH'}\n`;

      alert(msg);
    } catch (err) {
      console.error('Error verificando integridad:', err);
      alert('❌ Error al verificar integridad. Revisa la consola para más detalles.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setInitialFormData(null);
  };

  return (



    <>



      <Routes>

        <Route path="/" element={
          <>
            <div style={{ backgroundColor: '#f0f0f0', padding: '20px', fontFamily: 'Arial, sans-serif', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/*Funditec image*/}
                <img
                  src="funditecrb.png"
                  alt="Funditec Logo"
                  style={{ width: '100%', height: 'auto', marginBottom: '20px' }}
                />
                {/* Display del titulo DPP y al lado el boton de crear */}
                <h1 style={{ display: 'inline-block', marginRight: '90px' }}>Digital Product Passport</h1>

                {/* Botón para crear un nuevo DPP, al pulsarlo cambia a cancelar creación, solo si se esta en la route /*/}
                <button
                  onClick={() => {
                    setEditingId(null);
                    setIsCreating(!isCreating);
                    setInitialFormData(isCreating ? null : { name: '', description: '' });
                  }
                  }
                  style={{
                    backgroundColor: isCreating ? 'red' : 'green',
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
                  {isCreating ? 'Cancel DPP' : 'Create DPP'}
                </button>
              </div>
            </div>
            {/* Mostrar el formulario solo si se ha pulsado editar o crear*/}
            {(isCreating) && (
              <DPPForm
                passports={passports}
                initialFormData={initialFormData}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelEdit}
              />
            )}
            {/* Mostrar el formulario solo si se ha pulsado editar */}
            {(editingId && !isCreating) && (
              <DPPForm
                key={editingId} // << forzamos re-montaje cuando cambia editingId
                passports={passports}
                editingId={editingId}
                initialData={initialFormData}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelEdit}
              />
            )}

            {/* Mostrar la lista de DPPs cuando NO se esté creando o cuando NO se esté editando*/}
            {
              (!isCreating && !editingId) && (
                <DPPList
                  passports={passports}
                  selectedVersions={selectedVersions}
                  setSelectedVersions={setSelectedVersions}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onVerifyIntegrity={handleVerifyIntegrity}
                />
              )
            }
          </>
        } />

        <Route path="/dpp/:id" element={<>
          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', fontFamily: 'Arial, sans-serif', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              {/*Funditec image*/}
              <img
                src="/funditecrb.png"
                alt="Funditec Logo"
                style={{ width: '100%', height: 'auto', marginBottom: '20px' }}
              />
            </div>
          </div>

          <DPPDetail />
        </>

        } />

        <Route path='/dpp/:id/:version' element={
          <>
            <div style={{ backgroundColor: '#f0f0f0', padding: '20px', fontFamily: 'Arial, sans-serif', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/*Funditec image*/}
                <img
                  src="/funditecrb.png"
                  alt="Funditec Logo"
                  style={{ width: '100%', height: 'auto', marginBottom: '20px' }}
                />
              </div>
            </div>

            <DPPDetailVersion />
          </>

        } />

      </Routes>
    </>


  );
}

export default App;
