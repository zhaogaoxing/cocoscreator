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
