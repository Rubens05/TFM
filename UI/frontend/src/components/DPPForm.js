// client/src/components/DPPForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DPPForm({ onSubmit, editingId, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [attributes, setAttributes] = useState([]); // Array de { key, value }
  const [existingDatasets, setExistingDatasets] = useState([]); // Datasets que ya existían
  const [selectedDatasets, setSelectedDatasets] = useState([]); // Datasets nuevos (CSV) subidos
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Imagen seleccionada
  const [existingPhoto, setExistingPhoto] = useState(null); // Imagen existente


  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSerialNumber(initialData.serialNumber || '');
      // Suponiendo que "versions" es un array y la versión vigente es la última
      const latestVersion = initialData.versions[initialData.versions.length - 1];
      // Convertir los atributos de la versión vigente a un array (excluyendo datasets)
      const attrArray = Object.entries(latestVersion.attributes || {})
        .filter(([key]) => key !== 'datasets' && key !== 'photo')
        .map(([key, value]) => ({ key, value }));
      setAttributes(attrArray);
      // Extraer los datasets de la versión vigente
      setExistingDatasets(latestVersion.datasets || []);
      // Cargar foto existente (si la hay) de la versión vigente
      if (latestVersion.photo) {
        setExistingPhoto(latestVersion.photo);
      } else {
        setExistingPhoto(null);
      }
    } else {
      clearForm();
    }
  }, [initialData]);

  const clearForm = () => {
    setName('');
    setSerialNumber('');
    setAttributes([]);
    setSelectedDatasets([]);
    setExistingPhoto(null);
    setSelectedPhoto(null);
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

  // Permitir eliminar la foto existente
  const handleRemoveExistingPhoto = () => {
    setExistingPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // 1. Validar que exista al menos un atributo
    if (attributes.length === 0) {
      alert("Debes añadir al menos un atributo.");
      return;
    }
  
    // 2. Validar que ningún atributo tenga campos vacíos
    for (let i = 0; i < attributes.length; i++) {
      const key = typeof attributes[i].key === 'string' ? attributes[i].key.trim() : '';
      const value = typeof attributes[i].value === 'string' ? attributes[i].value.trim() : '';
      if (!key || !value) {
        alert("Todos los atributos deben tener nombre y valor.");
        return;
      }
    }
  
    // 3. Convertir el array de atributos a objeto
    const attributesObj = attributes.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  
    // 4. Subir los nuevos datasets (si se seleccionaron)
    let uploadedDatasets = [];
    if (selectedDatasets.length > 0) {
      const uploadPromises = selectedDatasets.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        return axios.post('http://localhost:5000/api/upload/doc', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      });
  
      try {
        const responses = await Promise.all(uploadPromises);
        uploadedDatasets = responses.map((res) => ({
          originalname: res.data.file.originalname,
          encoding: res.data.file.encoding,
          mimetype: res.data.file.mimetype,
          size: res.data.file.size,
          filename: res.data.file.filename,
        }));
      } catch (error) {
        console.error('Error al subir los datasets:', error);
      }
    }
  
    // 5. Combinar los datasets: los existentes (después de quitar los que se eliminaron)
    //    y los nuevos subidos.
    const finalDatasets = [...existingDatasets, ...uploadedDatasets];
  
    // 6. Subir la imagen si se seleccionó; si no, conservar la foto existente (si hay)
    let uploadedImage = null;
    if (selectedPhoto) {
      const imageFormData = new FormData();
      imageFormData.append('image', selectedPhoto);
      try {
        const imageResponse = await axios.post('http://localhost:5000/api/upload/img', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedImage = {
          originalname: imageResponse.data.file.originalname,
          encoding: imageResponse.data.file.encoding,
          mimetype: imageResponse.data.file.mimetype,
          size: imageResponse.data.file.size,
          filename: imageResponse.data.file.filename,
        };
      } catch (error) {
        console.error('Error al subir la imagen:', error);
      }
    } else if (existingPhoto) {
      uploadedImage = existingPhoto;
    }
  
    // 7. En modo edición, comparar con la última versión para ver si hay cambios
    if (editingId && initialData) {
      const latestVersion = initialData.versions[initialData.versions.length - 1];
  
      // Comparar el campo attributes, ignorando datasets y foto
      const initialAttributes = Object.entries(latestVersion.attributes || {})
        .filter(([key]) => key !== 'datasets' && key !== 'photo')
        .map(([key, value]) => ({ key, value }));
      const hasAttributeChanges = JSON.stringify(initialAttributes) !== JSON.stringify(attributes);

    
      
      // Detectar si se han añadido nuevos atributos
      const initialAttrKeys = Object.keys(latestVersion.attributes || {});
      const currentAttrKeys = Object.keys(attributesObj);
      const hasNewAttributes = currentAttrKeys.length > initialAttrKeys.length;
      
      // Comparar foto: se considera cambio si se seleccionó una nueva foto o si había foto y ahora se quitó
      const initialPhoto = latestVersion.photo || null;
      const hasPhotoChanges = !!selectedPhoto || (initialPhoto && !existingPhoto);
      
      // Comparar datasets: se compara el array final de datasets con el de la última versión
      const hasDatasetChanges =
        JSON.stringify(latestVersion.datasets) !== JSON.stringify(finalDatasets);
  
      if (!hasAttributeChanges && !hasNewAttributes && !hasPhotoChanges && !hasDatasetChanges) {
        alert('No se detectaron cambios en el DPP.');
        return;
      }
    }
  
    // 8. Incluir los datasets y la foto en el objeto de atributos (opcional)
    attributesObj.datasets = finalDatasets;
    attributesObj.photo = uploadedImage;
  
    // 9. Armar el objeto final a enviar
    const formDataToSend = {
      name,
      serialNumber,
      attributes: attributesObj,
      datasets: finalDatasets,
      photo: uploadedImage,
    };
  
    // 10. Enviar el formulario y limpiar el formulario local
    onSubmit(formDataToSend);
    clearForm();
  };
  


  // Controlar que solo se pueda seleccionar una foto
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedPhoto(e.target.files[0]);
    }
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
              required
              onChange={(e) => handleAttributeKeyChange(index, e.target.value)}
              style={{ flex: '1' }}
            />
            <input
              type="text"
              placeholder="Valor (ej. rojo)"
              value={attr.value}
              required
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

      <h3>Foto (opcional)</h3>
      <div style={{ marginBottom: '8px' }}>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>
      {/* Mostrar la foto existente, con opción de quitar */}
      {existingPhoto && (
        <div style={{ marginBottom: '8px' }}>
          <strong>Foto existente:</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{existingPhoto.originalname}</span>
            <button type="button" onClick={handleRemoveExistingPhoto}>
              Quitar foto
            </button>
          </div>
        </div>
      )}

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
