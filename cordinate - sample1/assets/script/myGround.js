cc.Class({
    extends: cc.Component,

    properties: {
        
        curTileX : 12,
        curTileY : 42,
       
        
        finalList : [],
        
        radio : 1,
        
        hero: {
            default: null,
            type: cc.Node,
        },
        
        curTileXY: {
            default: null,
            type: cc.Label,
        },
        
        curTileForeName : '当前坐标: ',

    },
    

    
    
    toMove : function(){
         if(this.finalList.length == 0){                    //如果走完了  
             this._standHero();                             //就站着
             //this.hero.getComponent('myHero').toStand();
             return;
         }
        var dir = this.finalList.shift();                   //否则取得下一步
        

         
        this.curTilePosX = dir.dx;                          //修改当前坐标  (这个是为寻路中断准备的 可惜没能实现)
        this.curTilePosY = dir.dy;
        this.curTileXY.string = this.curTileForeName + this.curTilePosX + ',' + this.curTilePosY;
        //console.log(this.curTilePosX + ' ' + this.curTilePosY);
        //this._moveHero(dir.dx, dir.dy);
        //this.hero.getComponent('myHero').toWalk(dir.dx + '' + dir.dy);
        
        //Begin-----------------------_moveBackground--------------------------//
        this.node.runAction(                                //开始移动吧  
            cc.sequence(
                
                cc.callFunc(this._moveHero(dir.dx, dir.dy),this),   //角色转向下一步
                cc.moveBy(
                    this.radio * ((dir.dx != 0) && (dir.dy != 0) ? 1.4 : 1) / 10,  //地图向下一步移动
                    -(dir.dx+dir.dy)*32, 
                     (dir.dy-dir.dx)*24
                ),
                cc.callFunc(this.toMove,this)               //然后调用自己  获取下一步
            )
            
        );
        
        //this._moveBackground(dir.x,dir.y);
        //End-----------------------_moveBackground----------------------------//
        
        //#bug1
        //      cc.sequence(cc.Action(),cc.callFunc(this.hero.dir = 'dir.dx + '' + dir.dy'); !async
        //      cc.sequence(cc.Action(),cc.callFunc(function,target,data)) !async
        //      cc.sequence(cc.Action(),cc.callFunc(function(data),target)) !async
        //      cc.sequence(cc.Action(),cc.callFunc(new function(data),target)); !async
        //      cc.sequence(cc.Action(),cc.callFunc(new function,target, data)); !async
        //      cc.sequence(cc.Action(),cc.callFunc(function,target);       work without args
        //      cc.sequence(cc.Action(),cc.callFunc(function(function(data)),target)); work once
        
    
    },
    
    
    // _moveBackground : function(dx,dy){
    //     this.node.runAction(
    //         cc.sequence(
                
    //             cc.callFunc(this._moveHero(dx, dy),this),
    //             cc.moveBy(
    //                 this.radio * ((dx != 0) && (dy != 0) ? 1.4 : 1), 
    //                 -(dx+dy)*32, 
    //                  (dy-dx)*24
    //             ),
    //             cc.callFunc(this.toMove,this)
    //         )
            
    //     );
    // },

    _moveHero : function(dx,dy){
        this.hero.getComponent('myHero').toWalk(dx + '' + dy);
    },
    
    _standHero : function(){
        this.hero.getComponent('myHero').toStand();
    },
    

    // use this for initialization
    onLoad: function () {
        
        var self = this;
        
        var myUtil = self.getComponent('myUtil');  //这次我们不用require 我们用组件的方式
                                                   //我们将myUtil.js扔到层级管理器的background的属性检查器中
        
        
        this.node.on('mouseup', function(event){
            
            var myevent = new cc.Event.EventCustom('myClick',true); //这个是下一部分的内容
            myevent.setUserData(event);
            
            this.node.dispatchEvent(myevent);
            
            self.finalList = [];                    //这个也是一个寻路中断的尝试 不过失败了
                                                    
                                                    //下面这句是将鼠标的点击转换成路径
            self.finalList = myUtil.convertToPath(myUtil.convertTo45(event),self.curTileX,self.curTileY);
            //this.toMoveOnce();
            this.toMove();                          //然后移动就行了
        },this);
        
        
        
        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

        
    // },
});
