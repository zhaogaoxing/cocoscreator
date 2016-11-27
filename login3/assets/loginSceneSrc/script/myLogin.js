cc.Class({
    extends: cc.Component,

    properties: {
        label:{
            default:null,
            type: cc.Label,
        },
        userNameInput:{
            default:null,
            type:cc.Label,
        },
        passwordInput:{
            default:null,
            type:cc.Label,
        },
        
        errorText: '用户名或密码错误',
        emptyText: '用户名或密码不能为空',
        
    },
    
    login:function(){
        if(this.isEmpty(this.getUserName(),this.getPassword())){
            this.serverFeedback.string = this.emptyText;
            return;
        }else{
            
            socket.emit('login',{
                userName:this.getUserName(),
                password:this.getPassword(),
            });
        }
    },
    
    isEmpty:function(userName,password){
         console.log(userName);
         console.log(password);
         
         if(userName == ''||password == '')return true;
         if(userName[0] == '请') return true;
         return false;
    },
    
    getUserName:function(){
        return this.userNameInput.string;  
    },
    
    getPassword:function(){
        return this.passwordInput.getComponent('myPasswordInput').passwordText
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        
        //数据传输
        
        if(cc.sys.isNative){
            window.io = SocketIO;
        }
        else{
            require('socket.io');
        }
        var socket = io('http://localhost:3000');
        
        //一次传递多个信息
        //方法一：直接传对象 写法是‘{}’为一份数据 ‘：’左右为一键一值 ‘，’ 分割一条信息
        socket.emit('login',{'name':'linhaiwei号','password':'123'});
        
        //数据传输
        
        socket.on('login',function(success){
            if(success){
                console.log(cc);
                self.serverFeedback.string = '';
                cc.director.loadScene('fighten');
            }
            else{
                self.serverFeedback.sring = self.errorText;
            }
        });
        
        // if(cc.sys.isNative){
        //     window.io = SocketIO;
        // }
        // else{
        //     require('socket.io');
        // }
        
        // var socket = io('http://localhost:3000');
        
        // socket.on('connected',function(msg){
        //     self.label.string = msg;
        // });
        
        
    },

    
});
