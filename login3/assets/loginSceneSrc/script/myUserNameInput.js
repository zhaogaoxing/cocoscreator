cc.Class({
    extends: cc.Component,

    properties: {
       text: '请输入用户名',
       userNameput:{
           default:null,
           type:cc.Label,
       },
       
       focus:false,
    },
    
    delPlaceHolder:function(){
        if(this.userNameput.string[0] == '请'){
            this.userNameput.string = '';
        }
    },
    
    resumePlaceHolder:function(){
        if(this.userNameput.string.length == 0){
            this.userNameput.string = this.text;
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
                        self.userNameput.string = self.userNameput.string.slice(0,-1);
                        return;
                    }
                    self.userNameput.string += String.fromCharCode(keyCode);
                },
            }, self.node);
            
    },
    

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
