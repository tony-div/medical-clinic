import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';

import { 
    getDoctors,
    getDoctorScheduleByDocId
} from "../../services/doctors.js";

import { 
    getReviewsByDoctorId,
    getRating
} from "../../services/reviews.js";

import { 
    getSpecialties
} from "../../services/specialty.js";

import './DoctorsList.css';

export default function DoctorsList() {
    const [searchParams] = useSearchParams();
    const initialDept = searchParams.get('dept');

    const [doctors, setDoctors] = useState([]);
    const [schedules, setSchedules] = useState({});
    const [filteredDoctors, setFilteredDoctors] = useState([]);

    const [activeDept, setActiveDept] = useState(initialDept || 'All');
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [specialties, setSpecialties] = useState(['All']);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Load doctors
                const res = await getDoctors();
                const doctorsData = res.data.data || [];

                // 2. Attach rating + reviews
                for (let doctor of doctorsData) {

                    // load rating row
                    if (doctor.rating_id) {
                        const ratingRes = await getRating(doctor.rating_id);
                        const ratingData = ratingRes.data.rating || {};

                        doctor.avg_rating = ratingData.avg_rating || 0;
                        doctor.reviews_count = ratingData.reviews_count || 0;
                    } else {
                        doctor.avg_rating = 0;
                        doctor.reviews_count = 0;
                    }

                    // load doctor reviews
                    const reviewsRes = await getReviewsByDoctorId(doctor.id);
                    doctor.reviews = reviewsRes.data.data || [];
                }

                setDoctors(doctorsData);
                setFilteredDoctors(doctorsData);

                // 3. Load specialties from backend
                const specRes = await getSpecialties();
                const specList = specRes.data.data.map(s => s.name);
                setSpecialties(['All', ...specList]);

                // 4. Load schedules for each doctor
                const scheduleMap = {};
                for (let doc of doctorsData) {
                    const schedRes = await getDoctorScheduleByDocId(doc.id);
                    scheduleMap[doc.id] = schedRes.data.schedule || [];
                }

                setSchedules(scheduleMap);

            } catch (err) {
                console.error("Failed to load doctors list", err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const deptParam = searchParams.get('dept');
        if (deptParam) {
            setActiveDept(deptParam);
        } else {
            setActiveDept('All');
        }
    }, [searchParams]);
    
    // filtering / sorting
    useEffect(() => {
        let results = [...doctors];

        if (activeDept !== 'All') {
            results = results.filter(d => d.specialty_name === activeDept);
        }

        if (searchTerm) {
            const t = searchTerm.toLowerCase();
            results = results.filter(d => 
                d.name.toLowerCase().includes(t) ||
                d.specialty_name?.toLowerCase().includes(t)
            );
        }

        if (sortBy === "price-low") {
            results.sort((a, b) => a.consultation_fees - b.consultation_fees);
        } else if (sortBy === "price-high") {
            results.sort((a, b) => b.consultation_fees - a.consultation_fees);
        } else if (sortBy === "rating") {
            results.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        }

        setFilteredDoctors(results);
    }, [activeDept, searchTerm, sortBy, doctors]);

    const getAvailability = (docId) => {
        const sched = schedules[docId];
        if (!sched || sched.length === 0) return "Not set";

        const days = sched.map(d => d.day).join(", ");
        const time = `${sched[0].starts_at} - ${sched[0].ends_at}`;

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
                        filteredDoctors.map(doc => (
                            <div className="doctor-card" key={doc.id}>
                                <Link to={`/doctor/${doc.id}`} className="card-link">
                                    <div className="card-header">
                                        <div className="img-box">
                                            <img 
                                                src={doc.profile_pic_path || "/default.jpg"} 
                                                alt={doc.name} 
                                            />
                                        </div>

                                        <div className="header-info">
                                            <h3>{doc.name}</h3>

                                            <div className="specialty-badge">
                                                {doc.specialty_name}
                                            </div>

                                            <div className="rating">
                                                ⭐ {doc.avg_rating || 0}
                                                <span className="rating-count">
                                                    ({doc.reviews_count} reviews)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="price-tag">
                                            {doc.consultation_fees} EGP
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <p className="avail-text">
                                            📅 <strong>Availability:</strong> {getAvailability(doc.id)}
                                        </p>
                                        <p className="bio-snippet">
                                            {doc.about_doctor?.substring(0, 60)}...
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            <h3>No doctors found matching your criteria.</h3>
                            <button
                                onClick={() => { setSearchTerm(''); setActiveDept('All'); }}
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
