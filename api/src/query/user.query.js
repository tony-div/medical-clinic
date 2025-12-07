export const query = {
    CREATE_MEDICAL_TEST: `INSERT INTO MedicalTest ( appointment_id, file_path, test_date, description ) VALUES (?,?,?,?);`,
    UPDATE_MEDICAL_TEST: `UPDATE MedicalTest SET ? WHERE id = ?;`,
    SELECT_APPOINTMENT_BY_ID: `SELECT * FROM Appointment WHERE id = ?`,
    SELECT_MEDICAL_TEST_BY_ID: `SELECT * FROM MedicalTest WHERE id = ?`,
    DELETE_MEDICAL_TEST: `DELETE FROM MedicalTest WHERE id = ?`,
    CREATE_USER: `
    INSERT INTO User (email, password, name, phone_number, address, gender, birth_date, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    SELECT_USER_BY_ID: `SELECT * FROM User WHERE id = ?`,
    // [ADDED] - Query to get all users for admin panel
    SELECT_ALL_USERS: `SELECT id, email, name, phone_number, address, gender, birth_date, role FROM User`,
    UPDATE_USER_BY_ID: `UPDATE User SET ? WHERE id = ?`,
    SELECT_USER_BY_EMAIL: `SELECT * FROM User WHERE email = ?`,
    DELETE_USER_BY_ID: `DELETE FROM User WHERE id = ?`,
    CREATE_REVIEW: `INSERT INTO DoctorReview (doctor_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)`,
    CREATE_DIAGNOSIS: `
    INSERT INTO Diagnosis (description, prescription, treatment_plan)
    VALUES (?, ?, ?)`,
    SELECT_DIAGNOSIS_BY_ID: `SELECT * FROM Diagnosis WHERE id = ?`,
    GET_ALL_APPOINTMENTS: `SELECT * FROM Appointment`,
    CREATE_APPOINTMENT: `INSERT INTO Appointment ( user_id, doctor_id, reason, date, starts_at, ends_at, diagnosis_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    UPDATE_APPOINTMENT: `UPDATE Appointment SET ? WHERE id = ?;`,
    SELECT_APPOINTMENT_BY_USERID: `SELECT * FROM Appointment WHERE user_id = ?`,
    SELECT_APPOINTMENT_BY_DOCID: `SELECT * FROM Appointment WHERE doctor_id = ?`,
    SELECT_DOCTOR_BY_USERID: `SELECT * FROM Doctor WHERE user_id = ?`,
    CREATE_DOCTOR: `INSERT INTO Doctor SET ?`,
    UPDATE_DOCTOR_BY_USERID: `UPDATE Doctor SET ? WHERE user_id = ?`,
    DELETE_DOCTOR_BY_USERID: `DELETE FROM Doctor WHERE user_id = ?`,
    SELECT_DOCTOR_BY_ID: `SELECT * FROM Doctor WHERE id = ?`,
    SELECT_SCHEDULE_BY_DOCTOR_ID: `SELECT * FROM DoctorSchedule WHERE doctor_id = ?`,
    CREATE_SCHEDULE: `INSERT INTO DoctorSchedule (doctor_id, day, starts_at, ends_at, slot_duration) VALUES (?, ?, ?, ?, ?)`,
    SELECT_SCHEDULE_BY_ID: `SELECT * FROM DoctorSchedule WHERE id = ?`,
    UPDATE_SCHEDULE_BY_ID: `UPDATE DoctorSchedule  SET ? WHERE id = ?`,
    DELETE_SCHEDULE_BY_ID: `DELETE FROM DoctorSchedule WHERE id = ?`,
    SELECT_APPOINTMENTS_SHARED: `  SELECT * FROM Appointment WHERE user_id=? AND doctor_id=?`,
    GET_SPECIALTY_BY_ID: `SELECT * FROM Specialty WHERE id = ?`,
    CREATE_SPECIALTY: `INSERT INTO Specialty (name) VALUES (?)`,
    GET_RATING_BY_ID: `SELECT * FROM DoctorRating WHERE id = ?`,
    SELECT_MEDICAL_TEST_BY_APPOINTMENT_ID: `SELECT * FROM MedicalTest WHERE appointment_id = ?;`,
    SELECT_ALL_USERS: `SELECT * FROM User;`

}