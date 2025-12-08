import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaPlus } from 'react-icons/fa';
import Swal from 'sweetalert2';

import {
    getSpecialties,
    createSpecialty,
    deleteSpecialtyById
} from  "../../../../services/specialty.js";

import './AddUserModal.css';

export default function SpecialtiesModal({ isOpen, onClose }) {
    const [specialties, setSpecialties] = useState([]);
    const [newSpec, setNewSpec] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Load specialties from API
    const refreshSpecs = async () => {
        try {
            setIsLoading(true);
            const res = await getSpecialties();
            setSpecialties(res.data.data || []);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            Swal.fire("Error", "Failed to load specialties", "error");
        }
    };

    useEffect(() => {
        if (isOpen) refreshSpecs();
    }, [isOpen]);

    // lock scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => (document.body.style.overflow = 'unset');
    }, [isOpen]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newSpec.trim()) return;

        if (specialties.some(s => s.name.toLowerCase() === newSpec.toLowerCase())) {
            Swal.fire("Duplicate", "This specialty already exists", "warning");
            return;
        }

        try {
            setIsLoading(true);
            await createSpecialty(newSpec);

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                timer: 1500,
                showConfirmButton: false
            });
            Toast.fire({ icon: 'success', title: 'Specialty Added' });

            setNewSpec("");
            refreshSpecs();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to add specialty", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            confirmButtonText: "Delete"
        });

        if (!confirm.isConfirmed) return;

        try {
            await deleteSpecialtyById(id);
            setSpecialties(specialties.filter(s => s.id !== id));
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to delete specialty", "error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modalOverlay">
            <div className="modalContainer" style={{ width: '400px' }}>
                <div className="modalHeader" style={{ backgroundColor: '#8e44ad' }}>
                    <h3>Manage Specialties</h3>
                    <button onClick={onClose} className="closeBtn">
                        <FaTimes />
                    </button>
                </div>

                <div className="modalBody">
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="New Specialty Name"
                            value={newSpec}
                            onChange={e => setNewSpec(e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                        <button
                            type="submit"
                            style={{ background: '#8e44ad', color: 'white', border: 'none', borderRadius: '5px', padding: '0 15px', cursor: 'pointer' }}
                        >
                            <FaPlus />
                        </button>
                    </form>

                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {isLoading ? (
                            <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
                        ) : (
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
                        )}

                        {!isLoading && specialties.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>
                                No specialties found.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
