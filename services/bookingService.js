const Booking = require('../models/Booking');
const Customer = require('../models/Customer');

// Create a new booking
exports.createBookingService = async ({
    customerId,
    vehicleId,
    agencyId,
    startDate,
    endDate,
    totalCost
}) => {
    // Ensure that customerId, vehicleId, and agencyId are numbers
    const validCustomerId = Number(customerId);
    const validVehicleId = Number(vehicleId);
    const validAgencyId = Number(agencyId);

    // Validate required fields (this is redundant as it's already handled in controller, but keeping here for safety)
    if (!validCustomerId || !validVehicleId || !validAgencyId || !startDate || !endDate || !totalCost) {
        throw new Error('All fields are required.');
    }

    const newBooking = new Booking({
        customerId: validCustomerId,
        vehicleId: validVehicleId,
        agencyId: validAgencyId,
        startDate,
        endDate,
        totalCost,
        paymentStatus: 'Pending',
        bookingStatus: 'Confirmed'
    });

    await newBooking.save();

    // Update customer's booking history
    await Customer.findOneAndUpdate(
        { customerId: validCustomerId }, // Querying with the Number customerId
        { $push: { bookingHistory: newBooking.bookingId } } // Assuming bookingId is being set as a unique number
    );

    return newBooking;
};


// Update booking status
exports.updateBookingStatusService = async (bookingId, { bookingStatus, paymentStatus }) => {
    const booking = await Booking.findOne({ bookingId:bookingId });

    if (!booking) {
        throw new Error('Booking not found.');
    }

    if (bookingStatus !== undefined) {
        booking.bookingStatus = bookingStatus;
    }

    if (paymentStatus !== undefined) {
        booking.paymentStatus = paymentStatus;
    }

    // Save and return updated booking
    return await booking.save();
};

// Fetch booking details by ID
exports.getBookingDetailsByIdService = async (bookingId) => {
    const booking = await Booking.findById(bookingId).populate([
        { path: 'customerId' },
        { path: 'vehicleId' },
        { path: 'agencyId' }
    ]);

    if (!booking) {
        throw new Error('Booking not found.');
    }

    return booking;
};

// Get all bookings
exports.getAllBookingsService = async () => {
    return await Booking.find().populate('customerId').populate('vehicleId').populate('agencyId');
};


exports.getBookingDetailsByDateService = async (startDate, endDate) => {
    console.log("Raw startDate:", startDate);
    console.log("Raw endDate:", endDate);

    if (!startDate || !endDate) {
        throw new Error('Both startDate and endDate are required.');
    }

    // Parse the start and end dates (ensure they are treated as local time)
    const start = new Date(startDate);  // Treat as local time
    const end = new Date(endDate);      // Treat as local time

    if (isNaN(start) || isNaN(end)) {
        throw new Error('Invalid date format. Use a valid date format (e.g., YYYY-MM-DD).');
    }

    if (start > end) {
        throw new Error('startDate cannot be later than endDate.');
    }

    // Adjust to start of day and end of day in local time (no UTC offset)
    const startOfDay = new Date(start); 
    startOfDay.setHours(0, 0, 0, 0); // Start of the day in local time

    const endOfDay = new Date(end); 
    endOfDay.setHours(23, 59, 59, 999); // End of the day in local time

    console.log("Adjusted Start Date (Local):", startOfDay);
    console.log("Adjusted End Date (Local):", endOfDay);

    // MongoDB query using local time, no UTC adjustment
    const query = {
        $and: [
            { startDate: { $gte: startOfDay } }, // Greater than or equal to start date
            { endDate: { $lte: endOfDay } }      // Less than or equal to end date
        ]
    };

    console.log("MongoDB Query:", query);

    // Execute query
    const bookings = await Booking.find(query)
        .populate('vehicleId', 'vehicleName agencyId')
        .populate('agencyId', 'agencyName');

    console.log("Retrieved Bookings:", bookings);

    return bookings;
};







