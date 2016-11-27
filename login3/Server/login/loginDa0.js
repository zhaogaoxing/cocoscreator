//connect  创建一个连接池
var mysql = require('mysql'); //获取mysql驱动包，通过它访问mysql

var pool = mysql.createPool({  //创建从node.js到mysql的链接
	connectionLimit:10,              //添加一个最大连接数  我们设为10
	host:'localhost',
	user:'root',
	password:'zw223315',
	database:'db_user'
});

var sql = 'select * from t_user where t_user.userName=? and t_user.password=?';

var values = [];
var result = {};

exports.login = function login(user,socket){

		values.push(user.userName);
		values.push(user.password);

		pool.getConnection(function(err,connection){
			connection.query({sql:sql,values:values},function(err,rows,fields){
				if(rows.length == 0){
					socket.emit('login',false);
				}
				else{
					socket.user = rows[0];
					socket.emit('login',true);
				}
			});
			connection.release();
			values = [];
		});
}