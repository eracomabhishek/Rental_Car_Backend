const express = require('express');
const router = express.Router();
const agencyController = require("../controllers/agency/agencyController")
const vehicleController = require("../controllers/agency/vehicleController")
const upload = require("../middleware/multerConfig");
const { pagination, options } = require("../services/pagination")
const verifyToken = require("../middleware/verifyToken");

router.get('/pagination', pagination);
router.get('/vehicle/options', options);

// Agency routes
router.post('/agencies', agencyController.createAgency);                        // create agency
router.post('/loginAgency', agencyController.loginAgency);                      // login  agency
router.put('/update/agency',verifyToken, agencyController.updateAgencyProfile); // update agency

// Vehicle routes
router.post('/create/vehicle', verifyToken, upload.array('images', 5), vehicleController.createVehicle); // create vehicle
router.get('/get-all-vehicles', vehicleController.getVehicles);                       // Fetch all Vehicles with Agency name and id
//router.get('/get-vehicle-By/:vehicleId', getVehicleById);           // get vehicle by id
router.get('/vehicles-with-agency/:agencyId', verifyToken, vehicleController.getVehiclesByAgency); //... Find vehicles with agency id
router.post('/vehicle/delete/:vehicleId', vehicleController.deleteVehicle);           // for delete vehicle
router.put('/vehicles/update/:registrationNumber', upload.array('images', 5), vehicleController.updateVehicle);           // update vehic    le
router.get('/get-vehicle/:registrationNumber', vehicleController.getVehicleByRegistrationNumber) // fetch vehicle by registration number
router.get('/get-rented-Vehicle/:agencyId', vehicleController.getRentedVehicles);



// Protected route
router.get("/home", verifyToken, (req, res) => {
    res.status(200).json({
      msg: "Welcome to the protected home route!",
      user: req.user 
    });
});


module.exports = router;
