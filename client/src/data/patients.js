export const patientsData = [
    {
        id: 1,
        name: "John Doe",
        email: "john@gmail.com",
        age: 25,
        bloodType: "O+",
        upcomingAppointment: {
            id: 101,
            doctorName: "Dr. Frieren",
            specialty: "Neurology",
            date: "2025-12-05",
            time: "04:00 PM",
            image: "/assets/frieren.png",
        },
        recentHistory: [
            { id: 99, doctor: "Dr. Toothless", date: "2023-10-01", status: "Completed", diagnosis: "Wisdom Tooth Extraction" },
            { id: 98, doctor: "Dr. Miku", date: "2023-09-15", status: "Cancelled", diagnosis: "-" }
        ]
    },

    {
        id: 2,
        name: "Hannah Montana",
        email: "hannah@gmail.com",
        age: 22,
        bloodType: "A-",
        upcomingAppointment: {
            id: 102,
            doctorName: "Dr. Miku",
            specialty: "Cardiology",
            date: "2025-12-10",
            time: "10:00 AM",
            image: "/assets/miku.png",
        },
        recentHistory: [
            { id: 80, doctor: "Dr. Stone", date: "2023-08-20", status: "Completed", diagnosis: "Migraine Checkup" }
        ]
    },

    {
        id: 3,
        name: "Jane Smith",
        email: "jane@gmail.com",
        age: 30,
        bloodType: "AB+",
        upcomingAppointment: null,
        recentHistory: [
            { id: 55, doctor: "Dr. Ryan", date: "2023-05-12", status: "Completed", diagnosis: "Seasonal Allergies" },
            { id: 54, doctor: "Dr. Ryan", date: "2023-01-10", status: "Completed", diagnosis: "Annual Checkup" }
        ]
    }
];