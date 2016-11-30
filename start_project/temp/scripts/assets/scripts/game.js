"use strict";
cc._RFpush(module, '16857f11LFKnIp6pzYjAOAG', 'Game');
// scripts\Game.js

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
        },
        scoreDisplay: {
            'default': null,
            type: cc.Label
        },
        scoreAudio: {
            'default': null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.groundY = this.ground.y + this.ground.height / 2;

        //初始化计时器
        this.timer = 0;
        this.starDuration = 0;

        //生成一个星星
        this.spawnNewStar();
        //初始化计分
        this.score = 0;
    },

    spawnNewStar: function spawnNewStar() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPositon());

        //将game组件的实例传入星星组件
        newStar.getComponent('Star').game = this;

        //重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPositon: function getNewStarPositon() {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width / 2;
        randX = cc.randomMinus1To1() * maxX;
        return cc.p(randX, randY);
    },

    gainScore: function gainScore() {
        this.score += 1;
        this.scoreDisplay.string = 'Score:' + this.score.toString();
        //播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    gameOver: function gameOver() {
        this.player.stopAllActions(); //停止player节点的跳跃动作
        cc.director.loadScene('game');
    },

    update: function update(dt) {
        //每帧更新计时器，超过限度还没有生成新的星星
        //就调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();