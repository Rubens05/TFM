// client/src/components/DPPForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DPPForm({ onSubmit, editingId, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [attributes, setAttributes] = useState([]); // Array de { key, value }
  const [selectedDatasets, setSelectedDatasets] = useState([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSerialNumber(initialData.serialNumber || '');
      // Convertir currentAttributes a un array (excluyendo "datasets")
      const attrArray = Object.entries(initialData.currentAttributes || {})
        .filter(([key]) => key !== 'datasets')
        .map(([key, value]) => ({ key, value }));
      setAttributes(attrArray);
    } else {
      clearForm();
    }
  }, [initialData]);

  const clearForm = () => {
    setName('');
    setSerialNumber('');
    setAttributes([]);
    setSelectedDatasets([]);
  };

  const handleAddAttribute = () => {
    setAttributes((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleAttributeKeyChange = (index, newKey) => {
    const updated = [...attributes];
    updated[index].key = newKey;
    setAttributes(updated);
  };

  const handleAttributeValueChange = (index, newValue) => {
    const updated = [...attributes];
    updated[index].value = newValue;
    setAttributes(updated);
  };

  // Para seleccionar múltiples archivos CSV
  const handleDatasetsChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedDatasets(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convertir atributos de array a objeto
    const attributesObj = attributes.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Subir datasets (si se seleccionaron)
    let uploadedDatasets = [];
    if (selectedDatasets.length > 0) {
      const uploadPromises = selectedDatasets.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post('http://localhost:5000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      });
      try {
        const responses = await Promise.all(uploadPromises);
        uploadedDatasets = responses.map((res) => res.data.file);
      } catch (error) {
        console.error('Error al subir los datasets:', error);
      }
    }
    // Agregar los datasets subidos al objeto de atributos (y enviarlos como propiedad separada)
    attributesObj.datasets = uploadedDatasets;

    const formData = {
      name,
      serialNumber,
      attributes: attributesObj,
      datasets: uploadedDatasets,
    };

    onSubmit(formData);
    clearForm();
  };

  return (
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
      <div style={{ marginBottom: '8px' }}>
        <label>Subir Dataset(s) CSV (opcional)</label>
        <input type="file" accept=".csv" multiple onChange={handleDatasetsChange} />
      </div>
      <h3>Atributos</h3>
      {attributes.map((attr, index) => (
        <div key={index} style={{ marginBottom: '8px' }}>
          <label>Atributo {index + 1}</label>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            <input
              type="text"
              placeholder="Nombre (ej. color)"
              value={attr.key}
              onChange={(e) => handleAttributeKeyChange(index, e.target.value)}
              style={{ flex: '1' }}
            />
            <input
              type="text"
              placeholder="Valor (ej. rojo)"
              value={attr.value}
              onChange={(e) => handleAttributeValueChange(index, e.target.value)}
              style={{ flex: '1' }}
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddAttribute}>
        Añadir atributo
      </button>
      <div style={{ marginTop: '16px' }}>
        <button type="submit">{editingId ? 'Actualizar DPP' : 'Crear DPP'}</button>
        {editingId && (
          <button type="button" onClick={onCancel}>
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}

export default DPPForm;
