const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const queries = require('../queries/queries');


// ======================================================
// DATABASE CONNECTION
// ======================================================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    }
});


// Test database connection when the application starts
pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL pool error:', error);
});


// ======================================================
// AUTHENTICATION
// ======================================================

const addUser = async (req, res) => {

    try {

        const {
            first_name,
            last_name,
            email,
            password,
            role,
            phone
        } = req.body;

        if (!first_name || !last_name || !email || !password) {

            return res.status(400).json({
                success: false,
                error: 'First name, last name, email and password are required'
            });

        }

        const existingUser = await pool.query(
            queries.getUserByEmail,
            [email]
        );

        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                error: 'Email already exists'
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            queries.addUser,
            [
                first_name,
                last_name,
                email,
                hashedPassword,
                role || 'patient',
                phone || null
            ]
        );

        const user = result.rows[0];

        delete user.password;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user
        });

    } catch (error) {

        console.error('Add user error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to create user'
        });

    }

};


const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });

        }

        const result = await pool.query(
            queries.getUserByEmail,
            [email]
        );

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });

        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {

            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });

        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {

        console.error('Login error:', error);

        res.status(500).json({
            success: false,
            error: 'Login failed'
        });

    }

};


// ======================================================
// PATIENTS
// ======================================================

const getPatients = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getUsers
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get patients error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve patients'
        });

    }

};


const getPatientById = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getUserById,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Get patient error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve patient'
        });

    }

};


// ======================================================
// SERVICES
// ======================================================

const getServices = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getServices
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get services error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve services'
        });

    }

};


// ======================================================
// DOCTORS
// ======================================================

const getDoctors = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getDoctors
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get doctors error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve doctors'
        });

    }

};


const getDoctorById = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getDoctorById,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Get doctor error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve doctor'
        });

    }

};


const getDoctorsByService = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getDoctorsByService,
            [req.params.serviceId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get doctors by service error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve doctors for service'
        });

    }

};


// ======================================================
// APPOINTMENTS
// ======================================================

const bookAppointment = async (req, res) => {

    try {

        const {
            patient_id,
            doctor_id,
            service_id,
            appointment_date,
            appointment_time
        } = req.body;

        if (
            !patient_id ||
            !doctor_id ||
            !service_id ||
            !appointment_date ||
            !appointment_time
        ) {

            return res.status(400).json({
                success: false,
                error: 'All appointment fields are required'
            });

        }

        const result = await pool.query(
            queries.createAppointment,
            [
                patient_id,
                doctor_id,
                service_id,
                appointment_date,
                appointment_time
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            appointment: result.rows[0]
        });

    } catch (error) {

        console.error('Book appointment error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to book appointment'
        });

    }

};


const getAppointments = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getAppointments
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get appointments error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve appointments'
        });

    }

};


const getAppointmentsByPatient = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getAppointmentsByPatient,
            [req.params.patientId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get patient appointments error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve patient appointments'
        });

    }

};


const getAppointmentById = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getAppointmentById,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Get appointment error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve appointment'
        });

    }

};


const cancelAppointment = async (req, res) => {

    try {

        const result = await pool.query(
            queries.cancelAppointment,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });

        }

        res.json({
            success: true,
            message: 'Appointment cancelled',
            appointment: result.rows[0]
        });

    } catch (error) {

        console.error('Cancel appointment error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to cancel appointment'
        });

    }

};


// ======================================================
// MEDICAL RECORDS
// ======================================================

const getMedicalRecords = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getMedicalRecords,
            [req.params.patientId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get medical records error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve medical records'
        });

    }

};


const getMedicalRecordById = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getMedicalRecordById,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Medical record not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Get medical record error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve medical record'
        });

    }

};


// ======================================================
// PRESCRIPTIONS
// ======================================================

const getPrescriptions = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getPrescriptions,
            [req.params.patientId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get prescriptions error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve prescriptions'
        });

    }

};


// ======================================================
// MESSAGES
// ======================================================

const getMessages = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getMessages,
            [req.params.patientId]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get messages error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve messages'
        });

    }

};


const sendMessage = async (req, res) => {

    try {

        const {
            sender_id,
            recipient_id,
            subject,
            message
        } = req.body;

        if (!sender_id || !recipient_id || !message) {

            return res.status(400).json({
                success: false,
                error: 'Sender, recipient and message are required'
            });

        }

        const result = await pool.query(
            queries.createMessage,
            [
                sender_id,
                recipient_id,
                subject || null,
                message
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Send message error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to send message'
        });

    }

};


const markMessageRead = async (req, res) => {

    try {

        const result = await pool.query(
            queries.markMessageRead,
            [req.params.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });

        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {

        console.error('Mark message read error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to update message'
        });

    }

};


// ======================================================
// HEALTH TIPS
// ======================================================

const getHealthTips = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getHealthTips
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get health tips error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve health tips'
        });

    }

};


// ======================================================
// SYMPTOMS
// ======================================================

const getSymptoms = async (req, res) => {

    try {

        const result = await pool.query(
            queries.getSymptoms
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error('Get symptoms error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve symptoms'
        });

    }

};


// ======================================================
// DASHBOARD
// ======================================================

const getDashboardStats = async (req, res) => {

    try {

        const patients = await pool.query(
            queries.totalPatients
        );

        const doctors = await pool.query(
            queries.totalDoctors
        );

        const appointments = await pool.query(
            queries.totalAppointments
        );

        const upcoming = await pool.query(
            queries.upcomingAppointments
        );

        res.json({
            success: true,
            patients: Number(patients.rows[0].total),
            doctors: Number(doctors.rows[0].total),
            appointments: Number(appointments.rows[0].total),
            upcomingAppointments: Number(upcoming.rows[0].total)
        });

    } catch (error) {

        console.error('Dashboard stats error:', error);

        res.status(500).json({
            success: false,
            error: 'Unable to retrieve dashboard statistics'
        });

    }

};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {

    // Authentication
    addUser,
    login,

    // Patients
    getPatients,
    getPatientById,

    // Services
    getServices,

    // Doctors
    getDoctors,
    getDoctorById,
    getDoctorsByService,

    // Appointments
    bookAppointment,
    getAppointments,
    getAppointmentsByPatient,
    getAppointmentById,
    cancelAppointment,

    // Medical records
    getMedicalRecords,
    getMedicalRecordById,

    // Prescriptions
    getPrescriptions,

    // Messages
    getMessages,
    sendMessage,
    markMessageRead,

    // Health tips
    getHealthTips,

    // Symptoms
    getSymptoms,

    // Dashboard
    getDashboardStats

};