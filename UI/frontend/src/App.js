// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DPPForm from './components/DPPForm';
import DPPList from './components/DPPList';

function App() {
  const [passports, setPassports] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState({});
  const [initialFormData, setInitialFormData] = useState(null);

  const fetchPassports = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/passports');
      setPassports(res.data);
    } catch (error) {
      console.error('Error al obtener los DPPs:', error);
    }
  };

  useEffect(() => {
    fetchPassports();
  }, []);

  // Se invoca desde el formulario para crear o actualizar un DPP
  const handleFormSubmit = async (formData) => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/passports/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/passports', formData);
      }
      // Después de enviar, reiniciamos el modo edición y actualizamos la lista
      setEditingId(null);
      setInitialFormData(null);
      fetchPassports();
    } catch (error) {
      console.error('Error al enviar el DPP:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/passports/${id}`);
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
    
    <div style={{ maxWidth: '600px', margin: '0 auto' }}> 
      {/*Funditec image*/}
      <img
        src="funditec.png"
        alt="Funditec Logo"
        style={{ width: '100%', height: 'auto', marginBottom: '20px' }}
      />
      <h1>Digital Product Passport</h1>
      {editingId ? (
        <DPPForm
          key={editingId} // << forzamos re-montaje cuando cambia editingId
          editingId={editingId}
          initialData={initialFormData}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <DPPForm
          key="new" // << para el formulario de creación
          onSubmit={handleFormSubmit}
        />
      )}
      <hr />
      <DPPList
        passports={passports}
        selectedVersions={selectedVersions}
        setSelectedVersions={setSelectedVersions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;
