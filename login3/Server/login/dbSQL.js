//dbSQL.js
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit:10,              //添加一个最大连接数  我们设为10
	host:'localhost',
	user:'root',
	password:'zw223315',
	database:'db_user'
});

pool.query(
	{       //将sql和需要嵌入的项分开，需要嵌入的项用？代替
		sql:'select * from t_user where t_user.userName=? and t_user.password=?',
		values:['linhaiwei123','asd520']
	},
	function(err,rows,fields){

			for(var row of rows){

				var result = '';
				for(var field of fields){
					result += (' ' + row[field.name]);

				}

				console.log(result);

			}

	});