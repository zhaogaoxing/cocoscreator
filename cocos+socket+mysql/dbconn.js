var mysql = require('mysql');  //获取mysql驱动包，访问mysql

var connection = mysql.createConnection({   //创建从nodejs到mysql的链接
	host: 'localhost',
	user: 'root',

	database: 'db_user'
});

connection.connect(); 

connection.query('select * from t_user'
	,function(err,rows,fields){

		for(var row of rows){

			var result = '';

			for(var field of fields){
				result += (' ' + row[field.name]);
			}
			console.log(result);
		}
	});
connection.end();