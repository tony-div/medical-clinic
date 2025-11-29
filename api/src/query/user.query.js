export const query = {
    CREATE_MEDICAL_TEST: `INSERT INTO MedicalTest ( appointment_id, file_path, test_date, description ) VALUES (?,?,?,?);`,
    UPDATE_MEDICAL_TEST:  `UPDATE MedicalTest SET ? WHERE id = ?;`,
    SELECT_APPOINTMENT_BY_ID: `SELECT id FROM Appointment WHERE id = ?`,
    SELECT_MEDICAL_TEST_BY_ID: `SELECT * FROM MedicalTest WHERE id = ?`,
    DELETE_MEDICAL_TEST:`DELETE FROM MedicalTest WHERE id = ?`,
    CREATE_USER: `
    INSERT INTO User (email, password, name, phone_number, address, gender, birth_date, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    SELECT_USER_BY_ID: `SELECT * FROM User WHERE id = ?`,
    UPDATE_USER_BY_ID: `UPDATE User SET ? WHERE id = ?`,
    SELECT_USER_BY_EMAIL: `SELECT * FROM User WHERE email = ?`,
    DELETE_USER_BY_ID: `DELETE FROM User WHERE id = ?`,
    CREATE_REVIEW: `INSERT INTO DoctorReview (doctor_id, user_id, rating, comment)
    VALUES (?, ?, ?, ?)`,


}