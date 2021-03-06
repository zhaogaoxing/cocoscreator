cc.Class({
    extends: cc.Component,

    properties: {
       
        StandAnimName : '',
        WalkAnimName : '',
        curDir : '',
        dir : '',
        
        path : [],

    },
    
    toStand: function(){
        this.getComponent(cc.Animation).play(this.StandAnimName + this.curDir);
    },
    
    toWalk: function(){
        
        var item = this.path.shift();
        if(item == undefined) return;
        this.dir = item.dx + '' + item.dy;
        
        if(this.dir == this.curDir) return;
        this.curDir = this.dir;
        this.getComponent(cc.Animation).play(this.WalkAnimName + this.dir);
    },
    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
