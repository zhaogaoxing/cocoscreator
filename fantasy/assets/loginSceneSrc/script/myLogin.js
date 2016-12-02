cc.Class({
    extends: cc.Component,

    properties: {
        serverFeedback:{
            default:null,
            type:cc.Label,
        },
        userNameInput:{
            default:null,
            type:cc.Label,
        },
        passwordInput:{
            default:null,
            type:cc.Label,
        },
        
        errorText:'用户名或密码错误',
        emptyText:'用户名或密码不能为空',
    },
    
    login:function(){
        if(this.isEmpty(this.getUserName(),this.getPassword())){
            this.serverFeedback.string = this.emptyText; return;
        }else{
            socket.emit('login',{
                userName:this.getUserName(),
                password:this.getPassword(),
            });
        }
    },
    
    isEmpty:function(){
        console.log(userName);
        console.log(password);
        
        if(userName == ''|| password == '')return true;
        if(userName[0] == 'e') return true;
        return false;
    },
    
    getUserName:function(){
        return this.userNameInput.string;
    },
    getPassword:function(){
        return this.passwordInput.getComponent('myPasswordInput').passwordText;
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        
        
        socket.on('login',function(success){
            if(success){
                
                console.log(cc);
                
                self.serverFeedback.string = '';
                cc.director.loadScene('fightScene');
            }
            else{self.serverFeedback.string = self.errorText;}
        });

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
