// client/src/components/DPPList.js
import React from 'react';

function DPPList({ passports }) {
  return (
    <div>
      <h2>Lista de DPPs</h2>
      {passports.length === 0 ? (
        <p>No hay DPPs creados todavía.</p>
      ) : (
        <ul>
          {passports.map((passport) => (
            <li key={passport._id}>
              <strong>{passport.name}</strong> - {passport.serialNumber}
              <br />
              Atributos: {JSON.stringify(passport.attributes)}
              <br />
              Creado el: {new Date(passport.createdAt).toLocaleString()}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DPPList;
