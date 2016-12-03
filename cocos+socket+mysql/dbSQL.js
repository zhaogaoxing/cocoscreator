var mysql = require('mysql');  //获取mysql驱动包，访问mysql

var pool = mysql.createPool({   //创建从nodejs到mysql的链接
	connectionLimit : 10,
	host: 'localhost',
	user: 'root',

	database: 'db_user'
});

pool.query({sql:'select * from t_user where t_user.userName=? and t_user.password=?',
			values: ['zhaowei','123']
			}
	,function(err,rows,fields){

		for(var row of rows){

			var result = '';

			for(var field of fields){
				result += (' ' + row[field.name]);
			}
			console.log(result);
		}
	});