const Vehicle = require('../models/Vehicle');
const Agency = require('../models/Agency');
const Booking = require('../models/Booking');


exports.createVehicleService = async (data, files, agencyId) => {
    const { vehicleName, vehicleType, capacity, pricePerDay, pricePerHour, availability, features, description } = data;

    // Validate required fields
    const requiredFields = ['vehicleName', 'vehicleType', 'pricePerDay', 'pricePerHour', 'capacity', 'description', 'features', 'availability'];
    for (let field of requiredFields) {
        if (!data[field]) {
            throw new Error(`The field ${field} is required.`);
        }
    }

    // Check if images were uploaded
    if (!files || files.length === 0) {
        throw new Error('At least one image is required.');
    }

    // Extract the file paths from files
    const images = files.map((file) => file.path);

    // Check if the agency exists
    const agency = await Agency.find({ agencyId });
    if (!agency) {
        throw new Error('Agency not found.');
    }

    // Create a new vehicle and include the agencyId and agencyName
    const vehicle = new Vehicle({
        agencyId, 
        agencyName: agency.agencyName, 
        vehicleName,
        vehicleType,
        capacity,
        description,
        pricePerDay,
        pricePerHour,
        availability: availability ?? true, 
        features: features || [], 
        images: images || [], 
    });

    // Save the vehicle to the database
    return await vehicle.save();
};



// get vehicle by ID
exports.findVehicleByIdService = async (vehicleId) => {
    if (!vehicleId) {
        throw new Error('Vehicle ID is required.');
    }

    try {
        // Find the vehicle by its ID and populate the agency name
        const vehicle = await Vehicle.findById(vehicleId).populate('agencyId', 'agencyName');

        if (!vehicle) {
            throw new Error('Vehicle not found.');
        }

        return vehicle; // Return the vehicle document with populated agency name
    } catch (error) {
        console.error('Error in findVehicleById service:', error);
        throw new Error('Failed to find vehicle by ID.');
    }
};


// Get all vehicles
exports.getAllVehiclesService = async () => {
    try {
        // Fetch all vehicles
        const vehicles = await Vehicle.find();
        // For each vehicle, fetch the agency details based on agencyId
        const vehiclesWithAgencyDetails = await Promise.all(
            vehicles.map(async (vehicle) => {
                const agency = await Agency.findOne({ agencyId: vehicle.agencyId });
                return {
                    ...vehicle.toObject(),
                    agencyName: agency ? agency.agencyName : 'Unknown Agency', // Adding agencyName manually
                };
            })
        );

        return vehiclesWithAgencyDetails;
    } catch (error) {
        console.error('Error in getAllVehiclesService:', error);
        throw new Error('Error retrieving vehicles from the database');
    }
};

exports.getRentedVehicleService = async (agencyId) => {
    try {
        const vehicles = await Booking.find({ agencyId: agencyId }).populate('vehicleId'); 
        return vehicles;
    } catch (error) {
        console.error('Error in getAllVehicles service:', error);
        throw new Error('Error retrieving Rented vehicles from the database');
    }
};

// Get vehicles by agency ID
exports.getVehiclesByAgencyService = async (agencyUid) => {
    const vehicles = await Vehicle.find({ agencyUid }).populate('agencyUid', 'agencyName');
    if (vehicles.length === 0) {
        throw new Error('No vehicles found for this agency.');
    }
    return vehicles;
};

// Get vehicle by registration number
exports.getVehicleByRegistrationNumberService = async (registrationNumber) => {
    const vehicle = await Vehicle.findOne({ registrationNumber }).populate('agencyId', 'agencyName');
    if (!vehicle) {
        throw new Error('Vehicle not found.');
    }
    return vehicle;
};

// Update vehicle details
exports.updateVehicleService = async (registrationNumber, updates, files) => {
    console.log("Received registrationNumber:", registrationNumber); // Log the registration number to check the value

    const {
        vehicleName,
        vehicleType,
        capacity,
        description,
        pricePerDay,
        availability,
        features,
    } = updates;

    // Validate registration number
    if (!registrationNumber) {
        throw new Error('Registration number is required.');
    }

    // Find the vehicle by registration number with case-insensitive search
    const vehicle = await Vehicle.findOne({
        registrationNumber: { $regex: new RegExp(`^${registrationNumber}$`, 'i') }, // Case-insensitive match
    });

    console.log("Found vehicle:", vehicle); // Log the result of the query

    if (!vehicle) {
        throw new Error('Vehicle not found.');
    }

    // Update the fields if provided
    if (vehicleName) vehicle.vehicleName = vehicleName;
    if (vehicleType) vehicle.vehicleType = vehicleType;
    if (capacity) vehicle.capacity = capacity;
    if (description) vehicle.description = description;
    if (pricePerDay !== undefined) {
        if (typeof pricePerDay !== 'number') {
            throw new Error('pricePerDay must be a number.');
        }
        vehicle.pricePerDay = pricePerDay;
    }
    if (availability !== undefined) {
        if (typeof availability !== 'boolean') {
            throw new Error('availability must be a boolean.');
        }
        vehicle.availability = availability;
    }
    if (features) vehicle.features = Array.isArray(features) ? features : [features];

    // Handle images if files are provided
    if (files && files.length > 0) {
        const images = files.map((file) => file.path);
        vehicle.images = images;
    }

    // Save the updated vehicle
    return await vehicle.save();
};





// Delete a vehicle
exports.deleteVehicleService = async (vehicleId) => {
    const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);
    if (!deletedVehicle) {
        throw new Error('Vehicle not found.');
    }
    return deletedVehicle;
};


