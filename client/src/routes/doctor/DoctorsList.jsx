import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; 
import Nav from '../../components/Nav.jsx';

import { 
    getDoctors, 
    getDoctorScheduleByDocId 
} from "../../services/doctors.js";

import './DoctorsList.css';

export default function DoctorsList() {
    const [searchParams] = useSearchParams();
    const initialDept = searchParams.get('dept');

    const [doctors, setDoctors] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);

    const [activeDept, setActiveDept] = useState(initialDept || 'All');
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [specialties, setSpecialties] = useState(['All']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const doctorsRes = await getDoctors();
                const doctorsData = doctorsRes.data.data || [];

                setDoctors(doctorsData);
                setFilteredDoctors(doctorsData);

                const specs = ['All', ...new Set(doctorsData.map(d => d.specialty_name))];
                setSpecialties(specs);

                // Load schedules for each doctor
                const scheduleMap = {};
                for (const doc of doctorsData) {
                    const schedRes = await getDoctorScheduleByDocId(doc.id);
                    scheduleMap[doc.id] = schedRes.data.data || [];
                }
                setSchedules(scheduleMap);

            } catch (err) {
                console.error("Failed to fetch doctors", err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let results = [...doctors];

        if (activeDept !== 'All') {
            results = results.filter(doc => doc.specialty_name === activeDept);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(doc =>
                doc.name.toLowerCase().includes(term) ||
                doc.specialty_name.toLowerCase().includes(term)
            );
        }

        if (sortBy === 'price-low') {
            results.sort((a, b) => a.fees - b.fees);
        } else if (sortBy === 'price-high') {
            results.sort((a, b) => b.fees - a.fees);
        } else if (sortBy === 'rating') {
            results.sort((a, b) => calculateRating(b) - calculateRating(a));
        }

        setFilteredDoctors(results);
    }, [activeDept, searchTerm, sortBy, doctors]);

    const calculateRating = (doc) => {
        if (!doc.reviews || doc.reviews.length === 0) return 0;
        const total = doc.reviews.reduce((sum, r) => sum + r.rating, 0);
        return (total / doc.reviews.length).toFixed(1);
    };

    const getAvailability = (docId) => {
        const sched = schedules[docId];
        if (!sched || sched.length === 0) return "Not set";

        const days = sched.map(d => d.day.substring(0, 3)).join(", ");
        const time = `${sched[0].start}-${sched[0].end}`;

        return `${days}: ${time}`;
    };

    return (
        <div className="page-container">
            <Nav />

            <div className="doctors-content">
                <h1 className="page-title">Find a Doctor</h1>

                <div className="search-filter-container">
                    <input
                        type="text"
                        placeholder="🔍 Search doctor or specialty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />

                    <div className="filter-group">
                        <select 
                            value={activeDept} 
                            onChange={(e) => setActiveDept(e.target.value)} 
                            className="filter-select"
                        >
                            {specialties.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)} 
                            className="filter-select"
                        >
                            <option value="default">Sort By</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                <div className="doctors-grid">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map(doc => {
                            const avgRating = calculateRating(doc);
                            const count = doc.reviews?.length || 0;

                            return (
                                <div className="doctor-card" key={doc.id}>
                                    <Link to={`/doctor/${doc.id}`} className="card-link">
                                        <div className="card-header">
                                            <div className="img-box">
                                                <img src={doc.image_url} alt={doc.name} />
                                            </div>
                                            <div className="header-info">
                                                <h3>{doc.name}</h3>

                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <span className="specialty-badge">{doc.specialty_name}</span>
                                                </div>

                                                <div className="rating">
                                                    ⭐ {avgRating} 
                                                    <span style={{ color:'#777', fontSize:'0.8rem' }}>
                                                        ({count} reviews)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="price-tag">{doc.fees} EGP</div>
                                        </div>

                                        <div className="card-body">
                                            <p className="avail-text">
                                                📅 <strong>Availability:</strong> {getAvailability(doc.id)}
                                            </p>
                                            <p className="bio-snippet">{doc.bio?.substring(0, 50)}...</p>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-results">
                            <h3>No doctors found matching your criteria.</h3>
                            <button 
                                onClick={() => {setSearchTerm(''); setActiveDept('All');}}
                                className="btn-reset"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
