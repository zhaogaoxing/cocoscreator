"use strict";
cc._RFpush(module, 'b297f/coYlA06+P2BZ1kbav', 'star');
// scripts\star.js

cc.Class({
    "extends": cc.Component,

    properties: {
        pickRadius: 0
    },

    getPlayerDistance: function getPlayerDistance() {
        //根据player节点位置判断距离
        var playerPos = this.game.palyer.getPosition();

        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked() {
        //当星星被收集，调用game脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        //消除当前星星节点
        this.node.destroy();
    },

    // use this for initialization
    onLoad: function onLoad() {},

    update: function update(dt) {
        if (this.getPlayerDistance() < this.pickRadius) {
            this.onPicked();
            return;
        }
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();