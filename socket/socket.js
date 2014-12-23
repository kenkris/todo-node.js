/**
 *  Socket IO
 */

io.sockets.on('connection', function(socket){

	// Test function
    socket.on('message', function(message){
        var data = { 'message'  : message };
        socket.broadcast.emit('message', data);
        console.log("Mess:" + message);
    });

});