var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname+'/public'));

io.on('connection',function(socket){
		console.log('a user connected');
		//bging-----登录

				socket.on('login',function(user){

						require('login/logindao').login(user,socket);
				});
		//end-------登录

});

http.listen(3000,function(){
	console.log('listening on :3000');
});