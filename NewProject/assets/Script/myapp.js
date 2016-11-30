cc.Class({
    extends: cc.Component,

    properties: {
       label: null,
       type: cc.Label
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        
        if(cc.sys.isNative){
            window.io = SocketIO;
        }
        else{
            require('socket.io');
        }
        var socket = ('http://localhost:3000');
        
        socket.on('connected',function(msg){
            self.label.string = msg;
            
        });
        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
