//serverOne.js
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname+'/public'));

io.on('connection',function(socket){
	console.log('a user connected');

	//读取多个信息
	//方法一 通过键名直接读取
	socket.on('login',function(user){
		console.log('userName: ' +user.name);
		console.log('password: ' +user.password);
	});
});

http.listen(3000,function(){
	console.log('listening on :3000');
});