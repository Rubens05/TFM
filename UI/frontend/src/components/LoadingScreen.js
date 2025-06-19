import React from 'react';
import Styles from './Styles.js';

const LoadingScreen = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      height: '100vh',
    }}
  >

    {/* Sección con el spinner */}
    <div>
      <div
        style={{
          border: '1rem solid #f3f3f3',
          borderTop: '1rem solid #007BFF',
          borderRadius: '50%',
          width: '10rem',
          height: '10rem',
          animation: 'spin 1s linear infinite',
          marginBottom: '25rem',
        }}
      />
    </div>

    {/* Keyframes para la animación */}
    <style>
      {`@keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }`}
    </style>
  </div>
);

export default LoadingScreen;
