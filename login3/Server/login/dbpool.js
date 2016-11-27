//connect  创建一个连接池
var mysql = require('mysql'); //获取mysql驱动包，通过它访问mysql

var pool = mysql.createPool({  //创建从node.js到mysql的链接
	connectionLimit:10,              //添加一个最大连接数  我们设为10
	host:'localhost',
	user:'root',
	password:'zw223315',
	database:'db_user'
});
pool.query('select * from t_user',
	function(err,rows,fields){

			for(var row of rows){

				var result = '';
				for(var field of fields){
					result += (' ' + row[field.name]);

				}

				console.log(result);

			}

	});

