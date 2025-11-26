import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import { doctorsData } from './doctors'; 
import './DoctorsList.css';

export default function DoctorsList() {
    const [searchParams] = useSearchParams();
    const initialDept = searchParams.get('dept');
    
    const [filteredDoctors, setFilteredDoctors] = useState(doctorsData);
    const [activeFilter, setActiveFilter] = useState(initialDept || 'All');

    const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Dental'];

    useEffect(() => {
        setActiveFilter(initialDept || 'All');
        if (!initialDept || initialDept === 'All') {
            setFilteredDoctors(doctorsData);
        } else {
            setFilteredDoctors(doctorsData.filter(doc => doc.specialty === initialDept));
        }
    }, [initialDept]); 

    return (
        <div className="page-container">
            <Nav />
            
            <div className="doctors-content">
                <h1 className="page-title">Specialists</h1>

                <div className="filter-bar">
                    {specialties.map(dept => (
                        <Link 
                            to={`/doctors?dept=${dept}`}
                            key={dept} 
                            className={`filter-btn ${activeFilter === dept ? 'active' : ''}`}
                        >
                            {dept}
                        </Link>
                    ))}
                </div>

                <div className="doctors-grid">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map(doc => (
                            <div className="doctor-card" key={doc.id}>
                                <div className="card-header">
                                    <div className="img-box">
                                        <img src={doc.image} alt={doc.name} />
                                    </div>
                                    <div className="header-info">
                                        <h3>{doc.name}</h3>
                                        <span className="specialty-badge">{doc.specialty}</span>
                                        <div className="rating">⭐ {doc.rating}</div>
                                    </div>
                                    <div className="price-tag">${doc.fees}</div>
                                </div>
                                
                                <div className="card-body">
                                    <p><strong>Availability:</strong><br/>{doc.schedule}</p>
                                </div>

                                <Link to={`/doctor/${doc.id}`} className="book-btn-small">
                                    View Profile & Book
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <h3>No doctors found in this department.</h3>
                            <Link to="/doctors?dept=All">View all doctors</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}