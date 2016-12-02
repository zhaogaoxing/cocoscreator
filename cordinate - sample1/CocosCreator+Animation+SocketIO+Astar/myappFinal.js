//myapp.js onload
let self = this;
        
        if(cc.sys.isNative){
            window.io = SocketIO;
        }
        else{
            require('socket.io');
        }
        
        var socket = io('http://localhost:3000');
        
        
        var User = require('user');      //先测试登录成功吧 linhaiwei123 asd520 
        var user4 = new User('linhaiwei123', 'asd520');    
        socket.emit('login',user4);
		
		 socket.on('login', function(msg){ //监听后台传来是登录成功还是登录失败 写到label 上
            self.label.string = msg;
        });