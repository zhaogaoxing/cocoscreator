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
        
        label: {
            default:null,
            type:cc.Label,
        },
        animation:{
            default:null,
            type:cc.Animation,
        },
        one:{
            default:null,
            type:Number,
        },
        hello:{
            default:'hello world',
            type:String,
        },
        通讯录:{
            default: null,
            隔壁老王:12315421645321,
        },
        
    },

    // use this for initialization
    onLoad: function () {
        //加载的时候调用
    },
    
    update: function(dt){
      //每帧刷新的时候调用  
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
