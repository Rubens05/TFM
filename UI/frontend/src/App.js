// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DPPForm from './components/DPPForm';
import DPPList from './components/DPPList';
import { FaTrash, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';


function App() {
  const [passports, setPassports] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState({});
  const [initialFormData, setInitialFormData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

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
          marginLeft: '30px',
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
      {/* Mostrar la lista de DPPs */}

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
