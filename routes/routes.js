const { Router } = require('express');

const controller = require('../controllers/controllers');

const router = Router();


/*
|--------------------------------------------------------------------------
| TEST
|--------------------------------------------------------------------------
*/

router.get('/test', (req, res) => {

    res.json({
        message: 'Mobile Clinic route working'
    });

});


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.post('/signup', controller.addUser);

router.post('/login', controller.login);


/*
|--------------------------------------------------------------------------
| PATIENTS
|--------------------------------------------------------------------------
*/

router.get('/patients', controller.getPatients);

router.get('/patients/:id', controller.getPatientById);


/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/

router.get('/services', controller.getServices);


/*
|--------------------------------------------------------------------------
| DOCTORS
|--------------------------------------------------------------------------
*/

router.get('/doctors', controller.getDoctors);

router.get('/doctors/:id', controller.getDoctorById);

router.get(
    '/doctors/service/:serviceId',
    controller.getDoctorsByService
);


/*
|--------------------------------------------------------------------------
| APPOINTMENTS
|--------------------------------------------------------------------------
*/

router.post('/appointments', controller.bookAppointment);

router.get('/appointments', controller.getAppointments);

router.get(
    '/appointments/patient/:patientId',
    controller.getAppointmentsByPatient
);

router.get(
    '/appointments/:id',
    controller.getAppointmentById
);

router.put(
    '/appointments/:id/cancel',
    controller.cancelAppointment
);


/*
|--------------------------------------------------------------------------
| MEDICAL RECORDS
|--------------------------------------------------------------------------
*/

router.get(
    '/medical-records/patient/:patientId',
    controller.getMedicalRecords
);

router.get(
    '/medical-records/:id',
    controller.getMedicalRecordById
);


/*
|--------------------------------------------------------------------------
| PRESCRIPTIONS
|--------------------------------------------------------------------------
*/

router.get(
    '/prescriptions/patient/:patientId',
    controller.getPrescriptions
);


/*
|--------------------------------------------------------------------------
| MESSAGES
|--------------------------------------------------------------------------
*/

router.get(
    '/messages/:patientId',
    controller.getMessages
);

router.post(
    '/messages',
    controller.sendMessage
);

router.put(
    '/messages/:id/read',
    controller.markMessageRead
);


/*
|--------------------------------------------------------------------------
| HEALTH TIPS
|--------------------------------------------------------------------------
*/

router.get(
    '/health-tips',
    controller.getHealthTips
);


/*
|--------------------------------------------------------------------------
| SYMPTOM CHECKER
|--------------------------------------------------------------------------
*/

router.get(
    '/symptoms',
    controller.getSymptoms
);


/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

router.get(
    '/dashboard/stats',
    controller.getDashboardStats
);


module.exports = router;