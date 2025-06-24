// client/src/components/DPPForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Styles from './Styles.js';
import { FaTrash, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import LoadingScreen from './LoadingScreen.js';

function DPPForm({ passports, onSubmit, editingId, initialData, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  // "sections" es un array donde cada elemento es:
  // { sectionName: string, attributes: [{ key, value }], datasets: [Object] (ya existentes), selectedDatasets: [File] (nuevos) }
  const [sections, setSections] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);       // Imagen nueva a subir
  const [existingPhoto, setExistingPhoto] = useState(null);       // Imagen ya existente
  // --------------------------------------------
  // Estados y lógica para "Related Passports"
  // --------------------------------------------
  // Cada elemento: { passport: "<ObjectId>", version: <Number>, name?: string }
  // (podemos añadir el nombre para mostrarlo en la lista, si queremos)
  const [relatedPassportVersions, setRelatedPassportVersions] = useState([]);
  // ID de pasaporte seleccionado en el dropdownºººº
  const [selectedRelatedPassportId, setSelectedRelatedPassportId] = useState('');
  // Array de versiones que correspondan al pasaporte seleccionado
  const [relatedVersions, setRelatedVersions] = useState([]);
  // Versión seleccionada en el segundo dropdown (una sola versión numérica)
  const [selectedRelatedVersion, setSelectedRelatedVersion] = useState('');


  // Al cargar initialData (modo edición), convertir el objeto de attributes en secciones.
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      // 1) Inicializar “sections” como antes (tú lo tenías)
      // Suponemos que la versión vigente es la última
      const latestVersion = initialData.versions[initialData.versions.length - 1];
      let sectionsArray = [];
      if (latestVersion.attributes && typeof latestVersion.attributes === 'object') {
        // Cada clave del objeto de attributes es una sección
        sectionsArray = Object.entries(latestVersion.attributes).map(([sectionName, sectionObj]) => {
          // Suponemos que cada sectionObj es un objeto con atributos y, opcionalmente, una propiedad "datasets"
          const { datasets: secDatasets, ...attrObj } = sectionObj;
          const attrArray = Object.entries(attrObj).map(([k, v]) => ({ key: k, value: v }));
          return {
            sectionName,
            attributes: attrArray,
            datasets: secDatasets || [],        // archivos ya existentes en esta sección
            selectedDatasets: []                 // archivos nuevos (vacío al inicio)
          };
        });
      }
      setSections(sectionsArray);

      // 2)  Cargar foto existente (si la hay)
      if (latestVersion.photo) {
        setExistingPhoto(latestVersion.photo);
      } else {
        setExistingPhoto(null);
      }

      // 3) Extraer relatedPassportVersions desde la última versión
      const existingRel = Array.isArray(latestVersion.relatedPassportVersions)
        ? latestVersion.relatedPassportVersions
        : [];

      if (existingRel.length > 0) {
        // Para depurar:

        const relacionesEnEstado = existingRel.map((rel) => {
          // Buscar nombre del pasaporte en tu lista “passports” (props)
          const pasaporteObj = passports.find((p) => p._id === rel.passport);
          return {
            passport: rel.passport,      // ObjectId como string
            version: rel.version,        // número de versión
            name: pasaporteObj ? pasaporteObj.name : ''
          };
        });

        setRelatedPassportVersions(relacionesEnEstado);
      } else {
        setRelatedPassportVersions([]);
      }
    } else {
      clearForm();
      return;
    }
  }, [initialData, passports]);

  // ------------------------------------------------------------------
  // Cada vez que cambie selectedRelatedPassportId, actualizamos versiones
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!selectedRelatedPassportId) {
      setRelatedVersions([]);
      setSelectedRelatedVersion('');
      return;
    }

    // Buscamos en el array “passports” el que coincida con ese ID
    const passportObj = passports.find((p) => p._id === selectedRelatedPassportId);

    if (passportObj && Array.isArray(passportObj.versions)) {
      // Mapear a un array de números/strings para el select
      const versArray = passportObj.versions.map((v) => v.version);
      setRelatedVersions(versArray);
    } else {
      setRelatedVersions([]);
    }
    // Por si hubo selección previa de versión, la limpiamos:
    setSelectedRelatedVersion('');
  }, [selectedRelatedPassportId, passports]);

  // --------------------------------------------------
  // Handler cuando el usuario hace click en “Add Related Passport”
  // --------------------------------------------------
  const handleAddRelatedPassport = () => {
    if (!selectedRelatedPassportId || !selectedRelatedVersion) {
      alert('Debes seleccionar un pasaporte y una versión antes de agregar.');
      return;
    }

    // Prevenir duplicados: mismo passport + versión
    const yaExiste = relatedPassportVersions.some(
      (rel) =>
        rel.passport === selectedRelatedPassportId &&
        rel.version.toString() === selectedRelatedVersion.toString()
    );
    if (yaExiste) {
      alert('Esa relación ya fue añadida.');
      return;
    }

    // Buscamos el nombre para mostrar en la lista
    const passportObj = passports.find((p) => p._id === selectedRelatedPassportId);
    const passportName = passportObj ? passportObj.name : '';

    // Añadimos al estado
    setRelatedPassportVersions((prev) => [
      ...prev,
      {
        passport: selectedRelatedPassportId,
        version: selectedRelatedVersion,
        name: passportName
      }
    ]);

    // Limpiamos selects
    setSelectedRelatedPassportId('');
    setRelatedVersions([]);
    setSelectedRelatedVersion('');
  };

  // -------------------------------------------------------
  // Handler para eliminar una relación ya en relatedPassportVersions
  // -------------------------------------------------------
  const handleRemoveRelatedPassport = (index) => {
    setRelatedPassportVersions((prev) => prev.filter((_, i) => i !== index));
  };


  const clearForm = () => {
    setName('');
    setSections([]);
    setSelectedPhoto(null);
    setExistingPhoto(null);
    setRelatedPassportVersions([]);
    setSelectedRelatedPassportId('');
    setRelatedVersions([]);
    setSelectedRelatedVersion('');
  };

  // Funciones para secciones
  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      { sectionName: '', attributes: [], datasets: [], selectedDatasets: [] }
    ]);
  };

  const handleRemoveSection = (sectionIndex) => {
    setSections((prev) => prev.filter((_, i) => i !== sectionIndex));
  };

  const handleSectionNameChange = (sectionIndex, newName) => {
    const updated = [...sections];
    updated[sectionIndex].sectionName = newName;
    setSections(updated);
  };

  // Funciones para atributos dentro de una sección
  const handleAddSectionAttribute = (sectionIndex) => {
    const updated = [...sections];
    updated[sectionIndex].attributes.push({ key: '', value: '' });
    setSections(updated);
  };

  const handleSectionAttributeKeyChange = (sectionIndex, attrIndex, newKey) => {
    const updated = [...sections];
    updated[sectionIndex].attributes[attrIndex].key = newKey;
    setSections(updated);
  };

  const handleSectionAttributeValueChange = (sectionIndex, attrIndex, newValue) => {
    const updated = [...sections];
    updated[sectionIndex].attributes[attrIndex].value = newValue;
    setSections(updated);
  };

  const handleRemoveSectionAttribute = (sectionIndex, attrIndex) => {
    const updated = [...sections];
    updated[sectionIndex].attributes = updated[sectionIndex].attributes.filter((_, i) => i !== attrIndex);
    setSections(updated);
  };

  // Función para seleccionar archivos CSV por sección
  const handleSectionDatasetsChange = (sectionIndex, e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const updated = [...sections];
      // Aquí reemplazamos los nuevos archivos para esa sección; si quieres acumular, puedes concatenar.
      updated[sectionIndex].selectedDatasets = filesArray;
      setSections(updated);
    }
  };

  // Para seleccionar la foto (solo una)
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedPhoto(e.target.files[0]);
    }
  };

  // Permitir eliminar la foto existente
  const handleRemoveExistingPhoto = () => {
    setExistingPhoto(null);
  };

  // Permitir eliminar un dataset existente de una sección
  const handleRemoveSectionDataset = (sectionIndex, datasetIndex) => {
    const updated = [...sections];
    updated[sectionIndex].datasets = updated[sectionIndex].datasets.filter((_, i) => i !== datasetIndex);
    setSections(updated);
  };

  // Al enviar el formulario:
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validar que exista al menos una sección y que en cada sección haya al menos un atributo.
    if (sections.length === 0) {
      alert("Debes añadir al menos una sección con atributos.");
      return;
    }
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (!sec.sectionName.trim()) {
        alert("Cada sección debe tener un nombre.");
        return;
      }
      if (sec.attributes.length === 0) {
        alert(`La sección "${sec.sectionName}" debe tener al menos un atributo.`);
        return;
      }
      for (let j = 0; j < sec.attributes.length; j++) {
        const key = typeof sec.attributes[j].key === 'string' ? sec.attributes[j].key.trim() : '';
        const value = typeof sec.attributes[j].value === 'string' ? sec.attributes[j].value.trim() : '';
        if (!key || !value) {
          alert(`Todos los atributos en la sección "${sec.sectionName}" deben tener nombre y valor.`);
          return;
        }
      }
    }

    // 2. Procesar cada sección: subir los nuevos archivos y combinar con los ya existentes.
    let sectionsToSend = {}; // Este objeto tendrá, para cada sección, los atributos y sus datasets.
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      let uploadedSectionDatasets = [];
      if (sec.selectedDatasets && sec.selectedDatasets.length > 0) {
        const uploadPromises = sec.selectedDatasets.map((file) => {
          const formData = new FormData();
          formData.append('file', file);
          return axios.post('/api/upload/doc', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        });
        try {
          const responses = await Promise.all(uploadPromises);
          uploadedSectionDatasets = responses.map((res) => ({
            originalname: res.data.file.originalname,
            encoding: res.data.file.encoding,
            mimetype: res.data.file.mimetype,
            size: res.data.file.size,
            filename: res.data.file.filename,
          }));
        } catch (error) {
          console.error('Error al subir los archivos de la sección:', error);
        }
      }
      // Combinar los datasets existentes de la sección con los nuevos subidos
      const finalSectionDatasets = [...sec.datasets, ...uploadedSectionDatasets];
      // Convertir el array de atributos a objeto para esta sección
      const attrObj = sec.attributes.reduce((obj, attr) => {
        obj[attr.key] = attr.value;
        return obj;
      }, {});
      // Añadir también la propiedad "datasets" dentro de la sección para enviarlo
      attrObj.datasets = finalSectionDatasets;
      sectionsToSend[sec.sectionName] = attrObj;
    }

    // 3. Procesar la foto global:
    let uploadedImage = null;
    if (selectedPhoto) {
      const imageFormData = new FormData();
      imageFormData.append('image', selectedPhoto);
      try {
        const imageResponse = await axios.post('/api/upload/img', imageFormData, {
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

    // 4. Si estamos en modo edición, comparar con la última versión para ver si hay cambios.
    if (editingId && initialData) {
      const latestVersion = initialData.versions[initialData.versions.length - 1];

      // 4.1) Comparar atributos (secciones)
      const hasAttributeChanges =
        JSON.stringify(latestVersion.attributes) !== JSON.stringify(sectionsToSend);

      // 4.2) Comparar foto
      const initialPhoto = latestVersion.photo || null;
      const hasPhotoChanges = !!selectedPhoto || (initialPhoto && !existingPhoto);

      // 4.3) Comparar related passports
      //   - “originalRel” es el array tal como vino en la última versión
      const originalRel = Array.isArray(latestVersion.relatedPassportVersions)
        ? latestVersion.relatedPassportVersions
        : [];

      //   - Normalizamos “originalRel” a un array de objetos { passport, version }
      const originalRelNormalized = originalRel.map((r) => ({
        passport: String(r.passport),
        version: String(r.version)
      }));

      //   - Normalizamos el estado actual “relatedPassportVersions” a { passport, version }
      const currentRelNormalized = relatedPassportVersions.map((r) => ({
        passport: String(r.passport),
        version: String(r.version)
      }));

      //   - Para comparar, podemos convertir a JSON (importante que el orden de los arrays sea el mismo
      //     o hayan sido ordenados de la misma forma; aquí asumimos que el backend y el front
      //     guardan el mismo orden, o que no nos importa el orden)
      const hasRelatedPassportChanges =
        JSON.stringify(originalRelNormalized) !== JSON.stringify(currentRelNormalized);

      // 4.4) Si no hay NINGÚN cambio en atributos, foto y related passports, abortamos
      if (!hasAttributeChanges && !hasPhotoChanges && !hasRelatedPassportChanges) {
        alert('No se detectaron cambios en el DPP.');
        return;
      }
    }

    // 5. Preparar relatedPassportVersions
    let relatedToSend = [];
    if (Array.isArray(relatedPassportVersions) && relatedPassportVersions.length > 0) {
      relatedToSend = relatedPassportVersions.map((rel) => ({
        passport: rel.passport, // aquí ya debe ser string con ObjectId válido
        version: rel.version,   // número de versión concreta
        name: rel.name || '' // opcional, para mostrar en la UI
      }));
    }
    // 6. Armar el objeto final a enviar
    const formDataToSend = {
      name,
      attributes: sectionsToSend,
      photo: uploadedImage,
      relatedPassportVersions: relatedToSend
    };

    // Pantalla de carga
    setLoading(true);
    await onSubmit(formDataToSend);
    setLoading(false);
    // Quitar pantalla de carga y limpiar formulario
    clearForm();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <form onSubmit={handleSubmit} style={Styles.formStyle}>
      <div>
        <h3>Product Name</h3>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={!!editingId}
        style={Styles.inputStyle}
      />

      {/* Secciones de atributos */}
      <h3>Sections</h3>
      {sections.map((section, sIndex) => (

        <div key={sIndex} style={Styles.sectionBox}>

          <label>Section Name:</label>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>

            <input
              type="text"
              value={section.sectionName}
              onChange={(e) => handleSectionNameChange(sIndex, e.target.value)}
              placeholder="e.g. Origin"
              required
              style={Styles.inputStyle}
            />
            {/* Botón para eliminar la sección a la derecha */}
            <div style={{ alignItems: 'center', marginLeft: '4px', paddingTop: '2px' }}>
              <button type="button" onClick={() => handleRemoveSection(sIndex)} style={Styles.dangerButton}
                title="Remove Section"
              >
                <FaTrash />
              </button>
            </div>



          </div>
          <h4>Attributes in {section.sectionName || 'Section Name'}</h4>
          {section.attributes.map((attr, aIndex) => (
            <div key={aIndex} style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <input
                type="text"
                placeholder="Name (e.g. Colour)"
                value={attr.key}
                required
                onChange={(e) => handleSectionAttributeKeyChange(sIndex, aIndex, e.target.value)}
                style={Styles.inputStyle}
              />
              <input
                type="text"
                placeholder="Value (e.g. Red)"
                value={attr.value}
                required
                onChange={(e) => handleSectionAttributeValueChange(sIndex, aIndex, e.target.value)}
                style={Styles.inputStyle}
              />
              <div style={{ alignItems: 'center', marginLeft: '4px', paddingTop: '2px' }}>
                <button type="button" onClick={() => handleRemoveSectionAttribute(sIndex, aIndex)} style={Styles.dangerButton}
                  title='Remove Attribute'>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => handleAddSectionAttribute(sIndex)} style={Styles.addAttributeButton}
            title='Add Attribute'>
            <FaPlus />
          </button>
          <br />
          <h4>Documents of section "{section.sectionName}"</h4>
          {/* Mostrar archivos ya existentes para esta sección */}
          {section.datasets && section.datasets.length > 0 && (
            <div style={{ display: 'flex' }}>
              {section.datasets.map((ds, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4>{ds.originalname}</h4>
                  <button type="button" title='Remove Document' onClick={() => handleRemoveSectionDataset(sIndex, idx)} style={Styles.dangerButton}>
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '8px' }}>
            <label>Upload new documents (CSV)</label>
            <br />
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={(e) => handleSectionDatasetsChange(sIndex, e)}
              style={Styles.sectionBox}
            />
          </div>

        </div>
      ))}
      <button type="button" onClick={handleAddSection} style={Styles.addSectionButton}>
        Add Section
      </button>

      <h3>Image (optional)</h3>
      <div style={Styles.sectionBox}>
        <input type="file" accept="image/*" onChange={handlePhotoChange} />
      </div>
      {existingPhoto && (
        <div style={{ marginBottom: '8px' }}>
          <strong> Existing Image:</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            <img
              src={`/imgs/${existingPhoto.filename}`}
              alt="Existing DPP"
              style={{ width: '100px', height: 'auto', borderRadius: '4px' }}
            />
            <span>{existingPhoto.originalname}</span>
            <button type="button" onClick={handleRemoveExistingPhoto} style={Styles.dangerButton}
              title='Remove Existing Image'>
              <FaTrash />
            </button>
          </div>
        </div>




      )}

      {/* ------------------------------- */}
      {/* Zona para “Related Passports” */}
      {/* ------------------------------- */}
      <h3>Related Passports (optional)</h3>
      <div style={Styles.sectionBox}>
        {/* 1) Mostrar los related passports ya existentes */}
        <h4>Existing Related Passports</h4>
        {relatedPassportVersions && relatedPassportVersions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {relatedPassportVersions.map((rel, index) => (
              <div
                key={index}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {/* Muestro nombre + versión */}
                <span>
                  {rel.name} (Version {rel.version})
                </span>
                {/* Botón para eliminar esta relación */}
                <button
                  type="button"
                  onClick={() => handleRemoveRelatedPassport(index)}
                  style={Styles.dangerButton}
                  title="Remove Related Passport"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontStyle: 'italic', color: '#555' }}>
            No related passports.
          </p>
        )}

        <hr style={{ margin: '8px 0' }} />

        {/* 2) Dropdown para elegir un pasaporte nuevo */}
        <label htmlFor="select-passport">Select a Passport:</label>
        <select
          id="select-passport"
          style={Styles.inputStyle}
          value={selectedRelatedPassportId}
          onChange={(e) => setSelectedRelatedPassportId(e.target.value)}
        >
          <option value="">-- Select a Passport --</option>
          {passports.map((passport) => (
            <option key={passport._id} value={passport._id}>
              {passport.name}
            </option>
          ))}
        </select>

        {/* 3) Dropdown para elegir versión (se carga desde relatedVersions) */}
        <label htmlFor="select-version" style={{ marginTop: '8px', display: 'block' }}>
          Select Version:
        </label>
        <select
          id="select-version"
          style={Styles.inputStyle}
          value={selectedRelatedVersion}
          onChange={(e) => setSelectedRelatedVersion(e.target.value)}
          disabled={!selectedRelatedPassportId}
        >
          <option value="">-- Select Version --</option>
          {relatedVersions.map((ver, idx) => (
            <option key={idx} value={ver}>
              Version {ver}
            </option>
          ))}
        </select>

        {/* 4) Botón para agregar la relación al estado */}
        <button
          type="button"
          onClick={handleAddRelatedPassport}
          style={{ ...Styles.addAttributeButton, marginTop: '8px' }}
        >
          <FaPlus /> Add Related Passport
        </button>
      </div>

      {/* Botones de enviar y cancelar */}

      <div style={{ marginTop: '16px' }}>
        <button type="submit" style={Styles.buttonStyle}>{editingId ? 'Update DPP' : 'Create DPP'}</button>

        {editingId && (
          <button type="button" onClick={onCancel}
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
            }}
          >
            {/* Icono de cancelar */}
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}

export default DPPForm;
