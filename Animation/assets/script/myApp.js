cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        
        hero:{
            default:null,
            type:cc.Node,
        }
        
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        self.node.on('mouseup',function(event){
           
            var visibleSize = cc.director.getVisibleSize();
            
            var Xindex = Math.floor(event.getLocationX()*3/visibleSize.width);
            var Yindex = 2 - Math.floor(event.getLocationY()*3/visibleSize.height);
            
            var dir = Xindex+Yindex;
            
            if(Xindex == 1&&Yindex ==1) return;
            
            if(Xindex<Yindex){
                dir = 8 - dir;
            }
            
            self.hero.getComponent('myHero').changeDirection(dir);
            
        });

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
