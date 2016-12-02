var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit : 10,
	host		: 'localhost',
	user		: 'root',
	password	: '123456',
	database	: 'db_user'
});


var sql =  'select * from t_user where t_user.userName=? and t_user.password=?';

var values = [];								//这个是用来装用户名和密码的

var result = {};														

exports.login = function login(user, socket){    //将请求语句封装起来 只需要调用的人告诉我们用户名和密码

	values.push(user.userName);
	values.push(user.password);


	pool.query({sql:sql,values:values},function(err, rows, fields){	


	     if(rows.length == 0){
		socket.emit('login', '\u5c0f\u5b50\u4f60\u8c01\u554a');//小子你谁啊
	     }
	     else{
		socket.emit('login', '\u5927\u7237\u4f60\u597d\u554a');//大爷你好啊
	     }
	
	});
	
}