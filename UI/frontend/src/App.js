// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DPPForm from './components/DPPForm';
import DPPList from './components/DPPList';
import { FaTrash, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
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
        const publicUrl = `${window.location.origin}/dpp/${created._id}`;
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
      console.error('Error al enviar el DPP:', error);
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

  const handleCancelEdit = () => {
    setEditingId(null);
    setInitialFormData(null);
  };

  return (
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

        {/* Botón para crear un nuevo DPP, al pulsarlo cambia a cancelar creación*/}
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

        {/* Mostrar el formulario solo si se ha pulsado editar o crear*/}
        {(isCreating) && (
          <DPPForm
            initialFormData={initialFormData}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelEdit}
          />
        )}
        {/* Mostrar el formulario solo si se ha pulsado editar */}
        {(editingId && !isCreating) && (
          <DPPForm
            key={editingId} // << forzamos re-montaje cuando cambia editingId
            editingId={editingId}
            initialData={initialFormData}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
      {/* Mostrar la lista de DPPs cuando NO se esté creando o cuando NO se esté editando*/}
      <div style={{ maxWidth: '100%', margin: '0 auto', marginTop: '20px' }}>
        {
          (!isCreating && !editingId) && (
            <DPPList
              passports={passports}
              selectedVersions={selectedVersions}
              setSelectedVersions={setSelectedVersions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        }
      </div>
    </div>
  );
}

export default App;
