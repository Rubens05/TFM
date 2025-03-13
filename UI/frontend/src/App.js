// client/src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [attributes, setAttributes] = useState([]); // Array de { key, value }
  const [passports, setPassports] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // Para el CSV

  useEffect(() => {
    fetchPassports();
  }, []);

  // Obtener todos los passports del backend
  const fetchPassports = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/passports');
      setPassports(res.data);
    } catch (error) {
      console.error('Error al obtener los passports:', error);
    }
  };

  // Manejar la selección del archivo CSV
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Añadir un nuevo atributo al array
  const handleAddAttribute = () => {
    setAttributes((prev) => [...prev, { key: '', value: '' }]);
  };

  // Manejar el cambio en la "clave" de un atributo
  const handleAttributeKeyChange = (index, newKey) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index].key = newKey;
    setAttributes(updatedAttributes);
  };

  // Manejar el cambio en el "valor" de un atributo
  const handleAttributeValueChange = (index, newValue) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index].value = newValue;
    setAttributes(updatedAttributes);
  };

  // Manejar envío del formulario para crear un nuevo DPP
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convertir el array de atributos en un objeto
    const attributesObj = attributes.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Si se ha seleccionado un CSV, se sube primero
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const uploadResponse = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // Suponemos que en la respuesta viene información del archivo subido (ej. filename)
        // y lo añadimos a los atributos, por ejemplo, en la propiedad "dataset"
        attributesObj.dataset = uploadResponse.data.file;
      } catch (uploadError) {
        console.error('Error al subir el archivo:', uploadError);
        // Podrías decidir abortar o continuar sin el CSV
      }
    }

    try {
      const res = await axios.post('http://localhost:5000/api/passports', {
        name,
        serialNumber,
        attributes: attributesObj,
      });
      console.log('DPP creado:', res.data);

      // Limpiar campos
      setName('');
      setSerialNumber('');
      setAttributes([]);
      setSelectedFile(null);

      // Refrescar la lista
      fetchPassports();
    } catch (error) {
      console.error('Error al crear DPP:', error);
    }
  };

  // Función para crear un passport de prueba (opcional)
  const handleCreateTestPassport = async () => {
    const testPassport = {
      name: 'Producto de prueba',
      serialNumber: 'ABC123',
      attributes: {
        Fabricación: {
          fecha: '2025-03-10',
          país: 'España',
        },
        Logística: {
          transporte: 'Camión',
          ruta: 'Barcelona -> Madrid',
        },
        Reciclado: {
          materialesReciclables: ['Plástico', 'Metal'],
        },
        Mantenimiento: {
          frecuencia: 'Anual',
          tipo: 'Revisión general',
        },
      },
    };

    try {
      const res = await axios.post('http://localhost:5000/api/passports', testPassport);
      console.log('Passport de prueba creado:', res.data);
      fetchPassports();
    } catch (error) {
      console.error('Error al crear passport de prueba:', error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Digital Product Passport</h1>

      {/* Formulario para crear un nuevo DPP */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label>Nombre del Producto</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', marginTop: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>Número de Serie</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
            style={{ width: '100%', marginTop: '4px' }}
          />
        </div>

        {/* Input para subir el archivo CSV (opcional) */}
        <div style={{ marginBottom: '8px' }}>
          <label>Subir Dataset CSV (opcional)</label>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </div>

        <h3>Atributos</h3>
        {/* Renderizar los atributos dinámicos */}
        {attributes.map((attr, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <label>Atributo {index + 1}</label>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <input
                type="text"
                placeholder="Nombre del atributo (ej. color)"
                value={attr.key}
                onChange={(e) => handleAttributeKeyChange(index, e.target.value)}
                style={{ flex: '1' }}
              />
              <input
                type="text"
                placeholder="Valor del atributo (ej. rojo)"
                value={attr.value}
                onChange={(e) => handleAttributeValueChange(index, e.target.value)}
                style={{ flex: '1' }}
              />
            </div>
          </div>
        ))}

        {/* Botón para añadir un nuevo atributo */}
        <button type="button" onClick={handleAddAttribute}>
          Añadir atributo
        </button>

        <div style={{ marginTop: '16px' }}>
          <button type="submit">Crear DPP</button>
        </div>
      </form>

      <br />
      {/* Botón para crear un passport de prueba */}
      <button onClick={handleCreateTestPassport}>Crear Passport de Prueba</button>

      <hr />

      <h2>Lista de DPPs</h2>
      <ul>
        {passports.map((passport) => (
          <li key={passport._id} style={{ marginBottom: '16px' }}>
            <strong>{passport.name}</strong> - {passport.serialNumber}
            <br />
            Atributos: {JSON.stringify(passport.attributes)}
            <br />
            Creado: {new Date(passport.createdAt).toLocaleString()}
            <br />
            {/* Si existe un CSV asociado, mostrar enlace de descarga */}
            {passport.attributes.dataset && (
              <a
                href={`http://localhost:5000/uploads/${passport.attributes.dataset.filename}`}
                download={passport.attributes.dataset.originalname}
              >
                Descargar CSV
              </a>
            )}
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
