DROP DATABASE IF EXISTS medicalClinic;
CREATE DATABASE medicalClinic;
USE medicalClinic;

CREATE TABLE User (
	id int AUTO_INCREMENT PRIMARY KEY,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    phone_number varchar(255) NOT NULL,
    address varchar(255),
    gender enum ('male', 'female'),
    birth_date date,
    role enum('patient', 'doctor', 'admin') DEFAULT 'patient',
    created_at datetime DEFAULT current_timestamp()
);

CREATE TABLE Specialty (
	id int AUTO_INCREMENT PRIMARY KEY,
    name varchar(255) NOT NULL UNIQUE
);

CREATE TABLE DoctorRating (
	id int AUTO_INCREMENT PRIMARY KEY,
    avg_rating decimal(2,1) NOT NULL,
    reviews_count int NOT NULL
);

CREATE TABLE Doctor (
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id int NOT NULL,
    specialty_id int,
    profile_pic_path varchar(500),
    rating_id int,
    consultation_fees int,
    waiting_time int,
    about_doctor varchar(255),
    education_and_experience varchar(255),
    status enum('active', 'inactive'),
    FOREIGN KEY (user_id) REFERENCES User(id) on delete cascade,
    FOREIGN KEY (rating_id) REFERENCES DoctorRating(id) on delete set null,
    FOREIGN KEY (specialty_id) REFERENCES Specialty(id) on delete set null
	);

CREATE TABLE Diagnosis (
	id int AUTO_INCREMENT PRIMARY KEY,
    description varchar(255),
    prescription varchar(255),
    treatment_plan varchar(255)
);
    
CREATE TABLE Appointment (
	id int AUTO_INCREMENT PRIMARY KEY,
    user_id int,
    doctor_id int,
    reason varchar(255),
    date date NOT NULL,
    starts_at time NOT NULL,
    ends_at time NOT NULL,
    diagnosis_id integer,
    status enum('scheduled' , 'complete', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    created_at datetime DEFAULT current_timestamp(),
    FOREIGN KEY (user_id) REFERENCES User(id) on delete set null,
    FOREIGN KEY (doctor_id) REFERENCES Doctor(id) on delete set null,
    FOREIGN KEY (diagnosis_id) REFERENCES Diagnosis(id) on delete set null
);
    
CREATE TABLE MedicalTest (
	id int AUTO_INCREMENT PRIMARY KEY,
    appointment_id int NOT NULL,
	file_path varchar(500) NOT NULL,
    description varchar(255),
    test_date date,
    uploaded_at datetime DEFAULT current_timestamp(),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(id) on delete cascade
);
    
    
CREATE TABLE DoctorReview(
	id int AUTO_INCREMENT PRIMARY KEY,
    doctor_id int NOT NULL,
    user_id int,
    rating tinyint NOT NULL CHECK (rating >= 0 AND rating <=5),
    comment varchar(255),
    date datetime DEFAULT current_timestamp(),
    FOREIGN KEY (doctor_id) REFERENCES Doctor(id) on delete cascade,
    FOREIGN KEY (user_id) REFERENCES User(id) on delete set null
    );
    
CREATE TABLE DoctorSchedule (
	id int AUTO_INCREMENT PRIMARY KEY,
    doctor_id int NOT NULL,
    day enum('Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Sat', 'Fri') NOT NULL,
    starts_at time NOT NULL,
    ends_at time NOT NULL,
    slot_duration int NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES Doctor(id) on delete cascade
);

INSERT INTO User (
    email,
    password,
    name,
    phone_number,
    address,
    gender,
    birth_date,
    role
) VALUES (
    'rootadmin@gmail.com',
    '$2b$10$tOn0X2ltv/aDH6qMzQ./iedwCJZwndL8axHTtns6HJ8epLRbpPk2.',
    'Root Admin',
    '01000000000',
    'Cairo',
    'female',
    '1990-01-01',
    'admin'
);

SELECT id, email FROM User;
