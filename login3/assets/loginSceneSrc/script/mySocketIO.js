cc.Class({
    extends: cc.Component,

    properties: {
        
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
        socket = io('http://localhost:3000');
    },

    
});
