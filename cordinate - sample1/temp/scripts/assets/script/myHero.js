"use strict";
cc._RFpush(module, '25ca0646MpBKK8r8Ua9mLds', 'myHero');
// script\myHero.js

cc.Class({
    'extends': cc.Component,

    properties: {

        StandAnimName: '',
        WalkAnimName: '',
        curDir: ''

    },

    toStand: function toStand() {
        this.getComponent(cc.Animation).play(this.StandAnimName + this.curDir);
    },

    toWalk: function toWalk(dir) {
        //console.log(dir);
        if (dir == this.curDir) return;
        this.curDir = dir;
        this.getComponent(cc.Animation).play(this.WalkAnimName + dir);
    },
    // use this for initialization
    onLoad: function onLoad() {}

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();