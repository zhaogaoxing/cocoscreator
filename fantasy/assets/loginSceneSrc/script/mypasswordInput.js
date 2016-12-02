cc.Class({
    extends: cc.Component,

    properties: {
        text: 'enter password',
       passwordInput:{
           default:null,
           type:cc.Label,
       },
       
       passwordText:'',
       
       focus:false,
    },
    
    delPlaceHolder:function(){
        if(this.passwordInput.string[0] == 'e'){
            this.passwordInput.string = '';
        }
    },
    
    resumePlaceHolder:function(){
        if(this.passwordInput.string.length == 0){
            this.passwordInput.string = this.text;
        }
    },
    
    isContain:function(event){
        var point = this.node.convertToNodeSpace(event.getLocation());
        
        if(point.x<0|| point.y<0)return false;
        
        var rect = this.node.getBoundingBox();
        
        if(point.x>rect.width || point.y>rect.height)return false;
        return true;
        
    },

    // use this for initialization
    onLoad: function () {
            let self = this;
            cc.eventManager.addListener({
                event:cc.EventListener.MOUSE,
                onMouseDown: function(event){
                    if(self.focus = self.isContain(event)){
                        self.delPlaceHolder();
                    }
                    else{
                        self.resumePlaceHolder();
                    }
                }
            }, self.node);
            
            cc.eventManager.addListener({
                event:cc.EventListener.KEYBOARD,
                onKeyPressed:function(keyCode,event){
                    if(!self.focus) return;
                    if(keyCode == cc.KEY.backspace){
                        self.passwordText = self.passwordText.slice(0,-1);
                        self.passwordInput.string = self.passwordInput.string.slice(0, -1);
                        return;
                    }
                    self.passwordText += String.fromCharCode(keyCode);//存真正的密码
                    self.passwordInput.string += '*';//回
                   
                },
            }, self.node);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
