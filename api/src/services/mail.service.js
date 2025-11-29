import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendAppointmentEmail = async (to, patientName, doctorName, appointmentDateFormatted, appointmentTimeFormatted, address) => {
  const mailOptions = {
    from: `Medical Clinic <${process.env.GMAIL_USER}>`,
    to,
    subject: `Appointment Confirmation: with Dr. ${doctorName} on ${appointmentDateFormatted}`,
    html: `
    <strong>Dear ${patientName},</strong><br/><br/>
    This email is to confirm your upcoming appointment with <strong>Dr. ${doctorName}.</strong><br/><br/>
    <strong>Appointment Details:</strong><br/>
    <ul>
      <li><strong>Date</strong>: ${appointmentDateFormatted}</li>
      <li><strong>Time</strong>: ${appointmentTimeFormatted}</li>
      <li><strong>Address</strong>: ${address}</li>
      <li><strong>Doctor</strong>: Dr. ${doctorName}</li>
    </ul>
    <br/>
    Please arrive 10 minutes early to complete any necessary paperwork.<br/><br/>
    If you have any questions or need to reschedule, feel free to contact us.<br/><br/>
    We look forward to seeing you!<br/><br/>
    <strong>Best regards,</strong><br/>
    Medical Clinic Team<br/>
    <ul>
      <li>Email: contact@medicalclinic.com</li>
    </ul>
    `,
    text: `Dear ${patientName}, This email is to confirm your upcoming appointment with Dr. ${doctorName}. Appointment Details: - Date: ${appointmentDateFormatted} - Time: ${appointmentTimeFormatted} - Address: ${address} - Doctor: Dr. ${doctorName} Please arrive 10 minutes early to complete any necessary paperwork. If you have any questions or need to reschedule, feel free to contact us. We look forward to seeing you! Best regards, Medical Clinic Team - Email: contact@medicalclinic.com`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending appointment confirmation email to", to, ":", error);
  }
}

export const sendCancelledAppointmentEmail = async (to, patientName, doctorName, appointmentDateFormatted, appointmentTimeFormatted) => {
  const mailOptions = {
    from: `Medical Clinic <${process.env.GMAIL_USER}>`,
    to,
    subject: `Appointment Cancellation: with Dr. ${doctorName} on ${appointmentDateFormatted}`,
    html: `
    <strong>Dear ${patientName},</strong><br/><br/>
    We regret to inform you that your appointment with <strong>Dr. ${doctorName}</strong> scheduled for <strong>${appointmentDateFormatted} at ${appointmentTimeFormatted}</strong> has been cancelled.<br/><br/>
    We apologize for any inconvenience this may cause. If you have any questions or need to reschedule, please contact us at your earliest convenience.<br/><br/>
    <strong>Best regards,</strong><br/>
    Medical Clinic Team<br/>
    <ul>
      <li>Email: contact@medicalclinic.com</li>
    </ul>

    `,
    text: `Dear ${patientName}, We regret to inform you that your appointment with Dr. ${doctorName} scheduled for ${appointmentDateFormatted} at ${appointmentTimeFormatted} has been cancelled. We apologize for any inconvenience this may cause. If you have any questions or need to reschedule, please contact us at your earliest convenience. Best regards, Medical Clinic Team - Email: contact@medicalclinic.com`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending cancellation email to ${to} (Dr. ${doctorName} on ${appointmentDateFormatted}):`, error);
  }
}

export const sendRescheduledAppointmentEmail = async (to, patientName, doctorName, oldDateFormatted, oldTimeFormatted, newDateFormatted, newTimeFormatted) => {
  const mailOptions = {
    from: `Medical Clinic <${process.env.GMAIL_USER}>`,
    to,
    subject: `Appointment Rescheduled: with Dr. ${doctorName}`,
    html: `
    <strong>Dear ${patientName},</strong><br/><br/>
    Your appointment with <strong>Dr. ${doctorName}</strong> has been rescheduled.<br/><br/>
    <strong>Old Appointment Details:</strong><br/>
    <ul>
      <li><strong>Date</strong>: ${oldDateFormatted}</li>
      <li><strong>Time</strong>: ${oldTimeFormatted}</li>
    </ul>
    <strong>New Appointment Details:</strong><br/>
    <ul>
      <li><strong>Date</strong>: ${newDateFormatted}</li>
      <li><strong>Time</strong>: ${newTimeFormatted}</li>
    </ul>
    <br/>
    If you have any questions or need further assistance, please contact us.<br/><br/>
    <strong>Best regards,</strong><br/>
    Medical Clinic Team<br/>
    <ul>
      <li>Email: contact@medicalclinic.com</li>
    </ul>

    `,
    text: `Dear ${patientName}, Your appointment with Dr. ${doctorName} has been rescheduled. Old Appointment Details: - Date: ${oldDateFormatted} - Time: ${oldTimeFormatted} New Appointment Details: - Date: ${newDateFormatted} - Time: ${newTimeFormatted} If you have any questions or need further assistance, please contact us. Best regards, Medical Clinic Team - Email: contact@medicalclinic.com`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}