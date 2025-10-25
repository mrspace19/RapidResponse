const trackingHandler = (io, socket) => {
  
  // Join tracking room for a specific request
  socket.on('tracking:join', (data) => {
    const { requestId, userId } = data;
    
    socket.join(`request:${requestId}`);
    
    console.log(`User ${userId} joined tracking for request ${requestId}`);
    
    socket.emit('tracking:joined', {
      requestId,
      message: 'Successfully joined tracking'
    });
  });

  // Leave tracking room
  socket.on('tracking:leave', (data) => {
    const { requestId } = data;
    
    socket.leave(`request:${requestId}`);
    
    console.log(`User left tracking for request ${requestId}`);
  });

  // Share location with emergency contacts
  socket.on('tracking:share_with_contacts', (data) => {
    const { requestId, contacts } = data;
    
    // Emit to all emergency contacts (if they're connected)
    contacts.forEach(contactId => {
      io.to(`user:${contactId}`).emit('tracking:emergency_alert', {
        requestId,
        message: 'Your contact has requested emergency assistance',
        timestamp: new Date()
      });
    });
  });

  // Real-time ETA update
  socket.on('tracking:eta_update', (data) => {
    const { requestId, eta, distance } = data;
    
    io.to(`request:${requestId}`).emit('tracking:eta_changed', {
      eta,
      distance,
      timestamp: new Date()
    });
  });
};

export default trackingHandler;