cc.Class({
    extends: cc.Component,

    properties: {
        
    },
    
    convertTo45 : function(clickEvent){
        var visibleSize = cc.director.getVisibleSize();
            var oldX = (clickEvent.getLocationX() - visibleSize.width/2)/64;  //正常XY单位
            var oldY = (clickEvent.getLocationY() - visibleSize.height/2)/48;
            
            var rawNewX = (oldX + oldY);    //45度XY单位
            var rawNewY = (oldX - oldY);
                            
          
            var newX = Math.floor(rawNewX) + 1;    //截断小数
            var newY = -Math.floor(-(rawNewY)) - 1;  //因为地图起始位置调的不大准 这里用 +1 -1 打了个补丁
            
            return {
              newX : newX,
              newY : newY,
            };
    },
    
    convertToPath : function(newPos, curTilePosX,curTilePosY){
        
        var newX = newPos.newX;
        var newY = newPos.newY;
        
        var openList = [];          
        var closeList = [];
        var finalList = [];
  
        

        var start = {
            x: curTilePosX,
            y: curTilePosY,
            h: (Math.abs(newX) + Math.abs(newY))*10,
            g: 0,
            p:null,
        };
        start.f = start.h + start.g;
        
        openList.push(start);   //把起点加入 open list
        

        
        var desTileX = start.x + newX;
        var desTileY = start.y + newY;
        
                                //重复如下过程

        while(openList.length != 0){     
            
        openList.sort(this._sortF);      //遍历open list  我是先排序 然后移出数组第一个元素 (数组.shift())
        
        var parent  = openList.shift();  //查找F值最小的节点 把它当前要处理的节点 
        
        closeList.push(parent);         //把这个节点移到 close list
        
        if(parent.h == 0){break;}
            
             
            for(var i = -1; i <= 1; i++){   //对当前方格的8个相邻方格的每一个方格?
                for(var j = -1; j <= 1; j++){
                    var rawx = parent.x + i;
                    var rawy = parent.y + j;
                                            //如果它是不可抵达的或者它在close list中， 忽略它
                    if(this._hadInCloseList(rawx, rawy, closeList)){/*比较G值换P 返回*/ continue;}
                    var neibour = {
                        x: rawx,
                        y: rawy,
                        h: Math.max(Math.abs(rawx - desTileX),Math.abs(rawy - desTileY))*10,
                        g: parent.g + ((i != 0 && j != 0) ? 14 : 10),  
                        p: parent,
                    }
                    
                    neibour.f = neibour.h + neibour.g;
                    
                    openList.push(neibour); //如果它不在 open list中 把它加入 open list, 
                                //并且把当前方格设置为它的父亲，记录该方格的 F, G 和 H 值(在上面for里做了)
                                
                                //如果它已经在 open list 中，
                                //检查这条路径（即经由当前方格到达它那里）是否更好，
                                //用 G 值作参考。更小的 G 值表示这是更好的路径。
                                //如果是这样，把它的父亲设置为当前方格，
                                //并重新计算它的 G 和 F 值。
                                //如果你的 open list 是按 F 值排序的话，
                                //改变后你可能需要重新排序。 (这部分还没有实现 等3月份tileMap出来再加)
                }
            }                   //停止，当你

                                //把终点加入到了 open list 中，此时路径已经找到了，或者 (while下第四行 终点的h为0)

                                //查找终点失败，并且 open list 是空的，此时没有路径。(看while条件)
            
            
            
            
        }
        
        
        
        var des = closeList.pop();  //保存路径。从终点开始，
       
        while(des.p){                   //每个方格沿着父节点移动直至起点，这就是你的路径。(我放到了单独的finalList中)
            des.dx = des.x - des.p.x;
            des.dy = des.y - des.p.y;
            finalList.unshift(des);
            des = des.p;
        };
        
        return finalList;

    },
    
    _hadInCloseList : function(x, y, closeList){
        for(var item of closeList){
            if(item.x == x && item.y == y) return true;
        }
        return false;
    },
    
    _sortF : function(a,b){
        return a.f - b.f;
    },
    

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
