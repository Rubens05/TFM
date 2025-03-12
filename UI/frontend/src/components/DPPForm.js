// client/src/components/DPPForm.js
import React, { useState } from 'react';

function DPPForm({ onCreate }) {
  // Estados locales para los campos del formulario
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [attributes, setAttributes] = useState({});

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Llamamos a la función que recibimos por props (onCreate) pasando los datos
    onCreate({
      name,
      serialNumber,
      attributes
    });

    // Limpiar campos
    setName('');
    setSerialNumber('');
    setAttributes({});
  };

  // Manejar cambio en el campo de texto (para el JSON de atributos)
  const handleAttributesChange = (e) => {
    try {
      const parsedJSON = JSON.parse(e.target.value);
      setAttributes(parsedJSON);
    } catch (error) {
      // Si no es un JSON válido, podrías manejar un error o simplemente ignorarlo
      console.error('JSON inválido:', error);
    }
  };

  return (
    <div>
      <h2>Crear Nuevo DPP</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre del Producto</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Atributo 1</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Atributo 2</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Atributo N</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />
        </div>

        <button type="submit">Crear DPP</button>
      </form>
    </div>
  );
}

export default DPPForm;
