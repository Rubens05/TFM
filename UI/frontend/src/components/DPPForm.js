// client/src/components/DPPForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DPPForm({ onSubmit, editingId, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [attributes, setAttributes] = useState([]); // Array de { key, value }
  const [existingDatasets, setExistingDatasets] = useState([]); // Datasets que ya existían
  const [selectedDatasets, setSelectedDatasets] = useState([]); // Datasets nuevos (CSV) subidos

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSerialNumber(initialData.serialNumber || '');
      // Suponiendo que "versions" es un array y la versión vigente es la última
      const latestVersion = initialData.versions[initialData.versions.length - 1];
      // Convertir los atributos de la versión vigente a un array (excluyendo datasets)
      const attrArray = Object.entries(latestVersion.attributes || {})
        .filter(([key]) => key !== 'datasets')
        .map(([key, value]) => ({ key, value }));
      setAttributes(attrArray);
      // Extraer los datasets de la versión vigente
      setExistingDatasets(latestVersion.datasets || []);
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

  // Añadir un nuevo atributo
  const handleAddAttribute = () => {
    setAttributes((prev) => [...prev, { key: '', value: '' }]);
  };

  // Eliminar un atributo existente
  const handleRemoveAttribute = (index) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
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

  // Permitir quitar un dataset existente
  const handleRemoveExistingDataset = (index) => {
    setExistingDatasets((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que no haya atributos con campos vacíos
    for (let i = 0; i < attributes.length; i++) {
      if (!attributes[i].key.trim() || !attributes[i].value.trim()) {
        alert("Todos los atributos deben tener nombre y valor.");
        return;
      }
    }

    // Convertir atributos de array a objeto
    const attributesObj = attributes.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Subir los nuevos datasets (si se seleccionaron)
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
        // Filtrar para conservar solo los campos deseados, por ejemplo, originalname, encoding, mimetype, size, y filename (si necesitas enlace)
        uploadedDatasets = responses.map((res) => {
          const fileData = res.data.file;
          return {
            originalname: fileData.originalname,
            encoding: fileData.encoding,
            mimetype: fileData.mimetype,
            size: fileData.size,
            filename: fileData.filename, // Se conserva para descarga
          };
        });
      } catch (error) {
        console.error('Error al subir los datasets:', error);
      }
    }

    // Combinar los datasets: los existentes (después de quitar los que se eliminaron) y los nuevos subidos
    const finalDatasets = [...existingDatasets, ...uploadedDatasets];

    // Incluir el array final en los datos que se enviarán
    attributesObj.datasets = finalDatasets;

    const formData = {
      name,
      serialNumber,
      attributes: attributesObj,
      datasets: finalDatasets, // Este array se enviará para crear la nueva versión con la lista final de datasets
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
          disabled={!!editingId} // Si se quiere bloquear la edición del nombre
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
          disabled={!!editingId} // Bloqueado si se edita
        />
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
            <button type="button" onClick={() => handleRemoveAttribute(index)}>
              Eliminar
            </button>
          </div>

        </div>


      ))}
      <button type="button" onClick={handleAddAttribute}>
        Añadir atributo
      </button>

      <h3>Datasets</h3>

      {/* Mostrar datasets existentes con opción de quitar solo si se está editando */}

      {existingDatasets.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Datasets existentes:</strong>
          {existingDatasets.map((ds, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{ds.originalname}</span>
              <button type="button" onClick={() => setExistingDatasets(prev => prev.filter((_, i) => i !== idx))}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '8px' }}>
        <label>Subir Dataset(s) CSV</label>
        <br />
        <small>Seleccione uno o más archivos CSV</small>
        <br />
        <input type="file" accept=".csv" multiple onChange={handleDatasetsChange} />
      </div>

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
