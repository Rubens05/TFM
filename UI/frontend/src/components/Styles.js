// client/src/components/DPPListStyles.js
const Styles = {
  cardStyle: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    transition: 'transform 0.2s',
  },
  cardStyledPPVersion: {
    minWidth: '75%',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    transition: 'transform 0.2s',
  },
  headerStyle: {
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    padding: '4px',
    alignItems: 'center',
    gap: '12px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
  },
  imageStyle: {
    width: '10.2rem',
    height: '10.2rem',
    objectFit: 'cover',
    borderRadius: '10%',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8px',
    marginTop: '8px',
  },
  qrCodeStyle: {
    width: '10.2rem',
    height: '10.2rem',
    objectFit: 'cover',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8px',
    marginTop: '8px',
  },
  titleStyle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    marginTop: '8px',
    color: '#333',
    textAlign: 'center',
  },
  selectStyle: {
    marginLeft: 'auto',
    padding: '4px',
    borderRadius: '4px',
    marginBottom: '8px',
    marginTop: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',

  },
  sectionStyle: {
    marginLeft: '16px',
    padding: '8px 0',
    borderTop: '1px solid #eee',
    marginTop: '8px',
    marginBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',

  },
  datasetLinkStyle: {
    color: '#007BFF',
    textDecoration: 'none',
    marginRight: '8px',
  },
  footerStyle: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },

  inputStyle: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginBottom: '8px',
    width: '100%',
    boxSizing: 'border-box',

  },
  buttonStyle: {
    backgroundColor: '#007BFF',
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
  },
  addAttributeButton: {
    padding: '5px 8px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'green',
    color: '#fff',
    cursor: 'pointer',
  },
  addSectionButton: {
    padding: '5px 8px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'green',
    color: '#fff',
    cursor: 'pointer',
  },

  dangerButton: {
    padding: '5px 8px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: '#fff',
    cursor: 'pointer',
    marginLeft: 'auto',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',

  },
  createButton: {
    padding: '5px 8px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'green',
    color: '#fff',
    cursor: 'pointer',
    marginLeft: 'auto',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',

  },
  sectionBox: {
    border: '1px solid #ccc',
    padding: '12px',
    marginBottom: '16px',
    backgroundColor: '#fff',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '8px',
  },
  //Dropdown multiselect styles
  dropdownContainer: {
    position: 'relative',
    width: 'auto',
    marginBottom: '8px',
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '4px',
  },

  dropdownButton: {
    padding: '8px 12px',
    textAlign: 'left',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },

  dropdownContent: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    width: '100%',
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    marginTop: '4px',
    display: 'none', // Añadir clase "show" en el componente para cambiar a "block"

  },

  dropdownContentShow: {
    display: 'block',
  },

  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
    backgroundColor: '#fff',
  },

  dropdownCheckbox: {
    marginRight: '8px',
  },

  dropdownActionButton: {
    fontSize: '12px',
    padding: '4px 8px',
    marginLeft: '4px',
    marginRight: '4px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
  },


};



export default Styles;
