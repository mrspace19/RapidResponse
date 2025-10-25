import EmergencyRequest from '../../models/emergency.request.js';
import Ambulance from '../../models/Ambulance.js';
import { findNearbyAmbulances } from '../../services/location.service.js';
import { suggestHospitals } from '../../services/hospitalmatching.service.js';

const emergencyHandler = (io, socket) => {
  
  // Create new emergency request
  socket.on('emergency:create', async (data) => {
    try {
      const {
        patientId,
        emergencyType,
        severity,
        pickupLocation,
        ambulanceType,
        patientDetails,
        notes
      } = data;

      // Create emergency request
      const emergencyRequest = await EmergencyRequest.create({
        patientId,
        emergencyType,
        severity,
        serviceType: 'emergency',
        pickupLocation: {
          type: 'Point',
          coordinates: [pickupLocation.longitude, pickupLocation.latitude],
          address: pickupLocation.address,
          landmark: pickupLocation.landmark
        },
        ambulanceType,
        patientDetails,
        notes,
        status: 'searching',
        responseMetrics: {
          searchStartTime: new Date()
        }
      });

      // Find nearby ambulances
      const nearbyAmbulances = await findNearbyAmbulances(
        pickupLocation.longitude,
        pickupLocation.latitude,
        ambulanceType,
        'government',
        10000 // 10km radius
      );

      // Update metrics
      emergencyRequest.responseMetrics.ambulancesNotified = nearbyAmbulances.length;
      await emergencyRequest.save();

      if (nearbyAmbulances.length === 0) {
        emergencyRequest.status = 'no_ambulance_available';
        await emergencyRequest.save();
        
        socket.emit('emergency:no_ambulance', {
          requestId: emergencyRequest._id,
          message: 'No ambulances available nearby'
        });
        return;
      }

      // Broadcast to nearby ambulances
      nearbyAmbulances.forEach(ambulance => {
        io.to(`driver:${ambulance.driverId}`).emit('emergency:new_request', {
          requestId: emergencyRequest._id,
          emergencyType,
          severity,
          pickupLocation: {
            coordinates: pickupLocation,
            address: pickupLocation.address
          },
          ambulanceType,
          patientDetails,
          distance: ambulance.distance
        });
      });

      // Confirm to patient
      socket.emit('emergency:searching', {
        requestId: emergencyRequest._id,
        ambulancesNotified: nearbyAmbulances.length,
        message: 'Searching for nearby ambulances...'
      });

      // Set timeout for no response
      setTimeout(async () => {
        const request = await EmergencyRequest.findById(emergencyRequest._id);
        if (request && request.status === 'searching') {
          request.status = 'no_ambulance_available';
          request.responseMetrics.searchEndTime = new Date();
          await request.save();
          
          socket.emit('emergency:timeout', {
            requestId: emergencyRequest._id,
            message: 'No ambulance accepted the request'
          });
        }
      }, 120000); // 2 minutes timeout

    } catch (error) {
      console.error('Emergency create error:', error);
      socket.emit('emergency:error', {
        message: 'Failed to create emergency request',
        error: error.message
      });
    }
  });

  // Accept emergency request (driver side)
  socket.on('emergency:accept', async (data) => {
    try {
      const { requestId, ambulanceId, driverId } = data;

      const request = await EmergencyRequest.findById(requestId);
      
      if (!request) {
        socket.emit('emergency:error', { message: 'Request not found' });
        return;
      }

      if (request.status !== 'searching') {
        socket.emit('emergency:error', { message: 'Request already accepted by another driver' });
        return;
      }

      // Update request
      request.status = 'accepted';
      request.assignedAmbulanceId = ambulanceId;
      request.acceptTime = new Date();
      request.responseMetrics.searchEndTime = new Date();
      request.responseMetrics.responseTime = request.calculateResponseTime();
      await request.save();

      // Update ambulance status
      await Ambulance.findByIdAndUpdate(ambulanceId, {
        status: 'on_duty'
      });

      // Get hospital suggestions
      const hospitals = await suggestHospitals(
        request.emergencyType,
        request.pickupLocation.coordinates,
        10000
      );
      
      request.suggestedHospitals = hospitals.map(h => ({
        hospitalId: h.hospital._id,
        distance: h.distance,
        eta: h.eta,
        matchScore: h.score,
        reason: h.reason
      }));
      await request.save();

      // Notify patient
      io.to(`user:${request.patientId}`).emit('emergency:accepted', {
        requestId: request._id,
        ambulance: await Ambulance.findById(ambulanceId).populate('driverId', 'name phone'),
        suggestedHospitals: hospitals,
        estimatedArrival: 5 // Calculate based on distance
      });

      // Notify driver
      socket.emit('emergency:accept_confirmed', {
        requestId: request._id,
        pickupLocation: request.pickupLocation,
        patientDetails: request.patientDetails,
        suggestedHospitals: hospitals
      });

      // Notify other drivers that request is taken
      const nearbyAmbulances = await findNearbyAmbulances(
        request.pickupLocation.coordinates[0],
        request.pickupLocation.coordinates[1],
        request.ambulanceType,
        'government',
        10000
      );

      nearbyAmbulances.forEach(ambulance => {
        if (ambulance._id.toString() !== ambulanceId.toString()) {
          io.to(`driver:${ambulance.driverId}`).emit('emergency:request_taken', {
            requestId: request._id
          });
        }
      });

    } catch (error) {
      console.error('Emergency accept error:', error);
      socket.emit('emergency:error', {
        message: 'Failed to accept request',
        error: error.message
      });
    }
  });

  // Reject emergency request
  socket.on('emergency:reject', async (data) => {
    try {
      const { requestId, driverId, reason } = data;
      
      console.log(`Driver ${driverId} rejected request ${requestId}: ${reason}`);
      
      socket.emit('emergency:reject_confirmed', {
        requestId,
        message: 'Request rejected successfully'
      });

    } catch (error) {
      console.error('Emergency reject error:', error);
    }
  });

  // Cancel emergency request
  socket.on('emergency:cancel', async (data) => {
    try {
      const { requestId, reason } = data;

      const request = await EmergencyRequest.findById(requestId);
      
      if (!request) {
        socket.emit('emergency:error', { message: 'Request not found' });
        return;
      }

      request.status = 'cancelled';
      request.cancellationTime = new Date();
      request.cancellationReason = reason;
      await request.save();

      // If ambulance was assigned, free it up
      if (request.assignedAmbulanceId) {
        await Ambulance.findByIdAndUpdate(request.assignedAmbulanceId, {
          status: 'available'
        });

        // Notify driver
        const ambulance = await Ambulance.findById(request.assignedAmbulanceId);
        io.to(`driver:${ambulance.driverId}`).emit('emergency:cancelled', {
          requestId: request._id,
          reason
        });
      }

      socket.emit('emergency:cancel_confirmed', {
        requestId: request._id,
        message: 'Request cancelled successfully'
      });

    } catch (error) {
      console.error('Emergency cancel error:', error);
      socket.emit('emergency:error', {
        message: 'Failed to cancel request',
        error: error.message
      });
    }
  });

  // Update request status
  socket.on('emergency:update_status', async (data) => {
    try {
      const { requestId, status } = data;

      const request = await EmergencyRequest.findById(requestId);
      
      if (!request) {
        socket.emit('emergency:error', { message: 'Request not found' });
        return;
      }

      await request.updateStatus(status);

      // Notify patient
      io.to(`user:${request.patientId}`).emit('emergency:status_update', {
        requestId: request._id,
        status: request.status,
        timestamp: new Date()
      });

      // If completed, update ambulance status
      if (status === 'completed') {
        await Ambulance.findByIdAndUpdate(request.assignedAmbulanceId, {
          status: 'available',
          $inc: { totalRides: 1 }
        });
      }

      socket.emit('emergency:status_update_confirmed', {
        requestId: request._id,
        status: request.status
      });

    } catch (error) {
      console.error('Status update error:', error);
      socket.emit('emergency:error', {
        message: 'Failed to update status',
        error: error.message
      });
    }
  });
};

export default emergencyHandler;