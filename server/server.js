const io = require('socket.io')(3000, {
  cors: {
    origin: 'http://localhost:1234',
  },
})

io.on('connection', (socket) => {
  console.log('here')
})
