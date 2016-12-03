var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit:10,
	host:'localhost',
	user:'root',
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

					if(rows.length==0){
							socket.emit('login',false);
					}else{
						socket.user = rows[0];
						socket.emit('login',true);
					}
			});
			connection.release();
			values = [];
		});
}
