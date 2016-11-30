require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Game":[function(require,module,exports){
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
},{}],"Player":[function(require,module,exports){
"use strict";
cc._RFpush(module, '507d2S8H1hD1a9iMgOR5hJG', 'Player');
// scripts\Player.js

cc.Class({
    "extends": cc.Component,

    properties: {
        jumpHeight: 0,
        jumpDuration: 0,
        maxMoveSpeed: 0,
        accel: 0,

        //跳跃音效资源
        jumpAudio: {
            "default": null,
            url: cc.AudioClip
        }
    },

    setJumpAction: function setJumpAction() {
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());

        var callback = cc.callFunc(this.playjumpSound, this);
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown));
    },

    playJumpSound: function playJumpSound() {
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    setInputControl: function setInputControl() {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,

            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },

            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            }
        }, self.node);
    },

    // use this for initialization
    onLoad: function onLoad() {
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);

        this.accLeft = false;
        this.accRight = false;

        this.xSpeed = 0;

        this.setInputControl();
    },

    update: function update(dt) {
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }

        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        this.node.x += this.xSpeed * dt;
    }

});

cc._RFpop();
},{}],"Star":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'b297f/coYlA06+P2BZ1kbav', 'Star');
// scripts\Star.js

cc.Class({
    "extends": cc.Component,

    properties: {
        pickRadius: 0
    },

    getPlayerDistance: function getPlayerDistance() {
        //根据player节点位置判断距离
        var playerPos = this.game.player.getPosition();

        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked() {
        //当星星被收集，调用game脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        //调用game脚本的得分方法
        this.game.gainScore();
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
        //根据game脚本中的计时器更新星星的透明度
        var opacityRatio = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}]},{},["Game","Player","Star"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6L3poYW9nYW94aW5nL2NvY29zY3JlYXRvci9Db2Nvc0NyZWF0b3IvcmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9HYW1lLmpzIiwiYXNzZXRzL3NjcmlwdHMvUGxheWVyLmpzIiwiYXNzZXRzL3NjcmlwdHMvU3Rhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcxNjg1N2YxMUxGS25JcDZwellqQU9BRycsICdHYW1lJyk7XG4vLyBzY3JpcHRzXFxHYW1lLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g6L+Z5Liq5bGe5oCn5byV55So5LqG5pif5pif6aKE5Yi26LWE5rqQXG4gICAgICAgIHN0YXJQcmVmYWI6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYlxuICAgICAgICB9LFxuICAgICAgICAvLyDmmJ/mmJ/kuqfnlJ/lkI7mtojlpLHml7bpl7TnmoTpmo/mnLrojIPlm7RcbiAgICAgICAgbWF4U3RhckR1cmF0aW9uOiAwLFxuICAgICAgICBtaW5TdGFyRHVyYXRpb246IDAsXG4gICAgICAgIGdyb3VuZDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBwbGF5ZXI6IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcbiAgICAgICAgfSxcbiAgICAgICAgc2NvcmVEaXNwbGF5OiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxuICAgICAgICB9LFxuICAgICAgICBzY29yZUF1ZGlvOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge1xuICAgICAgICB0aGlzLmdyb3VuZFkgPSB0aGlzLmdyb3VuZC55ICsgdGhpcy5ncm91bmQuaGVpZ2h0IC8gMjtcblxuICAgICAgICAvL+WIneWni+WMluiuoeaXtuWZqFxuICAgICAgICB0aGlzLnRpbWVyID0gMDtcbiAgICAgICAgdGhpcy5zdGFyRHVyYXRpb24gPSAwO1xuXG4gICAgICAgIC8v55Sf5oiQ5LiA5Liq5pif5pifXG4gICAgICAgIHRoaXMuc3Bhd25OZXdTdGFyKCk7XG4gICAgICAgIC8v5Yid5aeL5YyW6K6h5YiGXG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIH0sXG5cbiAgICBzcGF3bk5ld1N0YXI6IGZ1bmN0aW9uIHNwYXduTmV3U3RhcigpIHtcbiAgICAgICAgLy8g5L2/55So57uZ5a6a55qE5qih5p2/5Zyo5Zy65pmv5Lit55Sf5oiQ5LiA5Liq5paw6IqC54K5XG4gICAgICAgIHZhciBuZXdTdGFyID0gY2MuaW5zdGFudGlhdGUodGhpcy5zdGFyUHJlZmFiKTtcbiAgICAgICAgLy8g5bCG5paw5aKe55qE6IqC54K55re75Yqg5YiwIENhbnZhcyDoioLngrnkuIvpnaJcbiAgICAgICAgdGhpcy5ub2RlLmFkZENoaWxkKG5ld1N0YXIpO1xuICAgICAgICAvLyDkuLrmmJ/mmJ/orr7nva7kuIDkuKrpmo/mnLrkvY3nva5cbiAgICAgICAgbmV3U3Rhci5zZXRQb3NpdGlvbih0aGlzLmdldE5ld1N0YXJQb3NpdG9uKCkpO1xuXG4gICAgICAgIC8v5bCGZ2FtZee7hOS7tueahOWunuS+i+S8oOWFpeaYn+aYn+e7hOS7tlxuICAgICAgICBuZXdTdGFyLmdldENvbXBvbmVudCgnU3RhcicpLmdhbWUgPSB0aGlzO1xuXG4gICAgICAgIC8v6YeN572u6K6h5pe25Zmo77yM5qC55o2u5raI5aSx5pe26Ze06IyD5Zu06ZqP5py65Y+W5LiA5Liq5YC8XG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gdGhpcy5taW5TdGFyRHVyYXRpb24gKyBjYy5yYW5kb20wVG8xKCkgKiAodGhpcy5tYXhTdGFyRHVyYXRpb24gLSB0aGlzLm1pblN0YXJEdXJhdGlvbik7XG4gICAgICAgIHRoaXMudGltZXIgPSAwO1xuICAgIH0sXG5cbiAgICBnZXROZXdTdGFyUG9zaXRvbjogZnVuY3Rpb24gZ2V0TmV3U3RhclBvc2l0b24oKSB7XG4gICAgICAgIHZhciByYW5kWCA9IDA7XG4gICAgICAgIC8vIOagueaNruWcsOW5s+mdouS9jee9ruWSjOS4u+inkui3s+i3g+mrmOW6pu+8jOmaj+acuuW+l+WIsOS4gOS4quaYn+aYn+eahCB5IOWdkOagh1xuICAgICAgICB2YXIgcmFuZFkgPSB0aGlzLmdyb3VuZFkgKyBjYy5yYW5kb20wVG8xKCkgKiB0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1BsYXllcicpLmp1bXBIZWlnaHQgKyA1MDtcbiAgICAgICAgLy8g5qC55o2u5bGP5bmV5a695bqm77yM6ZqP5py65b6X5Yiw5LiA5Liq5pif5pifIHgg5Z2Q5qCHXG4gICAgICAgIHZhciBtYXhYID0gdGhpcy5ub2RlLndpZHRoIC8gMjtcbiAgICAgICAgcmFuZFggPSBjYy5yYW5kb21NaW51czFUbzEoKSAqIG1heFg7XG4gICAgICAgIHJldHVybiBjYy5wKHJhbmRYLCByYW5kWSk7XG4gICAgfSxcblxuICAgIGdhaW5TY29yZTogZnVuY3Rpb24gZ2FpblNjb3JlKCkge1xuICAgICAgICB0aGlzLnNjb3JlICs9IDE7XG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTonICsgdGhpcy5zY29yZS50b1N0cmluZygpO1xuICAgICAgICAvL+aSreaUvuW+l+WIhumfs+aViFxuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMuc2NvcmVBdWRpbywgZmFsc2UpO1xuICAgIH0sXG5cbiAgICBnYW1lT3ZlcjogZnVuY3Rpb24gZ2FtZU92ZXIoKSB7XG4gICAgICAgIHRoaXMucGxheWVyLnN0b3BBbGxBY3Rpb25zKCk7IC8v5YGc5q2icGxheWVy6IqC54K555qE6Lez6LeD5Yqo5L2cXG4gICAgICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnZ2FtZScpO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICAvL+avj+W4p+abtOaWsOiuoeaXtuWZqO+8jOi2hei/h+mZkOW6pui/mOayoeacieeUn+aIkOaWsOeahOaYn+aYn1xuICAgICAgICAvL+Wwseiwg+eUqOa4uOaIj+Wksei0pemAu+i+kVxuICAgICAgICBpZiAodGhpcy50aW1lciA+IHRoaXMuc3RhckR1cmF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50aW1lciArPSBkdDtcbiAgICB9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICc1MDdkMlM4SDFoRDFhOWlNZ09SNWhKRycsICdQbGF5ZXInKTtcbi8vIHNjcmlwdHNcXFBsYXllci5qc1xuXG5jYy5DbGFzcyh7XG4gICAgXCJleHRlbmRzXCI6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAganVtcEhlaWdodDogMCxcbiAgICAgICAganVtcER1cmF0aW9uOiAwLFxuICAgICAgICBtYXhNb3ZlU3BlZWQ6IDAsXG4gICAgICAgIGFjY2VsOiAwLFxuXG4gICAgICAgIC8v6Lez6LeD6Z+z5pWI6LWE5rqQXG4gICAgICAgIGp1bXBBdWRpbzoge1xuICAgICAgICAgICAgXCJkZWZhdWx0XCI6IG51bGwsXG4gICAgICAgICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNldEp1bXBBY3Rpb246IGZ1bmN0aW9uIHNldEp1bXBBY3Rpb24oKSB7XG4gICAgICAgIHZhciBqdW1wVXAgPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbk91dCgpKTtcbiAgICAgICAgdmFyIGp1bXBEb3duID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIC10aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uSW4oKSk7XG5cbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY2MuY2FsbEZ1bmModGhpcy5wbGF5anVtcFNvdW5kLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIGNjLnJlcGVhdEZvcmV2ZXIoY2Muc2VxdWVuY2UoanVtcFVwLCBqdW1wRG93bikpO1xuICAgIH0sXG5cbiAgICBwbGF5SnVtcFNvdW5kOiBmdW5jdGlvbiBwbGF5SnVtcFNvdW5kKCkge1xuICAgICAgICBjYy5hdWRpb0VuZ2luZS5wbGF5RWZmZWN0KHRoaXMuanVtcEF1ZGlvLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIHNldElucHV0Q29udHJvbDogZnVuY3Rpb24gc2V0SW5wdXRDb250cm9sKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNjLmV2ZW50TWFuYWdlci5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5LRVlCT0FSRCxcblxuICAgICAgICAgICAgb25LZXlQcmVzc2VkOiBmdW5jdGlvbiBvbktleVByZXNzZWQoa2V5Q29kZSwgZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbktleVJlbGVhc2VkOiBmdW5jdGlvbiBvbktleVJlbGVhc2VkKGtleUNvZGUsIGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmE6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5kOlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCBzZWxmLm5vZGUpO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdGhpcy5qdW1wQWN0aW9uID0gdGhpcy5zZXRKdW1wQWN0aW9uKCk7XG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24odGhpcy5qdW1wQWN0aW9uKTtcblxuICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hY2NSaWdodCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcblxuICAgICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICBpZiAodGhpcy5hY2NMZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLnhTcGVlZCAtPSB0aGlzLmFjY2VsICogZHQ7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY2NSaWdodCkge1xuICAgICAgICAgICAgdGhpcy54U3BlZWQgKz0gdGhpcy5hY2NlbCAqIGR0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKE1hdGguYWJzKHRoaXMueFNwZWVkKSA+IHRoaXMubWF4TW92ZVNwZWVkKSB7XG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCAqIGR0O1xuICAgIH1cblxufSk7XG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdiMjk3Zi9jb1lsQTA2K1AyQloxa2JhdicsICdTdGFyJyk7XG4vLyBzY3JpcHRzXFxTdGFyLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBwaWNrUmFkaXVzOiAwXG4gICAgfSxcblxuICAgIGdldFBsYXllckRpc3RhbmNlOiBmdW5jdGlvbiBnZXRQbGF5ZXJEaXN0YW5jZSgpIHtcbiAgICAgICAgLy/moLnmja5wbGF5ZXLoioLngrnkvY3nva7liKTmlq3ot53nprtcbiAgICAgICAgdmFyIHBsYXllclBvcyA9IHRoaXMuZ2FtZS5wbGF5ZXIuZ2V0UG9zaXRpb24oKTtcblxuICAgICAgICB2YXIgZGlzdCA9IGNjLnBEaXN0YW5jZSh0aGlzLm5vZGUucG9zaXRpb24sIHBsYXllclBvcyk7XG4gICAgICAgIHJldHVybiBkaXN0O1xuICAgIH0sXG5cbiAgICBvblBpY2tlZDogZnVuY3Rpb24gb25QaWNrZWQoKSB7XG4gICAgICAgIC8v5b2T5pif5pif6KKr5pS26ZuG77yM6LCD55SoZ2FtZeiEmuacrOS4reeahOaOpeWPo++8jOeUn+aIkOS4gOS4quaWsOeahOaYn+aYn1xuICAgICAgICB0aGlzLmdhbWUuc3Bhd25OZXdTdGFyKCk7XG4gICAgICAgIC8v6LCD55SoZ2FtZeiEmuacrOeahOW+l+WIhuaWueazlVxuICAgICAgICB0aGlzLmdhbWUuZ2FpblNjb3JlKCk7XG4gICAgICAgIC8v5raI6Zmk5b2T5YmN5pif5pif6IqC54K5XG4gICAgICAgIHRoaXMubm9kZS5kZXN0cm95KCk7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge30sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShkdCkge1xuICAgICAgICBpZiAodGhpcy5nZXRQbGF5ZXJEaXN0YW5jZSgpIDwgdGhpcy5waWNrUmFkaXVzKSB7XG4gICAgICAgICAgICB0aGlzLm9uUGlja2VkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy/moLnmja5nYW1l6ISa5pys5Lit55qE6K6h5pe25Zmo5pu05paw5pif5pif55qE6YCP5piO5bqmXG4gICAgICAgIHZhciBvcGFjaXR5UmF0aW8gPSAxIC0gdGhpcy5nYW1lLnRpbWVyIC8gdGhpcy5nYW1lLnN0YXJEdXJhdGlvbjtcbiAgICAgICAgdmFyIG1pbk9wYWNpdHkgPSA1MDtcbiAgICAgICAgdGhpcy5ub2RlLm9wYWNpdHkgPSBtaW5PcGFjaXR5ICsgTWF0aC5mbG9vcihvcGFjaXR5UmF0aW8gKiAoMjU1IC0gbWluT3BhY2l0eSkpO1xuICAgIH1cblxufSk7XG4vLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuLy8gfSxcblxuY2MuX1JGcG9wKCk7Il19
