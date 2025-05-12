import React, { useState, useRef, useEffect } from 'react';
import Styles from './Styles';

function DropdownMultiselect({ options, selectedValues, onChange }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    const toggleDropdown = () => setOpen(!open);

    const handleOptionToggle = (value) => {
        const newSelection = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onChange(newSelection);
    };

    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectAll = () => {
        const allValues = options.map(opt => opt.value);
        onChange(allValues);
    };

    const deselectAll = () => {
        // Poner la ultima versión como seleccionada
        const lastVersion = options[options.length - 1].value;
        onChange([lastVersion]);
        };

    // Showing versions v1, v2, v3
    const labelText =
        selectedValues.length > 1
            ? `Showing versions (${selectedValues.join(', ')})`
            : `Showing latest version (v${selectedValues[0]})`;


    return (
        <div style={Styles.dropdownContainer} ref={dropdownRef}>
            <div style={Styles.dropdownButton} onClick={toggleDropdown}>
                {labelText}
            </div>
            <div
                style={{
                    ...Styles.dropdownContent,
                    ...(open ? Styles.dropdownContentShow : {})
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                    <button onClick={selectAll} style={Styles.dropdownActionButton}>Select all</button>
                    <button onClick={deselectAll} style={Styles.dropdownActionButton}>Clear all</button>
                </div>
                {options.map((opt) => (
                    <label key={opt.value} style={Styles.dropdownItem}>
                        <input
                            type="checkbox"
                            checked={selectedValues.includes(opt.value)}
                            onChange={() => handleOptionToggle(opt.value)}
                            style={Styles.dropdownCheckbox}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

export default DropdownMultiselect;
