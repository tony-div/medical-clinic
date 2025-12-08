import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { DB_SPECIALTIES_KEY } from '../../../../data/initDB';
import './AddUserModal.css'; // Reuse existing modal styles

export default function SpecialtiesModal({ isOpen, onClose }) {
    const [specialties, setSpecialties] = useState([]);
    const [newSpec, setNewSpec] = useState("");

    // Load Data
    const refreshSpecs = () => {
        const stored = JSON.parse(localStorage.getItem(DB_SPECIALTIES_KEY) || "[]");
        setSpecialties(stored);
    };

    useEffect(() => {
        if (isOpen) refreshSpecs();
    }, [isOpen]);

    // Disable page scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newSpec.trim()) return;

        // Check duplicate
        if (specialties.some(s => s.name.toLowerCase() === newSpec.toLowerCase())) {
            Swal.fire('Error', 'Specialty already exists', 'warning');
            return;
        }

        const newItem = { id: Date.now(), name: newSpec.trim() };
        const updated = [...specialties, newItem];

        localStorage.setItem(DB_SPECIALTIES_KEY, JSON.stringify(updated));
        setSpecialties(updated);
        setNewSpec(""); // Clear input

        // Optional: Toast
        const Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
        });
        Toast.fire({ icon: 'success', title: 'Specialty Added' });
    };

    const handleDelete = (id) => {
        const updated = specialties.filter(s => s.id !== id);
        localStorage.setItem(DB_SPECIALTIES_KEY, JSON.stringify(updated));
        setSpecialties(updated);
    };

    if (!isOpen) return null;

    return (
        <div className="modalOverlay">
            <div className="modalContainer" style={{ width: '400px' }}>
                <div className="modalHeader" style={{ backgroundColor: '#8e44ad' }}> {/* Different color to distinguish */}
                    <h3>Manage Specialties</h3>
                    <button onClick={onClose} className="closeBtn"><FaTimes /></button>
                </div>

                <div className="modalBody">
                    {/* ADD FORM */}
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="New Specialty Name"
                            value={newSpec}
                            onChange={e => setNewSpec(e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                        <button type="submit" style={{ background: '#8e44ad', color: 'white', border: 'none', borderRadius: '5px', padding: '0 15px', cursor: 'pointer' }}>
                            <FaPlus />
                        </button>
                    </form>

                    {/* LIST */}
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {specialties.map(spec => (
                                    <tr key={spec.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px', color: '#333' }}>{spec.name}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDelete(spec.id)}
                                                style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {specialties.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>No specialties found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}