//serverFinal.js
var express = require('express');

var app = express();

var http = require('http').Server(app);

var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));




var userID = 0;

var userList = [];


io.on('connection', function(socket){

	//begin---------------------登录处理-----------------------------//
	
		console.log('a user connected ' +  userID );  //服务器端记录

		socket.broadcast.emit('newUser',{userID: userID}); //广播新用户

		socket.emit('connected',{userID : userID, userList: userList}); //绘制原有用户

		userList.push({					//加入用户列表
			userID : userID,
			curTileX: 12,
			curTileY: 42,
		});

		socket.userID = userID;				//保存session

		userID++;					//总ID加1
	
	//end-----------------------登录处理-----------------------------//

	

	

	

	//begin---------------------离线处理-----------------------------//
	
	socket.on('disconnect',function(){

	


		console.log('a user leaved ' + socket.userID);	//服务器端记录
		delete userList[socket.userID];	 		//删除的为undefined
			
		socket.broadcast.emit('userLeave',{userID: socket.userID}); //广播删除

	
	
	});

	//end-----------------------离线处理-----------------------------//


	//begin---------------------移动处理-----------------------------//

	socket.on('move',function(data){
		userList[socket.userID] = {			   //更新服务器位置
			userID : socket.userID,
			curTileX: data.curTileX + data.newPos.newX,
			curTileY: data.curTileY + data.newPos.newY,
		};
		socket.broadcast.emit('move',data);			   //广播位置改变

		console.log(userList[socket.userID]);
	});

	//end-----------------------移动处理-----------------------------//
	
});





http.listen(3000, function(){
	console.log('listening on : 3000');
});






//socket.broadcast.emit('newUser', userID);
//	socket.emit('newUser', userID);
//	socket.id = userID++;
//	console.log('the ' + socket.id + 'th player had joined');



//socket.on('move',function(info){
//		socket.broadcast.emit('move', info);
//	});



//socket.on('login',function(user){		//----------------登录验证----------------//
//
//		var dao = require('logindao');		//访问前台的node.js和访问数据库的node.js的结合方式就是这个 通过require();
//
//		dao.login(user, socket);			//然后呢 将socket作为参数给到这个dao里面  我们就不管了 
//								//由dao负责通知CocosCreator端登录成功还是登录失败											
//	});





//读取多个信息
	//方法一 通过键名直接读取
//	socket.on('login' , function(user){
//		console.log('userName: ' + user.name);   
//		console.log('password: ' + user.password);
//	});




//	
	//方法二 不知道键名循环读取
//	socket.on('login' , function(user){
//			for(var item in user){
//				console.log(item + ' ' + user[item]);
//			}
//	});