import Ambulance from '../../models/Ambulance.js';

const driverHandler = (io, socket) => {
  
  // Driver goes online
  socket.on('driver:online', async (data) => {
    try {
      const { driverId, ambulanceId, location } = data;

      const ambulance = await Ambulance.findById(ambulanceId);
      
      if (!ambulance) {
        socket.emit('driver:error', { message: 'Ambulance not found' });
        return;
      }

      // Update ambulance location and status
      ambulance.status = 'available';
      ambulance.currentLocation = {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      };
      await ambulance.save();

      // Join driver-specific room
      socket.join(`driver:${driverId}`);

      socket.emit('driver:online_success', {
        message: 'You are now online and available for requests',
        ambulance: {
          id: ambulance._id,
          registrationNumber: ambulance.registrationNumber,
          type: ambulance.type,
          status: ambulance.status
        }
      });

      console.log(`Driver ${driverId} is now online with ambulance ${ambulanceId}`);

    } catch (error) {
      console.error('Driver online error:', error);
      socket.emit('driver:error', {
        message: 'Failed to go online',
        error: error.message
      });
    }
  });

  // Driver goes offline
  socket.on('driver:offline', async (data) => {
    try {
      const { ambulanceId } = data;

      await Ambulance.findByIdAndUpdate(ambulanceId, {
        status: 'offline'
      });

      socket.emit('driver:offline_success', {
        message: 'You are now offline'
      });

      console.log(`Ambulance ${ambulanceId} is now offline`);

    } catch (error) {
      console.error('Driver offline error:', error);
      socket.emit('driver:error', {
        message: 'Failed to go offline',
        error: error.message
      });
    }
  });

  // Update driver location
  socket.on('driver:location_update', async (data) => {
    try {
      const { ambulanceId, location, requestId } = data;

      // Update ambulance location in database
      const ambulance = await Ambulance.findById(ambulanceId);
      
      if (ambulance) {
        ambulance.currentLocation = {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        };
        await ambulance.save();

        // If there's an active request, emit location to patient
        if (requestId) {
          io.to(`request:${requestId}`).emit('ambulance:location_update', {
            location: {
              latitude: location.latitude,
              longitude: location.longitude
            },
            timestamp: new Date()
          });
        }
      }

    } catch (error) {
      console.error('Location update error:', error);
    }
  });

  // Driver arrived at pickup
  socket.on('driver:arrived_pickup', async (data) => {
    try {
      const { requestId } = data;

      io.to(`request:${requestId}`).emit('driver:arrived', {
        message: 'Ambulance has arrived at your location',
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Arrived pickup error:', error);
    }
  });

  // Patient picked up
  socket.on('driver:patient_picked', async (data) => {
    try {
      const { requestId } = data;

      io.to(`request:${requestId}`).emit('driver:patient_onboard', {
        message: 'Patient is onboard, heading to hospital',
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Patient picked error:', error);
    }
  });
};

export default driverHandler;