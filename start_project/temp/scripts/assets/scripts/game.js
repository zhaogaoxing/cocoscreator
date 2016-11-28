"use strict";
cc._RFpush(module, '16857f11LFKnIp6pzYjAOAG', 'game');
// scripts\game.js

cc.Class({
    'extends': cc.Component,

    properties: {
        // 这个属性引用了星星预制资源
        starPrefab: {
            'default': null,
            type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        ground: {
            'default': null,
            type: cc.Node
        },
        player: {
            'default': null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.groundY = this.ground.y + this.ground.height / 2;
        //生成一个星星
        this.spawnNewStar();
    },

    spawnNewStar: function spawnNewStar() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPositon);
    },

    getNewStarPositon: function getNewStarPositon() {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randx = cc.randomMinus1to1() * maxX;
        return cc.p(randX, randY);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

cc._RFpop();