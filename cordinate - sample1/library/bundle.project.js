require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"myApp":[function(require,module,exports){
"use strict";
cc._RFpush(module, '96768kSAVBOmo6jvT8fCKU7', 'myApp');
// script\myApp.js

cc.Class({
    'extends': cc.Component,

    properties: {
        ServerState: {
            'default': null,
            type: cc.Label
        },
        background: {
            'default': null,
            type: cc.Node
        },
        otherHero: {
            'default': null,
            type: cc.Prefab
        },

        radio: 2,

        myID: 0,

        userList: []
    },

    _drawUser: function _drawUser(posX, posY, user) {
        var otherhero = cc.instantiate(this.otherHero);
        this.background.addChild(otherhero, user.userID, user.userID);
        otherhero.setPosition(posX, posY);
    },

    // use this for initialization
    onLoad: function onLoad() {
        var self = this;

        if (cc.sys.isNative) {
            window.io = SocketIO;
        } else {
            require('socket.io');
        }

        //socket = io('http://localhost:3000');
        var socket = io.connect('http://localhost:3000');

        //begin---------------登录处理-----------------------//

        socket.on('connected', function (data) {
            self.myID = data.userID; //存入自己的ID
            self.ServerState.string = 'your ID: ' + data.userID;
            self.userList = data.userList; //获取原有用户列表

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = self.userList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var user = _step.value;
                    //画到背景
                    if (user == undefined) continue;
                    self._drawUser(688, -504, user);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        });

        //end-----------------登录处理-----------------------//

        //begin-----------------新增处理-----------------------//

        socket.on('newUser', function (data) {
            self.ServerState.string = 'new user: ' + data.userID;
            self.userList.push(data); //加到列表
            self._drawUser(688, -504, data); //画到背景
        });

        //end-------------------新增处理-----------------------//

        //end-------------------离开处理-----------------------//

        socket.on('userLeave', function (data) {
            self.ServerState.string = 'user leave: ' + data.userID;
            delete self.userList[data.userID]; //从列表删除
            self.background.removeChildByTag(data.userID); //从背景移除
        });

        //end-------------------离开处理-----------------------//

        //begin-------------------移动发出处理-----------------------//

        var myUtil = require('myUtil');
        var util = new myUtil();

        var myGround = this.background.getComponent('myGround');
        var curTileX = myGround.curTileX;
        var curTileY = myGround.curTileY;

        self.node.on('myClick', function (event) {

            //console.log(event);
            socket.emit('move', {
                userID: self.myID,
                curTileX: curTileX,
                curTileY: curTileY,
                newPos: util.convertTo45(event.detail)
            });
        });

        //end---------------------移动发出处理-----------------------//

        //begin-------------------移动收到处理-----------------------//

        socket.on('move', function (data) {
            var target = self.background.getChildByTag(data.userID).getComponent('myOtherHero');
            //var target = self.background.getChildByTag(data.userID).getComponent('myHero');
            var Path = util.convertToPath(data.newPos, data.curTileX, data.curTileY);
            var asc = [];

            console.log(target);
            target.path = Path;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Path[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var dir = _step2.value;

                    asc.push(cc.callFunc(target.toWalk, target));
                    //asc.push(cc.callFunc(target.toWalk,target));
                    asc.push(cc.moveBy(self.radio * (dir.dx != 0 && dir.dy != 0 ? 1.4 : 1) / 10, (dir.dy + dir.dx) * 32, (dir.dx - dir.dy) * 24));
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            asc.push(cc.callFunc(target.toStand, target));

            target.node.runAction(cc.sequence(asc));
        });

        //end---------------------移动收到处理-----------------------//
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{"myUtil":"myUtil","socket.io":"socket.io"}],"myGround":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'dd8f5RynalJPIwy0vwa29Ee', 'myGround');
// script\myGround.js

cc.Class({
    'extends': cc.Component,

    properties: {

        curTileX: 12,
        curTileY: 42,

        finalList: [],

        radio: 1,

        hero: {
            'default': null,
            type: cc.Node
        },

        curTileXY: {
            'default': null,
            type: cc.Label
        },

        curTileForeName: '当前坐标: '

    },

    toMove: function toMove() {
        if (this.finalList.length == 0) {
            //如果走完了 
            this._standHero(); //就站着
            //this.hero.getComponent('myHero').toStand();
            return;
        }
        var dir = this.finalList.shift(); //否则取得下一步

        this.curTilePosX = dir.dx; //修改当前坐标  (这个是为寻路中断准备的 可惜没能实现)
        this.curTilePosY = dir.dy;
        this.curTileXY.string = this.curTileForeName + this.curTilePosX + ',' + this.curTilePosY;
        //console.log(this.curTilePosX + ' ' + this.curTilePosY);
        //this._moveHero(dir.dx, dir.dy);
        //this.hero.getComponent('myHero').toWalk(dir.dx + '' + dir.dy);

        //Begin-----------------------_moveBackground--------------------------//
        this.node.runAction( //开始移动吧 
        cc.sequence(cc.callFunc(this._moveHero(dir.dx, dir.dy), this), //角色转向下一步
        cc.moveBy(this.radio * (dir.dx != 0 && dir.dy != 0 ? 1.4 : 1) / 10, //地图向下一步移动
        -(dir.dx + dir.dy) * 32, (dir.dy - dir.dx) * 24), cc.callFunc(this.toMove, this) //然后调用自己  获取下一步
        ));

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

    _moveHero: function _moveHero(dx, dy) {
        this.hero.getComponent('myHero').toWalk(dx + '' + dy);
    },

    _standHero: function _standHero() {
        this.hero.getComponent('myHero').toStand();
    },

    // use this for initialization
    onLoad: function onLoad() {

        var self = this;

        var myUtil = self.getComponent('myUtil'); //这次我们不用require 我们用组件的方式
        //我们将myUtil.js扔到层级管理器的background的属性检查器中

        this.node.on('mouseup', function (event) {

            var myevent = new cc.Event.EventCustom('myClick', true); //这个是下一部分的内容
            myevent.setUserData(event);

            this.node.dispatchEvent(myevent);

            self.finalList = []; //这个也是一个寻路中断的尝试 不过失败了

            //下面这句是将鼠标的点击转换成路径
            self.finalList = myUtil.convertToPath(myUtil.convertTo45(event), self.curTileX, self.curTileY);
            //this.toMoveOnce();
            this.toMove(); //然后移动就行了
        }, this);
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"myHero":[function(require,module,exports){
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
},{}],"myOtherHero":[function(require,module,exports){
"use strict";
cc._RFpush(module, '2ec00qkYdhHRbG8YykoOqLt', 'myOtherHero');
// script\myOtherHero.js

cc.Class({
    'extends': cc.Component,

    properties: {

        StandAnimName: '',
        WalkAnimName: '',
        curDir: '',
        dir: '',

        path: []

    },

    toStand: function toStand() {
        this.getComponent(cc.Animation).play(this.StandAnimName + this.curDir);
    },

    toWalk: function toWalk() {

        var item = this.path.shift();
        if (item == undefined) return;
        this.dir = item.dx + '' + item.dy;

        if (this.dir == this.curDir) return;
        this.curDir = this.dir;
        this.getComponent(cc.Animation).play(this.WalkAnimName + this.dir);
    },
    // use this for initialization
    onLoad: function onLoad() {}

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"myUtil":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'd5774Ct/iVK9oe4tagNz6I/', 'myUtil');
// script\myUtil.js

cc.Class({
    "extends": cc.Component,

    properties: {},

    convertTo45: function convertTo45(clickEvent) {
        var visibleSize = cc.director.getVisibleSize();
        var oldX = (clickEvent.getLocationX() - visibleSize.width / 2) / 64; //正常XY单位
        var oldY = (clickEvent.getLocationY() - visibleSize.height / 2) / 48;

        var rawNewX = oldX + oldY; //45度XY单位
        var rawNewY = oldX - oldY;

        var newX = Math.floor(rawNewX) + 1; //截断小数
        var newY = -Math.floor(-rawNewY) - 1; //因为地图起始位置调的不大准 这里用 +1 -1 打了个补丁

        return {
            newX: newX,
            newY: newY
        };
    },

    convertToPath: function convertToPath(newPos, curTilePosX, curTilePosY) {

        var newX = newPos.newX;
        var newY = newPos.newY;

        var openList = [];
        var closeList = [];
        var finalList = [];

        var start = {
            x: curTilePosX,
            y: curTilePosY,
            h: (Math.abs(newX) + Math.abs(newY)) * 10,
            g: 0,
            p: null
        };
        start.f = start.h + start.g;

        openList.push(start); //把起点加入 open list

        var desTileX = start.x + newX;
        var desTileY = start.y + newY;

        //重复如下过程

        while (openList.length != 0) {

            openList.sort(this._sortF); //遍历open list  我是先排序 然后移出数组第一个元素 (数组.shift())

            var parent = openList.shift(); //查找F值最小的节点 把它当前要处理的节点

            closeList.push(parent); //把这个节点移到 close list

            if (parent.h == 0) {
                break;
            }

            for (var i = -1; i <= 1; i++) {
                //对当前方格的8个相邻方格的每一个方格?
                for (var j = -1; j <= 1; j++) {
                    var rawx = parent.x + i;
                    var rawy = parent.y + j;
                    //如果它是不可抵达的或者它在close list中， 忽略它
                    if (this._hadInCloseList(rawx, rawy, closeList)) {
                        /*比较G值换P 返回*/continue;
                    }
                    var neibour = {
                        x: rawx,
                        y: rawy,
                        h: Math.max(Math.abs(rawx - desTileX), Math.abs(rawy - desTileY)) * 10,
                        g: parent.g + (i != 0 && j != 0 ? 14 : 10),
                        p: parent
                    };

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
            } //停止，当你

            //把终点加入到了 open list 中，此时路径已经找到了，或者 (while下第四行 终点的h为0)

            //查找终点失败，并且 open list 是空的，此时没有路径。(看while条件)
        }

        var des = closeList.pop(); //保存路径。从终点开始，

        while (des.p) {
            //每个方格沿着父节点移动直至起点，这就是你的路径。(我放到了单独的finalList中)
            des.dx = des.x - des.p.x;
            des.dy = des.y - des.p.y;
            finalList.unshift(des);
            des = des.p;
        };

        return finalList;
    },

    _hadInCloseList: function _hadInCloseList(x, y, closeList) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = closeList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                if (item.x == x && item.y == y) return true;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return false;
    },

    _sortF: function _sortF(a, b) {
        return a.f - b.f;
    },

    // use this for initialization
    onLoad: function onLoad() {}

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"socket.io":[function(require,module,exports){
(function (global){
"use strict";
cc._RFpush(module, '336f7QoxnZJPbBVP1twghqA', 'socket.io');
// script\socket.io.js

"use strict";if(!cc.sys.isNative){(function(f){if(typeof exports === "object" && typeof module !== "undefined"){module.exports = f();}else if(typeof define === "function" && define.amd){define([],f);}else {var g;if(typeof window !== "undefined"){g = window;}else if(typeof global !== "undefined"){g = global;}else if(typeof self !== "undefined"){g = self;}else {g = this;}g.io = f();}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require == "function" && require;if(!u && a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND",f);}var l=n[o] = {exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require == "function" && require;for(var o=0;o < r.length;o++) s(r[o]);return s;})({1:[function(_dereq_,module,exports){module.exports = _dereq_('./lib/');},{"./lib/":2}],2:[function(_dereq_,module,exports){module.exports = _dereq_('./socket'); /**
 * Exports parser
 *
 * @api public
 *
 */module.exports.parser = _dereq_('engine.io-parser');},{"./socket":3,"engine.io-parser":19}],3:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies.
 */var transports=_dereq_('./transports');var Emitter=_dereq_('component-emitter');var debug=_dereq_('debug')('engine.io-client:socket');var index=_dereq_('indexof');var parser=_dereq_('engine.io-parser');var parseuri=_dereq_('parseuri');var parsejson=_dereq_('parsejson');var parseqs=_dereq_('parseqs'); /**
 * Module exports.
 */module.exports = Socket; /**
 * Noop function.
 *
 * @api private
 */function noop(){} /**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */function Socket(uri,opts){if(!(this instanceof Socket))return new Socket(uri,opts);opts = opts || {};if(uri && 'object' == typeof uri){opts = uri;uri = null;}if(uri){uri = parseuri(uri);opts.hostname = uri.host;opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';opts.port = uri.port;if(uri.query)opts.query = uri.query;}else if(opts.host){opts.hostname = parseuri(opts.host).host;}this.secure = null != opts.secure?opts.secure:global.location && 'https:' == location.protocol;if(opts.hostname && !opts.port){ // if no port is specified manually, use the protocol default
opts.port = this.secure?'443':'80';}this.agent = opts.agent || false;this.hostname = opts.hostname || (global.location?location.hostname:'localhost');this.port = opts.port || (global.location && location.port?location.port:this.secure?443:80);this.query = opts.query || {};if('string' == typeof this.query)this.query = parseqs.decode(this.query);this.upgrade = false !== opts.upgrade;this.path = (opts.path || '/engine.io').replace(/\/$/,'') + '/';this.forceJSONP = !!opts.forceJSONP;this.jsonp = false !== opts.jsonp;this.forceBase64 = !!opts.forceBase64;this.enablesXDR = !!opts.enablesXDR;this.timestampParam = opts.timestampParam || 't';this.timestampRequests = opts.timestampRequests;this.transports = opts.transports || ['polling','websocket'];this.readyState = '';this.writeBuffer = [];this.policyPort = opts.policyPort || 843;this.rememberUpgrade = opts.rememberUpgrade || false;this.binaryType = null;this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;this.perMessageDeflate = false !== opts.perMessageDeflate?opts.perMessageDeflate || {}:false;if(true === this.perMessageDeflate)this.perMessageDeflate = {};if(this.perMessageDeflate && null == this.perMessageDeflate.threshold){this.perMessageDeflate.threshold = 1024;} // SSL options for Node.js client
this.pfx = opts.pfx || null;this.key = opts.key || null;this.passphrase = opts.passphrase || null;this.cert = opts.cert || null;this.ca = opts.ca || null;this.ciphers = opts.ciphers || null;this.rejectUnauthorized = opts.rejectUnauthorized === undefined?null:opts.rejectUnauthorized; // other options for Node.js client
var freeGlobal=typeof global == 'object' && global;if(freeGlobal.global === freeGlobal){if(opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0){this.extraHeaders = opts.extraHeaders;}}this.open();}Socket.priorWebsocketSuccess = false; /**
 * Mix in `Emitter`.
 */Emitter(Socket.prototype); /**
 * Protocol version.
 *
 * @api public
 */Socket.protocol = parser.protocol; // this is an int
/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */Socket.Socket = Socket;Socket.Transport = _dereq_('./transport');Socket.transports = _dereq_('./transports');Socket.parser = _dereq_('engine.io-parser'); /**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */Socket.prototype.createTransport = function(name){debug('creating transport "%s"',name);var query=clone(this.query); // append engine.io protocol identifier
query.EIO = parser.protocol; // transport name
query.transport = name; // session id if we already have one
if(this.id)query.sid = this.id;var transport=new transports[name]({agent:this.agent,hostname:this.hostname,port:this.port,secure:this.secure,path:this.path,query:query,forceJSONP:this.forceJSONP,jsonp:this.jsonp,forceBase64:this.forceBase64,enablesXDR:this.enablesXDR,timestampRequests:this.timestampRequests,timestampParam:this.timestampParam,policyPort:this.policyPort,socket:this,pfx:this.pfx,key:this.key,passphrase:this.passphrase,cert:this.cert,ca:this.ca,ciphers:this.ciphers,rejectUnauthorized:this.rejectUnauthorized,perMessageDeflate:this.perMessageDeflate,extraHeaders:this.extraHeaders});return transport;};function clone(obj){var o={};for(var i in obj) {if(obj.hasOwnProperty(i)){o[i] = obj[i];}}return o;} /**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */Socket.prototype.open = function(){var transport;if(this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1){transport = 'websocket';}else if(0 === this.transports.length){ // Emit error on next tick so it can be listened to
var self=this;setTimeout(function(){self.emit('error','No transports available');},0);return;}else {transport = this.transports[0];}this.readyState = 'opening'; // Retry with the next transport if the transport is disabled (jsonp: false)
try{transport = this.createTransport(transport);}catch(e) {this.transports.shift();this.open();return;}transport.open();this.setTransport(transport);}; /**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */Socket.prototype.setTransport = function(transport){debug('setting transport %s',transport.name);var self=this;if(this.transport){debug('clearing existing transport %s',this.transport.name);this.transport.removeAllListeners();} // set up transport
this.transport = transport; // set up transport listeners
transport.on('drain',function(){self.onDrain();}).on('packet',function(packet){self.onPacket(packet);}).on('error',function(e){self.onError(e);}).on('close',function(){self.onClose('transport close');});}; /**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */Socket.prototype.probe = function(name){debug('probing transport "%s"',name);var transport=this.createTransport(name,{probe:1}),failed=false,self=this;Socket.priorWebsocketSuccess = false;function onTransportOpen(){if(self.onlyBinaryUpgrades){var upgradeLosesBinary=!this.supportsBinary && self.transport.supportsBinary;failed = failed || upgradeLosesBinary;}if(failed)return;debug('probe transport "%s" opened',name);transport.send([{type:'ping',data:'probe'}]);transport.once('packet',function(msg){if(failed)return;if('pong' == msg.type && 'probe' == msg.data){debug('probe transport "%s" pong',name);self.upgrading = true;self.emit('upgrading',transport);if(!transport)return;Socket.priorWebsocketSuccess = 'websocket' == transport.name;debug('pausing current transport "%s"',self.transport.name);self.transport.pause(function(){if(failed)return;if('closed' == self.readyState)return;debug('changing transport and sending upgrade packet');cleanup();self.setTransport(transport);transport.send([{type:'upgrade'}]);self.emit('upgrade',transport);transport = null;self.upgrading = false;self.flush();});}else {debug('probe transport "%s" failed',name);var err=new Error('probe error');err.transport = transport.name;self.emit('upgradeError',err);}});}function freezeTransport(){if(failed)return; // Any callback called by transport should be ignored since now
failed = true;cleanup();transport.close();transport = null;} //Handle any error that happens while probing
function onerror(err){var error=new Error('probe error: ' + err);error.transport = transport.name;freezeTransport();debug('probe transport "%s" failed because of error: %s',name,err);self.emit('upgradeError',error);}function onTransportClose(){onerror("transport closed");} //When the socket is closed while we're probing
function onclose(){onerror("socket closed");} //When the socket is upgraded while we're probing
function onupgrade(to){if(transport && to.name != transport.name){debug('"%s" works - aborting "%s"',to.name,transport.name);freezeTransport();}} //Remove all listeners on the transport and on self
function cleanup(){transport.removeListener('open',onTransportOpen);transport.removeListener('error',onerror);transport.removeListener('close',onTransportClose);self.removeListener('close',onclose);self.removeListener('upgrading',onupgrade);}transport.once('open',onTransportOpen);transport.once('error',onerror);transport.once('close',onTransportClose);this.once('close',onclose);this.once('upgrading',onupgrade);transport.open();}; /**
 * Called when connection is deemed open.
 *
 * @api public
 */Socket.prototype.onOpen = function(){debug('socket open');this.readyState = 'open';Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;this.emit('open');this.flush(); // we check for `readyState` in case an `open`
// listener already closed the socket
if('open' == this.readyState && this.upgrade && this.transport.pause){debug('starting upgrade probes');for(var i=0,l=this.upgrades.length;i < l;i++) {this.probe(this.upgrades[i]);}}}; /**
 * Handles a packet.
 *
 * @api private
 */Socket.prototype.onPacket = function(packet){if('opening' == this.readyState || 'open' == this.readyState){debug('socket receive: type "%s", data "%s"',packet.type,packet.data);this.emit('packet',packet); // Socket is live - any packet counts
this.emit('heartbeat');switch(packet.type){case 'open':this.onHandshake(parsejson(packet.data));break;case 'pong':this.setPing();this.emit('pong');break;case 'error':var err=new Error('server error');err.code = packet.data;this.onError(err);break;case 'message':this.emit('data',packet.data);this.emit('message',packet.data);break;}}else {debug('packet received with socket readyState "%s"',this.readyState);}}; /**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */Socket.prototype.onHandshake = function(data){this.emit('handshake',data);this.id = data.sid;this.transport.query.sid = data.sid;this.upgrades = this.filterUpgrades(data.upgrades);this.pingInterval = data.pingInterval;this.pingTimeout = data.pingTimeout;this.onOpen(); // In case open handler closes socket
if('closed' == this.readyState)return;this.setPing(); // Prolong liveness of socket on heartbeat
this.removeListener('heartbeat',this.onHeartbeat);this.on('heartbeat',this.onHeartbeat);}; /**
 * Resets ping timeout.
 *
 * @api private
 */Socket.prototype.onHeartbeat = function(timeout){clearTimeout(this.pingTimeoutTimer);var self=this;self.pingTimeoutTimer = setTimeout(function(){if('closed' == self.readyState)return;self.onClose('ping timeout');},timeout || self.pingInterval + self.pingTimeout);}; /**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */Socket.prototype.setPing = function(){var self=this;clearTimeout(self.pingIntervalTimer);self.pingIntervalTimer = setTimeout(function(){debug('writing ping packet - expecting pong within %sms',self.pingTimeout);self.ping();self.onHeartbeat(self.pingTimeout);},self.pingInterval);}; /**
* Sends a ping packet.
*
* @api private
*/Socket.prototype.ping = function(){var self=this;this.sendPacket('ping',function(){self.emit('ping');});}; /**
 * Called on `drain` event
 *
 * @api private
 */Socket.prototype.onDrain = function(){this.writeBuffer.splice(0,this.prevBufferLen); // setting prevBufferLen = 0 is very important
// for example, when upgrading, upgrade packet is sent over,
// and a nonzero prevBufferLen could cause problems on `drain`
this.prevBufferLen = 0;if(0 === this.writeBuffer.length){this.emit('drain');}else {this.flush();}}; /**
 * Flush write buffers.
 *
 * @api private
 */Socket.prototype.flush = function(){if('closed' != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length){debug('flushing %d packets in socket',this.writeBuffer.length);this.transport.send(this.writeBuffer); // keep track of current length of writeBuffer
// splice writeBuffer and callbackBuffer on `drain`
this.prevBufferLen = this.writeBuffer.length;this.emit('flush');}}; /**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */Socket.prototype.write = Socket.prototype.send = function(msg,options,fn){this.sendPacket('message',msg,options,fn);return this;}; /**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */Socket.prototype.sendPacket = function(type,data,options,fn){if('function' == typeof data){fn = data;data = undefined;}if('function' == typeof options){fn = options;options = null;}if('closing' == this.readyState || 'closed' == this.readyState){return;}options = options || {};options.compress = false !== options.compress;var packet={type:type,data:data,options:options};this.emit('packetCreate',packet);this.writeBuffer.push(packet);if(fn)this.once('flush',fn);this.flush();}; /**
 * Closes the connection.
 *
 * @api private
 */Socket.prototype.close = function(){if('opening' == this.readyState || 'open' == this.readyState){this.readyState = 'closing';var self=this;if(this.writeBuffer.length){this.once('drain',function(){if(this.upgrading){waitForUpgrade();}else {close();}});}else if(this.upgrading){waitForUpgrade();}else {close();}}function close(){self.onClose('forced close');debug('socket closing - telling transport to close');self.transport.close();}function cleanupAndClose(){self.removeListener('upgrade',cleanupAndClose);self.removeListener('upgradeError',cleanupAndClose);close();}function waitForUpgrade(){ // wait for upgrade to finish since we can't send packets while pausing a transport
self.once('upgrade',cleanupAndClose);self.once('upgradeError',cleanupAndClose);}return this;}; /**
 * Called upon transport error
 *
 * @api private
 */Socket.prototype.onError = function(err){debug('socket error %j',err);Socket.priorWebsocketSuccess = false;this.emit('error',err);this.onClose('transport error',err);}; /**
 * Called upon transport close.
 *
 * @api private
 */Socket.prototype.onClose = function(reason,desc){if('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState){debug('socket close with reason: "%s"',reason);var self=this; // clear timers
clearTimeout(this.pingIntervalTimer);clearTimeout(this.pingTimeoutTimer); // stop event from firing again for transport
this.transport.removeAllListeners('close'); // ensure transport won't stay open
this.transport.close(); // ignore further transport communication
this.transport.removeAllListeners(); // set ready state
this.readyState = 'closed'; // clear session id
this.id = null; // emit close event
this.emit('close',reason,desc); // clean buffers after, so users can still
// grab the buffers on `close` event
self.writeBuffer = [];self.prevBufferLen = 0;}}; /**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */Socket.prototype.filterUpgrades = function(upgrades){var filteredUpgrades=[];for(var i=0,j=upgrades.length;i < j;i++) {if(~index(this.transports,upgrades[i]))filteredUpgrades.push(upgrades[i]);}return filteredUpgrades;};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./transport":4,"./transports":5,"component-emitter":15,"debug":17,"engine.io-parser":19,"indexof":23,"parsejson":26,"parseqs":27,"parseuri":28}],4:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var parser=_dereq_('engine.io-parser');var Emitter=_dereq_('component-emitter'); /**
 * Module exports.
 */module.exports = Transport; /**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */function Transport(opts){this.path = opts.path;this.hostname = opts.hostname;this.port = opts.port;this.secure = opts.secure;this.query = opts.query;this.timestampParam = opts.timestampParam;this.timestampRequests = opts.timestampRequests;this.readyState = '';this.agent = opts.agent || false;this.socket = opts.socket;this.enablesXDR = opts.enablesXDR; // SSL options for Node.js client
this.pfx = opts.pfx;this.key = opts.key;this.passphrase = opts.passphrase;this.cert = opts.cert;this.ca = opts.ca;this.ciphers = opts.ciphers;this.rejectUnauthorized = opts.rejectUnauthorized; // other options for Node.js client
this.extraHeaders = opts.extraHeaders;} /**
 * Mix in `Emitter`.
 */Emitter(Transport.prototype); /**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */Transport.prototype.onError = function(msg,desc){var err=new Error(msg);err.type = 'TransportError';err.description = desc;this.emit('error',err);return this;}; /**
 * Opens the transport.
 *
 * @api public
 */Transport.prototype.open = function(){if('closed' == this.readyState || '' == this.readyState){this.readyState = 'opening';this.doOpen();}return this;}; /**
 * Closes the transport.
 *
 * @api private
 */Transport.prototype.close = function(){if('opening' == this.readyState || 'open' == this.readyState){this.doClose();this.onClose();}return this;}; /**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */Transport.prototype.send = function(packets){if('open' == this.readyState){this.write(packets);}else {throw new Error('Transport not open');}}; /**
 * Called upon open
 *
 * @api private
 */Transport.prototype.onOpen = function(){this.readyState = 'open';this.writable = true;this.emit('open');}; /**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */Transport.prototype.onData = function(data){var packet=parser.decodePacket(data,this.socket.binaryType);this.onPacket(packet);}; /**
 * Called with a decoded packet.
 */Transport.prototype.onPacket = function(packet){this.emit('packet',packet);}; /**
 * Called upon close.
 *
 * @api private
 */Transport.prototype.onClose = function(){this.readyState = 'closed';this.emit('close');};},{"component-emitter":15,"engine.io-parser":19}],5:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies
 */var XMLHttpRequest=_dereq_('xmlhttprequest-ssl');var XHR=_dereq_('./polling-xhr');var JSONP=_dereq_('./polling-jsonp');var websocket=_dereq_('./websocket'); /**
 * Export transports.
 */exports.polling = polling;exports.websocket = websocket; /**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */function polling(opts){var xhr;var xd=false;var xs=false;var jsonp=false !== opts.jsonp;if(global.location){var isSSL='https:' == location.protocol;var port=location.port; // some user agents have empty `location.port`
if(!port){port = isSSL?443:80;}xd = opts.hostname != location.hostname || port != opts.port;xs = opts.secure != isSSL;}opts.xdomain = xd;opts.xscheme = xs;xhr = new XMLHttpRequest(opts);if('open' in xhr && !opts.forceJSONP){return new XHR(opts);}else {if(!jsonp)throw new Error('JSONP disabled');return new JSONP(opts);}}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./polling-jsonp":6,"./polling-xhr":7,"./websocket":9,"xmlhttprequest-ssl":10}],6:[function(_dereq_,module,exports){(function(global){ /**
 * Module requirements.
 */var Polling=_dereq_('./polling');var inherit=_dereq_('component-inherit'); /**
 * Module exports.
 */module.exports = JSONPPolling; /**
 * Cached regular expressions.
 */var rNewline=/\n/g;var rEscapedNewline=/\\n/g; /**
 * Global JSONP callbacks.
 */var callbacks; /**
 * Callbacks count.
 */var index=0; /**
 * Noop.
 */function empty(){} /**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */function JSONPPolling(opts){Polling.call(this,opts);this.query = this.query || {}; // define global callbacks array if not present
// we do this here (lazily) to avoid unneeded global pollution
if(!callbacks){ // we need to consider multiple engines in the same page
if(!global.___eio)global.___eio = [];callbacks = global.___eio;} // callback identifier
this.index = callbacks.length; // add callback to jsonp global
var self=this;callbacks.push(function(msg){self.onData(msg);}); // append to query string
this.query.j = this.index; // prevent spurious errors from being emitted when the window is unloaded
if(global.document && global.addEventListener){global.addEventListener('beforeunload',function(){if(self.script)self.script.onerror = empty;},false);}} /**
 * Inherits from Polling.
 */inherit(JSONPPolling,Polling); /*
 * JSONP only supports binary as base64 encoded strings
 */JSONPPolling.prototype.supportsBinary = false; /**
 * Closes the socket.
 *
 * @api private
 */JSONPPolling.prototype.doClose = function(){if(this.script){this.script.parentNode.removeChild(this.script);this.script = null;}if(this.form){this.form.parentNode.removeChild(this.form);this.form = null;this.iframe = null;}Polling.prototype.doClose.call(this);}; /**
 * Starts a poll cycle.
 *
 * @api private
 */JSONPPolling.prototype.doPoll = function(){var self=this;var script=document.createElement('script');if(this.script){this.script.parentNode.removeChild(this.script);this.script = null;}script.async = true;script.src = this.uri();script.onerror = function(e){self.onError('jsonp poll error',e);};var insertAt=document.getElementsByTagName('script')[0];if(insertAt){insertAt.parentNode.insertBefore(script,insertAt);}else {(document.head || document.body).appendChild(script);}this.script = script;var isUAgecko='undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);if(isUAgecko){setTimeout(function(){var iframe=document.createElement('iframe');document.body.appendChild(iframe);document.body.removeChild(iframe);},100);}}; /**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */JSONPPolling.prototype.doWrite = function(data,fn){var self=this;if(!this.form){var form=document.createElement('form');var area=document.createElement('textarea');var id=this.iframeId = 'eio_iframe_' + this.index;var iframe;form.className = 'socketio';form.style.position = 'absolute';form.style.top = '-1000px';form.style.left = '-1000px';form.target = id;form.method = 'POST';form.setAttribute('accept-charset','utf-8');area.name = 'd';form.appendChild(area);document.body.appendChild(form);this.form = form;this.area = area;}this.form.action = this.uri();function complete(){initIframe();fn();}function initIframe(){if(self.iframe){try{self.form.removeChild(self.iframe);}catch(e) {self.onError('jsonp polling iframe removal error',e);}}try{ // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
var html='<iframe src="javascript:0" name="' + self.iframeId + '">';iframe = document.createElement(html);}catch(e) {iframe = document.createElement('iframe');iframe.name = self.iframeId;iframe.src = 'javascript:0';}iframe.id = self.iframeId;self.form.appendChild(iframe);self.iframe = iframe;}initIframe(); // escape \n to prevent it from being converted into \r\n by some UAs
// double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
data = data.replace(rEscapedNewline,'\\\n');this.area.value = data.replace(rNewline,'\\n');try{this.form.submit();}catch(e) {}if(this.iframe.attachEvent){this.iframe.onreadystatechange = function(){if(self.iframe.readyState == 'complete'){complete();}};}else {this.iframe.onload = complete;}};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./polling":8,"component-inherit":16}],7:[function(_dereq_,module,exports){(function(global){ /**
 * Module requirements.
 */var XMLHttpRequest=_dereq_('xmlhttprequest-ssl');var Polling=_dereq_('./polling');var Emitter=_dereq_('component-emitter');var inherit=_dereq_('component-inherit');var debug=_dereq_('debug')('engine.io-client:polling-xhr'); /**
 * Module exports.
 */module.exports = XHR;module.exports.Request = Request; /**
 * Empty function
 */function empty(){} /**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */function XHR(opts){Polling.call(this,opts);if(global.location){var isSSL='https:' == location.protocol;var port=location.port; // some user agents have empty `location.port`
if(!port){port = isSSL?443:80;}this.xd = opts.hostname != global.location.hostname || port != opts.port;this.xs = opts.secure != isSSL;}else {this.extraHeaders = opts.extraHeaders;}} /**
 * Inherits from Polling.
 */inherit(XHR,Polling); /**
 * XHR supports binary
 */XHR.prototype.supportsBinary = true; /**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */XHR.prototype.request = function(opts){opts = opts || {};opts.uri = this.uri();opts.xd = this.xd;opts.xs = this.xs;opts.agent = this.agent || false;opts.supportsBinary = this.supportsBinary;opts.enablesXDR = this.enablesXDR; // SSL options for Node.js client
opts.pfx = this.pfx;opts.key = this.key;opts.passphrase = this.passphrase;opts.cert = this.cert;opts.ca = this.ca;opts.ciphers = this.ciphers;opts.rejectUnauthorized = this.rejectUnauthorized; // other options for Node.js client
opts.extraHeaders = this.extraHeaders;return new Request(opts);}; /**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */XHR.prototype.doWrite = function(data,fn){var isBinary=typeof data !== 'string' && data !== undefined;var req=this.request({method:'POST',data:data,isBinary:isBinary});var self=this;req.on('success',fn);req.on('error',function(err){self.onError('xhr post error',err);});this.sendXhr = req;}; /**
 * Starts a poll cycle.
 *
 * @api private
 */XHR.prototype.doPoll = function(){debug('xhr poll');var req=this.request();var self=this;req.on('data',function(data){self.onData(data);});req.on('error',function(err){self.onError('xhr poll error',err);});this.pollXhr = req;}; /**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */function Request(opts){this.method = opts.method || 'GET';this.uri = opts.uri;this.xd = !!opts.xd;this.xs = !!opts.xs;this.async = false !== opts.async;this.data = undefined != opts.data?opts.data:null;this.agent = opts.agent;this.isBinary = opts.isBinary;this.supportsBinary = opts.supportsBinary;this.enablesXDR = opts.enablesXDR; // SSL options for Node.js client
this.pfx = opts.pfx;this.key = opts.key;this.passphrase = opts.passphrase;this.cert = opts.cert;this.ca = opts.ca;this.ciphers = opts.ciphers;this.rejectUnauthorized = opts.rejectUnauthorized; // other options for Node.js client
this.extraHeaders = opts.extraHeaders;this.create();} /**
 * Mix in `Emitter`.
 */Emitter(Request.prototype); /**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */Request.prototype.create = function(){var opts={agent:this.agent,xdomain:this.xd,xscheme:this.xs,enablesXDR:this.enablesXDR}; // SSL options for Node.js client
opts.pfx = this.pfx;opts.key = this.key;opts.passphrase = this.passphrase;opts.cert = this.cert;opts.ca = this.ca;opts.ciphers = this.ciphers;opts.rejectUnauthorized = this.rejectUnauthorized;var xhr=this.xhr = new XMLHttpRequest(opts);var self=this;try{debug('xhr open %s: %s',this.method,this.uri);xhr.open(this.method,this.uri,this.async);try{if(this.extraHeaders){xhr.setDisableHeaderCheck(true);for(var i in this.extraHeaders) {if(this.extraHeaders.hasOwnProperty(i)){xhr.setRequestHeader(i,this.extraHeaders[i]);}}}}catch(e) {}if(this.supportsBinary){ // This has to be done after open because Firefox is stupid
// http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
xhr.responseType = 'arraybuffer';}if('POST' == this.method){try{if(this.isBinary){xhr.setRequestHeader('Content-type','application/octet-stream');}else {xhr.setRequestHeader('Content-type','text/plain;charset=UTF-8');}}catch(e) {}} // ie6 check
if('withCredentials' in xhr){xhr.withCredentials = true;}if(this.hasXDR()){xhr.onload = function(){self.onLoad();};xhr.onerror = function(){self.onError(xhr.responseText);};}else {xhr.onreadystatechange = function(){if(4 != xhr.readyState)return;if(200 == xhr.status || 1223 == xhr.status){self.onLoad();}else { // make sure the `error` event handler that's user-set
// does not throw in the same tick and gets caught here
setTimeout(function(){self.onError(xhr.status);},0);}};}debug('xhr data %s',this.data);xhr.send(this.data);}catch(e) { // Need to defer since .create() is called directly fhrom the constructor
// and thus the 'error' event can only be only bound *after* this exception
// occurs.  Therefore, also, we cannot throw here at all.
setTimeout(function(){self.onError(e);},0);return;}if(global.document){this.index = Request.requestsCount++;Request.requests[this.index] = this;}}; /**
 * Called upon successful response.
 *
 * @api private
 */Request.prototype.onSuccess = function(){this.emit('success');this.cleanup();}; /**
 * Called if we have data.
 *
 * @api private
 */Request.prototype.onData = function(data){this.emit('data',data);this.onSuccess();}; /**
 * Called upon error.
 *
 * @api private
 */Request.prototype.onError = function(err){this.emit('error',err);this.cleanup(true);}; /**
 * Cleans up house.
 *
 * @api private
 */Request.prototype.cleanup = function(fromError){if('undefined' == typeof this.xhr || null === this.xhr){return;} // xmlhttprequest
if(this.hasXDR()){this.xhr.onload = this.xhr.onerror = empty;}else {this.xhr.onreadystatechange = empty;}if(fromError){try{this.xhr.abort();}catch(e) {}}if(global.document){delete Request.requests[this.index];}this.xhr = null;}; /**
 * Called upon load.
 *
 * @api private
 */Request.prototype.onLoad = function(){var data;try{var contentType;try{contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];}catch(e) {}if(contentType === 'application/octet-stream'){data = this.xhr.response;}else {if(!this.supportsBinary){data = this.xhr.responseText;}else {try{data = String.fromCharCode.apply(null,new Uint8Array(this.xhr.response));}catch(e) {var ui8Arr=new Uint8Array(this.xhr.response);var dataArray=[];for(var idx=0,length=ui8Arr.length;idx < length;idx++) {dataArray.push(ui8Arr[idx]);}data = String.fromCharCode.apply(null,dataArray);}}}}catch(e) {this.onError(e);}if(null != data){this.onData(data);}}; /**
 * Check if it has XDomainRequest.
 *
 * @api private
 */Request.prototype.hasXDR = function(){return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;}; /**
 * Aborts the request.
 *
 * @api public
 */Request.prototype.abort = function(){this.cleanup();}; /**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */if(global.document){Request.requestsCount = 0;Request.requests = {};if(global.attachEvent){global.attachEvent('onunload',unloadHandler);}else if(global.addEventListener){global.addEventListener('beforeunload',unloadHandler,false);}}function unloadHandler(){for(var i in Request.requests) {if(Request.requests.hasOwnProperty(i)){Request.requests[i].abort();}}}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./polling":8,"component-emitter":15,"component-inherit":16,"debug":17,"xmlhttprequest-ssl":10}],8:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var Transport=_dereq_('../transport');var parseqs=_dereq_('parseqs');var parser=_dereq_('engine.io-parser');var inherit=_dereq_('component-inherit');var yeast=_dereq_('yeast');var debug=_dereq_('debug')('engine.io-client:polling'); /**
 * Module exports.
 */module.exports = Polling; /**
 * Is XHR2 supported?
 */var hasXHR2=(function(){var XMLHttpRequest=_dereq_('xmlhttprequest-ssl');var xhr=new XMLHttpRequest({xdomain:false});return null != xhr.responseType;})(); /**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */function Polling(opts){var forceBase64=opts && opts.forceBase64;if(!hasXHR2 || forceBase64){this.supportsBinary = false;}Transport.call(this,opts);} /**
 * Inherits from Transport.
 */inherit(Polling,Transport); /**
 * Transport name.
 */Polling.prototype.name = 'polling'; /**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */Polling.prototype.doOpen = function(){this.poll();}; /**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */Polling.prototype.pause = function(onPause){var pending=0;var self=this;this.readyState = 'pausing';function pause(){debug('paused');self.readyState = 'paused';onPause();}if(this.polling || !this.writable){var total=0;if(this.polling){debug('we are currently polling - waiting to pause');total++;this.once('pollComplete',function(){debug('pre-pause polling complete');--total || pause();});}if(!this.writable){debug('we are currently writing - waiting to pause');total++;this.once('drain',function(){debug('pre-pause writing complete');--total || pause();});}}else {pause();}}; /**
 * Starts polling cycle.
 *
 * @api public
 */Polling.prototype.poll = function(){debug('polling');this.polling = true;this.doPoll();this.emit('poll');}; /**
 * Overloads onData to detect payloads.
 *
 * @api private
 */Polling.prototype.onData = function(data){var self=this;debug('polling got data %s',data);var callback=function callback(packet,index,total){ // if its the first message we consider the transport open
if('opening' == self.readyState){self.onOpen();} // if its a close packet, we close the ongoing requests
if('close' == packet.type){self.onClose();return false;} // otherwise bypass onData and handle the message
self.onPacket(packet);}; // decode payload
parser.decodePayload(data,this.socket.binaryType,callback); // if an event did not trigger closing
if('closed' != this.readyState){ // if we got data we're not polling
this.polling = false;this.emit('pollComplete');if('open' == this.readyState){this.poll();}else {debug('ignoring poll - transport state "%s"',this.readyState);}}}; /**
 * For polling, send a close packet.
 *
 * @api private
 */Polling.prototype.doClose = function(){var self=this;function close(){debug('writing close packet');self.write([{type:'close'}]);}if('open' == this.readyState){debug('transport open - closing');close();}else { // in case we're trying to close while
// handshaking is in progress (GH-164)
debug('transport not open - deferring close');this.once('open',close);}}; /**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */Polling.prototype.write = function(packets){var self=this;this.writable = false;var callbackfn=function callbackfn(){self.writable = true;self.emit('drain');};var self=this;parser.encodePayload(packets,this.supportsBinary,function(data){self.doWrite(data,callbackfn);});}; /**
 * Generates uri for connection.
 *
 * @api private
 */Polling.prototype.uri = function(){var query=this.query || {};var schema=this.secure?'https':'http';var port=''; // cache busting is forced
if(false !== this.timestampRequests){query[this.timestampParam] = yeast();}if(!this.supportsBinary && !query.sid){query.b64 = 1;}query = parseqs.encode(query); // avoid port if default for schema
if(this.port && ('https' == schema && this.port != 443 || 'http' == schema && this.port != 80)){port = ':' + this.port;} // prepend ? to query
if(query.length){query = '?' + query;}var ipv6=this.hostname.indexOf(':') !== -1;return schema + '://' + (ipv6?'[' + this.hostname + ']':this.hostname) + port + this.path + query;};},{"../transport":4,"component-inherit":16,"debug":17,"engine.io-parser":19,"parseqs":27,"xmlhttprequest-ssl":10,"yeast":30}],9:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies.
 */var Transport=_dereq_('../transport');var parser=_dereq_('engine.io-parser');var parseqs=_dereq_('parseqs');var inherit=_dereq_('component-inherit');var yeast=_dereq_('yeast');var debug=_dereq_('debug')('engine.io-client:websocket');var BrowserWebSocket=global.WebSocket || global.MozWebSocket; /**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or the WebSocket-compatible interface
 * exposed by `ws` for Node environment.
 */var WebSocket=BrowserWebSocket || (typeof window !== 'undefined'?null:_dereq_('ws')); /**
 * Module exports.
 */module.exports = WS; /**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */function WS(opts){var forceBase64=opts && opts.forceBase64;if(forceBase64){this.supportsBinary = false;}this.perMessageDeflate = opts.perMessageDeflate;Transport.call(this,opts);} /**
 * Inherits from Transport.
 */inherit(WS,Transport); /**
 * Transport name.
 *
 * @api public
 */WS.prototype.name = 'websocket'; /*
 * WebSockets support binary
 */WS.prototype.supportsBinary = true; /**
 * Opens socket.
 *
 * @api private
 */WS.prototype.doOpen = function(){if(!this.check()){ // let probe timeout
return;}var self=this;var uri=this.uri();var protocols=void 0;var opts={agent:this.agent,perMessageDeflate:this.perMessageDeflate}; // SSL options for Node.js client
opts.pfx = this.pfx;opts.key = this.key;opts.passphrase = this.passphrase;opts.cert = this.cert;opts.ca = this.ca;opts.ciphers = this.ciphers;opts.rejectUnauthorized = this.rejectUnauthorized;if(this.extraHeaders){opts.headers = this.extraHeaders;}this.ws = BrowserWebSocket?new WebSocket(uri):new WebSocket(uri,protocols,opts);if(this.ws.binaryType === undefined){this.supportsBinary = false;}if(this.ws.supports && this.ws.supports.binary){this.supportsBinary = true;this.ws.binaryType = 'buffer';}else {this.ws.binaryType = 'arraybuffer';}this.addEventListeners();}; /**
 * Adds event listeners to the socket
 *
 * @api private
 */WS.prototype.addEventListeners = function(){var self=this;this.ws.onopen = function(){self.onOpen();};this.ws.onclose = function(){self.onClose();};this.ws.onmessage = function(ev){self.onData(ev.data);};this.ws.onerror = function(e){self.onError('websocket error',e);};}; /**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */if('undefined' != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)){WS.prototype.onData = function(data){var self=this;setTimeout(function(){Transport.prototype.onData.call(self,data);},0);};} /**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */WS.prototype.write = function(packets){var self=this;this.writable = false; // encodePacket efficient as it uses WS framing
// no need for encodePayload
var total=packets.length;for(var i=0,l=total;i < l;i++) {(function(packet){parser.encodePacket(packet,self.supportsBinary,function(data){if(!BrowserWebSocket){ // always create a new object (GH-437)
var opts={};if(packet.options){opts.compress = packet.options.compress;}if(self.perMessageDeflate){var len='string' == typeof data?global.Buffer.byteLength(data):data.length;if(len < self.perMessageDeflate.threshold){opts.compress = false;}}} //Sometimes the websocket has already been closed but the browser didn't
//have a chance of informing us about it yet, in that case send will
//throw an error
try{if(BrowserWebSocket){ // TypeError is thrown when passing the second argument on Safari
self.ws.send(data);}else {self.ws.send(data,opts);}}catch(e) {debug('websocket closed before onclose event');}--total || done();});})(packets[i]);}function done(){self.emit('flush'); // fake drain
// defer to next tick to allow Socket to clear writeBuffer
setTimeout(function(){self.writable = true;self.emit('drain');},0);}}; /**
 * Called upon close
 *
 * @api private
 */WS.prototype.onClose = function(){Transport.prototype.onClose.call(this);}; /**
 * Closes socket.
 *
 * @api private
 */WS.prototype.doClose = function(){if(typeof this.ws !== 'undefined'){this.ws.close();}}; /**
 * Generates uri for connection.
 *
 * @api private
 */WS.prototype.uri = function(){var query=this.query || {};var schema=this.secure?'wss':'ws';var port=''; // avoid port if default for schema
if(this.port && ('wss' == schema && this.port != 443 || 'ws' == schema && this.port != 80)){port = ':' + this.port;} // append timestamp to URI
if(this.timestampRequests){query[this.timestampParam] = yeast();} // communicate binary support capabilities
if(!this.supportsBinary){query.b64 = 1;}query = parseqs.encode(query); // prepend ? to query
if(query.length){query = '?' + query;}var ipv6=this.hostname.indexOf(':') !== -1;return schema + '://' + (ipv6?'[' + this.hostname + ']':this.hostname) + port + this.path + query;}; /**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */WS.prototype.check = function(){return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"../transport":4,"component-inherit":16,"debug":17,"engine.io-parser":19,"parseqs":27,"ws":undefined,"yeast":30}],10:[function(_dereq_,module,exports){ // browser shim for xmlhttprequest module
var hasCORS=_dereq_('has-cors');module.exports = function(opts){var xdomain=opts.xdomain; // scheme must be same when usign XDomainRequest
// http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
var xscheme=opts.xscheme; // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
// https://github.com/Automattic/engine.io-client/pull/217
var enablesXDR=opts.enablesXDR; // XMLHttpRequest can be disabled on IE
try{if('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)){return new XMLHttpRequest();}}catch(e) {} // Use XDomainRequest for IE8 if enablesXDR is true
// because loading bar keeps flashing when using jsonp-polling
// https://github.com/yujiosaka/socke.io-ie8-loading-example
try{if('undefined' != typeof XDomainRequest && !xscheme && enablesXDR){return new XDomainRequest();}}catch(e) {}if(!xdomain){try{return new ActiveXObject('Microsoft.XMLHTTP');}catch(e) {}}};},{"has-cors":22}],11:[function(_dereq_,module,exports){module.exports = after;function after(count,callback,err_cb){var bail=false;err_cb = err_cb || noop;proxy.count = count;return count === 0?callback():proxy;function proxy(err,result){if(proxy.count <= 0){throw new Error('after called too many times');}--proxy.count; // after first error, rest are passed to err_cb
if(err){bail = true;callback(err); // future error callbacks will go to error handler
callback = err_cb;}else if(proxy.count === 0 && !bail){callback(null,result);}}}function noop(){}},{}],12:[function(_dereq_,module,exports){ /**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */module.exports = function(arraybuffer,start,end){var bytes=arraybuffer.byteLength;start = start || 0;end = end || bytes;if(arraybuffer.slice){return arraybuffer.slice(start,end);}if(start < 0){start += bytes;}if(end < 0){end += bytes;}if(end > bytes){end = bytes;}if(start >= bytes || start >= end || bytes === 0){return new ArrayBuffer(0);}var abv=new Uint8Array(arraybuffer);var result=new Uint8Array(end - start);for(var i=start,ii=0;i < end;i++,ii++) {result[ii] = abv[i];}return result.buffer;};},{}],13:[function(_dereq_,module,exports){ /*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */(function(chars){"use strict";exports.encode = function(arraybuffer){var bytes=new Uint8Array(arraybuffer),i,len=bytes.length,base64="";for(i = 0;i < len;i += 3) {base64 += chars[bytes[i] >> 2];base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];base64 += chars[bytes[i + 2] & 63];}if(len % 3 === 2){base64 = base64.substring(0,base64.length - 1) + "=";}else if(len % 3 === 1){base64 = base64.substring(0,base64.length - 2) + "==";}return base64;};exports.decode = function(base64){var bufferLength=base64.length * 0.75,len=base64.length,i,p=0,encoded1,encoded2,encoded3,encoded4;if(base64[base64.length - 1] === "="){bufferLength--;if(base64[base64.length - 2] === "="){bufferLength--;}}var arraybuffer=new ArrayBuffer(bufferLength),bytes=new Uint8Array(arraybuffer);for(i = 0;i < len;i += 4) {encoded1 = chars.indexOf(base64[i]);encoded2 = chars.indexOf(base64[i + 1]);encoded3 = chars.indexOf(base64[i + 2]);encoded4 = chars.indexOf(base64[i + 3]);bytes[p++] = encoded1 << 2 | encoded2 >> 4;bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;}return arraybuffer;};})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");},{}],14:[function(_dereq_,module,exports){(function(global){ /**
 * Create a blob builder even when vendor prefixes exist
 */var BlobBuilder=global.BlobBuilder || global.WebKitBlobBuilder || global.MSBlobBuilder || global.MozBlobBuilder; /**
 * Check if Blob constructor is supported
 */var blobSupported=(function(){try{var a=new Blob(['hi']);return a.size === 2;}catch(e) {return false;}})(); /**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */var blobSupportsArrayBufferView=blobSupported && (function(){try{var b=new Blob([new Uint8Array([1,2])]);return b.size === 2;}catch(e) {return false;}})(); /**
 * Check if BlobBuilder is supported
 */var blobBuilderSupported=BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob; /**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */function mapArrayBufferViews(ary){for(var i=0;i < ary.length;i++) {var chunk=ary[i];if(chunk.buffer instanceof ArrayBuffer){var buf=chunk.buffer; // if this is a subarray, make a copy so we only
// include the subarray region from the underlying buffer
if(chunk.byteLength !== buf.byteLength){var copy=new Uint8Array(chunk.byteLength);copy.set(new Uint8Array(buf,chunk.byteOffset,chunk.byteLength));buf = copy.buffer;}ary[i] = buf;}}}function BlobBuilderConstructor(ary,options){options = options || {};var bb=new BlobBuilder();mapArrayBufferViews(ary);for(var i=0;i < ary.length;i++) {bb.append(ary[i]);}return options.type?bb.getBlob(options.type):bb.getBlob();};function BlobConstructor(ary,options){mapArrayBufferViews(ary);return new Blob(ary,options || {});};module.exports = (function(){if(blobSupported){return blobSupportsArrayBufferView?global.Blob:BlobConstructor;}else if(blobBuilderSupported){return BlobBuilderConstructor;}else {return undefined;}})();}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],15:[function(_dereq_,module,exports){ /**
 * Expose `Emitter`.
 */module.exports = Emitter; /**
 * Initialize a new `Emitter`.
 *
 * @api public
 */function Emitter(obj){if(obj)return mixin(obj);}; /**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */function mixin(obj){for(var key in Emitter.prototype) {obj[key] = Emitter.prototype[key];}return obj;} /**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.on = Emitter.prototype.addEventListener = function(event,fn){this._callbacks = this._callbacks || {};(this._callbacks[event] = this._callbacks[event] || []).push(fn);return this;}; /**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.once = function(event,fn){var self=this;this._callbacks = this._callbacks || {};function on(){self.off(event,on);fn.apply(this,arguments);}on.fn = fn;this.on(event,on);return this;}; /**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event,fn){this._callbacks = this._callbacks || {}; // all
if(0 == arguments.length){this._callbacks = {};return this;} // specific event
var callbacks=this._callbacks[event];if(!callbacks)return this; // remove all handlers
if(1 == arguments.length){delete this._callbacks[event];return this;} // remove specific handler
var cb;for(var i=0;i < callbacks.length;i++) {cb = callbacks[i];if(cb === fn || cb.fn === fn){callbacks.splice(i,1);break;}}return this;}; /**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */Emitter.prototype.emit = function(event){this._callbacks = this._callbacks || {};var args=[].slice.call(arguments,1),callbacks=this._callbacks[event];if(callbacks){callbacks = callbacks.slice(0);for(var i=0,len=callbacks.length;i < len;++i) {callbacks[i].apply(this,args);}}return this;}; /**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */Emitter.prototype.listeners = function(event){this._callbacks = this._callbacks || {};return this._callbacks[event] || [];}; /**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */Emitter.prototype.hasListeners = function(event){return !!this.listeners(event).length;};},{}],16:[function(_dereq_,module,exports){module.exports = function(a,b){var fn=function fn(){};fn.prototype = b.prototype;a.prototype = new fn();a.prototype.constructor = a;};},{}],17:[function(_dereq_,module,exports){ /**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */exports = module.exports = _dereq_('./debug');exports.log = log;exports.formatArgs = formatArgs;exports.save = save;exports.load = load;exports.useColors = useColors;exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage?chrome.storage.local:localstorage(); /**
 * Colors.
 */exports.colors = ['lightseagreen','forestgreen','goldenrod','dodgerblue','darkorchid','crimson']; /**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */function useColors(){ // is webkit? http://stackoverflow.com/a/16459606/376773
return 'WebkitAppearance' in document.documentElement.style ||  // is firebug? http://stackoverflow.com/a/398120/376773
window.console && (console.firebug || console.exception && console.table) ||  // is firefox >= v31?
// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1,10) >= 31;} /**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */exports.formatters.j = function(v){return JSON.stringify(v);}; /**
 * Colorize log arguments if enabled.
 *
 * @api public
 */function formatArgs(){var args=arguments;var useColors=this.useColors;args[0] = (useColors?'%c':'') + this.namespace + (useColors?' %c':' ') + args[0] + (useColors?'%c ':' ') + '+' + exports.humanize(this.diff);if(!useColors)return args;var c='color: ' + this.color;args = [args[0],c,'color: inherit'].concat(Array.prototype.slice.call(args,1)); // the final "%c" is somewhat tricky, because there could be other
// arguments passed either before or after the %c, so we need to
// figure out the correct index to insert the CSS into
var index=0;var lastC=0;args[0].replace(/%[a-z%]/g,function(match){if('%%' === match)return;index++;if('%c' === match){ // we only are interested in the *last* %c
// (the user may have provided their own)
lastC = index;}});args.splice(lastC,0,c);return args;} /**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */function log(){ // this hackery is required for IE8/9, where
// the `console.log` function doesn't have 'apply'
return 'object' === typeof console && console.log && Function.prototype.apply.call(console.log,console,arguments);} /**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */function save(namespaces){try{if(null == namespaces){exports.storage.removeItem('debug');}else {exports.storage.debug = namespaces;}}catch(e) {}} /**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */function load(){var r;try{r = exports.storage.debug;}catch(e) {}return r;} /**
 * Enable namespaces listed in `localStorage.debug` initially.
 */exports.enable(load()); /**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */function localstorage(){try{return window.localStorage;}catch(e) {}}},{"./debug":18}],18:[function(_dereq_,module,exports){ /**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */exports = module.exports = debug;exports.coerce = coerce;exports.disable = disable;exports.enable = enable;exports.enabled = enabled;exports.humanize = _dereq_('ms'); /**
 * The currently active debug mode names, and names to skip.
 */exports.names = [];exports.skips = []; /**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */exports.formatters = {}; /**
 * Previously assigned color.
 */var prevColor=0; /**
 * Previous log timestamp.
 */var prevTime; /**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */function selectColor(){return exports.colors[prevColor++ % exports.colors.length];} /**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */function debug(namespace){ // define the `disabled` version
function disabled(){}disabled.enabled = false; // define the `enabled` version
function enabled(){var self=enabled; // set `diff` timestamp
var curr=+new Date();var ms=curr - (prevTime || curr);self.diff = ms;self.prev = prevTime;self.curr = curr;prevTime = curr; // add the `color` if not set
if(null == self.useColors)self.useColors = exports.useColors();if(null == self.color && self.useColors)self.color = selectColor();var args=Array.prototype.slice.call(arguments);args[0] = exports.coerce(args[0]);if('string' !== typeof args[0]){ // anything else let's inspect with %o
args = ['%o'].concat(args);} // apply any `formatters` transformations
var index=0;args[0] = args[0].replace(/%([a-z%])/g,function(match,format){ // if we encounter an escaped % then don't increase the array index
if(match === '%%')return match;index++;var formatter=exports.formatters[format];if('function' === typeof formatter){var val=args[index];match = formatter.call(self,val); // now we need to remove `args[index]` since it's inlined in the `format`
args.splice(index,1);index--;}return match;});if('function' === typeof exports.formatArgs){args = exports.formatArgs.apply(self,args);}var logFn=enabled.log || exports.log || console.log.bind(console);logFn.apply(self,args);}enabled.enabled = true;var fn=exports.enabled(namespace)?enabled:disabled;fn.namespace = namespace;return fn;} /**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */function enable(namespaces){exports.save(namespaces);var split=(namespaces || '').split(/[\s,]+/);var len=split.length;for(var i=0;i < len;i++) {if(!split[i])continue; // ignore empty strings
namespaces = split[i].replace(/\*/g,'.*?');if(namespaces[0] === '-'){exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));}else {exports.names.push(new RegExp('^' + namespaces + '$'));}}} /**
 * Disable debug output.
 *
 * @api public
 */function disable(){exports.enable('');} /**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */function enabled(name){var i,len;for(i = 0,len = exports.skips.length;i < len;i++) {if(exports.skips[i].test(name)){return false;}}for(i = 0,len = exports.names.length;i < len;i++) {if(exports.names[i].test(name)){return true;}}return false;} /**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */function coerce(val){if(val instanceof Error)return val.stack || val.message;return val;}},{"ms":25}],19:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies.
 */var keys=_dereq_('./keys');var hasBinary=_dereq_('has-binary');var sliceBuffer=_dereq_('arraybuffer.slice');var base64encoder=_dereq_('base64-arraybuffer');var after=_dereq_('after');var utf8=_dereq_('utf8'); /**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */var isAndroid=navigator.userAgent.match(/Android/i); /**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */var isPhantomJS=/PhantomJS/i.test(navigator.userAgent); /**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */var dontSendBlobs=isAndroid || isPhantomJS; /**
 * Current protocol version.
 */exports.protocol = 3; /**
 * Packet types.
 */var packets=exports.packets = {open:0, // non-ws
close:1, // non-ws
ping:2,pong:3,message:4,upgrade:5,noop:6};var packetslist=keys(packets); /**
 * Premade error packet.
 */var err={type:'error',data:'parser error'}; /**
 * Create a blob api even for blob builder when vendor prefixes exist
 */var Blob=_dereq_('blob'); /**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */exports.encodePacket = function(packet,supportsBinary,utf8encode,callback){if('function' == typeof supportsBinary){callback = supportsBinary;supportsBinary = false;}if('function' == typeof utf8encode){callback = utf8encode;utf8encode = null;}var data=packet.data === undefined?undefined:packet.data.buffer || packet.data;if(global.ArrayBuffer && data instanceof ArrayBuffer){return encodeArrayBuffer(packet,supportsBinary,callback);}else if(Blob && data instanceof global.Blob){return encodeBlob(packet,supportsBinary,callback);} // might be an object with { base64: true, data: dataAsBase64String }
if(data && data.base64){return encodeBase64Object(packet,callback);} // Sending data as a utf-8 string
var encoded=packets[packet.type]; // data fragment is optional
if(undefined !== packet.data){encoded += utf8encode?utf8.encode(String(packet.data)):String(packet.data);}return callback('' + encoded);};function encodeBase64Object(packet,callback){ // packet data is an object { base64: true, data: dataAsBase64String }
var message='b' + exports.packets[packet.type] + packet.data.data;return callback(message);} /**
 * Encode packet helpers for binary types
 */function encodeArrayBuffer(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback);}var data=packet.data;var contentArray=new Uint8Array(data);var resultBuffer=new Uint8Array(1 + data.byteLength);resultBuffer[0] = packets[packet.type];for(var i=0;i < contentArray.length;i++) {resultBuffer[i + 1] = contentArray[i];}return callback(resultBuffer.buffer);}function encodeBlobAsArrayBuffer(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback);}var fr=new FileReader();fr.onload = function(){packet.data = fr.result;exports.encodePacket(packet,supportsBinary,true,callback);};return fr.readAsArrayBuffer(packet.data);}function encodeBlob(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback);}if(dontSendBlobs){return encodeBlobAsArrayBuffer(packet,supportsBinary,callback);}var length=new Uint8Array(1);length[0] = packets[packet.type];var blob=new Blob([length.buffer,packet.data]);return callback(blob);} /**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */exports.encodeBase64Packet = function(packet,callback){var message='b' + exports.packets[packet.type];if(Blob && packet.data instanceof global.Blob){var fr=new FileReader();fr.onload = function(){var b64=fr.result.split(',')[1];callback(message + b64);};return fr.readAsDataURL(packet.data);}var b64data;try{b64data = String.fromCharCode.apply(null,new Uint8Array(packet.data));}catch(e) { // iPhone Safari doesn't let you apply with typed arrays
var typed=new Uint8Array(packet.data);var basic=new Array(typed.length);for(var i=0;i < typed.length;i++) {basic[i] = typed[i];}b64data = String.fromCharCode.apply(null,basic);}message += global.btoa(b64data);return callback(message);}; /**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */exports.decodePacket = function(data,binaryType,utf8decode){ // String data
if(typeof data == 'string' || data === undefined){if(data.charAt(0) == 'b'){return exports.decodeBase64Packet(data.substr(1),binaryType);}if(utf8decode){try{data = utf8.decode(data);}catch(e) {return err;}}var type=data.charAt(0);if(Number(type) != type || !packetslist[type]){return err;}if(data.length > 1){return {type:packetslist[type],data:data.substring(1)};}else {return {type:packetslist[type]};}}var asArray=new Uint8Array(data);var type=asArray[0];var rest=sliceBuffer(data,1);if(Blob && binaryType === 'blob'){rest = new Blob([rest]);}return {type:packetslist[type],data:rest};}; /**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */exports.decodeBase64Packet = function(msg,binaryType){var type=packetslist[msg.charAt(0)];if(!global.ArrayBuffer){return {type:type,data:{base64:true,data:msg.substr(1)}};}var data=base64encoder.decode(msg.substr(1));if(binaryType === 'blob' && Blob){data = new Blob([data]);}return {type:type,data:data};}; /**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */exports.encodePayload = function(packets,supportsBinary,callback){if(typeof supportsBinary == 'function'){callback = supportsBinary;supportsBinary = null;}var isBinary=hasBinary(packets);if(supportsBinary && isBinary){if(Blob && !dontSendBlobs){return exports.encodePayloadAsBlob(packets,callback);}return exports.encodePayloadAsArrayBuffer(packets,callback);}if(!packets.length){return callback('0:');}function setLengthHeader(message){return message.length + ':' + message;}function encodeOne(packet,doneCallback){exports.encodePacket(packet,!isBinary?false:supportsBinary,true,function(message){doneCallback(null,setLengthHeader(message));});}map(packets,encodeOne,function(err,results){return callback(results.join(''));});}; /**
 * Async array map using after
 */function map(ary,each,done){var result=new Array(ary.length);var next=after(ary.length,done);var eachWithIndex=function eachWithIndex(i,el,cb){each(el,function(error,msg){result[i] = msg;cb(error,result);});};for(var i=0;i < ary.length;i++) {eachWithIndex(i,ary[i],next);}} /*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */exports.decodePayload = function(data,binaryType,callback){if(typeof data != 'string'){return exports.decodePayloadAsBinary(data,binaryType,callback);}if(typeof binaryType === 'function'){callback = binaryType;binaryType = null;}var packet;if(data == ''){ // parser error - ignoring payload
return callback(err,0,1);}var length='',n,msg;for(var i=0,l=data.length;i < l;i++) {var chr=data.charAt(i);if(':' != chr){length += chr;}else {if('' == length || length != (n = Number(length))){ // parser error - ignoring payload
return callback(err,0,1);}msg = data.substr(i + 1,n);if(length != msg.length){ // parser error - ignoring payload
return callback(err,0,1);}if(msg.length){packet = exports.decodePacket(msg,binaryType,true);if(err.type == packet.type && err.data == packet.data){ // parser error in individual packet - ignoring payload
return callback(err,0,1);}var ret=callback(packet,i + n,l);if(false === ret)return;} // advance cursor
i += n;length = '';}}if(length != ''){ // parser error - ignoring payload
return callback(err,0,1);}}; /**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */exports.encodePayloadAsArrayBuffer = function(packets,callback){if(!packets.length){return callback(new ArrayBuffer(0));}function encodeOne(packet,doneCallback){exports.encodePacket(packet,true,true,function(data){return doneCallback(null,data);});}map(packets,encodeOne,function(err,encodedPackets){var totalLength=encodedPackets.reduce(function(acc,p){var len;if(typeof p === 'string'){len = p.length;}else {len = p.byteLength;}return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
},0);var resultArray=new Uint8Array(totalLength);var bufferIndex=0;encodedPackets.forEach(function(p){var isString=typeof p === 'string';var ab=p;if(isString){var view=new Uint8Array(p.length);for(var i=0;i < p.length;i++) {view[i] = p.charCodeAt(i);}ab = view.buffer;}if(isString){ // not true binary
resultArray[bufferIndex++] = 0;}else { // true binary
resultArray[bufferIndex++] = 1;}var lenStr=ab.byteLength.toString();for(var i=0;i < lenStr.length;i++) {resultArray[bufferIndex++] = parseInt(lenStr[i]);}resultArray[bufferIndex++] = 255;var view=new Uint8Array(ab);for(var i=0;i < view.length;i++) {resultArray[bufferIndex++] = view[i];}});return callback(resultArray.buffer);});}; /**
 * Encode as Blob
 */exports.encodePayloadAsBlob = function(packets,callback){function encodeOne(packet,doneCallback){exports.encodePacket(packet,true,true,function(encoded){var binaryIdentifier=new Uint8Array(1);binaryIdentifier[0] = 1;if(typeof encoded === 'string'){var view=new Uint8Array(encoded.length);for(var i=0;i < encoded.length;i++) {view[i] = encoded.charCodeAt(i);}encoded = view.buffer;binaryIdentifier[0] = 0;}var len=encoded instanceof ArrayBuffer?encoded.byteLength:encoded.size;var lenStr=len.toString();var lengthAry=new Uint8Array(lenStr.length + 1);for(var i=0;i < lenStr.length;i++) {lengthAry[i] = parseInt(lenStr[i]);}lengthAry[lenStr.length] = 255;if(Blob){var blob=new Blob([binaryIdentifier.buffer,lengthAry.buffer,encoded]);doneCallback(null,blob);}});}map(packets,encodeOne,function(err,results){return callback(new Blob(results));});}; /*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */exports.decodePayloadAsBinary = function(data,binaryType,callback){if(typeof binaryType === 'function'){callback = binaryType;binaryType = null;}var bufferTail=data;var buffers=[];var numberTooLong=false;while(bufferTail.byteLength > 0) {var tailArray=new Uint8Array(bufferTail);var isString=tailArray[0] === 0;var msgLength='';for(var i=1;;i++) {if(tailArray[i] == 255)break;if(msgLength.length > 310){numberTooLong = true;break;}msgLength += tailArray[i];}if(numberTooLong)return callback(err,0,1);bufferTail = sliceBuffer(bufferTail,2 + msgLength.length);msgLength = parseInt(msgLength);var msg=sliceBuffer(bufferTail,0,msgLength);if(isString){try{msg = String.fromCharCode.apply(null,new Uint8Array(msg));}catch(e) { // iPhone Safari doesn't let you apply to typed arrays
var typed=new Uint8Array(msg);msg = '';for(var i=0;i < typed.length;i++) {msg += String.fromCharCode(typed[i]);}}}buffers.push(msg);bufferTail = sliceBuffer(bufferTail,msgLength);}var total=buffers.length;buffers.forEach(function(buffer,i){callback(exports.decodePacket(buffer,binaryType,true),i,total);});};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./keys":20,"after":11,"arraybuffer.slice":12,"base64-arraybuffer":13,"blob":14,"has-binary":21,"utf8":29}],20:[function(_dereq_,module,exports){ /**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */module.exports = Object.keys || function keys(obj){var arr=[];var has=Object.prototype.hasOwnProperty;for(var i in obj) {if(has.call(obj,i)){arr.push(i);}}return arr;};},{}],21:[function(_dereq_,module,exports){(function(global){ /*
 * Module requirements.
 */var isArray=_dereq_('isarray'); /**
 * Module exports.
 */module.exports = hasBinary; /**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */function hasBinary(data){function _hasBinary(obj){if(!obj)return false;if(global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File){return true;}if(isArray(obj)){for(var i=0;i < obj.length;i++) {if(_hasBinary(obj[i])){return true;}}}else if(obj && 'object' == typeof obj){if(obj.toJSON){obj = obj.toJSON();}for(var key in obj) {if(Object.prototype.hasOwnProperty.call(obj,key) && _hasBinary(obj[key])){return true;}}}return false;}return _hasBinary(data);}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"isarray":24}],22:[function(_dereq_,module,exports){ /**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */try{module.exports = typeof XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest();}catch(err) { // if XMLHttp support is disabled in IE then it will throw
// when trying to create
module.exports = false;}},{}],23:[function(_dereq_,module,exports){var indexOf=[].indexOf;module.exports = function(arr,obj){if(indexOf)return arr.indexOf(obj);for(var i=0;i < arr.length;++i) {if(arr[i] === obj)return i;}return -1;};},{}],24:[function(_dereq_,module,exports){module.exports = Array.isArray || function(arr){return Object.prototype.toString.call(arr) == '[object Array]';};},{}],25:[function(_dereq_,module,exports){ /**
 * Helpers.
 */var s=1000;var m=s * 60;var h=m * 60;var d=h * 24;var y=d * 365.25; /**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */module.exports = function(val,options){options = options || {};if('string' == typeof val)return parse(val);return options.long?long(val):short(val);}; /**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */function parse(str){str = '' + str;if(str.length > 10000)return;var match=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);if(!match)return;var n=parseFloat(match[1]);var type=(match[2] || 'ms').toLowerCase();switch(type){case 'years':case 'year':case 'yrs':case 'yr':case 'y':return n * y;case 'days':case 'day':case 'd':return n * d;case 'hours':case 'hour':case 'hrs':case 'hr':case 'h':return n * h;case 'minutes':case 'minute':case 'mins':case 'min':case 'm':return n * m;case 'seconds':case 'second':case 'secs':case 'sec':case 's':return n * s;case 'milliseconds':case 'millisecond':case 'msecs':case 'msec':case 'ms':return n;}} /**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */function short(ms){if(ms >= d)return Math.round(ms / d) + 'd';if(ms >= h)return Math.round(ms / h) + 'h';if(ms >= m)return Math.round(ms / m) + 'm';if(ms >= s)return Math.round(ms / s) + 's';return ms + 'ms';} /**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */function long(ms){return plural(ms,d,'day') || plural(ms,h,'hour') || plural(ms,m,'minute') || plural(ms,s,'second') || ms + ' ms';} /**
 * Pluralization helper.
 */function plural(ms,n,name){if(ms < n)return;if(ms < n * 1.5)return Math.floor(ms / n) + ' ' + name;return Math.ceil(ms / n) + ' ' + name + 's';}},{}],26:[function(_dereq_,module,exports){(function(global){ /**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */var rvalidchars=/^[\],:{}\s]*$/;var rvalidescape=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;var rvalidtokens=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;var rvalidbraces=/(?:^|:|,)(?:\s*\[)+/g;var rtrimLeft=/^\s+/;var rtrimRight=/\s+$/;module.exports = function parsejson(data){if('string' != typeof data || !data){return null;}data = data.replace(rtrimLeft,'').replace(rtrimRight,''); // Attempt to parse using the native JSON parser first
if(global.JSON && JSON.parse){return JSON.parse(data);}if(rvalidchars.test(data.replace(rvalidescape,'@').replace(rvalidtokens,']').replace(rvalidbraces,''))){return new Function('return ' + data)();}};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],27:[function(_dereq_,module,exports){ /**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */exports.encode = function(obj){var str='';for(var i in obj) {if(obj.hasOwnProperty(i)){if(str.length)str += '&';str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);}}return str;}; /**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */exports.decode = function(qs){var qry={};var pairs=qs.split('&');for(var i=0,l=pairs.length;i < l;i++) {var pair=pairs[i].split('=');qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);}return qry;};},{}],28:[function(_dereq_,module,exports){ /**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */var re=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;var parts=['source','protocol','authority','userInfo','user','password','host','port','relative','path','directory','file','query','anchor'];module.exports = function parseuri(str){var src=str,b=str.indexOf('['),e=str.indexOf(']');if(b != -1 && e != -1){str = str.substring(0,b) + str.substring(b,e).replace(/:/g,';') + str.substring(e,str.length);}var m=re.exec(str || ''),uri={},i=14;while(i--) {uri[parts[i]] = m[i] || '';}if(b != -1 && e != -1){uri.source = src;uri.host = uri.host.substring(1,uri.host.length - 1).replace(/;/g,':');uri.authority = uri.authority.replace('[','').replace(']','').replace(/;/g,':');uri.ipv6uri = true;}return uri;};},{}],29:[function(_dereq_,module,exports){(function(global){ /*! https://mths.be/utf8js v2.0.0 by @mathias */;(function(root){ // Detect free variables `exports`
var freeExports=typeof exports == 'object' && exports; // Detect free variable `module`
var freeModule=typeof module == 'object' && module && module.exports == freeExports && module; // Detect free variable `global`, from Node.js or Browserified code,
// and use it as `root`
var freeGlobal=typeof global == 'object' && global;if(freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal){root = freeGlobal;} /*--------------------------------------------------------------------------*/var stringFromCharCode=String.fromCharCode; // Taken from https://mths.be/punycode
function ucs2decode(string){var output=[];var counter=0;var length=string.length;var value;var extra;while(counter < length) {value = string.charCodeAt(counter++);if(value >= 0xD800 && value <= 0xDBFF && counter < length){ // high surrogate, and there is a next character
extra = string.charCodeAt(counter++);if((extra & 0xFC00) == 0xDC00){ // low surrogate
output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);}else { // unmatched surrogate; only append this code unit, in case the next
// code unit is the high surrogate of a surrogate pair
output.push(value);counter--;}}else {output.push(value);}}return output;} // Taken from https://mths.be/punycode
function ucs2encode(array){var length=array.length;var index=-1;var value;var output='';while(++index < length) {value = array[index];if(value > 0xFFFF){value -= 0x10000;output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);value = 0xDC00 | value & 0x3FF;}output += stringFromCharCode(value);}return output;}function checkScalarValue(codePoint){if(codePoint >= 0xD800 && codePoint <= 0xDFFF){throw Error('Lone surrogate U+' + codePoint.toString(16).toUpperCase() + ' is not a scalar value');}} /*--------------------------------------------------------------------------*/function createByte(codePoint,shift){return stringFromCharCode(codePoint >> shift & 0x3F | 0x80);}function encodeCodePoint(codePoint){if((codePoint & 0xFFFFFF80) == 0){ // 1-byte sequence
return stringFromCharCode(codePoint);}var symbol='';if((codePoint & 0xFFFFF800) == 0){ // 2-byte sequence
symbol = stringFromCharCode(codePoint >> 6 & 0x1F | 0xC0);}else if((codePoint & 0xFFFF0000) == 0){ // 3-byte sequence
checkScalarValue(codePoint);symbol = stringFromCharCode(codePoint >> 12 & 0x0F | 0xE0);symbol += createByte(codePoint,6);}else if((codePoint & 0xFFE00000) == 0){ // 4-byte sequence
symbol = stringFromCharCode(codePoint >> 18 & 0x07 | 0xF0);symbol += createByte(codePoint,12);symbol += createByte(codePoint,6);}symbol += stringFromCharCode(codePoint & 0x3F | 0x80);return symbol;}function utf8encode(string){var codePoints=ucs2decode(string);var length=codePoints.length;var index=-1;var codePoint;var byteString='';while(++index < length) {codePoint = codePoints[index];byteString += encodeCodePoint(codePoint);}return byteString;} /*--------------------------------------------------------------------------*/function readContinuationByte(){if(byteIndex >= byteCount){throw Error('Invalid byte index');}var continuationByte=byteArray[byteIndex] & 0xFF;byteIndex++;if((continuationByte & 0xC0) == 0x80){return continuationByte & 0x3F;} // If we end up here, it’s not a continuation byte
throw Error('Invalid continuation byte');}function decodeSymbol(){var byte1;var byte2;var byte3;var byte4;var codePoint;if(byteIndex > byteCount){throw Error('Invalid byte index');}if(byteIndex == byteCount){return false;} // Read first byte
byte1 = byteArray[byteIndex] & 0xFF;byteIndex++; // 1-byte sequence (no continuation bytes)
if((byte1 & 0x80) == 0){return byte1;} // 2-byte sequence
if((byte1 & 0xE0) == 0xC0){var byte2=readContinuationByte();codePoint = (byte1 & 0x1F) << 6 | byte2;if(codePoint >= 0x80){return codePoint;}else {throw Error('Invalid continuation byte');}} // 3-byte sequence (may include unpaired surrogates)
if((byte1 & 0xF0) == 0xE0){byte2 = readContinuationByte();byte3 = readContinuationByte();codePoint = (byte1 & 0x0F) << 12 | byte2 << 6 | byte3;if(codePoint >= 0x0800){checkScalarValue(codePoint);return codePoint;}else {throw Error('Invalid continuation byte');}} // 4-byte sequence
if((byte1 & 0xF8) == 0xF0){byte2 = readContinuationByte();byte3 = readContinuationByte();byte4 = readContinuationByte();codePoint = (byte1 & 0x0F) << 0x12 | byte2 << 0x0C | byte3 << 0x06 | byte4;if(codePoint >= 0x010000 && codePoint <= 0x10FFFF){return codePoint;}}throw Error('Invalid UTF-8 detected');}var byteArray;var byteCount;var byteIndex;function utf8decode(byteString){byteArray = ucs2decode(byteString);byteCount = byteArray.length;byteIndex = 0;var codePoints=[];var tmp;while((tmp = decodeSymbol()) !== false) {codePoints.push(tmp);}return ucs2encode(codePoints);} /*--------------------------------------------------------------------------*/var utf8={'version':'2.0.0','encode':utf8encode,'decode':utf8decode}; // Some AMD build optimizers, like r.js, check for specific condition patterns
// like the following:
if(typeof define == 'function' && typeof define.amd == 'object' && define.amd){define(function(){return utf8;});}else if(freeExports && !freeExports.nodeType){if(freeModule){ // in Node.js or RingoJS v0.8.0+
freeModule.exports = utf8;}else { // in Narwhal or RingoJS v0.7.0-
var object={};var hasOwnProperty=object.hasOwnProperty;for(var key in utf8) {hasOwnProperty.call(utf8,key) && (freeExports[key] = utf8[key]);}}}else { // in Rhino or a web browser
root.utf8 = utf8;}})(this);}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],30:[function(_dereq_,module,exports){'use strict';var alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''),length=64,map={},seed=0,i=0,prev; /**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */function encode(num){var encoded='';do {encoded = alphabet[num % length] + encoded;num = Math.floor(num / length);}while(num > 0);return encoded;} /**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */function decode(str){var decoded=0;for(i = 0;i < str.length;i++) {decoded = decoded * length + map[str.charAt(i)];}return decoded;} /**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */function yeast(){var now=encode(+new Date());if(now !== prev)return seed = 0,prev = now;return now + '.' + encode(seed++);} //
// Map each character to its index.
//
for(;i < length;i++) map[alphabet[i]] = i; //
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;yeast.decode = decode;module.exports = yeast;},{}],31:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var url=_dereq_('./url');var parser=_dereq_('socket.io-parser');var Manager=_dereq_('./manager');var debug=_dereq_('debug')('socket.io-client'); /**
 * Module exports.
 */module.exports = exports = lookup; /**
 * Managers cache.
 */var cache=exports.managers = {}; /**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */function lookup(uri,opts){if(typeof uri == 'object'){opts = uri;uri = undefined;}opts = opts || {};var parsed=url(uri);var source=parsed.source;var id=parsed.id;var path=parsed.path;var sameNamespace=cache[id] && path in cache[id].nsps;var newConnection=opts.forceNew || opts['force new connection'] || false === opts.multiplex || sameNamespace;var io;if(newConnection){debug('ignoring socket cache for %s',source);io = Manager(source,opts);}else {if(!cache[id]){debug('new io instance for %s',source);cache[id] = Manager(source,opts);}io = cache[id];}return io.socket(parsed.path);} /**
 * Protocol version.
 *
 * @api public
 */exports.protocol = parser.protocol; /**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */exports.connect = lookup; /**
 * Expose constructors for standalone build.
 *
 * @api public
 */exports.Manager = _dereq_('./manager');exports.Socket = _dereq_('./socket');},{"./manager":32,"./socket":34,"./url":35,"debug":39,"socket.io-parser":47}],32:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var eio=_dereq_('engine.io-client');var Socket=_dereq_('./socket');var Emitter=_dereq_('component-emitter');var parser=_dereq_('socket.io-parser');var on=_dereq_('./on');var bind=_dereq_('component-bind');var debug=_dereq_('debug')('socket.io-client:manager');var indexOf=_dereq_('indexof');var Backoff=_dereq_('backo2'); /**
 * IE6+ hasOwnProperty
 */var has=Object.prototype.hasOwnProperty; /**
 * Module exports
 */module.exports = Manager; /**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */function Manager(uri,opts){if(!(this instanceof Manager))return new Manager(uri,opts);if(uri && 'object' == typeof uri){opts = uri;uri = undefined;}opts = opts || {};opts.path = opts.path || '/socket.io';this.nsps = {};this.subs = [];this.opts = opts;this.reconnection(opts.reconnection !== false);this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);this.reconnectionDelay(opts.reconnectionDelay || 1000);this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);this.randomizationFactor(opts.randomizationFactor || 0.5);this.backoff = new Backoff({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()});this.timeout(null == opts.timeout?20000:opts.timeout);this.readyState = 'closed';this.uri = uri;this.connecting = [];this.lastPing = null;this.encoding = false;this.packetBuffer = [];this.encoder = new parser.Encoder();this.decoder = new parser.Decoder();this.autoConnect = opts.autoConnect !== false;if(this.autoConnect)this.open();} /**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */Manager.prototype.emitAll = function(){this.emit.apply(this,arguments);for(var nsp in this.nsps) {if(has.call(this.nsps,nsp)){this.nsps[nsp].emit.apply(this.nsps[nsp],arguments);}}}; /**
 * Update `socket.id` of all sockets
 *
 * @api private
 */Manager.prototype.updateSocketIds = function(){for(var nsp in this.nsps) {if(has.call(this.nsps,nsp)){this.nsps[nsp].id = this.engine.id;}}}; /**
 * Mix in `Emitter`.
 */Emitter(Manager.prototype); /**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.reconnection = function(v){if(!arguments.length)return this._reconnection;this._reconnection = !!v;return this;}; /**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.reconnectionAttempts = function(v){if(!arguments.length)return this._reconnectionAttempts;this._reconnectionAttempts = v;return this;}; /**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.reconnectionDelay = function(v){if(!arguments.length)return this._reconnectionDelay;this._reconnectionDelay = v;this.backoff && this.backoff.setMin(v);return this;};Manager.prototype.randomizationFactor = function(v){if(!arguments.length)return this._randomizationFactor;this._randomizationFactor = v;this.backoff && this.backoff.setJitter(v);return this;}; /**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.reconnectionDelayMax = function(v){if(!arguments.length)return this._reconnectionDelayMax;this._reconnectionDelayMax = v;this.backoff && this.backoff.setMax(v);return this;}; /**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.timeout = function(v){if(!arguments.length)return this._timeout;this._timeout = v;return this;}; /**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */Manager.prototype.maybeReconnectOnOpen = function(){ // Only try to reconnect if it's the first time we're connecting
if(!this.reconnecting && this._reconnection && this.backoff.attempts === 0){ // keeps reconnection from firing twice for the same reconnection loop
this.reconnect();}}; /**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */Manager.prototype.open = Manager.prototype.connect = function(fn){debug('readyState %s',this.readyState);if(~this.readyState.indexOf('open'))return this;debug('opening %s',this.uri);this.engine = eio(this.uri,this.opts);var socket=this.engine;var self=this;this.readyState = 'opening';this.skipReconnect = false; // emit `open`
var openSub=on(socket,'open',function(){self.onopen();fn && fn();}); // emit `connect_error`
var errorSub=on(socket,'error',function(data){debug('connect_error');self.cleanup();self.readyState = 'closed';self.emitAll('connect_error',data);if(fn){var err=new Error('Connection error');err.data = data;fn(err);}else { // Only do this if there is no fn to handle the error
self.maybeReconnectOnOpen();}}); // emit `connect_timeout`
if(false !== this._timeout){var timeout=this._timeout;debug('connect attempt will timeout after %d',timeout); // set timer
var timer=setTimeout(function(){debug('connect attempt timed out after %d',timeout);openSub.destroy();socket.close();socket.emit('error','timeout');self.emitAll('connect_timeout',timeout);},timeout);this.subs.push({destroy:function destroy(){clearTimeout(timer);}});}this.subs.push(openSub);this.subs.push(errorSub);return this;}; /**
 * Called upon transport open.
 *
 * @api private
 */Manager.prototype.onopen = function(){debug('open'); // clear old subs
this.cleanup(); // mark as open
this.readyState = 'open';this.emit('open'); // add new subs
var socket=this.engine;this.subs.push(on(socket,'data',bind(this,'ondata')));this.subs.push(on(socket,'ping',bind(this,'onping')));this.subs.push(on(socket,'pong',bind(this,'onpong')));this.subs.push(on(socket,'error',bind(this,'onerror')));this.subs.push(on(socket,'close',bind(this,'onclose')));this.subs.push(on(this.decoder,'decoded',bind(this,'ondecoded')));}; /**
 * Called upon a ping.
 *
 * @api private
 */Manager.prototype.onping = function(){this.lastPing = new Date();this.emitAll('ping');}; /**
 * Called upon a packet.
 *
 * @api private
 */Manager.prototype.onpong = function(){this.emitAll('pong',new Date() - this.lastPing);}; /**
 * Called with data.
 *
 * @api private
 */Manager.prototype.ondata = function(data){this.decoder.add(data);}; /**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */Manager.prototype.ondecoded = function(packet){this.emit('packet',packet);}; /**
 * Called upon socket error.
 *
 * @api private
 */Manager.prototype.onerror = function(err){debug('error',err);this.emitAll('error',err);}; /**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */Manager.prototype.socket = function(nsp){var socket=this.nsps[nsp];if(!socket){socket = new Socket(this,nsp);this.nsps[nsp] = socket;var self=this;socket.on('connecting',onConnecting);socket.on('connect',function(){socket.id = self.engine.id;});if(this.autoConnect){ // manually call here since connecting evnet is fired before listening
onConnecting();}}function onConnecting(){if(! ~indexOf(self.connecting,socket)){self.connecting.push(socket);}}return socket;}; /**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */Manager.prototype.destroy = function(socket){var index=indexOf(this.connecting,socket);if(~index)this.connecting.splice(index,1);if(this.connecting.length)return;this.close();}; /**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */Manager.prototype.packet = function(packet){debug('writing packet %j',packet);var self=this;if(!self.encoding){ // encode, then write to engine with result
self.encoding = true;this.encoder.encode(packet,function(encodedPackets){for(var i=0;i < encodedPackets.length;i++) {self.engine.write(encodedPackets[i],packet.options);}self.encoding = false;self.processPacketQueue();});}else { // add packet to the queue
self.packetBuffer.push(packet);}}; /**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */Manager.prototype.processPacketQueue = function(){if(this.packetBuffer.length > 0 && !this.encoding){var pack=this.packetBuffer.shift();this.packet(pack);}}; /**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */Manager.prototype.cleanup = function(){debug('cleanup');var sub;while(sub = this.subs.shift()) sub.destroy();this.packetBuffer = [];this.encoding = false;this.lastPing = null;this.decoder.destroy();}; /**
 * Close the current socket.
 *
 * @api private
 */Manager.prototype.close = Manager.prototype.disconnect = function(){debug('disconnect');this.skipReconnect = true;this.reconnecting = false;if('opening' == this.readyState){ // `onclose` will not fire because
// an open event never happened
this.cleanup();}this.backoff.reset();this.readyState = 'closed';if(this.engine)this.engine.close();}; /**
 * Called upon engine close.
 *
 * @api private
 */Manager.prototype.onclose = function(reason){debug('onclose');this.cleanup();this.backoff.reset();this.readyState = 'closed';this.emit('close',reason);if(this._reconnection && !this.skipReconnect){this.reconnect();}}; /**
 * Attempt a reconnection.
 *
 * @api private
 */Manager.prototype.reconnect = function(){if(this.reconnecting || this.skipReconnect)return this;var self=this;if(this.backoff.attempts >= this._reconnectionAttempts){debug('reconnect failed');this.backoff.reset();this.emitAll('reconnect_failed');this.reconnecting = false;}else {var delay=this.backoff.duration();debug('will wait %dms before reconnect attempt',delay);this.reconnecting = true;var timer=setTimeout(function(){if(self.skipReconnect)return;debug('attempting reconnect');self.emitAll('reconnect_attempt',self.backoff.attempts);self.emitAll('reconnecting',self.backoff.attempts); // check again for the case socket closed in above events
if(self.skipReconnect)return;self.open(function(err){if(err){debug('reconnect attempt error');self.reconnecting = false;self.reconnect();self.emitAll('reconnect_error',err.data);}else {debug('reconnect success');self.onreconnect();}});},delay);this.subs.push({destroy:function destroy(){clearTimeout(timer);}});}}; /**
 * Called upon successful reconnect.
 *
 * @api private
 */Manager.prototype.onreconnect = function(){var attempt=this.backoff.attempts;this.reconnecting = false;this.backoff.reset();this.updateSocketIds();this.emitAll('reconnect',attempt);};},{"./on":33,"./socket":34,"backo2":36,"component-bind":37,"component-emitter":38,"debug":39,"engine.io-client":1,"indexof":42,"socket.io-parser":47}],33:[function(_dereq_,module,exports){ /**
 * Module exports.
 */module.exports = on; /**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */function on(obj,ev,fn){obj.on(ev,fn);return {destroy:function destroy(){obj.removeListener(ev,fn);}};}},{}],34:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var parser=_dereq_('socket.io-parser');var Emitter=_dereq_('component-emitter');var toArray=_dereq_('to-array');var on=_dereq_('./on');var bind=_dereq_('component-bind');var debug=_dereq_('debug')('socket.io-client:socket');var hasBin=_dereq_('has-binary'); /**
 * Module exports.
 */module.exports = exports = Socket; /**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */var events={connect:1,connect_error:1,connect_timeout:1,connecting:1,disconnect:1,error:1,reconnect:1,reconnect_attempt:1,reconnect_failed:1,reconnect_error:1,reconnecting:1,ping:1,pong:1}; /**
 * Shortcut to `Emitter#emit`.
 */var emit=Emitter.prototype.emit; /**
 * `Socket` constructor.
 *
 * @api public
 */function Socket(io,nsp){this.io = io;this.nsp = nsp;this.json = this; // compat
this.ids = 0;this.acks = {};this.receiveBuffer = [];this.sendBuffer = [];this.connected = false;this.disconnected = true;if(this.io.autoConnect)this.open();} /**
 * Mix in `Emitter`.
 */Emitter(Socket.prototype); /**
 * Subscribe to open, close and packet events
 *
 * @api private
 */Socket.prototype.subEvents = function(){if(this.subs)return;var io=this.io;this.subs = [on(io,'open',bind(this,'onopen')),on(io,'packet',bind(this,'onpacket')),on(io,'close',bind(this,'onclose'))];}; /**
 * "Opens" the socket.
 *
 * @api public
 */Socket.prototype.open = Socket.prototype.connect = function(){if(this.connected)return this;this.subEvents();this.io.open(); // ensure open
if('open' == this.io.readyState)this.onopen();this.emit('connecting');return this;}; /**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */Socket.prototype.send = function(){var args=toArray(arguments);args.unshift('message');this.emit.apply(this,args);return this;}; /**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */Socket.prototype.emit = function(ev){if(events.hasOwnProperty(ev)){emit.apply(this,arguments);return this;}var args=toArray(arguments);var parserType=parser.EVENT; // default
if(hasBin(args)){parserType = parser.BINARY_EVENT;} // binary
var packet={type:parserType,data:args};packet.options = {};packet.options.compress = !this.flags || false !== this.flags.compress; // event ack callback
if('function' == typeof args[args.length - 1]){debug('emitting packet with ack id %d',this.ids);this.acks[this.ids] = args.pop();packet.id = this.ids++;}if(this.connected){this.packet(packet);}else {this.sendBuffer.push(packet);}delete this.flags;return this;}; /**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */Socket.prototype.packet = function(packet){packet.nsp = this.nsp;this.io.packet(packet);}; /**
 * Called upon engine `open`.
 *
 * @api private
 */Socket.prototype.onopen = function(){debug('transport is open - connecting'); // write connect packet if necessary
if('/' != this.nsp){this.packet({type:parser.CONNECT});}}; /**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */Socket.prototype.onclose = function(reason){debug('close (%s)',reason);this.connected = false;this.disconnected = true;delete this.id;this.emit('disconnect',reason);}; /**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */Socket.prototype.onpacket = function(packet){if(packet.nsp != this.nsp)return;switch(packet.type){case parser.CONNECT:this.onconnect();break;case parser.EVENT:this.onevent(packet);break;case parser.BINARY_EVENT:this.onevent(packet);break;case parser.ACK:this.onack(packet);break;case parser.BINARY_ACK:this.onack(packet);break;case parser.DISCONNECT:this.ondisconnect();break;case parser.ERROR:this.emit('error',packet.data);break;}}; /**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */Socket.prototype.onevent = function(packet){var args=packet.data || [];debug('emitting event %j',args);if(null != packet.id){debug('attaching ack callback to event');args.push(this.ack(packet.id));}if(this.connected){emit.apply(this,args);}else {this.receiveBuffer.push(args);}}; /**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */Socket.prototype.ack = function(id){var self=this;var sent=false;return function(){ // prevent double callbacks
if(sent)return;sent = true;var args=toArray(arguments);debug('sending ack %j',args);var type=hasBin(args)?parser.BINARY_ACK:parser.ACK;self.packet({type:type,id:id,data:args});};}; /**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */Socket.prototype.onack = function(packet){var ack=this.acks[packet.id];if('function' == typeof ack){debug('calling ack %s with %j',packet.id,packet.data);ack.apply(this,packet.data);delete this.acks[packet.id];}else {debug('bad ack %s',packet.id);}}; /**
 * Called upon server connect.
 *
 * @api private
 */Socket.prototype.onconnect = function(){this.connected = true;this.disconnected = false;this.emit('connect');this.emitBuffered();}; /**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */Socket.prototype.emitBuffered = function(){var i;for(i = 0;i < this.receiveBuffer.length;i++) {emit.apply(this,this.receiveBuffer[i]);}this.receiveBuffer = [];for(i = 0;i < this.sendBuffer.length;i++) {this.packet(this.sendBuffer[i]);}this.sendBuffer = [];}; /**
 * Called upon server disconnect.
 *
 * @api private
 */Socket.prototype.ondisconnect = function(){debug('server disconnect (%s)',this.nsp);this.destroy();this.onclose('io server disconnect');}; /**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */Socket.prototype.destroy = function(){if(this.subs){ // clean subscriptions to avoid reconnections
for(var i=0;i < this.subs.length;i++) {this.subs[i].destroy();}this.subs = null;}this.io.destroy(this);}; /**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */Socket.prototype.close = Socket.prototype.disconnect = function(){if(this.connected){debug('performing disconnect (%s)',this.nsp);this.packet({type:parser.DISCONNECT});} // remove socket from pool
this.destroy();if(this.connected){ // fire events
this.onclose('io client disconnect');}return this;}; /**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */Socket.prototype.compress = function(compress){this.flags = this.flags || {};this.flags.compress = compress;return this;};},{"./on":33,"component-bind":37,"component-emitter":38,"debug":39,"has-binary":41,"socket.io-parser":47,"to-array":51}],35:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies.
 */var parseuri=_dereq_('parseuri');var debug=_dereq_('debug')('socket.io-client:url'); /**
 * Module exports.
 */module.exports = url; /**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */function url(uri,loc){var obj=uri; // default to window.location
var loc=loc || global.location;if(null == uri)uri = loc.protocol + '//' + loc.host; // relative path support
if('string' == typeof uri){if('/' == uri.charAt(0)){if('/' == uri.charAt(1)){uri = loc.protocol + uri;}else {uri = loc.host + uri;}}if(!/^(https?|wss?):\/\//.test(uri)){debug('protocol-less url %s',uri);if('undefined' != typeof loc){uri = loc.protocol + '//' + uri;}else {uri = 'https://' + uri;}} // parse
debug('parse %s',uri);obj = parseuri(uri);} // make sure we treat `localhost:80` and `localhost` equally
if(!obj.port){if(/^(http|ws)$/.test(obj.protocol)){obj.port = '80';}else if(/^(http|ws)s$/.test(obj.protocol)){obj.port = '443';}}obj.path = obj.path || '/';var ipv6=obj.host.indexOf(':') !== -1;var host=ipv6?'[' + obj.host + ']':obj.host; // define unique id
obj.id = obj.protocol + '://' + host + ':' + obj.port; // define href
obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port?'':':' + obj.port);return obj;}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"debug":39,"parseuri":45}],36:[function(_dereq_,module,exports){ /**
 * Expose `Backoff`.
 */module.exports = Backoff; /**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */function Backoff(opts){opts = opts || {};this.ms = opts.min || 100;this.max = opts.max || 10000;this.factor = opts.factor || 2;this.jitter = opts.jitter > 0 && opts.jitter <= 1?opts.jitter:0;this.attempts = 0;} /**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */Backoff.prototype.duration = function(){var ms=this.ms * Math.pow(this.factor,this.attempts++);if(this.jitter){var rand=Math.random();var deviation=Math.floor(rand * this.jitter * ms);ms = (Math.floor(rand * 10) & 1) == 0?ms - deviation:ms + deviation;}return Math.min(ms,this.max) | 0;}; /**
 * Reset the number of attempts.
 *
 * @api public
 */Backoff.prototype.reset = function(){this.attempts = 0;}; /**
 * Set the minimum duration
 *
 * @api public
 */Backoff.prototype.setMin = function(min){this.ms = min;}; /**
 * Set the maximum duration
 *
 * @api public
 */Backoff.prototype.setMax = function(max){this.max = max;}; /**
 * Set the jitter
 *
 * @api public
 */Backoff.prototype.setJitter = function(jitter){this.jitter = jitter;};},{}],37:[function(_dereq_,module,exports){ /**
 * Slice reference.
 */var slice=[].slice; /**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */module.exports = function(obj,fn){if('string' == typeof fn)fn = obj[fn];if('function' != typeof fn)throw new Error('bind() requires a function');var args=slice.call(arguments,2);return function(){return fn.apply(obj,args.concat(slice.call(arguments)));};};},{}],38:[function(_dereq_,module,exports){ /**
 * Expose `Emitter`.
 */module.exports = Emitter; /**
 * Initialize a new `Emitter`.
 *
 * @api public
 */function Emitter(obj){if(obj)return mixin(obj);}; /**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */function mixin(obj){for(var key in Emitter.prototype) {obj[key] = Emitter.prototype[key];}return obj;} /**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.on = Emitter.prototype.addEventListener = function(event,fn){this._callbacks = this._callbacks || {};(this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);return this;}; /**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.once = function(event,fn){function on(){this.off(event,on);fn.apply(this,arguments);}on.fn = fn;this.on(event,on);return this;}; /**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event,fn){this._callbacks = this._callbacks || {}; // all
if(0 == arguments.length){this._callbacks = {};return this;} // specific event
var callbacks=this._callbacks['$' + event];if(!callbacks)return this; // remove all handlers
if(1 == arguments.length){delete this._callbacks['$' + event];return this;} // remove specific handler
var cb;for(var i=0;i < callbacks.length;i++) {cb = callbacks[i];if(cb === fn || cb.fn === fn){callbacks.splice(i,1);break;}}return this;}; /**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */Emitter.prototype.emit = function(event){this._callbacks = this._callbacks || {};var args=[].slice.call(arguments,1),callbacks=this._callbacks['$' + event];if(callbacks){callbacks = callbacks.slice(0);for(var i=0,len=callbacks.length;i < len;++i) {callbacks[i].apply(this,args);}}return this;}; /**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */Emitter.prototype.listeners = function(event){this._callbacks = this._callbacks || {};return this._callbacks['$' + event] || [];}; /**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */Emitter.prototype.hasListeners = function(event){return !!this.listeners(event).length;};},{}],39:[function(_dereq_,module,exports){arguments[4][17][0].apply(exports,arguments);},{"./debug":40,"dup":17}],40:[function(_dereq_,module,exports){arguments[4][18][0].apply(exports,arguments);},{"dup":18,"ms":44}],41:[function(_dereq_,module,exports){(function(global){ /*
 * Module requirements.
 */var isArray=_dereq_('isarray'); /**
 * Module exports.
 */module.exports = hasBinary; /**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */function hasBinary(data){function _hasBinary(obj){if(!obj)return false;if(global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File){return true;}if(isArray(obj)){for(var i=0;i < obj.length;i++) {if(_hasBinary(obj[i])){return true;}}}else if(obj && 'object' == typeof obj){ // see: https://github.com/Automattic/has-binary/pull/4
if(obj.toJSON && 'function' == typeof obj.toJSON){obj = obj.toJSON();}for(var key in obj) {if(Object.prototype.hasOwnProperty.call(obj,key) && _hasBinary(obj[key])){return true;}}}return false;}return _hasBinary(data);}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"isarray":43}],42:[function(_dereq_,module,exports){arguments[4][23][0].apply(exports,arguments);},{"dup":23}],43:[function(_dereq_,module,exports){arguments[4][24][0].apply(exports,arguments);},{"dup":24}],44:[function(_dereq_,module,exports){arguments[4][25][0].apply(exports,arguments);},{"dup":25}],45:[function(_dereq_,module,exports){arguments[4][28][0].apply(exports,arguments);},{"dup":28}],46:[function(_dereq_,module,exports){(function(global){ /*global Blob,File*/ /**
 * Module requirements
 */var isArray=_dereq_('isarray');var isBuf=_dereq_('./is-buffer'); /**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */exports.deconstructPacket = function(packet){var buffers=[];var packetData=packet.data;function _deconstructPacket(data){if(!data)return data;if(isBuf(data)){var placeholder={_placeholder:true,num:buffers.length};buffers.push(data);return placeholder;}else if(isArray(data)){var newData=new Array(data.length);for(var i=0;i < data.length;i++) {newData[i] = _deconstructPacket(data[i]);}return newData;}else if('object' == typeof data && !(data instanceof Date)){var newData={};for(var key in data) {newData[key] = _deconstructPacket(data[key]);}return newData;}return data;}var pack=packet;pack.data = _deconstructPacket(packetData);pack.attachments = buffers.length; // number of binary 'attachments'
return {packet:pack,buffers:buffers};}; /**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */exports.reconstructPacket = function(packet,buffers){var curPlaceHolder=0;function _reconstructPacket(data){if(data && data._placeholder){var buf=buffers[data.num]; // appropriate buffer (should be natural order anyway)
return buf;}else if(isArray(data)){for(var i=0;i < data.length;i++) {data[i] = _reconstructPacket(data[i]);}return data;}else if(data && 'object' == typeof data){for(var key in data) {data[key] = _reconstructPacket(data[key]);}return data;}return data;}packet.data = _reconstructPacket(packet.data);packet.attachments = undefined; // no longer useful
return packet;}; /**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */exports.removeBlobs = function(data,callback){function _removeBlobs(obj,curKey,containingObject){if(!obj)return obj; // convert any blob
if(global.Blob && obj instanceof Blob || global.File && obj instanceof File){pendingBlobs++; // async filereader
var fileReader=new FileReader();fileReader.onload = function(){ // this.result == arraybuffer
if(containingObject){containingObject[curKey] = this.result;}else {bloblessData = this.result;} // if nothing pending its callback time
if(! --pendingBlobs){callback(bloblessData);}};fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
}else if(isArray(obj)){ // handle array
for(var i=0;i < obj.length;i++) {_removeBlobs(obj[i],i,obj);}}else if(obj && 'object' == typeof obj && !isBuf(obj)){ // and object
for(var key in obj) {_removeBlobs(obj[key],key,obj);}}}var pendingBlobs=0;var bloblessData=data;_removeBlobs(bloblessData);if(!pendingBlobs){callback(bloblessData);}};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./is-buffer":48,"isarray":43}],47:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var debug=_dereq_('debug')('socket.io-parser');var json=_dereq_('json3');var isArray=_dereq_('isarray');var Emitter=_dereq_('component-emitter');var binary=_dereq_('./binary');var isBuf=_dereq_('./is-buffer'); /**
 * Protocol version.
 *
 * @api public
 */exports.protocol = 4; /**
 * Packet types.
 *
 * @api public
 */exports.types = ['CONNECT','DISCONNECT','EVENT','BINARY_EVENT','ACK','BINARY_ACK','ERROR']; /**
 * Packet type `connect`.
 *
 * @api public
 */exports.CONNECT = 0; /**
 * Packet type `disconnect`.
 *
 * @api public
 */exports.DISCONNECT = 1; /**
 * Packet type `event`.
 *
 * @api public
 */exports.EVENT = 2; /**
 * Packet type `ack`.
 *
 * @api public
 */exports.ACK = 3; /**
 * Packet type `error`.
 *
 * @api public
 */exports.ERROR = 4; /**
 * Packet type 'binary event'
 *
 * @api public
 */exports.BINARY_EVENT = 5; /**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */exports.BINARY_ACK = 6; /**
 * Encoder constructor.
 *
 * @api public
 */exports.Encoder = Encoder; /**
 * Decoder constructor.
 *
 * @api public
 */exports.Decoder = Decoder; /**
 * A socket.io Encoder instance
 *
 * @api public
 */function Encoder(){} /**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */Encoder.prototype.encode = function(obj,callback){debug('encoding packet %j',obj);if(exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type){encodeAsBinary(obj,callback);}else {var encoding=encodeAsString(obj);callback([encoding]);}}; /**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */function encodeAsString(obj){var str='';var nsp=false; // first is type
str += obj.type; // attachments if we have them
if(exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type){str += obj.attachments;str += '-';} // if we have a namespace other than `/`
// we append it followed by a comma `,`
if(obj.nsp && '/' != obj.nsp){nsp = true;str += obj.nsp;} // immediately followed by the id
if(null != obj.id){if(nsp){str += ',';nsp = false;}str += obj.id;} // json data
if(null != obj.data){if(nsp)str += ',';str += json.stringify(obj.data);}debug('encoded %j as %s',obj,str);return str;} /**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */function encodeAsBinary(obj,callback){function writeEncoding(bloblessData){var deconstruction=binary.deconstructPacket(bloblessData);var pack=encodeAsString(deconstruction.packet);var buffers=deconstruction.buffers;buffers.unshift(pack); // add packet info to beginning of data list
callback(buffers); // write all the buffers
}binary.removeBlobs(obj,writeEncoding);} /**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */function Decoder(){this.reconstructor = null;} /**
 * Mix in `Emitter` with Decoder.
 */Emitter(Decoder.prototype); /**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */Decoder.prototype.add = function(obj){var packet;if('string' == typeof obj){packet = decodeString(obj);if(exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type){ // binary packet's json
this.reconstructor = new BinaryReconstructor(packet); // no attachments, labeled binary but no binary data to follow
if(this.reconstructor.reconPack.attachments === 0){this.emit('decoded',packet);}}else { // non-binary full packet
this.emit('decoded',packet);}}else if(isBuf(obj) || obj.base64){ // raw binary data
if(!this.reconstructor){throw new Error('got binary data when not reconstructing a packet');}else {packet = this.reconstructor.takeBinaryData(obj);if(packet){ // received final buffer
this.reconstructor = null;this.emit('decoded',packet);}}}else {throw new Error('Unknown type: ' + obj);}}; /**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */function decodeString(str){var p={};var i=0; // look up type
p.type = Number(str.charAt(0));if(null == exports.types[p.type])return error(); // look up attachments if type binary
if(exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type){var buf='';while(str.charAt(++i) != '-') {buf += str.charAt(i);if(i == str.length)break;}if(buf != Number(buf) || str.charAt(i) != '-'){throw new Error('Illegal attachments');}p.attachments = Number(buf);} // look up namespace (if any)
if('/' == str.charAt(i + 1)){p.nsp = '';while(++i) {var c=str.charAt(i);if(',' == c)break;p.nsp += c;if(i == str.length)break;}}else {p.nsp = '/';} // look up id
var next=str.charAt(i + 1);if('' !== next && Number(next) == next){p.id = '';while(++i) {var c=str.charAt(i);if(null == c || Number(c) != c){--i;break;}p.id += str.charAt(i);if(i == str.length)break;}p.id = Number(p.id);} // look up json data
if(str.charAt(++i)){try{p.data = json.parse(str.substr(i));}catch(e) {return error();}}debug('decoded %s as %j',str,p);return p;} /**
 * Deallocates a parser's resources
 *
 * @api public
 */Decoder.prototype.destroy = function(){if(this.reconstructor){this.reconstructor.finishedReconstruction();}}; /**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */function BinaryReconstructor(packet){this.reconPack = packet;this.buffers = [];} /**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */BinaryReconstructor.prototype.takeBinaryData = function(binData){this.buffers.push(binData);if(this.buffers.length == this.reconPack.attachments){ // done with buffer list
var packet=binary.reconstructPacket(this.reconPack,this.buffers);this.finishedReconstruction();return packet;}return null;}; /**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */BinaryReconstructor.prototype.finishedReconstruction = function(){this.reconPack = null;this.buffers = [];};function error(data){return {type:exports.ERROR,data:'parser error'};}},{"./binary":46,"./is-buffer":48,"component-emitter":49,"debug":39,"isarray":43,"json3":50}],48:[function(_dereq_,module,exports){(function(global){module.exports = isBuf; /**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */function isBuf(obj){return global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer;}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],49:[function(_dereq_,module,exports){arguments[4][15][0].apply(exports,arguments);},{"dup":15}],50:[function(_dereq_,module,exports){(function(global){ /*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */;(function(){ // Detect the `define` function exposed by asynchronous module loaders. The
// strict `define` check is necessary for compatibility with `r.js`.
var isLoader=typeof define === "function" && define.amd; // A set of types used to distinguish objects from primitives.
var objectTypes={"function":true,"object":true}; // Detect the `exports` object exposed by CommonJS implementations.
var freeExports=objectTypes[typeof exports] && exports && !exports.nodeType && exports; // Use the `global` object exposed by Node (including Browserify via
// `insert-module-globals`), Narwhal, and Ringo as the default context,
// and the `window` object in browsers. Rhino exports a `global` function
// instead.
var root=objectTypes[typeof window] && window || this,freeGlobal=freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;if(freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)){root = freeGlobal;} // Public: Initializes JSON 3 using the given `context` object, attaching the
// `stringify` and `parse` functions to the specified `exports` object.
function runInContext(context,exports){context || (context = root["Object"]());exports || (exports = root["Object"]()); // Native constructor aliases.
var Number=context["Number"] || root["Number"],String=context["String"] || root["String"],Object=context["Object"] || root["Object"],Date=context["Date"] || root["Date"],SyntaxError=context["SyntaxError"] || root["SyntaxError"],TypeError=context["TypeError"] || root["TypeError"],Math=context["Math"] || root["Math"],nativeJSON=context["JSON"] || root["JSON"]; // Delegate to the native `stringify` and `parse` implementations.
if(typeof nativeJSON == "object" && nativeJSON){exports.stringify = nativeJSON.stringify;exports.parse = nativeJSON.parse;} // Convenience aliases.
var objectProto=Object.prototype,getClass=objectProto.toString,isProperty,forEach,undef; // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
var isExtended=new Date(-3509827334573292);try{ // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
// results for certain dates in Opera >= 10.53.
isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&  // Safari < 2.0.2 stores the internal millisecond time value correctly,
// but clips the values returned by the date methods to the range of
// signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;}catch(exception) {} // Internal: Determines whether the native `JSON.stringify` and `parse`
// implementations are spec-compliant. Based on work by Ken Snyder.
function has(name){if(has[name] !== undef){ // Return cached feature test result.
return has[name];}var isSupported;if(name == "bug-string-char-index"){ // IE <= 7 doesn't support accessing string characters using square
// bracket notation. IE 8 only supports this for primitives.
isSupported = "a"[0] != "a";}else if(name == "json"){ // Indicates whether both `JSON.stringify` and `JSON.parse` are
// supported.
isSupported = has("json-stringify") && has("json-parse");}else {var value,serialized="{\"a\":[1,true,false,null,\"\\u0000\\b\\n\\f\\r\\t\"]}"; // Test `JSON.stringify`.
if(name == "json-stringify"){var stringify=exports.stringify,stringifySupported=typeof stringify == "function" && isExtended;if(stringifySupported){ // A test function object with a custom `toJSON` method.
(value = function(){return 1;}).toJSON = value;try{stringifySupported =  // Firefox 3.1b1 and b2 serialize string, number, and boolean
// primitives as object literals.
stringify(0) === "0" &&  // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
// literals.
stringify(new Number()) === "0" && stringify(new String()) == '""' &&  // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
// does not define a canonical JSON representation (this applies to
// objects with `toJSON` properties as well, *unless* they are nested
// within an object or array).
stringify(getClass) === undef &&  // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
// FF 3.1b3 pass this test.
stringify(undef) === undef &&  // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
// respectively, if the value is omitted entirely.
stringify() === undef &&  // FF 3.1b1, 2 throw an error if the given value is not a number,
// string, array, object, Boolean, or `null` literal. This applies to
// objects with custom `toJSON` methods as well, unless they are nested
// inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
// methods entirely.
stringify(value) === "1" && stringify([value]) == "[1]" &&  // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
// `"[null]"`.
stringify([undef]) == "[null]" &&  // YUI 3.0.0b1 fails to serialize `null` literals.
stringify(null) == "null" &&  // FF 3.1b1, 2 halts serialization if an array contains a function:
// `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
// elides non-JSON values from objects and arrays, unless they
// define custom `toJSON` methods.
stringify([undef,getClass,null]) == "[null,null,null]" &&  // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
// where character escape codes are expected (e.g., `\b` => `\u0008`).
stringify({"a":[value,true,false,null,"\x00\b\n\f\r\t"]}) == serialized &&  // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
stringify(null,value) === "1" && stringify([1,2],null,1) == "[\n 1,\n 2\n]" &&  // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
// serialize extended years.
stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&  // The milliseconds are optional in ES 5, but required in 5.1.
stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&  // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
// four-digit years instead of six-digit years. Credits: @Yaffle.
stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&  // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
// values less than 1000. Credits: @Yaffle.
stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';}catch(exception) {stringifySupported = false;}}isSupported = stringifySupported;} // Test `JSON.parse`.
if(name == "json-parse"){var parse=exports.parse;if(typeof parse == "function"){try{ // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
// Conforming implementations should also coerce the initial argument to
// a string prior to parsing.
if(parse("0") === 0 && !parse(false)){ // Simple parsing test.
value = parse(serialized);var parseSupported=value["a"].length == 5 && value["a"][0] === 1;if(parseSupported){try{ // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
parseSupported = !parse('"\t"');}catch(exception) {}if(parseSupported){try{ // FF 4.0 and 4.0.1 allow leading `+` signs and leading
// decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
// certain octal literals.
parseSupported = parse("01") !== 1;}catch(exception) {}}if(parseSupported){try{ // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
// points. These environments, along with FF 3.1b1 and 2,
// also allow trailing commas in JSON objects and arrays.
parseSupported = parse("1.") !== 1;}catch(exception) {}}}}}catch(exception) {parseSupported = false;}}isSupported = parseSupported;}}return has[name] = !!isSupported;}if(!has("json")){ // Common `[[Class]]` name aliases.
var functionClass="[object Function]",dateClass="[object Date]",numberClass="[object Number]",stringClass="[object String]",arrayClass="[object Array]",booleanClass="[object Boolean]"; // Detect incomplete support for accessing string characters by index.
var charIndexBuggy=has("bug-string-char-index"); // Define additional utility methods if the `Date` methods are buggy.
if(!isExtended){var floor=Math.floor; // A mapping between the months of the year and the number of days between
// January 1st and the first of the respective month.
var Months=[0,31,59,90,120,151,181,212,243,273,304,334]; // Internal: Calculates the number of days between the Unix epoch and the
// first day of the given month.
var getDay=function getDay(year,month){return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);};} // Internal: Determines if a property is a direct property of the given
// object. Delegates to the native `Object#hasOwnProperty` method.
if(!(isProperty = objectProto.hasOwnProperty)){isProperty = function(property){var members={},constructor;if((members.__proto__ = null,members.__proto__ = { // The *proto* property cannot be set multiple times in recent
// versions of Firefox and SeaMonkey.
"toString":1},members).toString != getClass){ // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
// supports the mutable *proto* property.
isProperty = function(property){ // Capture and break the object's prototype chain (see section 8.6.2
// of the ES 5.1 spec). The parenthesized expression prevents an
// unsafe transformation by the Closure Compiler.
var original=this.__proto__,result=(property in (this.__proto__ = null,this)); // Restore the original prototype chain.
this.__proto__ = original;return result;};}else { // Capture a reference to the top-level `Object` constructor.
constructor = members.constructor; // Use the `constructor` property to simulate `Object#hasOwnProperty` in
// other environments.
isProperty = function(property){var parent=(this.constructor || constructor).prototype;return property in this && !(property in parent && this[property] === parent[property]);};}members = null;return isProperty.call(this,property);};} // Internal: Normalizes the `for...in` iteration algorithm across
// environments. Each enumerated key is yielded to a `callback` function.
forEach = function(object,callback){var size=0,Properties,members,property; // Tests for bugs in the current environment's `for...in` algorithm. The
// `valueOf` property inherits the non-enumerable flag from
// `Object.prototype` in older versions of IE, Netscape, and Mozilla.
(Properties = function(){this.valueOf = 0;}).prototype.valueOf = 0; // Iterate over a new instance of the `Properties` class.
members = new Properties();for(property in members) { // Ignore all properties inherited from `Object.prototype`.
if(isProperty.call(members,property)){size++;}}Properties = members = null; // Normalize the iteration algorithm.
if(!size){ // A list of non-enumerable properties inherited from `Object.prototype`.
members = ["valueOf","toString","toLocaleString","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"]; // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
// properties.
forEach = function(object,callback){var isFunction=getClass.call(object) == functionClass,property,length;var hasProperty=!isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;for(property in object) { // Gecko <= 1.0 enumerates the `prototype` property of functions under
// certain conditions; IE does not.
if(!(isFunction && property == "prototype") && hasProperty.call(object,property)){callback(property);}} // Manually invoke the callback for each non-enumerable property.
for(length = members.length;property = members[--length];hasProperty.call(object,property) && callback(property));};}else if(size == 2){ // Safari <= 2.0.4 enumerates shadowed properties twice.
forEach = function(object,callback){ // Create a set of iterated properties.
var members={},isFunction=getClass.call(object) == functionClass,property;for(property in object) { // Store each property name to prevent double enumeration. The
// `prototype` property of functions is not enumerated due to cross-
// environment inconsistencies.
if(!(isFunction && property == "prototype") && !isProperty.call(members,property) && (members[property] = 1) && isProperty.call(object,property)){callback(property);}}};}else { // No bugs detected; use the standard `for...in` algorithm.
forEach = function(object,callback){var isFunction=getClass.call(object) == functionClass,property,isConstructor;for(property in object) {if(!(isFunction && property == "prototype") && isProperty.call(object,property) && !(isConstructor = property === "constructor")){callback(property);}} // Manually invoke the callback for the `constructor` property due to
// cross-environment inconsistencies.
if(isConstructor || isProperty.call(object,property = "constructor")){callback(property);}};}return forEach(object,callback);}; // Public: Serializes a JavaScript `value` as a JSON string. The optional
// `filter` argument may specify either a function that alters how object and
// array members are serialized, or an array of strings and numbers that
// indicates which properties should be serialized. The optional `width`
// argument may be either a string or number that specifies the indentation
// level of the output.
if(!has("json-stringify")){ // Internal: A map of control characters and their escaped equivalents.
var Escapes={92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"}; // Internal: Converts `value` into a zero-padded string such that its
// length is at least equal to `width`. The `width` must be <= 6.
var leadingZeroes="000000";var toPaddedString=function toPaddedString(width,value){ // The `|| 0` expression is necessary to work around a bug in
// Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
return (leadingZeroes + (value || 0)).slice(-width);}; // Internal: Double-quotes a string `value`, replacing all ASCII control
// characters (characters with code unit values between 0 and 31) with
// their escaped equivalents. This is an implementation of the
// `Quote(value)` operation defined in ES 5.1 section 15.12.3.
var unicodePrefix="\\u00";var quote=function quote(value){var result='"',index=0,length=value.length,useCharIndex=!charIndexBuggy || length > 10;var symbols=useCharIndex && (charIndexBuggy?value.split(""):value);for(;index < length;index++) {var charCode=value.charCodeAt(index); // If the character is a control character, append its Unicode or
// shorthand escape sequence; otherwise, append the character as-is.
switch(charCode){case 8:case 9:case 10:case 12:case 13:case 34:case 92:result += Escapes[charCode];break;default:if(charCode < 32){result += unicodePrefix + toPaddedString(2,charCode.toString(16));break;}result += useCharIndex?symbols[index]:value.charAt(index);}}return result + '"';}; // Internal: Recursively serializes an object. Implements the
// `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
var serialize=function serialize(property,object,callback,properties,whitespace,indentation,stack){var value,className,year,month,date,time,hours,minutes,seconds,milliseconds,results,element,index,length,prefix,result;try{ // Necessary for host object support.
value = object[property];}catch(exception) {}if(typeof value == "object" && value){className = getClass.call(value);if(className == dateClass && !isProperty.call(value,"toJSON")){if(value > -1 / 0 && value < 1 / 0){ // Dates are serialized according to the `Date#toJSON` method
// specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
// for the ISO 8601 date time string format.
if(getDay){ // Manually compute the year, month, date, hours, minutes,
// seconds, and milliseconds if the `getUTC*` methods are
// buggy. Adapted from @Yaffle's `date-shim` project.
date = floor(value / 864e5);for(year = floor(date / 365.2425) + 1970 - 1;getDay(year + 1,0) <= date;year++);for(month = floor((date - getDay(year,0)) / 30.42);getDay(year,month + 1) <= date;month++);date = 1 + date - getDay(year,month); // The `time` value specifies the time within the day (see ES
// 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
// to compute `A modulo B`, as the `%` operator does not
// correspond to the `modulo` operation for negative numbers.
time = (value % 864e5 + 864e5) % 864e5; // The hours, minutes, seconds, and milliseconds are obtained by
// decomposing the time within the day. See section 15.9.1.10.
hours = floor(time / 36e5) % 24;minutes = floor(time / 6e4) % 60;seconds = floor(time / 1e3) % 60;milliseconds = time % 1e3;}else {year = value.getUTCFullYear();month = value.getUTCMonth();date = value.getUTCDate();hours = value.getUTCHours();minutes = value.getUTCMinutes();seconds = value.getUTCSeconds();milliseconds = value.getUTCMilliseconds();} // Serialize extended years correctly.
value = (year <= 0 || year >= 1e4?(year < 0?"-":"+") + toPaddedString(6,year < 0?-year:year):toPaddedString(4,year)) + "-" + toPaddedString(2,month + 1) + "-" + toPaddedString(2,date) +  // Months, dates, hours, minutes, and seconds should have two
// digits; milliseconds should have three.
"T" + toPaddedString(2,hours) + ":" + toPaddedString(2,minutes) + ":" + toPaddedString(2,seconds) +  // Milliseconds are optional in ES 5.0, but required in 5.1.
"." + toPaddedString(3,milliseconds) + "Z";}else {value = null;}}else if(typeof value.toJSON == "function" && (className != numberClass && className != stringClass && className != arrayClass || isProperty.call(value,"toJSON"))){ // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
// `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
// ignores all `toJSON` methods on these objects unless they are
// defined directly on an instance.
value = value.toJSON(property);}}if(callback){ // If a replacement function was provided, call it to obtain the value
// for serialization.
value = callback.call(object,property,value);}if(value === null){return "null";}className = getClass.call(value);if(className == booleanClass){ // Booleans are represented literally.
return "" + value;}else if(className == numberClass){ // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
// `"null"`.
return value > -1 / 0 && value < 1 / 0?"" + value:"null";}else if(className == stringClass){ // Strings are double-quoted and escaped.
return quote("" + value);} // Recursively serialize objects and arrays.
if(typeof value == "object"){ // Check for cyclic structures. This is a linear search; performance
// is inversely proportional to the number of unique nested objects.
for(length = stack.length;length--;) {if(stack[length] === value){ // Cyclic structures cannot be serialized by `JSON.stringify`.
throw TypeError();}} // Add the object to the stack of traversed objects.
stack.push(value);results = []; // Save the current indentation level and indent one additional level.
prefix = indentation;indentation += whitespace;if(className == arrayClass){ // Recursively serialize array elements.
for(index = 0,length = value.length;index < length;index++) {element = serialize(index,value,callback,properties,whitespace,indentation,stack);results.push(element === undef?"null":element);}result = results.length?whitespace?"[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]":"[" + results.join(",") + "]":"[]";}else { // Recursively serialize object members. Members are selected from
// either a user-specified list of property names, or the object
// itself.
forEach(properties || value,function(property){var element=serialize(property,value,callback,properties,whitespace,indentation,stack);if(element !== undef){ // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
// is not the empty string, let `member` {quote(property) + ":"}
// be the concatenation of `member` and the `space` character."
// The "`space` character" refers to the literal space
// character, not the `space` {width} argument provided to
// `JSON.stringify`.
results.push(quote(property) + ":" + (whitespace?" ":"") + element);}});result = results.length?whitespace?"{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}":"{" + results.join(",") + "}":"{}";} // Remove the object from the traversed object stack.
stack.pop();return result;}}; // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
exports.stringify = function(source,filter,width){var whitespace,callback,properties,className;if(objectTypes[typeof filter] && filter){if((className = getClass.call(filter)) == functionClass){callback = filter;}else if(className == arrayClass){ // Convert the property names array into a makeshift set.
properties = {};for(var index=0,length=filter.length,value;index < length;value = filter[index++],(className = getClass.call(value),className == stringClass || className == numberClass) && (properties[value] = 1));}}if(width){if((className = getClass.call(width)) == numberClass){ // Convert the `width` to an integer and create a string containing
// `width` number of space characters.
if((width -= width % 1) > 0){for(whitespace = "",width > 10 && (width = 10);whitespace.length < width;whitespace += " ");}}else if(className == stringClass){whitespace = width.length <= 10?width:width.slice(0,10);}} // Opera <= 7.54u2 discards the values associated with empty string keys
// (`""`) only if they are used directly within an object member list
// (e.g., `!("" in { "": 1})`).
return serialize("",(value = {},value[""] = source,value),callback,properties,whitespace,"",[]);};} // Public: Parses a JSON source string.
if(!has("json-parse")){var fromCharCode=String.fromCharCode; // Internal: A map of escaped control characters and their unescaped
// equivalents.
var Unescapes={92:"\\",34:'"',47:"/",98:"\b",116:"\t",110:"\n",102:"\f",114:"\r"}; // Internal: Stores the parser state.
var Index,Source; // Internal: Resets the parser state and throws a `SyntaxError`.
var abort=function abort(){Index = Source = null;throw SyntaxError();}; // Internal: Returns the next token, or `"$"` if the parser has reached
// the end of the source string. A token may be a string, number, `null`
// literal, or Boolean literal.
var lex=function lex(){var source=Source,length=source.length,value,begin,position,isSigned,charCode;while(Index < length) {charCode = source.charCodeAt(Index);switch(charCode){case 9:case 10:case 13:case 32: // Skip whitespace tokens, including tabs, carriage returns, line
// feeds, and space characters.
Index++;break;case 123:case 125:case 91:case 93:case 58:case 44: // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
// the current position.
value = charIndexBuggy?source.charAt(Index):source[Index];Index++;return value;case 34: // `"` delimits a JSON string; advance to the next character and
// begin parsing the string. String tokens are prefixed with the
// sentinel `@` character to distinguish them from punctuators and
// end-of-string tokens.
for(value = "@",Index++;Index < length;) {charCode = source.charCodeAt(Index);if(charCode < 32){ // Unescaped ASCII control characters (those with a code unit
// less than the space character) are not permitted.
abort();}else if(charCode == 92){ // A reverse solidus (`\`) marks the beginning of an escaped
// control character (including `"`, `\`, and `/`) or Unicode
// escape sequence.
charCode = source.charCodeAt(++Index);switch(charCode){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114: // Revive escaped control characters.
value += Unescapes[charCode];Index++;break;case 117: // `\u` marks the beginning of a Unicode escape sequence.
// Advance to the first character and validate the
// four-digit code point.
begin = ++Index;for(position = Index + 4;Index < position;Index++) {charCode = source.charCodeAt(Index); // A valid sequence comprises four hexdigits (case-
// insensitive) that form a single hexadecimal value.
if(!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)){ // Invalid Unicode escape sequence.
abort();}} // Revive the escaped character.
value += fromCharCode("0x" + source.slice(begin,Index));break;default: // Invalid escape sequence.
abort();}}else {if(charCode == 34){ // An unescaped double-quote character marks the end of the
// string.
break;}charCode = source.charCodeAt(Index);begin = Index; // Optimize for the common case where a string is valid.
while(charCode >= 32 && charCode != 92 && charCode != 34) {charCode = source.charCodeAt(++Index);} // Append the string as-is.
value += source.slice(begin,Index);}}if(source.charCodeAt(Index) == 34){ // Advance to the next character and return the revived string.
Index++;return value;} // Unterminated string.
abort();default: // Parse numbers and literals.
begin = Index; // Advance past the negative sign, if one is specified.
if(charCode == 45){isSigned = true;charCode = source.charCodeAt(++Index);} // Parse an integer or floating-point value.
if(charCode >= 48 && charCode <= 57){ // Leading zeroes are interpreted as octal literals.
if(charCode == 48 && (charCode = source.charCodeAt(Index + 1),charCode >= 48 && charCode <= 57)){ // Illegal octal literal.
abort();}isSigned = false; // Parse the integer component.
for(;Index < length && (charCode = source.charCodeAt(Index),charCode >= 48 && charCode <= 57);Index++); // Floats cannot contain a leading decimal point; however, this
// case is already accounted for by the parser.
if(source.charCodeAt(Index) == 46){position = ++Index; // Parse the decimal component.
for(;position < length && (charCode = source.charCodeAt(position),charCode >= 48 && charCode <= 57);position++);if(position == Index){ // Illegal trailing decimal.
abort();}Index = position;} // Parse exponents. The `e` denoting the exponent is
// case-insensitive.
charCode = source.charCodeAt(Index);if(charCode == 101 || charCode == 69){charCode = source.charCodeAt(++Index); // Skip past the sign following the exponent, if one is
// specified.
if(charCode == 43 || charCode == 45){Index++;} // Parse the exponential component.
for(position = Index;position < length && (charCode = source.charCodeAt(position),charCode >= 48 && charCode <= 57);position++);if(position == Index){ // Illegal empty exponent.
abort();}Index = position;} // Coerce the parsed value to a JavaScript number.
return +source.slice(begin,Index);} // A negative sign may only precede numbers.
if(isSigned){abort();} // `true`, `false`, and `null` literals.
if(source.slice(Index,Index + 4) == "true"){Index += 4;return true;}else if(source.slice(Index,Index + 5) == "false"){Index += 5;return false;}else if(source.slice(Index,Index + 4) == "null"){Index += 4;return null;} // Unrecognized token.
abort();}} // Return the sentinel `$` character if the parser has reached the end
// of the source string.
return "$";}; // Internal: Parses a JSON `value` token.
var get=function get(value){var results,hasMembers;if(value == "$"){ // Unexpected end of input.
abort();}if(typeof value == "string"){if((charIndexBuggy?value.charAt(0):value[0]) == "@"){ // Remove the sentinel `@` character.
return value.slice(1);} // Parse object and array literals.
if(value == "["){ // Parses a JSON array, returning a new JavaScript array.
results = [];for(;;hasMembers || (hasMembers = true)) {value = lex(); // A closing square bracket marks the end of the array literal.
if(value == "]"){break;} // If the array literal contains elements, the current token
// should be a comma separating the previous element from the
// next.
if(hasMembers){if(value == ","){value = lex();if(value == "]"){ // Unexpected trailing `,` in array literal.
abort();}}else { // A `,` must separate each array element.
abort();}} // Elisions and leading commas are not permitted.
if(value == ","){abort();}results.push(get(value));}return results;}else if(value == "{"){ // Parses a JSON object, returning a new JavaScript object.
results = {};for(;;hasMembers || (hasMembers = true)) {value = lex(); // A closing curly brace marks the end of the object literal.
if(value == "}"){break;} // If the object literal contains members, the current token
// should be a comma separator.
if(hasMembers){if(value == ","){value = lex();if(value == "}"){ // Unexpected trailing `,` in object literal.
abort();}}else { // A `,` must separate each object member.
abort();}} // Leading commas are not permitted, object property names must be
// double-quoted strings, and a `:` must separate each property
// name and value.
if(value == "," || typeof value != "string" || (charIndexBuggy?value.charAt(0):value[0]) != "@" || lex() != ":"){abort();}results[value.slice(1)] = get(lex());}return results;} // Unexpected token encountered.
abort();}return value;}; // Internal: Updates a traversed object member.
var update=function update(source,property,callback){var element=walk(source,property,callback);if(element === undef){delete source[property];}else {source[property] = element;}}; // Internal: Recursively traverses a parsed JSON object, invoking the
// `callback` function for each value. This is an implementation of the
// `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
var walk=function walk(source,property,callback){var value=source[property],length;if(typeof value == "object" && value){ // `forEach` can't be used to traverse an array in Opera <= 8.54
// because its `Object#hasOwnProperty` implementation returns `false`
// for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
if(getClass.call(value) == arrayClass){for(length = value.length;length--;) {update(value,length,callback);}}else {forEach(value,function(property){update(value,property,callback);});}}return callback.call(source,property,value);}; // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
exports.parse = function(source,callback){var result,value;Index = 0;Source = "" + source;result = get(lex()); // If a JSON string contains multiple tokens, it is invalid.
if(lex() != "$"){abort();} // Reset the parser state.
Index = Source = null;return callback && getClass.call(callback) == functionClass?walk((value = {},value[""] = result,value),"",callback):result;};}}exports["runInContext"] = runInContext;return exports;}if(freeExports && !isLoader){ // Export for CommonJS environments.
runInContext(root,freeExports);}else { // Export for web browsers and JavaScript engines.
var nativeJSON=root.JSON,previousJSON=root["JSON3"],isRestored=false;var JSON3=runInContext(root,root["JSON3"] = { // Public: Restores the original value of the global `JSON` object and
// returns a reference to the `JSON3` object.
"noConflict":function noConflict(){if(!isRestored){isRestored = true;root.JSON = nativeJSON;root["JSON3"] = previousJSON;nativeJSON = previousJSON = null;}return JSON3;}});root.JSON = {"parse":JSON3.parse,"stringify":JSON3.stringify};} // Export for asynchronous module loaders.
if(isLoader){define(function(){return JSON3;});}}).call(this);}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],51:[function(_dereq_,module,exports){module.exports = toArray;function toArray(list,index){var array=[];index = index || 0;for(var i=index || 0;i < list.length;i++) {array[i - index] = list[i];}return array;}},{}]},{},[31])(31);});}

cc._RFpop();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},["myHero","myOtherHero","socket.io","myApp","myUtil","myGround"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkY6L3poYW9nYW94aW5nL2NvY29zY3JlYXRvci9Db2Nvc0NyZWF0b3IvcmVzb3VyY2VzL2FwcC5hc2FyL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0L215QXBwLmpzIiwiYXNzZXRzL3NjcmlwdC9teUdyb3VuZC5qcyIsImFzc2V0cy9zY3JpcHQvbXlIZXJvLmpzIiwiYXNzZXRzL3NjcmlwdC9teU90aGVySGVyby5qcyIsImFzc2V0cy9zY3JpcHQvbXlVdGlsLmpzIiwiYXNzZXRzL3NjcmlwdC9zb2NrZXQuaW8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnOTY3NjhrU0FWQk9tbzZqdlQ4ZkNLVTcnLCAnbXlBcHAnKTtcbi8vIHNjcmlwdFxcbXlBcHAuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBTZXJ2ZXJTdGF0ZToge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWxcbiAgICAgICAgfSxcbiAgICAgICAgYmFja2dyb3VuZDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBvdGhlckhlcm86IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYlxuICAgICAgICB9LFxuXG4gICAgICAgIHJhZGlvOiAyLFxuXG4gICAgICAgIG15SUQ6IDAsXG5cbiAgICAgICAgdXNlckxpc3Q6IFtdXG4gICAgfSxcblxuICAgIF9kcmF3VXNlcjogZnVuY3Rpb24gX2RyYXdVc2VyKHBvc1gsIHBvc1ksIHVzZXIpIHtcbiAgICAgICAgdmFyIG90aGVyaGVybyA9IGNjLmluc3RhbnRpYXRlKHRoaXMub3RoZXJIZXJvKTtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kLmFkZENoaWxkKG90aGVyaGVybywgdXNlci51c2VySUQsIHVzZXIudXNlcklEKTtcbiAgICAgICAgb3RoZXJoZXJvLnNldFBvc2l0aW9uKHBvc1gsIHBvc1kpO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGlmIChjYy5zeXMuaXNOYXRpdmUpIHtcbiAgICAgICAgICAgIHdpbmRvdy5pbyA9IFNvY2tldElPO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVxdWlyZSgnc29ja2V0LmlvJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3NvY2tldCA9IGlvKCdodHRwOi8vbG9jYWxob3N0OjMwMDAnKTtcbiAgICAgICAgdmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcpO1xuXG4gICAgICAgIC8vYmVnaW4tLS0tLS0tLS0tLS0tLS3nmbvlvZXlpITnkIYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cbiAgICAgICAgc29ja2V0Lm9uKCdjb25uZWN0ZWQnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgc2VsZi5teUlEID0gZGF0YS51c2VySUQ7IC8v5a2Y5YWl6Ieq5bex55qESURcbiAgICAgICAgICAgIHNlbGYuU2VydmVyU3RhdGUuc3RyaW5nID0gJ3lvdXIgSUQ6ICcgKyBkYXRhLnVzZXJJRDtcbiAgICAgICAgICAgIHNlbGYudXNlckxpc3QgPSBkYXRhLnVzZXJMaXN0OyAvL+iOt+WPluWOn+acieeUqOaIt+WIl+ihqFxuXG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBzZWxmLnVzZXJMaXN0W1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXNlciA9IF9zdGVwLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAvL+eUu+WIsOiDjOaZr1xuICAgICAgICAgICAgICAgICAgICBpZiAodXNlciA9PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kcmF3VXNlcig2ODgsIC01MDQsIHVzZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvclsncmV0dXJuJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9pdGVyYXRvclsncmV0dXJuJ10oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vZW5kLS0tLS0tLS0tLS0tLS0tLS3nmbvlvZXlpITnkIYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cbiAgICAgICAgLy9iZWdpbi0tLS0tLS0tLS0tLS0tLS0t5paw5aKe5aSE55CGLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXG4gICAgICAgIHNvY2tldC5vbignbmV3VXNlcicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLlNlcnZlclN0YXRlLnN0cmluZyA9ICduZXcgdXNlcjogJyArIGRhdGEudXNlcklEO1xuICAgICAgICAgICAgc2VsZi51c2VyTGlzdC5wdXNoKGRhdGEpOyAvL+WKoOWIsOWIl+ihqFxuICAgICAgICAgICAgc2VsZi5fZHJhd1VzZXIoNjg4LCAtNTA0LCBkYXRhKTsgLy/nlLvliLDog4zmma9cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9lbmQtLS0tLS0tLS0tLS0tLS0tLS0t5paw5aKe5aSE55CGLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXG4gICAgICAgIC8vZW5kLS0tLS0tLS0tLS0tLS0tLS0tLeemu+W8gOWkhOeQhi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuICAgICAgICBzb2NrZXQub24oJ3VzZXJMZWF2ZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLlNlcnZlclN0YXRlLnN0cmluZyA9ICd1c2VyIGxlYXZlOiAnICsgZGF0YS51c2VySUQ7XG4gICAgICAgICAgICBkZWxldGUgc2VsZi51c2VyTGlzdFtkYXRhLnVzZXJJRF07IC8v5LuO5YiX6KGo5Yig6ZmkXG4gICAgICAgICAgICBzZWxmLmJhY2tncm91bmQucmVtb3ZlQ2hpbGRCeVRhZyhkYXRhLnVzZXJJRCk7IC8v5LuO6IOM5pmv56e76ZmkXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vZW5kLS0tLS0tLS0tLS0tLS0tLS0tLeemu+W8gOWkhOeQhi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuICAgICAgICAvL2JlZ2luLS0tLS0tLS0tLS0tLS0tLS0tLeenu+WKqOWPkeWHuuWkhOeQhi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuICAgICAgICB2YXIgbXlVdGlsID0gcmVxdWlyZSgnbXlVdGlsJyk7XG4gICAgICAgIHZhciB1dGlsID0gbmV3IG15VXRpbCgpO1xuXG4gICAgICAgIHZhciBteUdyb3VuZCA9IHRoaXMuYmFja2dyb3VuZC5nZXRDb21wb25lbnQoJ215R3JvdW5kJyk7XG4gICAgICAgIHZhciBjdXJUaWxlWCA9IG15R3JvdW5kLmN1clRpbGVYO1xuICAgICAgICB2YXIgY3VyVGlsZVkgPSBteUdyb3VuZC5jdXJUaWxlWTtcblxuICAgICAgICBzZWxmLm5vZGUub24oJ215Q2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgICAgICBzb2NrZXQuZW1pdCgnbW92ZScsIHtcbiAgICAgICAgICAgICAgICB1c2VySUQ6IHNlbGYubXlJRCxcbiAgICAgICAgICAgICAgICBjdXJUaWxlWDogY3VyVGlsZVgsXG4gICAgICAgICAgICAgICAgY3VyVGlsZVk6IGN1clRpbGVZLFxuICAgICAgICAgICAgICAgIG5ld1BvczogdXRpbC5jb252ZXJ0VG80NShldmVudC5kZXRhaWwpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9lbmQtLS0tLS0tLS0tLS0tLS0tLS0tLS3np7vliqjlj5Hlh7rlpITnkIYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cbiAgICAgICAgLy9iZWdpbi0tLS0tLS0tLS0tLS0tLS0tLS3np7vliqjmlLbliLDlpITnkIYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cbiAgICAgICAgc29ja2V0Lm9uKCdtb3ZlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSBzZWxmLmJhY2tncm91bmQuZ2V0Q2hpbGRCeVRhZyhkYXRhLnVzZXJJRCkuZ2V0Q29tcG9uZW50KCdteU90aGVySGVybycpO1xuICAgICAgICAgICAgLy92YXIgdGFyZ2V0ID0gc2VsZi5iYWNrZ3JvdW5kLmdldENoaWxkQnlUYWcoZGF0YS51c2VySUQpLmdldENvbXBvbmVudCgnbXlIZXJvJyk7XG4gICAgICAgICAgICB2YXIgUGF0aCA9IHV0aWwuY29udmVydFRvUGF0aChkYXRhLm5ld1BvcywgZGF0YS5jdXJUaWxlWCwgZGF0YS5jdXJUaWxlWSk7XG4gICAgICAgICAgICB2YXIgYXNjID0gW107XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRhcmdldCk7XG4gICAgICAgICAgICB0YXJnZXQucGF0aCA9IFBhdGg7XG5cbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IyID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IyID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvcjIgPSBQYXRoW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXAyOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gKF9zdGVwMiA9IF9pdGVyYXRvcjIubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXIgPSBfc3RlcDIudmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgYXNjLnB1c2goY2MuY2FsbEZ1bmModGFyZ2V0LnRvV2FsaywgdGFyZ2V0KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vYXNjLnB1c2goY2MuY2FsbEZ1bmModGFyZ2V0LnRvV2Fsayx0YXJnZXQpKTtcbiAgICAgICAgICAgICAgICAgICAgYXNjLnB1c2goY2MubW92ZUJ5KHNlbGYucmFkaW8gKiAoZGlyLmR4ICE9IDAgJiYgZGlyLmR5ICE9IDAgPyAxLjQgOiAxKSAvIDEwLCAoZGlyLmR5ICsgZGlyLmR4KSAqIDMyLCAoZGlyLmR4IC0gZGlyLmR5KSAqIDI0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvcjIgPSBlcnI7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgJiYgX2l0ZXJhdG9yMlsncmV0dXJuJ10pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9pdGVyYXRvcjJbJ3JldHVybiddKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzYy5wdXNoKGNjLmNhbGxGdW5jKHRhcmdldC50b1N0YW5kLCB0YXJnZXQpKTtcblxuICAgICAgICAgICAgdGFyZ2V0Lm5vZGUucnVuQWN0aW9uKGNjLnNlcXVlbmNlKGFzYykpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL2VuZC0tLS0tLS0tLS0tLS0tLS0tLS0tLeenu+WKqOaUtuWIsOWkhOeQhi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICB9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdkZDhmNVJ5bmFsSlBJd3kwdndhMjlFZScsICdteUdyb3VuZCcpO1xuLy8gc2NyaXB0XFxteUdyb3VuZC5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgICAgY3VyVGlsZVg6IDEyLFxuICAgICAgICBjdXJUaWxlWTogNDIsXG5cbiAgICAgICAgZmluYWxMaXN0OiBbXSxcblxuICAgICAgICByYWRpbzogMSxcblxuICAgICAgICBoZXJvOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXG4gICAgICAgIH0sXG5cbiAgICAgICAgY3VyVGlsZVhZOiB7XG4gICAgICAgICAgICAnZGVmYXVsdCc6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBjYy5MYWJlbFxuICAgICAgICB9LFxuXG4gICAgICAgIGN1clRpbGVGb3JlTmFtZTogJ+W9k+WJjeWdkOaghzogJ1xuXG4gICAgfSxcblxuICAgIHRvTW92ZTogZnVuY3Rpb24gdG9Nb3ZlKCkge1xuICAgICAgICBpZiAodGhpcy5maW5hbExpc3QubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIC8v5aaC5p6c6LWw5a6M5LqGIFxuICAgICAgICAgICAgdGhpcy5fc3RhbmRIZXJvKCk7IC8v5bCx56uZ552AXG4gICAgICAgICAgICAvL3RoaXMuaGVyby5nZXRDb21wb25lbnQoJ215SGVybycpLnRvU3RhbmQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGlyID0gdGhpcy5maW5hbExpc3Quc2hpZnQoKTsgLy/lkKbliJnlj5blvpfkuIvkuIDmraVcblxuICAgICAgICB0aGlzLmN1clRpbGVQb3NYID0gZGlyLmR4OyAvL+S/ruaUueW9k+WJjeWdkOaghyAgKOi/meS4quaYr+S4uuWvu+i3r+S4reaWreWHhuWkh+eahCDlj6/mg5zmsqHog73lrp7njrApXG4gICAgICAgIHRoaXMuY3VyVGlsZVBvc1kgPSBkaXIuZHk7XG4gICAgICAgIHRoaXMuY3VyVGlsZVhZLnN0cmluZyA9IHRoaXMuY3VyVGlsZUZvcmVOYW1lICsgdGhpcy5jdXJUaWxlUG9zWCArICcsJyArIHRoaXMuY3VyVGlsZVBvc1k7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5jdXJUaWxlUG9zWCArICcgJyArIHRoaXMuY3VyVGlsZVBvc1kpO1xuICAgICAgICAvL3RoaXMuX21vdmVIZXJvKGRpci5keCwgZGlyLmR5KTtcbiAgICAgICAgLy90aGlzLmhlcm8uZ2V0Q29tcG9uZW50KCdteUhlcm8nKS50b1dhbGsoZGlyLmR4ICsgJycgKyBkaXIuZHkpO1xuXG4gICAgICAgIC8vQmVnaW4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV9tb3ZlQmFja2dyb3VuZC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbiggLy/lvIDlp4vnp7vliqjlkKcgXG4gICAgICAgIGNjLnNlcXVlbmNlKGNjLmNhbGxGdW5jKHRoaXMuX21vdmVIZXJvKGRpci5keCwgZGlyLmR5KSwgdGhpcyksIC8v6KeS6Imy6L2s5ZCR5LiL5LiA5q2lXG4gICAgICAgIGNjLm1vdmVCeSh0aGlzLnJhZGlvICogKGRpci5keCAhPSAwICYmIGRpci5keSAhPSAwID8gMS40IDogMSkgLyAxMCwgLy/lnLDlm77lkJHkuIvkuIDmraXnp7vliqhcbiAgICAgICAgLShkaXIuZHggKyBkaXIuZHkpICogMzIsIChkaXIuZHkgLSBkaXIuZHgpICogMjQpLCBjYy5jYWxsRnVuYyh0aGlzLnRvTW92ZSwgdGhpcykgLy/nhLblkI7osIPnlKjoh6rlt7EgIOiOt+WPluS4i+S4gOatpVxuICAgICAgICApKTtcblxuICAgICAgICAvL3RoaXMuX21vdmVCYWNrZ3JvdW5kKGRpci54LGRpci55KTtcbiAgICAgICAgLy9FbmQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV9tb3ZlQmFja2dyb3VuZC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXG4gICAgICAgIC8vI2J1ZzFcbiAgICAgICAgLy8gICAgICBjYy5zZXF1ZW5jZShjYy5BY3Rpb24oKSxjYy5jYWxsRnVuYyh0aGlzLmhlcm8uZGlyID0gJ2Rpci5keCArICcnICsgZGlyLmR5Jyk7ICFhc3luY1xuICAgICAgICAvLyAgICAgIGNjLnNlcXVlbmNlKGNjLkFjdGlvbigpLGNjLmNhbGxGdW5jKGZ1bmN0aW9uLHRhcmdldCxkYXRhKSkgIWFzeW5jXG4gICAgICAgIC8vICAgICAgY2Muc2VxdWVuY2UoY2MuQWN0aW9uKCksY2MuY2FsbEZ1bmMoZnVuY3Rpb24oZGF0YSksdGFyZ2V0KSkgIWFzeW5jXG4gICAgICAgIC8vICAgICAgY2Muc2VxdWVuY2UoY2MuQWN0aW9uKCksY2MuY2FsbEZ1bmMobmV3IGZ1bmN0aW9uKGRhdGEpLHRhcmdldCkpOyAhYXN5bmNcbiAgICAgICAgLy8gICAgICBjYy5zZXF1ZW5jZShjYy5BY3Rpb24oKSxjYy5jYWxsRnVuYyhuZXcgZnVuY3Rpb24sdGFyZ2V0LCBkYXRhKSk7ICFhc3luY1xuICAgICAgICAvLyAgICAgIGNjLnNlcXVlbmNlKGNjLkFjdGlvbigpLGNjLmNhbGxGdW5jKGZ1bmN0aW9uLHRhcmdldCk7ICAgICAgIHdvcmsgd2l0aG91dCBhcmdzXG4gICAgICAgIC8vICAgICAgY2Muc2VxdWVuY2UoY2MuQWN0aW9uKCksY2MuY2FsbEZ1bmMoZnVuY3Rpb24oZnVuY3Rpb24oZGF0YSkpLHRhcmdldCkpOyB3b3JrIG9uY2VcbiAgICB9LFxuXG4gICAgLy8gX21vdmVCYWNrZ3JvdW5kIDogZnVuY3Rpb24oZHgsZHkpe1xuICAgIC8vICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKFxuICAgIC8vICAgICAgICAgY2Muc2VxdWVuY2UoXG5cbiAgICAvLyAgICAgICAgICAgICBjYy5jYWxsRnVuYyh0aGlzLl9tb3ZlSGVybyhkeCwgZHkpLHRoaXMpLFxuICAgIC8vICAgICAgICAgICAgIGNjLm1vdmVCeShcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhpcy5yYWRpbyAqICgoZHggIT0gMCkgJiYgKGR5ICE9IDApID8gMS40IDogMSksXG4gICAgLy8gICAgICAgICAgICAgICAgIC0oZHgrZHkpKjMyLFxuICAgIC8vICAgICAgICAgICAgICAgICAgKGR5LWR4KSoyNFxuICAgIC8vICAgICAgICAgICAgICksXG4gICAgLy8gICAgICAgICAgICAgY2MuY2FsbEZ1bmModGhpcy50b01vdmUsdGhpcylcbiAgICAvLyAgICAgICAgIClcblxuICAgIC8vICAgICApO1xuICAgIC8vIH0sXG5cbiAgICBfbW92ZUhlcm86IGZ1bmN0aW9uIF9tb3ZlSGVybyhkeCwgZHkpIHtcbiAgICAgICAgdGhpcy5oZXJvLmdldENvbXBvbmVudCgnbXlIZXJvJykudG9XYWxrKGR4ICsgJycgKyBkeSk7XG4gICAgfSxcblxuICAgIF9zdGFuZEhlcm86IGZ1bmN0aW9uIF9zdGFuZEhlcm8oKSB7XG4gICAgICAgIHRoaXMuaGVyby5nZXRDb21wb25lbnQoJ215SGVybycpLnRvU3RhbmQoKTtcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHZhciBteVV0aWwgPSBzZWxmLmdldENvbXBvbmVudCgnbXlVdGlsJyk7IC8v6L+Z5qyh5oiR5Lus5LiN55SocmVxdWlyZSDmiJHku6znlKjnu4Tku7bnmoTmlrnlvI9cbiAgICAgICAgLy/miJHku6zlsIZteVV0aWwuanPmiZTliLDlsYLnuqfnrqHnkIblmajnmoRiYWNrZ3JvdW5k55qE5bGe5oCn5qOA5p+l5Zmo5LitXG5cbiAgICAgICAgdGhpcy5ub2RlLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBteWV2ZW50ID0gbmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKCdteUNsaWNrJywgdHJ1ZSk7IC8v6L+Z5Liq5piv5LiL5LiA6YOo5YiG55qE5YaF5a65XG4gICAgICAgICAgICBteWV2ZW50LnNldFVzZXJEYXRhKGV2ZW50KTtcblxuICAgICAgICAgICAgdGhpcy5ub2RlLmRpc3BhdGNoRXZlbnQobXlldmVudCk7XG5cbiAgICAgICAgICAgIHNlbGYuZmluYWxMaXN0ID0gW107IC8v6L+Z5Liq5Lmf5piv5LiA5Liq5a+76Lev5Lit5pat55qE5bCd6K+VIOS4jei/h+Wksei0peS6hlxuXG4gICAgICAgICAgICAvL+S4i+mdoui/meWPpeaYr+Wwhum8oOagh+eahOeCueWHu+i9rOaNouaIkOi3r+W+hFxuICAgICAgICAgICAgc2VsZi5maW5hbExpc3QgPSBteVV0aWwuY29udmVydFRvUGF0aChteVV0aWwuY29udmVydFRvNDUoZXZlbnQpLCBzZWxmLmN1clRpbGVYLCBzZWxmLmN1clRpbGVZKTtcbiAgICAgICAgICAgIC8vdGhpcy50b01vdmVPbmNlKCk7XG4gICAgICAgICAgICB0aGlzLnRvTW92ZSgpOyAvL+eEtuWQjuenu+WKqOWwseihjOS6hlxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcyNWNhMDY0Nk1wQktLOHI4VWE5bUxkcycsICdteUhlcm8nKTtcbi8vIHNjcmlwdFxcbXlIZXJvLmpzXG5cbmNjLkNsYXNzKHtcbiAgICAnZXh0ZW5kcyc6IGNjLkNvbXBvbmVudCxcblxuICAgIHByb3BlcnRpZXM6IHtcblxuICAgICAgICBTdGFuZEFuaW1OYW1lOiAnJyxcbiAgICAgICAgV2Fsa0FuaW1OYW1lOiAnJyxcbiAgICAgICAgY3VyRGlyOiAnJ1xuXG4gICAgfSxcblxuICAgIHRvU3RhbmQ6IGZ1bmN0aW9uIHRvU3RhbmQoKSB7XG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50KGNjLkFuaW1hdGlvbikucGxheSh0aGlzLlN0YW5kQW5pbU5hbWUgKyB0aGlzLmN1ckRpcik7XG4gICAgfSxcblxuICAgIHRvV2FsazogZnVuY3Rpb24gdG9XYWxrKGRpcikge1xuICAgICAgICAvL2NvbnNvbGUubG9nKGRpcik7XG4gICAgICAgIGlmIChkaXIgPT0gdGhpcy5jdXJEaXIpIHJldHVybjtcbiAgICAgICAgdGhpcy5jdXJEaXIgPSBkaXI7XG4gICAgICAgIHRoaXMuZ2V0Q29tcG9uZW50KGNjLkFuaW1hdGlvbikucGxheSh0aGlzLldhbGtBbmltTmFtZSArIGRpcik7XG4gICAgfSxcbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHt9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICcyZWMwMHFrWWRoSFJiRzhZeWtvT3FMdCcsICdteU90aGVySGVybycpO1xuLy8gc2NyaXB0XFxteU90aGVySGVyby5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgICAgU3RhbmRBbmltTmFtZTogJycsXG4gICAgICAgIFdhbGtBbmltTmFtZTogJycsXG4gICAgICAgIGN1ckRpcjogJycsXG4gICAgICAgIGRpcjogJycsXG5cbiAgICAgICAgcGF0aDogW11cblxuICAgIH0sXG5cbiAgICB0b1N0YW5kOiBmdW5jdGlvbiB0b1N0YW5kKCkge1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pLnBsYXkodGhpcy5TdGFuZEFuaW1OYW1lICsgdGhpcy5jdXJEaXIpO1xuICAgIH0sXG5cbiAgICB0b1dhbGs6IGZ1bmN0aW9uIHRvV2FsaygpIHtcblxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMucGF0aC5zaGlmdCgpO1xuICAgICAgICBpZiAoaXRlbSA9PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5kaXIgPSBpdGVtLmR4ICsgJycgKyBpdGVtLmR5O1xuXG4gICAgICAgIGlmICh0aGlzLmRpciA9PSB0aGlzLmN1ckRpcikgcmV0dXJuO1xuICAgICAgICB0aGlzLmN1ckRpciA9IHRoaXMuZGlyO1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pLnBsYXkodGhpcy5XYWxrQW5pbU5hbWUgKyB0aGlzLmRpcik7XG4gICAgfSxcbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHt9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdkNTc3NEN0L2lWSzlvZTR0YWdOejZJLycsICdteVV0aWwnKTtcbi8vIHNjcmlwdFxcbXlVdGlsLmpzXG5cbmNjLkNsYXNzKHtcbiAgICBcImV4dGVuZHNcIjogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge30sXG5cbiAgICBjb252ZXJ0VG80NTogZnVuY3Rpb24gY29udmVydFRvNDUoY2xpY2tFdmVudCkge1xuICAgICAgICB2YXIgdmlzaWJsZVNpemUgPSBjYy5kaXJlY3Rvci5nZXRWaXNpYmxlU2l6ZSgpO1xuICAgICAgICB2YXIgb2xkWCA9IChjbGlja0V2ZW50LmdldExvY2F0aW9uWCgpIC0gdmlzaWJsZVNpemUud2lkdGggLyAyKSAvIDY0OyAvL+ato+W4uFhZ5Y2V5L2NXG4gICAgICAgIHZhciBvbGRZID0gKGNsaWNrRXZlbnQuZ2V0TG9jYXRpb25ZKCkgLSB2aXNpYmxlU2l6ZS5oZWlnaHQgLyAyKSAvIDQ4O1xuXG4gICAgICAgIHZhciByYXdOZXdYID0gb2xkWCArIG9sZFk7IC8vNDXluqZYWeWNleS9jVxuICAgICAgICB2YXIgcmF3TmV3WSA9IG9sZFggLSBvbGRZO1xuXG4gICAgICAgIHZhciBuZXdYID0gTWF0aC5mbG9vcihyYXdOZXdYKSArIDE7IC8v5oiq5pat5bCP5pWwXG4gICAgICAgIHZhciBuZXdZID0gLU1hdGguZmxvb3IoLXJhd05ld1kpIC0gMTsgLy/lm6DkuLrlnLDlm77otbflp4vkvY3nva7osIPnmoTkuI3lpKflh4Yg6L+Z6YeM55SoICsxIC0xIOaJk+S6huS4quihpeS4gVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZXdYOiBuZXdYLFxuICAgICAgICAgICAgbmV3WTogbmV3WVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBjb252ZXJ0VG9QYXRoOiBmdW5jdGlvbiBjb252ZXJ0VG9QYXRoKG5ld1BvcywgY3VyVGlsZVBvc1gsIGN1clRpbGVQb3NZKSB7XG5cbiAgICAgICAgdmFyIG5ld1ggPSBuZXdQb3MubmV3WDtcbiAgICAgICAgdmFyIG5ld1kgPSBuZXdQb3MubmV3WTtcblxuICAgICAgICB2YXIgb3Blbkxpc3QgPSBbXTtcbiAgICAgICAgdmFyIGNsb3NlTGlzdCA9IFtdO1xuICAgICAgICB2YXIgZmluYWxMaXN0ID0gW107XG5cbiAgICAgICAgdmFyIHN0YXJ0ID0ge1xuICAgICAgICAgICAgeDogY3VyVGlsZVBvc1gsXG4gICAgICAgICAgICB5OiBjdXJUaWxlUG9zWSxcbiAgICAgICAgICAgIGg6IChNYXRoLmFicyhuZXdYKSArIE1hdGguYWJzKG5ld1kpKSAqIDEwLFxuICAgICAgICAgICAgZzogMCxcbiAgICAgICAgICAgIHA6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgc3RhcnQuZiA9IHN0YXJ0LmggKyBzdGFydC5nO1xuXG4gICAgICAgIG9wZW5MaXN0LnB1c2goc3RhcnQpOyAvL+aKiui1t+eCueWKoOWFpSBvcGVuIGxpc3RcblxuICAgICAgICB2YXIgZGVzVGlsZVggPSBzdGFydC54ICsgbmV3WDtcbiAgICAgICAgdmFyIGRlc1RpbGVZID0gc3RhcnQueSArIG5ld1k7XG5cbiAgICAgICAgLy/ph43lpI3lpoLkuIvov4fnqItcblxuICAgICAgICB3aGlsZSAob3Blbkxpc3QubGVuZ3RoICE9IDApIHtcblxuICAgICAgICAgICAgb3Blbkxpc3Quc29ydCh0aGlzLl9zb3J0Rik7IC8v6YGN5Y6Gb3BlbiBsaXN0ICDmiJHmmK/lhYjmjpLluo8g54S25ZCO56e75Ye65pWw57uE56ys5LiA5Liq5YWD57SgICjmlbDnu4Quc2hpZnQoKSlcblxuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG9wZW5MaXN0LnNoaWZ0KCk7IC8v5p+l5om+RuWAvOacgOWwj+eahOiKgueCuSDmiorlroPlvZPliY3opoHlpITnkIbnmoToioLngrlcblxuICAgICAgICAgICAgY2xvc2VMaXN0LnB1c2gocGFyZW50KTsgLy/miorov5nkuKroioLngrnnp7vliLAgY2xvc2UgbGlzdFxuXG4gICAgICAgICAgICBpZiAocGFyZW50LmggPT0gMCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gLTE7IGkgPD0gMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy/lr7nlvZPliY3mlrnmoLznmoQ45Liq55u46YK75pa55qC855qE5q+P5LiA5Liq5pa55qC8P1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAtMTsgaiA8PSAxOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJhd3ggPSBwYXJlbnQueCArIGk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYXd5ID0gcGFyZW50LnkgKyBqO1xuICAgICAgICAgICAgICAgICAgICAvL+WmguaenOWug+aYr+S4jeWPr+aKtei+vueahOaIluiAheWug+WcqGNsb3NlIGxpc3TkuK3vvIwg5b+955Wl5a6DXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9oYWRJbkNsb3NlTGlzdChyYXd4LCByYXd5LCBjbG9zZUxpc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKuavlOi+g0flgLzmjaJQIOi/lOWbniovY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5laWJvdXIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiByYXd4LFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogcmF3eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGg6IE1hdGgubWF4KE1hdGguYWJzKHJhd3ggLSBkZXNUaWxlWCksIE1hdGguYWJzKHJhd3kgLSBkZXNUaWxlWSkpICogMTAsXG4gICAgICAgICAgICAgICAgICAgICAgICBnOiBwYXJlbnQuZyArIChpICE9IDAgJiYgaiAhPSAwID8gMTQgOiAxMCksXG4gICAgICAgICAgICAgICAgICAgICAgICBwOiBwYXJlbnRcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBuZWlib3VyLmYgPSBuZWlib3VyLmggKyBuZWlib3VyLmc7XG5cbiAgICAgICAgICAgICAgICAgICAgb3Blbkxpc3QucHVzaChuZWlib3VyKTsgLy/lpoLmnpzlroPkuI3lnKggb3BlbiBsaXN05LitIOaKiuWug+WKoOWFpSBvcGVuIGxpc3QsXG4gICAgICAgICAgICAgICAgICAgIC8v5bm25LiU5oqK5b2T5YmN5pa55qC86K6+572u5Li65a6D55qE54i25Lqy77yM6K6w5b2V6K+l5pa55qC855qEIEYsIEcg5ZKMIEgg5YC8KOWcqOS4iumdomZvcumHjOWBmuS6hilcblxuICAgICAgICAgICAgICAgICAgICAvL+WmguaenOWug+W3sue7j+WcqCBvcGVuIGxpc3Qg5Lit77yMXG4gICAgICAgICAgICAgICAgICAgIC8v5qOA5p+l6L+Z5p2h6Lev5b6E77yI5Y2z57uP55Sx5b2T5YmN5pa55qC85Yiw6L6+5a6D6YKj6YeM77yJ5piv5ZCm5pu05aW977yMXG4gICAgICAgICAgICAgICAgICAgIC8v55SoIEcg5YC85L2c5Y+C6ICD44CC5pu05bCP55qEIEcg5YC86KGo56S66L+Z5piv5pu05aW955qE6Lev5b6E44CCXG4gICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c5piv6L+Z5qC377yM5oqK5a6D55qE54i25Lqy6K6+572u5Li65b2T5YmN5pa55qC877yMXG4gICAgICAgICAgICAgICAgICAgIC8v5bm26YeN5paw6K6h566X5a6D55qEIEcg5ZKMIEYg5YC844CCXG4gICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c5L2g55qEIG9wZW4gbGlzdCDmmK/mjIkgRiDlgLzmjpLluo/nmoTor53vvIxcbiAgICAgICAgICAgICAgICAgICAgLy/mlLnlj5jlkI7kvaDlj6/og73pnIDopoHph43mlrDmjpLluo/jgIIgKOi/memDqOWIhui/mOayoeacieWunueOsCDnrYkz5pyI5Lu9dGlsZU1hcOWHuuadpeWGjeWKoClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IC8v5YGc5q2i77yM5b2T5L2gXG5cbiAgICAgICAgICAgIC8v5oqK57uI54K55Yqg5YWl5Yiw5LqGIG9wZW4gbGlzdCDkuK3vvIzmraTml7bot6/lvoTlt7Lnu4/mib7liLDkuobvvIzmiJbogIUgKHdoaWxl5LiL56ys5Zub6KGMIOe7iOeCueeahGjkuLowKVxuXG4gICAgICAgICAgICAvL+afpeaJvue7iOeCueWksei0pe+8jOW5tuS4lCBvcGVuIGxpc3Qg5piv56m655qE77yM5q2k5pe25rKh5pyJ6Lev5b6E44CCKOeci3doaWxl5p2h5Lu2KVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlcyA9IGNsb3NlTGlzdC5wb3AoKTsgLy/kv53lrZjot6/lvoTjgILku47nu4jngrnlvIDlp4vvvIxcblxuICAgICAgICB3aGlsZSAoZGVzLnApIHtcbiAgICAgICAgICAgIC8v5q+P5Liq5pa55qC85rK/552A54i26IqC54K556e75Yqo55u06Iez6LW354K577yM6L+Z5bCx5piv5L2g55qE6Lev5b6E44CCKOaIkeaUvuWIsOS6huWNleeLrOeahGZpbmFsTGlzdOS4rSlcbiAgICAgICAgICAgIGRlcy5keCA9IGRlcy54IC0gZGVzLnAueDtcbiAgICAgICAgICAgIGRlcy5keSA9IGRlcy55IC0gZGVzLnAueTtcbiAgICAgICAgICAgIGZpbmFsTGlzdC51bnNoaWZ0KGRlcyk7XG4gICAgICAgICAgICBkZXMgPSBkZXMucDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZmluYWxMaXN0O1xuICAgIH0sXG5cbiAgICBfaGFkSW5DbG9zZUxpc3Q6IGZ1bmN0aW9uIF9oYWRJbkNsb3NlTGlzdCh4LCB5LCBjbG9zZUxpc3QpIHtcbiAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBjbG9zZUxpc3RbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnggPT0geCAmJiBpdGVtLnkgPT0geSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yW1wicmV0dXJuXCJdKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBfc29ydEY6IGZ1bmN0aW9uIF9zb3J0RihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLmYgLSBiLmY7XG4gICAgfSxcblxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxuICAgIG9uTG9hZDogZnVuY3Rpb24gb25Mb2FkKCkge31cblxufSk7XG4vLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuLy8gfSxcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzMzNmY3UW94blpKUGJCVlAxdHdnaHFBJywgJ3NvY2tldC5pbycpO1xuLy8gc2NyaXB0XFxzb2NrZXQuaW8uanNcblxuXCJ1c2Ugc3RyaWN0XCI7aWYoIWNjLnN5cy5pc05hdGl2ZSl7KGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzID0gZigpO31lbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKXtkZWZpbmUoW10sZik7fWVsc2Uge3ZhciBnO2lmKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpe2cgPSB3aW5kb3c7fWVsc2UgaWYodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIil7ZyA9IGdsb2JhbDt9ZWxzZSBpZih0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7ZyA9IHNlbGY7fWVsc2Uge2cgPSB0aGlzO31nLmlvID0gZigpO319KShmdW5jdGlvbigpe3ZhciBkZWZpbmUsbW9kdWxlLGV4cG9ydHM7cmV0dXJuIChmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgcmVxdWlyZTtpZighdSAmJiBhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG8gKyBcIidcIik7dGhyb3cgKGYuY29kZSA9IFwiTU9EVUxFX05PVF9GT1VORFwiLGYpO312YXIgbD1uW29dID0ge2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSk7fSxsLGwuZXhwb3J0cyxlLHQsbixyKTt9cmV0dXJuIG5bb10uZXhwb3J0czt9dmFyIGk9dHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7Zm9yKHZhciBvPTA7byA8IHIubGVuZ3RoO28rKykgcyhyW29dKTtyZXR1cm4gczt9KSh7MTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHMgPSBfZGVyZXFfKCcuL2xpYi8nKTt9LHtcIi4vbGliL1wiOjJ9XSwyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cyA9IF9kZXJlcV8oJy4vc29ja2V0Jyk7IC8qKlxuICogRXhwb3J0cyBwYXJzZXJcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICpcbiAqL21vZHVsZS5leHBvcnRzLnBhcnNlciA9IF9kZXJlcV8oJ2VuZ2luZS5pby1wYXJzZXInKTt9LHtcIi4vc29ja2V0XCI6MyxcImVuZ2luZS5pby1wYXJzZXJcIjoxOX1dLDM6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi92YXIgdHJhbnNwb3J0cz1fZGVyZXFfKCcuL3RyYW5zcG9ydHMnKTt2YXIgRW1pdHRlcj1fZGVyZXFfKCdjb21wb25lbnQtZW1pdHRlcicpO3ZhciBkZWJ1Zz1fZGVyZXFfKCdkZWJ1ZycpKCdlbmdpbmUuaW8tY2xpZW50OnNvY2tldCcpO3ZhciBpbmRleD1fZGVyZXFfKCdpbmRleG9mJyk7dmFyIHBhcnNlcj1fZGVyZXFfKCdlbmdpbmUuaW8tcGFyc2VyJyk7dmFyIHBhcnNldXJpPV9kZXJlcV8oJ3BhcnNldXJpJyk7dmFyIHBhcnNlanNvbj1fZGVyZXFfKCdwYXJzZWpzb24nKTt2YXIgcGFyc2Vxcz1fZGVyZXFfKCdwYXJzZXFzJyk7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IFNvY2tldDsgLyoqXG4gKiBOb29wIGZ1bmN0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gbm9vcCgpe30gLyoqXG4gKiBTb2NrZXQgY29uc3RydWN0b3IuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSB1cmkgb3Igb3B0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBTb2NrZXQodXJpLG9wdHMpe2lmKCEodGhpcyBpbnN0YW5jZW9mIFNvY2tldCkpcmV0dXJuIG5ldyBTb2NrZXQodXJpLG9wdHMpO29wdHMgPSBvcHRzIHx8IHt9O2lmKHVyaSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdXJpKXtvcHRzID0gdXJpO3VyaSA9IG51bGw7fWlmKHVyaSl7dXJpID0gcGFyc2V1cmkodXJpKTtvcHRzLmhvc3RuYW1lID0gdXJpLmhvc3Q7b3B0cy5zZWN1cmUgPSB1cmkucHJvdG9jb2wgPT0gJ2h0dHBzJyB8fCB1cmkucHJvdG9jb2wgPT0gJ3dzcyc7b3B0cy5wb3J0ID0gdXJpLnBvcnQ7aWYodXJpLnF1ZXJ5KW9wdHMucXVlcnkgPSB1cmkucXVlcnk7fWVsc2UgaWYob3B0cy5ob3N0KXtvcHRzLmhvc3RuYW1lID0gcGFyc2V1cmkob3B0cy5ob3N0KS5ob3N0O310aGlzLnNlY3VyZSA9IG51bGwgIT0gb3B0cy5zZWN1cmU/b3B0cy5zZWN1cmU6Z2xvYmFsLmxvY2F0aW9uICYmICdodHRwczonID09IGxvY2F0aW9uLnByb3RvY29sO2lmKG9wdHMuaG9zdG5hbWUgJiYgIW9wdHMucG9ydCl7IC8vIGlmIG5vIHBvcnQgaXMgc3BlY2lmaWVkIG1hbnVhbGx5LCB1c2UgdGhlIHByb3RvY29sIGRlZmF1bHRcbm9wdHMucG9ydCA9IHRoaXMuc2VjdXJlPyc0NDMnOic4MCc7fXRoaXMuYWdlbnQgPSBvcHRzLmFnZW50IHx8IGZhbHNlO3RoaXMuaG9zdG5hbWUgPSBvcHRzLmhvc3RuYW1lIHx8IChnbG9iYWwubG9jYXRpb24/bG9jYXRpb24uaG9zdG5hbWU6J2xvY2FsaG9zdCcpO3RoaXMucG9ydCA9IG9wdHMucG9ydCB8fCAoZ2xvYmFsLmxvY2F0aW9uICYmIGxvY2F0aW9uLnBvcnQ/bG9jYXRpb24ucG9ydDp0aGlzLnNlY3VyZT80NDM6ODApO3RoaXMucXVlcnkgPSBvcHRzLnF1ZXJ5IHx8IHt9O2lmKCdzdHJpbmcnID09IHR5cGVvZiB0aGlzLnF1ZXJ5KXRoaXMucXVlcnkgPSBwYXJzZXFzLmRlY29kZSh0aGlzLnF1ZXJ5KTt0aGlzLnVwZ3JhZGUgPSBmYWxzZSAhPT0gb3B0cy51cGdyYWRlO3RoaXMucGF0aCA9IChvcHRzLnBhdGggfHwgJy9lbmdpbmUuaW8nKS5yZXBsYWNlKC9cXC8kLywnJykgKyAnLyc7dGhpcy5mb3JjZUpTT05QID0gISFvcHRzLmZvcmNlSlNPTlA7dGhpcy5qc29ucCA9IGZhbHNlICE9PSBvcHRzLmpzb25wO3RoaXMuZm9yY2VCYXNlNjQgPSAhIW9wdHMuZm9yY2VCYXNlNjQ7dGhpcy5lbmFibGVzWERSID0gISFvcHRzLmVuYWJsZXNYRFI7dGhpcy50aW1lc3RhbXBQYXJhbSA9IG9wdHMudGltZXN0YW1wUGFyYW0gfHwgJ3QnO3RoaXMudGltZXN0YW1wUmVxdWVzdHMgPSBvcHRzLnRpbWVzdGFtcFJlcXVlc3RzO3RoaXMudHJhbnNwb3J0cyA9IG9wdHMudHJhbnNwb3J0cyB8fCBbJ3BvbGxpbmcnLCd3ZWJzb2NrZXQnXTt0aGlzLnJlYWR5U3RhdGUgPSAnJzt0aGlzLndyaXRlQnVmZmVyID0gW107dGhpcy5wb2xpY3lQb3J0ID0gb3B0cy5wb2xpY3lQb3J0IHx8IDg0Mzt0aGlzLnJlbWVtYmVyVXBncmFkZSA9IG9wdHMucmVtZW1iZXJVcGdyYWRlIHx8IGZhbHNlO3RoaXMuYmluYXJ5VHlwZSA9IG51bGw7dGhpcy5vbmx5QmluYXJ5VXBncmFkZXMgPSBvcHRzLm9ubHlCaW5hcnlVcGdyYWRlczt0aGlzLnBlck1lc3NhZ2VEZWZsYXRlID0gZmFsc2UgIT09IG9wdHMucGVyTWVzc2FnZURlZmxhdGU/b3B0cy5wZXJNZXNzYWdlRGVmbGF0ZSB8fCB7fTpmYWxzZTtpZih0cnVlID09PSB0aGlzLnBlck1lc3NhZ2VEZWZsYXRlKXRoaXMucGVyTWVzc2FnZURlZmxhdGUgPSB7fTtpZih0aGlzLnBlck1lc3NhZ2VEZWZsYXRlICYmIG51bGwgPT0gdGhpcy5wZXJNZXNzYWdlRGVmbGF0ZS50aHJlc2hvbGQpe3RoaXMucGVyTWVzc2FnZURlZmxhdGUudGhyZXNob2xkID0gMTAyNDt9IC8vIFNTTCBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxudGhpcy5wZnggPSBvcHRzLnBmeCB8fCBudWxsO3RoaXMua2V5ID0gb3B0cy5rZXkgfHwgbnVsbDt0aGlzLnBhc3NwaHJhc2UgPSBvcHRzLnBhc3NwaHJhc2UgfHwgbnVsbDt0aGlzLmNlcnQgPSBvcHRzLmNlcnQgfHwgbnVsbDt0aGlzLmNhID0gb3B0cy5jYSB8fCBudWxsO3RoaXMuY2lwaGVycyA9IG9wdHMuY2lwaGVycyB8fCBudWxsO3RoaXMucmVqZWN0VW5hdXRob3JpemVkID0gb3B0cy5yZWplY3RVbmF1dGhvcml6ZWQgPT09IHVuZGVmaW5lZD9udWxsOm9wdHMucmVqZWN0VW5hdXRob3JpemVkOyAvLyBvdGhlciBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxudmFyIGZyZWVHbG9iYWw9dHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7aWYoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwpe2lmKG9wdHMuZXh0cmFIZWFkZXJzICYmIE9iamVjdC5rZXlzKG9wdHMuZXh0cmFIZWFkZXJzKS5sZW5ndGggPiAwKXt0aGlzLmV4dHJhSGVhZGVycyA9IG9wdHMuZXh0cmFIZWFkZXJzO319dGhpcy5vcGVuKCk7fVNvY2tldC5wcmlvcldlYnNvY2tldFN1Y2Nlc3MgPSBmYWxzZTsgLyoqXG4gKiBNaXggaW4gYEVtaXR0ZXJgLlxuICovRW1pdHRlcihTb2NrZXQucHJvdG90eXBlKTsgLyoqXG4gKiBQcm90b2NvbCB2ZXJzaW9uLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9Tb2NrZXQucHJvdG9jb2wgPSBwYXJzZXIucHJvdG9jb2w7IC8vIHRoaXMgaXMgYW4gaW50XG4vKipcbiAqIEV4cG9zZSBkZXBzIGZvciBsZWdhY3kgY29tcGF0aWJpbGl0eVxuICogYW5kIHN0YW5kYWxvbmUgYnJvd3NlciBhY2Nlc3MuXG4gKi9Tb2NrZXQuU29ja2V0ID0gU29ja2V0O1NvY2tldC5UcmFuc3BvcnQgPSBfZGVyZXFfKCcuL3RyYW5zcG9ydCcpO1NvY2tldC50cmFuc3BvcnRzID0gX2RlcmVxXygnLi90cmFuc3BvcnRzJyk7U29ja2V0LnBhcnNlciA9IF9kZXJlcV8oJ2VuZ2luZS5pby1wYXJzZXInKTsgLyoqXG4gKiBDcmVhdGVzIHRyYW5zcG9ydCBvZiB0aGUgZ2l2ZW4gdHlwZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHJhbnNwb3J0IG5hbWVcbiAqIEByZXR1cm4ge1RyYW5zcG9ydH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5jcmVhdGVUcmFuc3BvcnQgPSBmdW5jdGlvbihuYW1lKXtkZWJ1ZygnY3JlYXRpbmcgdHJhbnNwb3J0IFwiJXNcIicsbmFtZSk7dmFyIHF1ZXJ5PWNsb25lKHRoaXMucXVlcnkpOyAvLyBhcHBlbmQgZW5naW5lLmlvIHByb3RvY29sIGlkZW50aWZpZXJcbnF1ZXJ5LkVJTyA9IHBhcnNlci5wcm90b2NvbDsgLy8gdHJhbnNwb3J0IG5hbWVcbnF1ZXJ5LnRyYW5zcG9ydCA9IG5hbWU7IC8vIHNlc3Npb24gaWQgaWYgd2UgYWxyZWFkeSBoYXZlIG9uZVxuaWYodGhpcy5pZClxdWVyeS5zaWQgPSB0aGlzLmlkO3ZhciB0cmFuc3BvcnQ9bmV3IHRyYW5zcG9ydHNbbmFtZV0oe2FnZW50OnRoaXMuYWdlbnQsaG9zdG5hbWU6dGhpcy5ob3N0bmFtZSxwb3J0OnRoaXMucG9ydCxzZWN1cmU6dGhpcy5zZWN1cmUscGF0aDp0aGlzLnBhdGgscXVlcnk6cXVlcnksZm9yY2VKU09OUDp0aGlzLmZvcmNlSlNPTlAsanNvbnA6dGhpcy5qc29ucCxmb3JjZUJhc2U2NDp0aGlzLmZvcmNlQmFzZTY0LGVuYWJsZXNYRFI6dGhpcy5lbmFibGVzWERSLHRpbWVzdGFtcFJlcXVlc3RzOnRoaXMudGltZXN0YW1wUmVxdWVzdHMsdGltZXN0YW1wUGFyYW06dGhpcy50aW1lc3RhbXBQYXJhbSxwb2xpY3lQb3J0OnRoaXMucG9saWN5UG9ydCxzb2NrZXQ6dGhpcyxwZng6dGhpcy5wZngsa2V5OnRoaXMua2V5LHBhc3NwaHJhc2U6dGhpcy5wYXNzcGhyYXNlLGNlcnQ6dGhpcy5jZXJ0LGNhOnRoaXMuY2EsY2lwaGVyczp0aGlzLmNpcGhlcnMscmVqZWN0VW5hdXRob3JpemVkOnRoaXMucmVqZWN0VW5hdXRob3JpemVkLHBlck1lc3NhZ2VEZWZsYXRlOnRoaXMucGVyTWVzc2FnZURlZmxhdGUsZXh0cmFIZWFkZXJzOnRoaXMuZXh0cmFIZWFkZXJzfSk7cmV0dXJuIHRyYW5zcG9ydDt9O2Z1bmN0aW9uIGNsb25lKG9iail7dmFyIG89e307Zm9yKHZhciBpIGluIG9iaikge2lmKG9iai5oYXNPd25Qcm9wZXJ0eShpKSl7b1tpXSA9IG9ialtpXTt9fXJldHVybiBvO30gLyoqXG4gKiBJbml0aWFsaXplcyB0cmFuc3BvcnQgdG8gdXNlIGFuZCBzdGFydHMgcHJvYmUuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbigpe3ZhciB0cmFuc3BvcnQ7aWYodGhpcy5yZW1lbWJlclVwZ3JhZGUgJiYgU29ja2V0LnByaW9yV2Vic29ja2V0U3VjY2VzcyAmJiB0aGlzLnRyYW5zcG9ydHMuaW5kZXhPZignd2Vic29ja2V0JykgIT0gLTEpe3RyYW5zcG9ydCA9ICd3ZWJzb2NrZXQnO31lbHNlIGlmKDAgPT09IHRoaXMudHJhbnNwb3J0cy5sZW5ndGgpeyAvLyBFbWl0IGVycm9yIG9uIG5leHQgdGljayBzbyBpdCBjYW4gYmUgbGlzdGVuZWQgdG9cbnZhciBzZWxmPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe3NlbGYuZW1pdCgnZXJyb3InLCdObyB0cmFuc3BvcnRzIGF2YWlsYWJsZScpO30sMCk7cmV0dXJuO31lbHNlIHt0cmFuc3BvcnQgPSB0aGlzLnRyYW5zcG9ydHNbMF07fXRoaXMucmVhZHlTdGF0ZSA9ICdvcGVuaW5nJzsgLy8gUmV0cnkgd2l0aCB0aGUgbmV4dCB0cmFuc3BvcnQgaWYgdGhlIHRyYW5zcG9ydCBpcyBkaXNhYmxlZCAoanNvbnA6IGZhbHNlKVxudHJ5e3RyYW5zcG9ydCA9IHRoaXMuY3JlYXRlVHJhbnNwb3J0KHRyYW5zcG9ydCk7fWNhdGNoKGUpIHt0aGlzLnRyYW5zcG9ydHMuc2hpZnQoKTt0aGlzLm9wZW4oKTtyZXR1cm47fXRyYW5zcG9ydC5vcGVuKCk7dGhpcy5zZXRUcmFuc3BvcnQodHJhbnNwb3J0KTt9OyAvKipcbiAqIFNldHMgdGhlIGN1cnJlbnQgdHJhbnNwb3J0LiBEaXNhYmxlcyB0aGUgZXhpc3Rpbmcgb25lIChpZiBhbnkpLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5zZXRUcmFuc3BvcnQgPSBmdW5jdGlvbih0cmFuc3BvcnQpe2RlYnVnKCdzZXR0aW5nIHRyYW5zcG9ydCAlcycsdHJhbnNwb3J0Lm5hbWUpO3ZhciBzZWxmPXRoaXM7aWYodGhpcy50cmFuc3BvcnQpe2RlYnVnKCdjbGVhcmluZyBleGlzdGluZyB0cmFuc3BvcnQgJXMnLHRoaXMudHJhbnNwb3J0Lm5hbWUpO3RoaXMudHJhbnNwb3J0LnJlbW92ZUFsbExpc3RlbmVycygpO30gLy8gc2V0IHVwIHRyYW5zcG9ydFxudGhpcy50cmFuc3BvcnQgPSB0cmFuc3BvcnQ7IC8vIHNldCB1cCB0cmFuc3BvcnQgbGlzdGVuZXJzXG50cmFuc3BvcnQub24oJ2RyYWluJyxmdW5jdGlvbigpe3NlbGYub25EcmFpbigpO30pLm9uKCdwYWNrZXQnLGZ1bmN0aW9uKHBhY2tldCl7c2VsZi5vblBhY2tldChwYWNrZXQpO30pLm9uKCdlcnJvcicsZnVuY3Rpb24oZSl7c2VsZi5vbkVycm9yKGUpO30pLm9uKCdjbG9zZScsZnVuY3Rpb24oKXtzZWxmLm9uQ2xvc2UoJ3RyYW5zcG9ydCBjbG9zZScpO30pO307IC8qKlxuICogUHJvYmVzIGEgdHJhbnNwb3J0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0cmFuc3BvcnQgbmFtZVxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLnByb2JlID0gZnVuY3Rpb24obmFtZSl7ZGVidWcoJ3Byb2JpbmcgdHJhbnNwb3J0IFwiJXNcIicsbmFtZSk7dmFyIHRyYW5zcG9ydD10aGlzLmNyZWF0ZVRyYW5zcG9ydChuYW1lLHtwcm9iZToxfSksZmFpbGVkPWZhbHNlLHNlbGY9dGhpcztTb2NrZXQucHJpb3JXZWJzb2NrZXRTdWNjZXNzID0gZmFsc2U7ZnVuY3Rpb24gb25UcmFuc3BvcnRPcGVuKCl7aWYoc2VsZi5vbmx5QmluYXJ5VXBncmFkZXMpe3ZhciB1cGdyYWRlTG9zZXNCaW5hcnk9IXRoaXMuc3VwcG9ydHNCaW5hcnkgJiYgc2VsZi50cmFuc3BvcnQuc3VwcG9ydHNCaW5hcnk7ZmFpbGVkID0gZmFpbGVkIHx8IHVwZ3JhZGVMb3Nlc0JpbmFyeTt9aWYoZmFpbGVkKXJldHVybjtkZWJ1ZygncHJvYmUgdHJhbnNwb3J0IFwiJXNcIiBvcGVuZWQnLG5hbWUpO3RyYW5zcG9ydC5zZW5kKFt7dHlwZToncGluZycsZGF0YToncHJvYmUnfV0pO3RyYW5zcG9ydC5vbmNlKCdwYWNrZXQnLGZ1bmN0aW9uKG1zZyl7aWYoZmFpbGVkKXJldHVybjtpZigncG9uZycgPT0gbXNnLnR5cGUgJiYgJ3Byb2JlJyA9PSBtc2cuZGF0YSl7ZGVidWcoJ3Byb2JlIHRyYW5zcG9ydCBcIiVzXCIgcG9uZycsbmFtZSk7c2VsZi51cGdyYWRpbmcgPSB0cnVlO3NlbGYuZW1pdCgndXBncmFkaW5nJyx0cmFuc3BvcnQpO2lmKCF0cmFuc3BvcnQpcmV0dXJuO1NvY2tldC5wcmlvcldlYnNvY2tldFN1Y2Nlc3MgPSAnd2Vic29ja2V0JyA9PSB0cmFuc3BvcnQubmFtZTtkZWJ1ZygncGF1c2luZyBjdXJyZW50IHRyYW5zcG9ydCBcIiVzXCInLHNlbGYudHJhbnNwb3J0Lm5hbWUpO3NlbGYudHJhbnNwb3J0LnBhdXNlKGZ1bmN0aW9uKCl7aWYoZmFpbGVkKXJldHVybjtpZignY2xvc2VkJyA9PSBzZWxmLnJlYWR5U3RhdGUpcmV0dXJuO2RlYnVnKCdjaGFuZ2luZyB0cmFuc3BvcnQgYW5kIHNlbmRpbmcgdXBncmFkZSBwYWNrZXQnKTtjbGVhbnVwKCk7c2VsZi5zZXRUcmFuc3BvcnQodHJhbnNwb3J0KTt0cmFuc3BvcnQuc2VuZChbe3R5cGU6J3VwZ3JhZGUnfV0pO3NlbGYuZW1pdCgndXBncmFkZScsdHJhbnNwb3J0KTt0cmFuc3BvcnQgPSBudWxsO3NlbGYudXBncmFkaW5nID0gZmFsc2U7c2VsZi5mbHVzaCgpO30pO31lbHNlIHtkZWJ1ZygncHJvYmUgdHJhbnNwb3J0IFwiJXNcIiBmYWlsZWQnLG5hbWUpO3ZhciBlcnI9bmV3IEVycm9yKCdwcm9iZSBlcnJvcicpO2Vyci50cmFuc3BvcnQgPSB0cmFuc3BvcnQubmFtZTtzZWxmLmVtaXQoJ3VwZ3JhZGVFcnJvcicsZXJyKTt9fSk7fWZ1bmN0aW9uIGZyZWV6ZVRyYW5zcG9ydCgpe2lmKGZhaWxlZClyZXR1cm47IC8vIEFueSBjYWxsYmFjayBjYWxsZWQgYnkgdHJhbnNwb3J0IHNob3VsZCBiZSBpZ25vcmVkIHNpbmNlIG5vd1xuZmFpbGVkID0gdHJ1ZTtjbGVhbnVwKCk7dHJhbnNwb3J0LmNsb3NlKCk7dHJhbnNwb3J0ID0gbnVsbDt9IC8vSGFuZGxlIGFueSBlcnJvciB0aGF0IGhhcHBlbnMgd2hpbGUgcHJvYmluZ1xuZnVuY3Rpb24gb25lcnJvcihlcnIpe3ZhciBlcnJvcj1uZXcgRXJyb3IoJ3Byb2JlIGVycm9yOiAnICsgZXJyKTtlcnJvci50cmFuc3BvcnQgPSB0cmFuc3BvcnQubmFtZTtmcmVlemVUcmFuc3BvcnQoKTtkZWJ1ZygncHJvYmUgdHJhbnNwb3J0IFwiJXNcIiBmYWlsZWQgYmVjYXVzZSBvZiBlcnJvcjogJXMnLG5hbWUsZXJyKTtzZWxmLmVtaXQoJ3VwZ3JhZGVFcnJvcicsZXJyb3IpO31mdW5jdGlvbiBvblRyYW5zcG9ydENsb3NlKCl7b25lcnJvcihcInRyYW5zcG9ydCBjbG9zZWRcIik7fSAvL1doZW4gdGhlIHNvY2tldCBpcyBjbG9zZWQgd2hpbGUgd2UncmUgcHJvYmluZ1xuZnVuY3Rpb24gb25jbG9zZSgpe29uZXJyb3IoXCJzb2NrZXQgY2xvc2VkXCIpO30gLy9XaGVuIHRoZSBzb2NrZXQgaXMgdXBncmFkZWQgd2hpbGUgd2UncmUgcHJvYmluZ1xuZnVuY3Rpb24gb251cGdyYWRlKHRvKXtpZih0cmFuc3BvcnQgJiYgdG8ubmFtZSAhPSB0cmFuc3BvcnQubmFtZSl7ZGVidWcoJ1wiJXNcIiB3b3JrcyAtIGFib3J0aW5nIFwiJXNcIicsdG8ubmFtZSx0cmFuc3BvcnQubmFtZSk7ZnJlZXplVHJhbnNwb3J0KCk7fX0gLy9SZW1vdmUgYWxsIGxpc3RlbmVycyBvbiB0aGUgdHJhbnNwb3J0IGFuZCBvbiBzZWxmXG5mdW5jdGlvbiBjbGVhbnVwKCl7dHJhbnNwb3J0LnJlbW92ZUxpc3RlbmVyKCdvcGVuJyxvblRyYW5zcG9ydE9wZW4pO3RyYW5zcG9ydC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLG9uZXJyb3IpO3RyYW5zcG9ydC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLG9uVHJhbnNwb3J0Q2xvc2UpO3NlbGYucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJyxvbmNsb3NlKTtzZWxmLnJlbW92ZUxpc3RlbmVyKCd1cGdyYWRpbmcnLG9udXBncmFkZSk7fXRyYW5zcG9ydC5vbmNlKCdvcGVuJyxvblRyYW5zcG9ydE9wZW4pO3RyYW5zcG9ydC5vbmNlKCdlcnJvcicsb25lcnJvcik7dHJhbnNwb3J0Lm9uY2UoJ2Nsb3NlJyxvblRyYW5zcG9ydENsb3NlKTt0aGlzLm9uY2UoJ2Nsb3NlJyxvbmNsb3NlKTt0aGlzLm9uY2UoJ3VwZ3JhZGluZycsb251cGdyYWRlKTt0cmFuc3BvcnQub3BlbigpO307IC8qKlxuICogQ2FsbGVkIHdoZW4gY29ubmVjdGlvbiBpcyBkZWVtZWQgb3Blbi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovU29ja2V0LnByb3RvdHlwZS5vbk9wZW4gPSBmdW5jdGlvbigpe2RlYnVnKCdzb2NrZXQgb3BlbicpO3RoaXMucmVhZHlTdGF0ZSA9ICdvcGVuJztTb2NrZXQucHJpb3JXZWJzb2NrZXRTdWNjZXNzID0gJ3dlYnNvY2tldCcgPT0gdGhpcy50cmFuc3BvcnQubmFtZTt0aGlzLmVtaXQoJ29wZW4nKTt0aGlzLmZsdXNoKCk7IC8vIHdlIGNoZWNrIGZvciBgcmVhZHlTdGF0ZWAgaW4gY2FzZSBhbiBgb3BlbmBcbi8vIGxpc3RlbmVyIGFscmVhZHkgY2xvc2VkIHRoZSBzb2NrZXRcbmlmKCdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUgJiYgdGhpcy51cGdyYWRlICYmIHRoaXMudHJhbnNwb3J0LnBhdXNlKXtkZWJ1Zygnc3RhcnRpbmcgdXBncmFkZSBwcm9iZXMnKTtmb3IodmFyIGk9MCxsPXRoaXMudXBncmFkZXMubGVuZ3RoO2kgPCBsO2krKykge3RoaXMucHJvYmUodGhpcy51cGdyYWRlc1tpXSk7fX19OyAvKipcbiAqIEhhbmRsZXMgYSBwYWNrZXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9uUGFja2V0ID0gZnVuY3Rpb24ocGFja2V0KXtpZignb3BlbmluZycgPT0gdGhpcy5yZWFkeVN0YXRlIHx8ICdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUpe2RlYnVnKCdzb2NrZXQgcmVjZWl2ZTogdHlwZSBcIiVzXCIsIGRhdGEgXCIlc1wiJyxwYWNrZXQudHlwZSxwYWNrZXQuZGF0YSk7dGhpcy5lbWl0KCdwYWNrZXQnLHBhY2tldCk7IC8vIFNvY2tldCBpcyBsaXZlIC0gYW55IHBhY2tldCBjb3VudHNcbnRoaXMuZW1pdCgnaGVhcnRiZWF0Jyk7c3dpdGNoKHBhY2tldC50eXBlKXtjYXNlICdvcGVuJzp0aGlzLm9uSGFuZHNoYWtlKHBhcnNlanNvbihwYWNrZXQuZGF0YSkpO2JyZWFrO2Nhc2UgJ3BvbmcnOnRoaXMuc2V0UGluZygpO3RoaXMuZW1pdCgncG9uZycpO2JyZWFrO2Nhc2UgJ2Vycm9yJzp2YXIgZXJyPW5ldyBFcnJvcignc2VydmVyIGVycm9yJyk7ZXJyLmNvZGUgPSBwYWNrZXQuZGF0YTt0aGlzLm9uRXJyb3IoZXJyKTticmVhaztjYXNlICdtZXNzYWdlJzp0aGlzLmVtaXQoJ2RhdGEnLHBhY2tldC5kYXRhKTt0aGlzLmVtaXQoJ21lc3NhZ2UnLHBhY2tldC5kYXRhKTticmVhazt9fWVsc2Uge2RlYnVnKCdwYWNrZXQgcmVjZWl2ZWQgd2l0aCBzb2NrZXQgcmVhZHlTdGF0ZSBcIiVzXCInLHRoaXMucmVhZHlTdGF0ZSk7fX07IC8qKlxuICogQ2FsbGVkIHVwb24gaGFuZHNoYWtlIGNvbXBsZXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhhbmRzaGFrZSBvYmpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vbkhhbmRzaGFrZSA9IGZ1bmN0aW9uKGRhdGEpe3RoaXMuZW1pdCgnaGFuZHNoYWtlJyxkYXRhKTt0aGlzLmlkID0gZGF0YS5zaWQ7dGhpcy50cmFuc3BvcnQucXVlcnkuc2lkID0gZGF0YS5zaWQ7dGhpcy51cGdyYWRlcyA9IHRoaXMuZmlsdGVyVXBncmFkZXMoZGF0YS51cGdyYWRlcyk7dGhpcy5waW5nSW50ZXJ2YWwgPSBkYXRhLnBpbmdJbnRlcnZhbDt0aGlzLnBpbmdUaW1lb3V0ID0gZGF0YS5waW5nVGltZW91dDt0aGlzLm9uT3BlbigpOyAvLyBJbiBjYXNlIG9wZW4gaGFuZGxlciBjbG9zZXMgc29ja2V0XG5pZignY2xvc2VkJyA9PSB0aGlzLnJlYWR5U3RhdGUpcmV0dXJuO3RoaXMuc2V0UGluZygpOyAvLyBQcm9sb25nIGxpdmVuZXNzIG9mIHNvY2tldCBvbiBoZWFydGJlYXRcbnRoaXMucmVtb3ZlTGlzdGVuZXIoJ2hlYXJ0YmVhdCcsdGhpcy5vbkhlYXJ0YmVhdCk7dGhpcy5vbignaGVhcnRiZWF0Jyx0aGlzLm9uSGVhcnRiZWF0KTt9OyAvKipcbiAqIFJlc2V0cyBwaW5nIHRpbWVvdXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9uSGVhcnRiZWF0ID0gZnVuY3Rpb24odGltZW91dCl7Y2xlYXJUaW1lb3V0KHRoaXMucGluZ1RpbWVvdXRUaW1lcik7dmFyIHNlbGY9dGhpcztzZWxmLnBpbmdUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aWYoJ2Nsb3NlZCcgPT0gc2VsZi5yZWFkeVN0YXRlKXJldHVybjtzZWxmLm9uQ2xvc2UoJ3BpbmcgdGltZW91dCcpO30sdGltZW91dCB8fCBzZWxmLnBpbmdJbnRlcnZhbCArIHNlbGYucGluZ1RpbWVvdXQpO307IC8qKlxuICogUGluZ3Mgc2VydmVyIGV2ZXJ5IGB0aGlzLnBpbmdJbnRlcnZhbGAgYW5kIGV4cGVjdHMgcmVzcG9uc2VcbiAqIHdpdGhpbiBgdGhpcy5waW5nVGltZW91dGAgb3IgY2xvc2VzIGNvbm5lY3Rpb24uXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLnNldFBpbmcgPSBmdW5jdGlvbigpe3ZhciBzZWxmPXRoaXM7Y2xlYXJUaW1lb3V0KHNlbGYucGluZ0ludGVydmFsVGltZXIpO3NlbGYucGluZ0ludGVydmFsVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVidWcoJ3dyaXRpbmcgcGluZyBwYWNrZXQgLSBleHBlY3RpbmcgcG9uZyB3aXRoaW4gJXNtcycsc2VsZi5waW5nVGltZW91dCk7c2VsZi5waW5nKCk7c2VsZi5vbkhlYXJ0YmVhdChzZWxmLnBpbmdUaW1lb3V0KTt9LHNlbGYucGluZ0ludGVydmFsKTt9OyAvKipcbiogU2VuZHMgYSBwaW5nIHBhY2tldC5cbipcbiogQGFwaSBwcml2YXRlXG4qL1NvY2tldC5wcm90b3R5cGUucGluZyA9IGZ1bmN0aW9uKCl7dmFyIHNlbGY9dGhpczt0aGlzLnNlbmRQYWNrZXQoJ3BpbmcnLGZ1bmN0aW9uKCl7c2VsZi5lbWl0KCdwaW5nJyk7fSk7fTsgLyoqXG4gKiBDYWxsZWQgb24gYGRyYWluYCBldmVudFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vbkRyYWluID0gZnVuY3Rpb24oKXt0aGlzLndyaXRlQnVmZmVyLnNwbGljZSgwLHRoaXMucHJldkJ1ZmZlckxlbik7IC8vIHNldHRpbmcgcHJldkJ1ZmZlckxlbiA9IDAgaXMgdmVyeSBpbXBvcnRhbnRcbi8vIGZvciBleGFtcGxlLCB3aGVuIHVwZ3JhZGluZywgdXBncmFkZSBwYWNrZXQgaXMgc2VudCBvdmVyLFxuLy8gYW5kIGEgbm9uemVybyBwcmV2QnVmZmVyTGVuIGNvdWxkIGNhdXNlIHByb2JsZW1zIG9uIGBkcmFpbmBcbnRoaXMucHJldkJ1ZmZlckxlbiA9IDA7aWYoMCA9PT0gdGhpcy53cml0ZUJ1ZmZlci5sZW5ndGgpe3RoaXMuZW1pdCgnZHJhaW4nKTt9ZWxzZSB7dGhpcy5mbHVzaCgpO319OyAvKipcbiAqIEZsdXNoIHdyaXRlIGJ1ZmZlcnMuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24oKXtpZignY2xvc2VkJyAhPSB0aGlzLnJlYWR5U3RhdGUgJiYgdGhpcy50cmFuc3BvcnQud3JpdGFibGUgJiYgIXRoaXMudXBncmFkaW5nICYmIHRoaXMud3JpdGVCdWZmZXIubGVuZ3RoKXtkZWJ1ZygnZmx1c2hpbmcgJWQgcGFja2V0cyBpbiBzb2NrZXQnLHRoaXMud3JpdGVCdWZmZXIubGVuZ3RoKTt0aGlzLnRyYW5zcG9ydC5zZW5kKHRoaXMud3JpdGVCdWZmZXIpOyAvLyBrZWVwIHRyYWNrIG9mIGN1cnJlbnQgbGVuZ3RoIG9mIHdyaXRlQnVmZmVyXG4vLyBzcGxpY2Ugd3JpdGVCdWZmZXIgYW5kIGNhbGxiYWNrQnVmZmVyIG9uIGBkcmFpbmBcbnRoaXMucHJldkJ1ZmZlckxlbiA9IHRoaXMud3JpdGVCdWZmZXIubGVuZ3RoO3RoaXMuZW1pdCgnZmx1c2gnKTt9fTsgLyoqXG4gKiBTZW5kcyBhIG1lc3NhZ2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLlxuICogQHJldHVybiB7U29ja2V0fSBmb3IgY2hhaW5pbmcuXG4gKiBAYXBpIHB1YmxpY1xuICovU29ja2V0LnByb3RvdHlwZS53cml0ZSA9IFNvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKG1zZyxvcHRpb25zLGZuKXt0aGlzLnNlbmRQYWNrZXQoJ21lc3NhZ2UnLG1zZyxvcHRpb25zLGZuKTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFNlbmRzIGEgcGFja2V0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYWNrZXQgdHlwZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5zZW5kUGFja2V0ID0gZnVuY3Rpb24odHlwZSxkYXRhLG9wdGlvbnMsZm4pe2lmKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpe2ZuID0gZGF0YTtkYXRhID0gdW5kZWZpbmVkO31pZignZnVuY3Rpb24nID09IHR5cGVvZiBvcHRpb25zKXtmbiA9IG9wdGlvbnM7b3B0aW9ucyA9IG51bGw7fWlmKCdjbG9zaW5nJyA9PSB0aGlzLnJlYWR5U3RhdGUgfHwgJ2Nsb3NlZCcgPT0gdGhpcy5yZWFkeVN0YXRlKXtyZXR1cm47fW9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O29wdGlvbnMuY29tcHJlc3MgPSBmYWxzZSAhPT0gb3B0aW9ucy5jb21wcmVzczt2YXIgcGFja2V0PXt0eXBlOnR5cGUsZGF0YTpkYXRhLG9wdGlvbnM6b3B0aW9uc307dGhpcy5lbWl0KCdwYWNrZXRDcmVhdGUnLHBhY2tldCk7dGhpcy53cml0ZUJ1ZmZlci5wdXNoKHBhY2tldCk7aWYoZm4pdGhpcy5vbmNlKCdmbHVzaCcsZm4pO3RoaXMuZmx1c2goKTt9OyAvKipcbiAqIENsb3NlcyB0aGUgY29ubmVjdGlvbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe2lmKCdvcGVuaW5nJyA9PSB0aGlzLnJlYWR5U3RhdGUgfHwgJ29wZW4nID09IHRoaXMucmVhZHlTdGF0ZSl7dGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NpbmcnO3ZhciBzZWxmPXRoaXM7aWYodGhpcy53cml0ZUJ1ZmZlci5sZW5ndGgpe3RoaXMub25jZSgnZHJhaW4nLGZ1bmN0aW9uKCl7aWYodGhpcy51cGdyYWRpbmcpe3dhaXRGb3JVcGdyYWRlKCk7fWVsc2Uge2Nsb3NlKCk7fX0pO31lbHNlIGlmKHRoaXMudXBncmFkaW5nKXt3YWl0Rm9yVXBncmFkZSgpO31lbHNlIHtjbG9zZSgpO319ZnVuY3Rpb24gY2xvc2UoKXtzZWxmLm9uQ2xvc2UoJ2ZvcmNlZCBjbG9zZScpO2RlYnVnKCdzb2NrZXQgY2xvc2luZyAtIHRlbGxpbmcgdHJhbnNwb3J0IHRvIGNsb3NlJyk7c2VsZi50cmFuc3BvcnQuY2xvc2UoKTt9ZnVuY3Rpb24gY2xlYW51cEFuZENsb3NlKCl7c2VsZi5yZW1vdmVMaXN0ZW5lcigndXBncmFkZScsY2xlYW51cEFuZENsb3NlKTtzZWxmLnJlbW92ZUxpc3RlbmVyKCd1cGdyYWRlRXJyb3InLGNsZWFudXBBbmRDbG9zZSk7Y2xvc2UoKTt9ZnVuY3Rpb24gd2FpdEZvclVwZ3JhZGUoKXsgLy8gd2FpdCBmb3IgdXBncmFkZSB0byBmaW5pc2ggc2luY2Ugd2UgY2FuJ3Qgc2VuZCBwYWNrZXRzIHdoaWxlIHBhdXNpbmcgYSB0cmFuc3BvcnRcbnNlbGYub25jZSgndXBncmFkZScsY2xlYW51cEFuZENsb3NlKTtzZWxmLm9uY2UoJ3VwZ3JhZGVFcnJvcicsY2xlYW51cEFuZENsb3NlKTt9cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiB0cmFuc3BvcnQgZXJyb3JcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25FcnJvciA9IGZ1bmN0aW9uKGVycil7ZGVidWcoJ3NvY2tldCBlcnJvciAlaicsZXJyKTtTb2NrZXQucHJpb3JXZWJzb2NrZXRTdWNjZXNzID0gZmFsc2U7dGhpcy5lbWl0KCdlcnJvcicsZXJyKTt0aGlzLm9uQ2xvc2UoJ3RyYW5zcG9ydCBlcnJvcicsZXJyKTt9OyAvKipcbiAqIENhbGxlZCB1cG9uIHRyYW5zcG9ydCBjbG9zZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uKHJlYXNvbixkZXNjKXtpZignb3BlbmluZycgPT0gdGhpcy5yZWFkeVN0YXRlIHx8ICdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUgfHwgJ2Nsb3NpbmcnID09IHRoaXMucmVhZHlTdGF0ZSl7ZGVidWcoJ3NvY2tldCBjbG9zZSB3aXRoIHJlYXNvbjogXCIlc1wiJyxyZWFzb24pO3ZhciBzZWxmPXRoaXM7IC8vIGNsZWFyIHRpbWVyc1xuY2xlYXJUaW1lb3V0KHRoaXMucGluZ0ludGVydmFsVGltZXIpO2NsZWFyVGltZW91dCh0aGlzLnBpbmdUaW1lb3V0VGltZXIpOyAvLyBzdG9wIGV2ZW50IGZyb20gZmlyaW5nIGFnYWluIGZvciB0cmFuc3BvcnRcbnRoaXMudHJhbnNwb3J0LnJlbW92ZUFsbExpc3RlbmVycygnY2xvc2UnKTsgLy8gZW5zdXJlIHRyYW5zcG9ydCB3b24ndCBzdGF5IG9wZW5cbnRoaXMudHJhbnNwb3J0LmNsb3NlKCk7IC8vIGlnbm9yZSBmdXJ0aGVyIHRyYW5zcG9ydCBjb21tdW5pY2F0aW9uXG50aGlzLnRyYW5zcG9ydC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTsgLy8gc2V0IHJlYWR5IHN0YXRlXG50aGlzLnJlYWR5U3RhdGUgPSAnY2xvc2VkJzsgLy8gY2xlYXIgc2Vzc2lvbiBpZFxudGhpcy5pZCA9IG51bGw7IC8vIGVtaXQgY2xvc2UgZXZlbnRcbnRoaXMuZW1pdCgnY2xvc2UnLHJlYXNvbixkZXNjKTsgLy8gY2xlYW4gYnVmZmVycyBhZnRlciwgc28gdXNlcnMgY2FuIHN0aWxsXG4vLyBncmFiIHRoZSBidWZmZXJzIG9uIGBjbG9zZWAgZXZlbnRcbnNlbGYud3JpdGVCdWZmZXIgPSBbXTtzZWxmLnByZXZCdWZmZXJMZW4gPSAwO319OyAvKipcbiAqIEZpbHRlcnMgdXBncmFkZXMsIHJldHVybmluZyBvbmx5IHRob3NlIG1hdGNoaW5nIGNsaWVudCB0cmFuc3BvcnRzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHNlcnZlciB1cGdyYWRlc1xuICogQGFwaSBwcml2YXRlXG4gKlxuICovU29ja2V0LnByb3RvdHlwZS5maWx0ZXJVcGdyYWRlcyA9IGZ1bmN0aW9uKHVwZ3JhZGVzKXt2YXIgZmlsdGVyZWRVcGdyYWRlcz1bXTtmb3IodmFyIGk9MCxqPXVwZ3JhZGVzLmxlbmd0aDtpIDwgajtpKyspIHtpZih+aW5kZXgodGhpcy50cmFuc3BvcnRzLHVwZ3JhZGVzW2ldKSlmaWx0ZXJlZFVwZ3JhZGVzLnB1c2godXBncmFkZXNbaV0pO31yZXR1cm4gZmlsdGVyZWRVcGdyYWRlczt9O30pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHtcIi4vdHJhbnNwb3J0XCI6NCxcIi4vdHJhbnNwb3J0c1wiOjUsXCJjb21wb25lbnQtZW1pdHRlclwiOjE1LFwiZGVidWdcIjoxNyxcImVuZ2luZS5pby1wYXJzZXJcIjoxOSxcImluZGV4b2ZcIjoyMyxcInBhcnNlanNvblwiOjI2LFwicGFyc2Vxc1wiOjI3LFwicGFyc2V1cmlcIjoyOH1dLDQ6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi92YXIgcGFyc2VyPV9kZXJlcV8oJ2VuZ2luZS5pby1wYXJzZXInKTt2YXIgRW1pdHRlcj1fZGVyZXFfKCdjb21wb25lbnQtZW1pdHRlcicpOyAvKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovbW9kdWxlLmV4cG9ydHMgPSBUcmFuc3BvcnQ7IC8qKlxuICogVHJhbnNwb3J0IGFic3RyYWN0IGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLlxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBUcmFuc3BvcnQob3B0cyl7dGhpcy5wYXRoID0gb3B0cy5wYXRoO3RoaXMuaG9zdG5hbWUgPSBvcHRzLmhvc3RuYW1lO3RoaXMucG9ydCA9IG9wdHMucG9ydDt0aGlzLnNlY3VyZSA9IG9wdHMuc2VjdXJlO3RoaXMucXVlcnkgPSBvcHRzLnF1ZXJ5O3RoaXMudGltZXN0YW1wUGFyYW0gPSBvcHRzLnRpbWVzdGFtcFBhcmFtO3RoaXMudGltZXN0YW1wUmVxdWVzdHMgPSBvcHRzLnRpbWVzdGFtcFJlcXVlc3RzO3RoaXMucmVhZHlTdGF0ZSA9ICcnO3RoaXMuYWdlbnQgPSBvcHRzLmFnZW50IHx8IGZhbHNlO3RoaXMuc29ja2V0ID0gb3B0cy5zb2NrZXQ7dGhpcy5lbmFibGVzWERSID0gb3B0cy5lbmFibGVzWERSOyAvLyBTU0wgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbnRoaXMucGZ4ID0gb3B0cy5wZng7dGhpcy5rZXkgPSBvcHRzLmtleTt0aGlzLnBhc3NwaHJhc2UgPSBvcHRzLnBhc3NwaHJhc2U7dGhpcy5jZXJ0ID0gb3B0cy5jZXJ0O3RoaXMuY2EgPSBvcHRzLmNhO3RoaXMuY2lwaGVycyA9IG9wdHMuY2lwaGVyczt0aGlzLnJlamVjdFVuYXV0aG9yaXplZCA9IG9wdHMucmVqZWN0VW5hdXRob3JpemVkOyAvLyBvdGhlciBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxudGhpcy5leHRyYUhlYWRlcnMgPSBvcHRzLmV4dHJhSGVhZGVyczt9IC8qKlxuICogTWl4IGluIGBFbWl0dGVyYC5cbiAqL0VtaXR0ZXIoVHJhbnNwb3J0LnByb3RvdHlwZSk7IC8qKlxuICogRW1pdHMgYW4gZXJyb3IuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7VHJhbnNwb3J0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9UcmFuc3BvcnQucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbihtc2csZGVzYyl7dmFyIGVycj1uZXcgRXJyb3IobXNnKTtlcnIudHlwZSA9ICdUcmFuc3BvcnRFcnJvcic7ZXJyLmRlc2NyaXB0aW9uID0gZGVzYzt0aGlzLmVtaXQoJ2Vycm9yJyxlcnIpO3JldHVybiB0aGlzO307IC8qKlxuICogT3BlbnMgdGhlIHRyYW5zcG9ydC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovVHJhbnNwb3J0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKXtpZignY2xvc2VkJyA9PSB0aGlzLnJlYWR5U3RhdGUgfHwgJycgPT0gdGhpcy5yZWFkeVN0YXRlKXt0aGlzLnJlYWR5U3RhdGUgPSAnb3BlbmluZyc7dGhpcy5kb09wZW4oKTt9cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBDbG9zZXMgdGhlIHRyYW5zcG9ydC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1RyYW5zcG9ydC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbigpe2lmKCdvcGVuaW5nJyA9PSB0aGlzLnJlYWR5U3RhdGUgfHwgJ29wZW4nID09IHRoaXMucmVhZHlTdGF0ZSl7dGhpcy5kb0Nsb3NlKCk7dGhpcy5vbkNsb3NlKCk7fXJldHVybiB0aGlzO307IC8qKlxuICogU2VuZHMgbXVsdGlwbGUgcGFja2V0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWNrZXRzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1RyYW5zcG9ydC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKHBhY2tldHMpe2lmKCdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUpe3RoaXMud3JpdGUocGFja2V0cyk7fWVsc2Uge3Rocm93IG5ldyBFcnJvcignVHJhbnNwb3J0IG5vdCBvcGVuJyk7fX07IC8qKlxuICogQ2FsbGVkIHVwb24gb3BlblxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovVHJhbnNwb3J0LnByb3RvdHlwZS5vbk9wZW4gPSBmdW5jdGlvbigpe3RoaXMucmVhZHlTdGF0ZSA9ICdvcGVuJzt0aGlzLndyaXRhYmxlID0gdHJ1ZTt0aGlzLmVtaXQoJ29wZW4nKTt9OyAvKipcbiAqIENhbGxlZCB3aXRoIGRhdGEuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGRhdGFcbiAqIEBhcGkgcHJpdmF0ZVxuICovVHJhbnNwb3J0LnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbihkYXRhKXt2YXIgcGFja2V0PXBhcnNlci5kZWNvZGVQYWNrZXQoZGF0YSx0aGlzLnNvY2tldC5iaW5hcnlUeXBlKTt0aGlzLm9uUGFja2V0KHBhY2tldCk7fTsgLyoqXG4gKiBDYWxsZWQgd2l0aCBhIGRlY29kZWQgcGFja2V0LlxuICovVHJhbnNwb3J0LnByb3RvdHlwZS5vblBhY2tldCA9IGZ1bmN0aW9uKHBhY2tldCl7dGhpcy5lbWl0KCdwYWNrZXQnLHBhY2tldCk7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBjbG9zZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1RyYW5zcG9ydC5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uKCl7dGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NlZCc7dGhpcy5lbWl0KCdjbG9zZScpO307fSx7XCJjb21wb25lbnQtZW1pdHRlclwiOjE1LFwiZW5naW5lLmlvLXBhcnNlclwiOjE5fV0sNTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCl7IC8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llc1xuICovdmFyIFhNTEh0dHBSZXF1ZXN0PV9kZXJlcV8oJ3htbGh0dHByZXF1ZXN0LXNzbCcpO3ZhciBYSFI9X2RlcmVxXygnLi9wb2xsaW5nLXhocicpO3ZhciBKU09OUD1fZGVyZXFfKCcuL3BvbGxpbmctanNvbnAnKTt2YXIgd2Vic29ja2V0PV9kZXJlcV8oJy4vd2Vic29ja2V0Jyk7IC8qKlxuICogRXhwb3J0IHRyYW5zcG9ydHMuXG4gKi9leHBvcnRzLnBvbGxpbmcgPSBwb2xsaW5nO2V4cG9ydHMud2Vic29ja2V0ID0gd2Vic29ja2V0OyAvKipcbiAqIFBvbGxpbmcgdHJhbnNwb3J0IHBvbHltb3JwaGljIGNvbnN0cnVjdG9yLlxuICogRGVjaWRlcyBvbiB4aHIgdnMganNvbnAgYmFzZWQgb24gZmVhdHVyZSBkZXRlY3Rpb24uXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBwb2xsaW5nKG9wdHMpe3ZhciB4aHI7dmFyIHhkPWZhbHNlO3ZhciB4cz1mYWxzZTt2YXIganNvbnA9ZmFsc2UgIT09IG9wdHMuanNvbnA7aWYoZ2xvYmFsLmxvY2F0aW9uKXt2YXIgaXNTU0w9J2h0dHBzOicgPT0gbG9jYXRpb24ucHJvdG9jb2w7dmFyIHBvcnQ9bG9jYXRpb24ucG9ydDsgLy8gc29tZSB1c2VyIGFnZW50cyBoYXZlIGVtcHR5IGBsb2NhdGlvbi5wb3J0YFxuaWYoIXBvcnQpe3BvcnQgPSBpc1NTTD80NDM6ODA7fXhkID0gb3B0cy5ob3N0bmFtZSAhPSBsb2NhdGlvbi5ob3N0bmFtZSB8fCBwb3J0ICE9IG9wdHMucG9ydDt4cyA9IG9wdHMuc2VjdXJlICE9IGlzU1NMO31vcHRzLnhkb21haW4gPSB4ZDtvcHRzLnhzY2hlbWUgPSB4czt4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Qob3B0cyk7aWYoJ29wZW4nIGluIHhociAmJiAhb3B0cy5mb3JjZUpTT05QKXtyZXR1cm4gbmV3IFhIUihvcHRzKTt9ZWxzZSB7aWYoIWpzb25wKXRocm93IG5ldyBFcnJvcignSlNPTlAgZGlzYWJsZWQnKTtyZXR1cm4gbmV3IEpTT05QKG9wdHMpO319fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se1wiLi9wb2xsaW5nLWpzb25wXCI6NixcIi4vcG9sbGluZy14aHJcIjo3LFwiLi93ZWJzb2NrZXRcIjo5LFwieG1saHR0cHJlcXVlc3Qtc3NsXCI6MTB9XSw2OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLyoqXG4gKiBNb2R1bGUgcmVxdWlyZW1lbnRzLlxuICovdmFyIFBvbGxpbmc9X2RlcmVxXygnLi9wb2xsaW5nJyk7dmFyIGluaGVyaXQ9X2RlcmVxXygnY29tcG9uZW50LWluaGVyaXQnKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gSlNPTlBQb2xsaW5nOyAvKipcbiAqIENhY2hlZCByZWd1bGFyIGV4cHJlc3Npb25zLlxuICovdmFyIHJOZXdsaW5lPS9cXG4vZzt2YXIgckVzY2FwZWROZXdsaW5lPS9cXFxcbi9nOyAvKipcbiAqIEdsb2JhbCBKU09OUCBjYWxsYmFja3MuXG4gKi92YXIgY2FsbGJhY2tzOyAvKipcbiAqIENhbGxiYWNrcyBjb3VudC5cbiAqL3ZhciBpbmRleD0wOyAvKipcbiAqIE5vb3AuXG4gKi9mdW5jdGlvbiBlbXB0eSgpe30gLyoqXG4gKiBKU09OUCBQb2xsaW5nIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzLlxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIEpTT05QUG9sbGluZyhvcHRzKXtQb2xsaW5nLmNhbGwodGhpcyxvcHRzKTt0aGlzLnF1ZXJ5ID0gdGhpcy5xdWVyeSB8fCB7fTsgLy8gZGVmaW5lIGdsb2JhbCBjYWxsYmFja3MgYXJyYXkgaWYgbm90IHByZXNlbnRcbi8vIHdlIGRvIHRoaXMgaGVyZSAobGF6aWx5KSB0byBhdm9pZCB1bm5lZWRlZCBnbG9iYWwgcG9sbHV0aW9uXG5pZighY2FsbGJhY2tzKXsgLy8gd2UgbmVlZCB0byBjb25zaWRlciBtdWx0aXBsZSBlbmdpbmVzIGluIHRoZSBzYW1lIHBhZ2VcbmlmKCFnbG9iYWwuX19fZWlvKWdsb2JhbC5fX19laW8gPSBbXTtjYWxsYmFja3MgPSBnbG9iYWwuX19fZWlvO30gLy8gY2FsbGJhY2sgaWRlbnRpZmllclxudGhpcy5pbmRleCA9IGNhbGxiYWNrcy5sZW5ndGg7IC8vIGFkZCBjYWxsYmFjayB0byBqc29ucCBnbG9iYWxcbnZhciBzZWxmPXRoaXM7Y2FsbGJhY2tzLnB1c2goZnVuY3Rpb24obXNnKXtzZWxmLm9uRGF0YShtc2cpO30pOyAvLyBhcHBlbmQgdG8gcXVlcnkgc3RyaW5nXG50aGlzLnF1ZXJ5LmogPSB0aGlzLmluZGV4OyAvLyBwcmV2ZW50IHNwdXJpb3VzIGVycm9ycyBmcm9tIGJlaW5nIGVtaXR0ZWQgd2hlbiB0aGUgd2luZG93IGlzIHVubG9hZGVkXG5pZihnbG9iYWwuZG9jdW1lbnQgJiYgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIpe2dsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLGZ1bmN0aW9uKCl7aWYoc2VsZi5zY3JpcHQpc2VsZi5zY3JpcHQub25lcnJvciA9IGVtcHR5O30sZmFsc2UpO319IC8qKlxuICogSW5oZXJpdHMgZnJvbSBQb2xsaW5nLlxuICovaW5oZXJpdChKU09OUFBvbGxpbmcsUG9sbGluZyk7IC8qXG4gKiBKU09OUCBvbmx5IHN1cHBvcnRzIGJpbmFyeSBhcyBiYXNlNjQgZW5jb2RlZCBzdHJpbmdzXG4gKi9KU09OUFBvbGxpbmcucHJvdG90eXBlLnN1cHBvcnRzQmluYXJ5ID0gZmFsc2U7IC8qKlxuICogQ2xvc2VzIHRoZSBzb2NrZXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9KU09OUFBvbGxpbmcucHJvdG90eXBlLmRvQ2xvc2UgPSBmdW5jdGlvbigpe2lmKHRoaXMuc2NyaXB0KXt0aGlzLnNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuc2NyaXB0KTt0aGlzLnNjcmlwdCA9IG51bGw7fWlmKHRoaXMuZm9ybSl7dGhpcy5mb3JtLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5mb3JtKTt0aGlzLmZvcm0gPSBudWxsO3RoaXMuaWZyYW1lID0gbnVsbDt9UG9sbGluZy5wcm90b3R5cGUuZG9DbG9zZS5jYWxsKHRoaXMpO307IC8qKlxuICogU3RhcnRzIGEgcG9sbCBjeWNsZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL0pTT05QUG9sbGluZy5wcm90b3R5cGUuZG9Qb2xsID0gZnVuY3Rpb24oKXt2YXIgc2VsZj10aGlzO3ZhciBzY3JpcHQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7aWYodGhpcy5zY3JpcHQpe3RoaXMuc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5zY3JpcHQpO3RoaXMuc2NyaXB0ID0gbnVsbDt9c2NyaXB0LmFzeW5jID0gdHJ1ZTtzY3JpcHQuc3JjID0gdGhpcy51cmkoKTtzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKGUpe3NlbGYub25FcnJvcignanNvbnAgcG9sbCBlcnJvcicsZSk7fTt2YXIgaW5zZXJ0QXQ9ZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdO2lmKGluc2VydEF0KXtpbnNlcnRBdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzY3JpcHQsaW5zZXJ0QXQpO31lbHNlIHsoZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5ib2R5KS5hcHBlbmRDaGlsZChzY3JpcHQpO310aGlzLnNjcmlwdCA9IHNjcmlwdDt2YXIgaXNVQWdlY2tvPSd1bmRlZmluZWQnICE9IHR5cGVvZiBuYXZpZ2F0b3IgJiYgL2dlY2tvL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtpZihpc1VBZ2Vja28pe3NldFRpbWVvdXQoZnVuY3Rpb24oKXt2YXIgaWZyYW1lPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlmcmFtZSk7fSwxMDApO319OyAvKipcbiAqIFdyaXRlcyB3aXRoIGEgaGlkZGVuIGlmcmFtZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZGF0YSB0byBzZW5kXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsZWQgdXBvbiBmbHVzaC5cbiAqIEBhcGkgcHJpdmF0ZVxuICovSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5kb1dyaXRlID0gZnVuY3Rpb24oZGF0YSxmbil7dmFyIHNlbGY9dGhpcztpZighdGhpcy5mb3JtKXt2YXIgZm9ybT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7dmFyIGFyZWE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTt2YXIgaWQ9dGhpcy5pZnJhbWVJZCA9ICdlaW9faWZyYW1lXycgKyB0aGlzLmluZGV4O3ZhciBpZnJhbWU7Zm9ybS5jbGFzc05hbWUgPSAnc29ja2V0aW8nO2Zvcm0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO2Zvcm0uc3R5bGUudG9wID0gJy0xMDAwcHgnO2Zvcm0uc3R5bGUubGVmdCA9ICctMTAwMHB4Jztmb3JtLnRhcmdldCA9IGlkO2Zvcm0ubWV0aG9kID0gJ1BPU1QnO2Zvcm0uc2V0QXR0cmlidXRlKCdhY2NlcHQtY2hhcnNldCcsJ3V0Zi04Jyk7YXJlYS5uYW1lID0gJ2QnO2Zvcm0uYXBwZW5kQ2hpbGQoYXJlYSk7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmb3JtKTt0aGlzLmZvcm0gPSBmb3JtO3RoaXMuYXJlYSA9IGFyZWE7fXRoaXMuZm9ybS5hY3Rpb24gPSB0aGlzLnVyaSgpO2Z1bmN0aW9uIGNvbXBsZXRlKCl7aW5pdElmcmFtZSgpO2ZuKCk7fWZ1bmN0aW9uIGluaXRJZnJhbWUoKXtpZihzZWxmLmlmcmFtZSl7dHJ5e3NlbGYuZm9ybS5yZW1vdmVDaGlsZChzZWxmLmlmcmFtZSk7fWNhdGNoKGUpIHtzZWxmLm9uRXJyb3IoJ2pzb25wIHBvbGxpbmcgaWZyYW1lIHJlbW92YWwgZXJyb3InLGUpO319dHJ5eyAvLyBpZTYgZHluYW1pYyBpZnJhbWVzIHdpdGggdGFyZ2V0PVwiXCIgc3VwcG9ydCAodGhhbmtzIENocmlzIExhbWJhY2hlcilcbnZhciBodG1sPSc8aWZyYW1lIHNyYz1cImphdmFzY3JpcHQ6MFwiIG5hbWU9XCInICsgc2VsZi5pZnJhbWVJZCArICdcIj4nO2lmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaHRtbCk7fWNhdGNoKGUpIHtpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtpZnJhbWUubmFtZSA9IHNlbGYuaWZyYW1lSWQ7aWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0OjAnO31pZnJhbWUuaWQgPSBzZWxmLmlmcmFtZUlkO3NlbGYuZm9ybS5hcHBlbmRDaGlsZChpZnJhbWUpO3NlbGYuaWZyYW1lID0gaWZyYW1lO31pbml0SWZyYW1lKCk7IC8vIGVzY2FwZSBcXG4gdG8gcHJldmVudCBpdCBmcm9tIGJlaW5nIGNvbnZlcnRlZCBpbnRvIFxcclxcbiBieSBzb21lIFVBc1xuLy8gZG91YmxlIGVzY2FwaW5nIGlzIHJlcXVpcmVkIGZvciBlc2NhcGVkIG5ldyBsaW5lcyBiZWNhdXNlIHVuZXNjYXBpbmcgb2YgbmV3IGxpbmVzIGNhbiBiZSBkb25lIHNhZmVseSBvbiBzZXJ2ZXItc2lkZVxuZGF0YSA9IGRhdGEucmVwbGFjZShyRXNjYXBlZE5ld2xpbmUsJ1xcXFxcXG4nKTt0aGlzLmFyZWEudmFsdWUgPSBkYXRhLnJlcGxhY2Uock5ld2xpbmUsJ1xcXFxuJyk7dHJ5e3RoaXMuZm9ybS5zdWJtaXQoKTt9Y2F0Y2goZSkge31pZih0aGlzLmlmcmFtZS5hdHRhY2hFdmVudCl7dGhpcy5pZnJhbWUub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKXtpZihzZWxmLmlmcmFtZS5yZWFkeVN0YXRlID09ICdjb21wbGV0ZScpe2NvbXBsZXRlKCk7fX07fWVsc2Uge3RoaXMuaWZyYW1lLm9ubG9hZCA9IGNvbXBsZXRlO319O30pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHtcIi4vcG9sbGluZ1wiOjgsXCJjb21wb25lbnQtaW5oZXJpdFwiOjE2fV0sNzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCl7IC8qKlxuICogTW9kdWxlIHJlcXVpcmVtZW50cy5cbiAqL3ZhciBYTUxIdHRwUmVxdWVzdD1fZGVyZXFfKCd4bWxodHRwcmVxdWVzdC1zc2wnKTt2YXIgUG9sbGluZz1fZGVyZXFfKCcuL3BvbGxpbmcnKTt2YXIgRW1pdHRlcj1fZGVyZXFfKCdjb21wb25lbnQtZW1pdHRlcicpO3ZhciBpbmhlcml0PV9kZXJlcV8oJ2NvbXBvbmVudC1pbmhlcml0Jyk7dmFyIGRlYnVnPV9kZXJlcV8oJ2RlYnVnJykoJ2VuZ2luZS5pby1jbGllbnQ6cG9sbGluZy14aHInKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gWEhSO21vZHVsZS5leHBvcnRzLlJlcXVlc3QgPSBSZXF1ZXN0OyAvKipcbiAqIEVtcHR5IGZ1bmN0aW9uXG4gKi9mdW5jdGlvbiBlbXB0eSgpe30gLyoqXG4gKiBYSFIgUG9sbGluZyBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIFhIUihvcHRzKXtQb2xsaW5nLmNhbGwodGhpcyxvcHRzKTtpZihnbG9iYWwubG9jYXRpb24pe3ZhciBpc1NTTD0naHR0cHM6JyA9PSBsb2NhdGlvbi5wcm90b2NvbDt2YXIgcG9ydD1sb2NhdGlvbi5wb3J0OyAvLyBzb21lIHVzZXIgYWdlbnRzIGhhdmUgZW1wdHkgYGxvY2F0aW9uLnBvcnRgXG5pZighcG9ydCl7cG9ydCA9IGlzU1NMPzQ0Mzo4MDt9dGhpcy54ZCA9IG9wdHMuaG9zdG5hbWUgIT0gZ2xvYmFsLmxvY2F0aW9uLmhvc3RuYW1lIHx8IHBvcnQgIT0gb3B0cy5wb3J0O3RoaXMueHMgPSBvcHRzLnNlY3VyZSAhPSBpc1NTTDt9ZWxzZSB7dGhpcy5leHRyYUhlYWRlcnMgPSBvcHRzLmV4dHJhSGVhZGVyczt9fSAvKipcbiAqIEluaGVyaXRzIGZyb20gUG9sbGluZy5cbiAqL2luaGVyaXQoWEhSLFBvbGxpbmcpOyAvKipcbiAqIFhIUiBzdXBwb3J0cyBiaW5hcnlcbiAqL1hIUi5wcm90b3R5cGUuc3VwcG9ydHNCaW5hcnkgPSB0cnVlOyAvKipcbiAqIENyZWF0ZXMgYSByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBhcGkgcHJpdmF0ZVxuICovWEhSLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24ob3B0cyl7b3B0cyA9IG9wdHMgfHwge307b3B0cy51cmkgPSB0aGlzLnVyaSgpO29wdHMueGQgPSB0aGlzLnhkO29wdHMueHMgPSB0aGlzLnhzO29wdHMuYWdlbnQgPSB0aGlzLmFnZW50IHx8IGZhbHNlO29wdHMuc3VwcG9ydHNCaW5hcnkgPSB0aGlzLnN1cHBvcnRzQmluYXJ5O29wdHMuZW5hYmxlc1hEUiA9IHRoaXMuZW5hYmxlc1hEUjsgLy8gU1NMIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG5vcHRzLnBmeCA9IHRoaXMucGZ4O29wdHMua2V5ID0gdGhpcy5rZXk7b3B0cy5wYXNzcGhyYXNlID0gdGhpcy5wYXNzcGhyYXNlO29wdHMuY2VydCA9IHRoaXMuY2VydDtvcHRzLmNhID0gdGhpcy5jYTtvcHRzLmNpcGhlcnMgPSB0aGlzLmNpcGhlcnM7b3B0cy5yZWplY3RVbmF1dGhvcml6ZWQgPSB0aGlzLnJlamVjdFVuYXV0aG9yaXplZDsgLy8gb3RoZXIgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbm9wdHMuZXh0cmFIZWFkZXJzID0gdGhpcy5leHRyYUhlYWRlcnM7cmV0dXJuIG5ldyBSZXF1ZXN0KG9wdHMpO307IC8qKlxuICogU2VuZHMgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZGF0YSB0byBzZW5kLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGVkIHVwb24gZmx1c2guXG4gKiBAYXBpIHByaXZhdGVcbiAqL1hIUi5wcm90b3R5cGUuZG9Xcml0ZSA9IGZ1bmN0aW9uKGRhdGEsZm4pe3ZhciBpc0JpbmFyeT10eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycgJiYgZGF0YSAhPT0gdW5kZWZpbmVkO3ZhciByZXE9dGhpcy5yZXF1ZXN0KHttZXRob2Q6J1BPU1QnLGRhdGE6ZGF0YSxpc0JpbmFyeTppc0JpbmFyeX0pO3ZhciBzZWxmPXRoaXM7cmVxLm9uKCdzdWNjZXNzJyxmbik7cmVxLm9uKCdlcnJvcicsZnVuY3Rpb24oZXJyKXtzZWxmLm9uRXJyb3IoJ3hociBwb3N0IGVycm9yJyxlcnIpO30pO3RoaXMuc2VuZFhociA9IHJlcTt9OyAvKipcbiAqIFN0YXJ0cyBhIHBvbGwgY3ljbGUuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9YSFIucHJvdG90eXBlLmRvUG9sbCA9IGZ1bmN0aW9uKCl7ZGVidWcoJ3hociBwb2xsJyk7dmFyIHJlcT10aGlzLnJlcXVlc3QoKTt2YXIgc2VsZj10aGlzO3JlcS5vbignZGF0YScsZnVuY3Rpb24oZGF0YSl7c2VsZi5vbkRhdGEoZGF0YSk7fSk7cmVxLm9uKCdlcnJvcicsZnVuY3Rpb24oZXJyKXtzZWxmLm9uRXJyb3IoJ3hociBwb2xsIGVycm9yJyxlcnIpO30pO3RoaXMucG9sbFhociA9IHJlcTt9OyAvKipcbiAqIFJlcXVlc3QgY29uc3RydWN0b3JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIFJlcXVlc3Qob3B0cyl7dGhpcy5tZXRob2QgPSBvcHRzLm1ldGhvZCB8fCAnR0VUJzt0aGlzLnVyaSA9IG9wdHMudXJpO3RoaXMueGQgPSAhIW9wdHMueGQ7dGhpcy54cyA9ICEhb3B0cy54czt0aGlzLmFzeW5jID0gZmFsc2UgIT09IG9wdHMuYXN5bmM7dGhpcy5kYXRhID0gdW5kZWZpbmVkICE9IG9wdHMuZGF0YT9vcHRzLmRhdGE6bnVsbDt0aGlzLmFnZW50ID0gb3B0cy5hZ2VudDt0aGlzLmlzQmluYXJ5ID0gb3B0cy5pc0JpbmFyeTt0aGlzLnN1cHBvcnRzQmluYXJ5ID0gb3B0cy5zdXBwb3J0c0JpbmFyeTt0aGlzLmVuYWJsZXNYRFIgPSBvcHRzLmVuYWJsZXNYRFI7IC8vIFNTTCBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxudGhpcy5wZnggPSBvcHRzLnBmeDt0aGlzLmtleSA9IG9wdHMua2V5O3RoaXMucGFzc3BocmFzZSA9IG9wdHMucGFzc3BocmFzZTt0aGlzLmNlcnQgPSBvcHRzLmNlcnQ7dGhpcy5jYSA9IG9wdHMuY2E7dGhpcy5jaXBoZXJzID0gb3B0cy5jaXBoZXJzO3RoaXMucmVqZWN0VW5hdXRob3JpemVkID0gb3B0cy5yZWplY3RVbmF1dGhvcml6ZWQ7IC8vIG90aGVyIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG50aGlzLmV4dHJhSGVhZGVycyA9IG9wdHMuZXh0cmFIZWFkZXJzO3RoaXMuY3JlYXRlKCk7fSAvKipcbiAqIE1peCBpbiBgRW1pdHRlcmAuXG4gKi9FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTsgLyoqXG4gKiBDcmVhdGVzIHRoZSBYSFIgb2JqZWN0IGFuZCBzZW5kcyB0aGUgcmVxdWVzdC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1JlcXVlc3QucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKCl7dmFyIG9wdHM9e2FnZW50OnRoaXMuYWdlbnQseGRvbWFpbjp0aGlzLnhkLHhzY2hlbWU6dGhpcy54cyxlbmFibGVzWERSOnRoaXMuZW5hYmxlc1hEUn07IC8vIFNTTCBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxub3B0cy5wZnggPSB0aGlzLnBmeDtvcHRzLmtleSA9IHRoaXMua2V5O29wdHMucGFzc3BocmFzZSA9IHRoaXMucGFzc3BocmFzZTtvcHRzLmNlcnQgPSB0aGlzLmNlcnQ7b3B0cy5jYSA9IHRoaXMuY2E7b3B0cy5jaXBoZXJzID0gdGhpcy5jaXBoZXJzO29wdHMucmVqZWN0VW5hdXRob3JpemVkID0gdGhpcy5yZWplY3RVbmF1dGhvcml6ZWQ7dmFyIHhocj10aGlzLnhociA9IG5ldyBYTUxIdHRwUmVxdWVzdChvcHRzKTt2YXIgc2VsZj10aGlzO3RyeXtkZWJ1ZygneGhyIG9wZW4gJXM6ICVzJyx0aGlzLm1ldGhvZCx0aGlzLnVyaSk7eGhyLm9wZW4odGhpcy5tZXRob2QsdGhpcy51cmksdGhpcy5hc3luYyk7dHJ5e2lmKHRoaXMuZXh0cmFIZWFkZXJzKXt4aHIuc2V0RGlzYWJsZUhlYWRlckNoZWNrKHRydWUpO2Zvcih2YXIgaSBpbiB0aGlzLmV4dHJhSGVhZGVycykge2lmKHRoaXMuZXh0cmFIZWFkZXJzLmhhc093blByb3BlcnR5KGkpKXt4aHIuc2V0UmVxdWVzdEhlYWRlcihpLHRoaXMuZXh0cmFIZWFkZXJzW2ldKTt9fX19Y2F0Y2goZSkge31pZih0aGlzLnN1cHBvcnRzQmluYXJ5KXsgLy8gVGhpcyBoYXMgdG8gYmUgZG9uZSBhZnRlciBvcGVuIGJlY2F1c2UgRmlyZWZveCBpcyBzdHVwaWRcbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTMyMTY5MDMvZ2V0LWJpbmFyeS1kYXRhLXdpdGgteG1saHR0cHJlcXVlc3QtaW4tYS1maXJlZm94LWV4dGVuc2lvblxueGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7fWlmKCdQT1NUJyA9PSB0aGlzLm1ldGhvZCl7dHJ5e2lmKHRoaXMuaXNCaW5hcnkpe3hoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nKTt9ZWxzZSB7eGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpO319Y2F0Y2goZSkge319IC8vIGllNiBjaGVja1xuaWYoJ3dpdGhDcmVkZW50aWFscycgaW4geGhyKXt4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTt9aWYodGhpcy5oYXNYRFIoKSl7eGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7c2VsZi5vbkxvYWQoKTt9O3hoci5vbmVycm9yID0gZnVuY3Rpb24oKXtzZWxmLm9uRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCk7fTt9ZWxzZSB7eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7aWYoNCAhPSB4aHIucmVhZHlTdGF0ZSlyZXR1cm47aWYoMjAwID09IHhoci5zdGF0dXMgfHwgMTIyMyA9PSB4aHIuc3RhdHVzKXtzZWxmLm9uTG9hZCgpO31lbHNlIHsgLy8gbWFrZSBzdXJlIHRoZSBgZXJyb3JgIGV2ZW50IGhhbmRsZXIgdGhhdCdzIHVzZXItc2V0XG4vLyBkb2VzIG5vdCB0aHJvdyBpbiB0aGUgc2FtZSB0aWNrIGFuZCBnZXRzIGNhdWdodCBoZXJlXG5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2VsZi5vbkVycm9yKHhoci5zdGF0dXMpO30sMCk7fX07fWRlYnVnKCd4aHIgZGF0YSAlcycsdGhpcy5kYXRhKTt4aHIuc2VuZCh0aGlzLmRhdGEpO31jYXRjaChlKSB7IC8vIE5lZWQgdG8gZGVmZXIgc2luY2UgLmNyZWF0ZSgpIGlzIGNhbGxlZCBkaXJlY3RseSBmaHJvbSB0aGUgY29uc3RydWN0b3Jcbi8vIGFuZCB0aHVzIHRoZSAnZXJyb3InIGV2ZW50IGNhbiBvbmx5IGJlIG9ubHkgYm91bmQgKmFmdGVyKiB0aGlzIGV4Y2VwdGlvblxuLy8gb2NjdXJzLiAgVGhlcmVmb3JlLCBhbHNvLCB3ZSBjYW5ub3QgdGhyb3cgaGVyZSBhdCBhbGwuXG5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7c2VsZi5vbkVycm9yKGUpO30sMCk7cmV0dXJuO31pZihnbG9iYWwuZG9jdW1lbnQpe3RoaXMuaW5kZXggPSBSZXF1ZXN0LnJlcXVlc3RzQ291bnQrKztSZXF1ZXN0LnJlcXVlc3RzW3RoaXMuaW5kZXhdID0gdGhpczt9fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBzdWNjZXNzZnVsIHJlc3BvbnNlLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovUmVxdWVzdC5wcm90b3R5cGUub25TdWNjZXNzID0gZnVuY3Rpb24oKXt0aGlzLmVtaXQoJ3N1Y2Nlc3MnKTt0aGlzLmNsZWFudXAoKTt9OyAvKipcbiAqIENhbGxlZCBpZiB3ZSBoYXZlIGRhdGEuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9SZXF1ZXN0LnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbihkYXRhKXt0aGlzLmVtaXQoJ2RhdGEnLGRhdGEpO3RoaXMub25TdWNjZXNzKCk7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1JlcXVlc3QucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbihlcnIpe3RoaXMuZW1pdCgnZXJyb3InLGVycik7dGhpcy5jbGVhbnVwKHRydWUpO307IC8qKlxuICogQ2xlYW5zIHVwIGhvdXNlLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovUmVxdWVzdC5wcm90b3R5cGUuY2xlYW51cCA9IGZ1bmN0aW9uKGZyb21FcnJvcil7aWYoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHRoaXMueGhyIHx8IG51bGwgPT09IHRoaXMueGhyKXtyZXR1cm47fSAvLyB4bWxodHRwcmVxdWVzdFxuaWYodGhpcy5oYXNYRFIoKSl7dGhpcy54aHIub25sb2FkID0gdGhpcy54aHIub25lcnJvciA9IGVtcHR5O31lbHNlIHt0aGlzLnhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBlbXB0eTt9aWYoZnJvbUVycm9yKXt0cnl7dGhpcy54aHIuYWJvcnQoKTt9Y2F0Y2goZSkge319aWYoZ2xvYmFsLmRvY3VtZW50KXtkZWxldGUgUmVxdWVzdC5yZXF1ZXN0c1t0aGlzLmluZGV4XTt9dGhpcy54aHIgPSBudWxsO307IC8qKlxuICogQ2FsbGVkIHVwb24gbG9hZC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1JlcXVlc3QucHJvdG90eXBlLm9uTG9hZCA9IGZ1bmN0aW9uKCl7dmFyIGRhdGE7dHJ5e3ZhciBjb250ZW50VHlwZTt0cnl7Y29udGVudFR5cGUgPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1UeXBlJykuc3BsaXQoJzsnKVswXTt9Y2F0Y2goZSkge31pZihjb250ZW50VHlwZSA9PT0gJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScpe2RhdGEgPSB0aGlzLnhoci5yZXNwb25zZTt9ZWxzZSB7aWYoIXRoaXMuc3VwcG9ydHNCaW5hcnkpe2RhdGEgPSB0aGlzLnhoci5yZXNwb25zZVRleHQ7fWVsc2Uge3RyeXtkYXRhID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLG5ldyBVaW50OEFycmF5KHRoaXMueGhyLnJlc3BvbnNlKSk7fWNhdGNoKGUpIHt2YXIgdWk4QXJyPW5ldyBVaW50OEFycmF5KHRoaXMueGhyLnJlc3BvbnNlKTt2YXIgZGF0YUFycmF5PVtdO2Zvcih2YXIgaWR4PTAsbGVuZ3RoPXVpOEFyci5sZW5ndGg7aWR4IDwgbGVuZ3RoO2lkeCsrKSB7ZGF0YUFycmF5LnB1c2godWk4QXJyW2lkeF0pO31kYXRhID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLGRhdGFBcnJheSk7fX19fWNhdGNoKGUpIHt0aGlzLm9uRXJyb3IoZSk7fWlmKG51bGwgIT0gZGF0YSl7dGhpcy5vbkRhdGEoZGF0YSk7fX07IC8qKlxuICogQ2hlY2sgaWYgaXQgaGFzIFhEb21haW5SZXF1ZXN0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovUmVxdWVzdC5wcm90b3R5cGUuaGFzWERSID0gZnVuY3Rpb24oKXtyZXR1cm4gJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBnbG9iYWwuWERvbWFpblJlcXVlc3QgJiYgIXRoaXMueHMgJiYgdGhpcy5lbmFibGVzWERSO307IC8qKlxuICogQWJvcnRzIHRoZSByZXF1ZXN0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9SZXF1ZXN0LnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCl7dGhpcy5jbGVhbnVwKCk7fTsgLyoqXG4gKiBBYm9ydHMgcGVuZGluZyByZXF1ZXN0cyB3aGVuIHVubG9hZGluZyB0aGUgd2luZG93LiBUaGlzIGlzIG5lZWRlZCB0byBwcmV2ZW50XG4gKiBtZW1vcnkgbGVha3MgKGUuZy4gd2hlbiB1c2luZyBJRSkgYW5kIHRvIGVuc3VyZSB0aGF0IG5vIHNwdXJpb3VzIGVycm9yIGlzXG4gKiBlbWl0dGVkLlxuICovaWYoZ2xvYmFsLmRvY3VtZW50KXtSZXF1ZXN0LnJlcXVlc3RzQ291bnQgPSAwO1JlcXVlc3QucmVxdWVzdHMgPSB7fTtpZihnbG9iYWwuYXR0YWNoRXZlbnQpe2dsb2JhbC5hdHRhY2hFdmVudCgnb251bmxvYWQnLHVubG9hZEhhbmRsZXIpO31lbHNlIGlmKGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKXtnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJyx1bmxvYWRIYW5kbGVyLGZhbHNlKTt9fWZ1bmN0aW9uIHVubG9hZEhhbmRsZXIoKXtmb3IodmFyIGkgaW4gUmVxdWVzdC5yZXF1ZXN0cykge2lmKFJlcXVlc3QucmVxdWVzdHMuaGFzT3duUHJvcGVydHkoaSkpe1JlcXVlc3QucmVxdWVzdHNbaV0uYWJvcnQoKTt9fX19KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7XCIuL3BvbGxpbmdcIjo4LFwiY29tcG9uZW50LWVtaXR0ZXJcIjoxNSxcImNvbXBvbmVudC1pbmhlcml0XCI6MTYsXCJkZWJ1Z1wiOjE3LFwieG1saHR0cHJlcXVlc3Qtc3NsXCI6MTB9XSw4OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIFRyYW5zcG9ydD1fZGVyZXFfKCcuLi90cmFuc3BvcnQnKTt2YXIgcGFyc2Vxcz1fZGVyZXFfKCdwYXJzZXFzJyk7dmFyIHBhcnNlcj1fZGVyZXFfKCdlbmdpbmUuaW8tcGFyc2VyJyk7dmFyIGluaGVyaXQ9X2RlcmVxXygnY29tcG9uZW50LWluaGVyaXQnKTt2YXIgeWVhc3Q9X2RlcmVxXygneWVhc3QnKTt2YXIgZGVidWc9X2RlcmVxXygnZGVidWcnKSgnZW5naW5lLmlvLWNsaWVudDpwb2xsaW5nJyk7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IFBvbGxpbmc7IC8qKlxuICogSXMgWEhSMiBzdXBwb3J0ZWQ/XG4gKi92YXIgaGFzWEhSMj0oZnVuY3Rpb24oKXt2YXIgWE1MSHR0cFJlcXVlc3Q9X2RlcmVxXygneG1saHR0cHJlcXVlc3Qtc3NsJyk7dmFyIHhocj1uZXcgWE1MSHR0cFJlcXVlc3Qoe3hkb21haW46ZmFsc2V9KTtyZXR1cm4gbnVsbCAhPSB4aHIucmVzcG9uc2VUeXBlO30pKCk7IC8qKlxuICogUG9sbGluZyBpbnRlcmZhY2UuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gUG9sbGluZyhvcHRzKXt2YXIgZm9yY2VCYXNlNjQ9b3B0cyAmJiBvcHRzLmZvcmNlQmFzZTY0O2lmKCFoYXNYSFIyIHx8IGZvcmNlQmFzZTY0KXt0aGlzLnN1cHBvcnRzQmluYXJ5ID0gZmFsc2U7fVRyYW5zcG9ydC5jYWxsKHRoaXMsb3B0cyk7fSAvKipcbiAqIEluaGVyaXRzIGZyb20gVHJhbnNwb3J0LlxuICovaW5oZXJpdChQb2xsaW5nLFRyYW5zcG9ydCk7IC8qKlxuICogVHJhbnNwb3J0IG5hbWUuXG4gKi9Qb2xsaW5nLnByb3RvdHlwZS5uYW1lID0gJ3BvbGxpbmcnOyAvKipcbiAqIE9wZW5zIHRoZSBzb2NrZXQgKHRyaWdnZXJzIHBvbGxpbmcpLiBXZSB3cml0ZSBhIFBJTkcgbWVzc2FnZSB0byBkZXRlcm1pbmVcbiAqIHdoZW4gdGhlIHRyYW5zcG9ydCBpcyBvcGVuLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovUG9sbGluZy5wcm90b3R5cGUuZG9PcGVuID0gZnVuY3Rpb24oKXt0aGlzLnBvbGwoKTt9OyAvKipcbiAqIFBhdXNlcyBwb2xsaW5nLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIHVwb24gYnVmZmVycyBhcmUgZmx1c2hlZCBhbmQgdHJhbnNwb3J0IGlzIHBhdXNlZFxuICogQGFwaSBwcml2YXRlXG4gKi9Qb2xsaW5nLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKG9uUGF1c2Upe3ZhciBwZW5kaW5nPTA7dmFyIHNlbGY9dGhpczt0aGlzLnJlYWR5U3RhdGUgPSAncGF1c2luZyc7ZnVuY3Rpb24gcGF1c2UoKXtkZWJ1ZygncGF1c2VkJyk7c2VsZi5yZWFkeVN0YXRlID0gJ3BhdXNlZCc7b25QYXVzZSgpO31pZih0aGlzLnBvbGxpbmcgfHwgIXRoaXMud3JpdGFibGUpe3ZhciB0b3RhbD0wO2lmKHRoaXMucG9sbGluZyl7ZGVidWcoJ3dlIGFyZSBjdXJyZW50bHkgcG9sbGluZyAtIHdhaXRpbmcgdG8gcGF1c2UnKTt0b3RhbCsrO3RoaXMub25jZSgncG9sbENvbXBsZXRlJyxmdW5jdGlvbigpe2RlYnVnKCdwcmUtcGF1c2UgcG9sbGluZyBjb21wbGV0ZScpOy0tdG90YWwgfHwgcGF1c2UoKTt9KTt9aWYoIXRoaXMud3JpdGFibGUpe2RlYnVnKCd3ZSBhcmUgY3VycmVudGx5IHdyaXRpbmcgLSB3YWl0aW5nIHRvIHBhdXNlJyk7dG90YWwrKzt0aGlzLm9uY2UoJ2RyYWluJyxmdW5jdGlvbigpe2RlYnVnKCdwcmUtcGF1c2Ugd3JpdGluZyBjb21wbGV0ZScpOy0tdG90YWwgfHwgcGF1c2UoKTt9KTt9fWVsc2Uge3BhdXNlKCk7fX07IC8qKlxuICogU3RhcnRzIHBvbGxpbmcgY3ljbGUuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1BvbGxpbmcucHJvdG90eXBlLnBvbGwgPSBmdW5jdGlvbigpe2RlYnVnKCdwb2xsaW5nJyk7dGhpcy5wb2xsaW5nID0gdHJ1ZTt0aGlzLmRvUG9sbCgpO3RoaXMuZW1pdCgncG9sbCcpO307IC8qKlxuICogT3ZlcmxvYWRzIG9uRGF0YSB0byBkZXRlY3QgcGF5bG9hZHMuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Qb2xsaW5nLnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbihkYXRhKXt2YXIgc2VsZj10aGlzO2RlYnVnKCdwb2xsaW5nIGdvdCBkYXRhICVzJyxkYXRhKTt2YXIgY2FsbGJhY2s9ZnVuY3Rpb24gY2FsbGJhY2socGFja2V0LGluZGV4LHRvdGFsKXsgLy8gaWYgaXRzIHRoZSBmaXJzdCBtZXNzYWdlIHdlIGNvbnNpZGVyIHRoZSB0cmFuc3BvcnQgb3BlblxuaWYoJ29wZW5pbmcnID09IHNlbGYucmVhZHlTdGF0ZSl7c2VsZi5vbk9wZW4oKTt9IC8vIGlmIGl0cyBhIGNsb3NlIHBhY2tldCwgd2UgY2xvc2UgdGhlIG9uZ29pbmcgcmVxdWVzdHNcbmlmKCdjbG9zZScgPT0gcGFja2V0LnR5cGUpe3NlbGYub25DbG9zZSgpO3JldHVybiBmYWxzZTt9IC8vIG90aGVyd2lzZSBieXBhc3Mgb25EYXRhIGFuZCBoYW5kbGUgdGhlIG1lc3NhZ2VcbnNlbGYub25QYWNrZXQocGFja2V0KTt9OyAvLyBkZWNvZGUgcGF5bG9hZFxucGFyc2VyLmRlY29kZVBheWxvYWQoZGF0YSx0aGlzLnNvY2tldC5iaW5hcnlUeXBlLGNhbGxiYWNrKTsgLy8gaWYgYW4gZXZlbnQgZGlkIG5vdCB0cmlnZ2VyIGNsb3NpbmdcbmlmKCdjbG9zZWQnICE9IHRoaXMucmVhZHlTdGF0ZSl7IC8vIGlmIHdlIGdvdCBkYXRhIHdlJ3JlIG5vdCBwb2xsaW5nXG50aGlzLnBvbGxpbmcgPSBmYWxzZTt0aGlzLmVtaXQoJ3BvbGxDb21wbGV0ZScpO2lmKCdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUpe3RoaXMucG9sbCgpO31lbHNlIHtkZWJ1ZygnaWdub3JpbmcgcG9sbCAtIHRyYW5zcG9ydCBzdGF0ZSBcIiVzXCInLHRoaXMucmVhZHlTdGF0ZSk7fX19OyAvKipcbiAqIEZvciBwb2xsaW5nLCBzZW5kIGEgY2xvc2UgcGFja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovUG9sbGluZy5wcm90b3R5cGUuZG9DbG9zZSA9IGZ1bmN0aW9uKCl7dmFyIHNlbGY9dGhpcztmdW5jdGlvbiBjbG9zZSgpe2RlYnVnKCd3cml0aW5nIGNsb3NlIHBhY2tldCcpO3NlbGYud3JpdGUoW3t0eXBlOidjbG9zZSd9XSk7fWlmKCdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUpe2RlYnVnKCd0cmFuc3BvcnQgb3BlbiAtIGNsb3NpbmcnKTtjbG9zZSgpO31lbHNlIHsgLy8gaW4gY2FzZSB3ZSdyZSB0cnlpbmcgdG8gY2xvc2Ugd2hpbGVcbi8vIGhhbmRzaGFraW5nIGlzIGluIHByb2dyZXNzIChHSC0xNjQpXG5kZWJ1ZygndHJhbnNwb3J0IG5vdCBvcGVuIC0gZGVmZXJyaW5nIGNsb3NlJyk7dGhpcy5vbmNlKCdvcGVuJyxjbG9zZSk7fX07IC8qKlxuICogV3JpdGVzIGEgcGFja2V0cyBwYXlsb2FkLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGRhdGEgcGFja2V0c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZHJhaW4gY2FsbGJhY2tcbiAqIEBhcGkgcHJpdmF0ZVxuICovUG9sbGluZy5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihwYWNrZXRzKXt2YXIgc2VsZj10aGlzO3RoaXMud3JpdGFibGUgPSBmYWxzZTt2YXIgY2FsbGJhY2tmbj1mdW5jdGlvbiBjYWxsYmFja2ZuKCl7c2VsZi53cml0YWJsZSA9IHRydWU7c2VsZi5lbWl0KCdkcmFpbicpO307dmFyIHNlbGY9dGhpcztwYXJzZXIuZW5jb2RlUGF5bG9hZChwYWNrZXRzLHRoaXMuc3VwcG9ydHNCaW5hcnksZnVuY3Rpb24oZGF0YSl7c2VsZi5kb1dyaXRlKGRhdGEsY2FsbGJhY2tmbik7fSk7fTsgLyoqXG4gKiBHZW5lcmF0ZXMgdXJpIGZvciBjb25uZWN0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovUG9sbGluZy5wcm90b3R5cGUudXJpID0gZnVuY3Rpb24oKXt2YXIgcXVlcnk9dGhpcy5xdWVyeSB8fCB7fTt2YXIgc2NoZW1hPXRoaXMuc2VjdXJlPydodHRwcyc6J2h0dHAnO3ZhciBwb3J0PScnOyAvLyBjYWNoZSBidXN0aW5nIGlzIGZvcmNlZFxuaWYoZmFsc2UgIT09IHRoaXMudGltZXN0YW1wUmVxdWVzdHMpe3F1ZXJ5W3RoaXMudGltZXN0YW1wUGFyYW1dID0geWVhc3QoKTt9aWYoIXRoaXMuc3VwcG9ydHNCaW5hcnkgJiYgIXF1ZXJ5LnNpZCl7cXVlcnkuYjY0ID0gMTt9cXVlcnkgPSBwYXJzZXFzLmVuY29kZShxdWVyeSk7IC8vIGF2b2lkIHBvcnQgaWYgZGVmYXVsdCBmb3Igc2NoZW1hXG5pZih0aGlzLnBvcnQgJiYgKCdodHRwcycgPT0gc2NoZW1hICYmIHRoaXMucG9ydCAhPSA0NDMgfHwgJ2h0dHAnID09IHNjaGVtYSAmJiB0aGlzLnBvcnQgIT0gODApKXtwb3J0ID0gJzonICsgdGhpcy5wb3J0O30gLy8gcHJlcGVuZCA/IHRvIHF1ZXJ5XG5pZihxdWVyeS5sZW5ndGgpe3F1ZXJ5ID0gJz8nICsgcXVlcnk7fXZhciBpcHY2PXRoaXMuaG9zdG5hbWUuaW5kZXhPZignOicpICE9PSAtMTtyZXR1cm4gc2NoZW1hICsgJzovLycgKyAoaXB2Nj8nWycgKyB0aGlzLmhvc3RuYW1lICsgJ10nOnRoaXMuaG9zdG5hbWUpICsgcG9ydCArIHRoaXMucGF0aCArIHF1ZXJ5O307fSx7XCIuLi90cmFuc3BvcnRcIjo0LFwiY29tcG9uZW50LWluaGVyaXRcIjoxNixcImRlYnVnXCI6MTcsXCJlbmdpbmUuaW8tcGFyc2VyXCI6MTksXCJwYXJzZXFzXCI6MjcsXCJ4bWxodHRwcmVxdWVzdC1zc2xcIjoxMCxcInllYXN0XCI6MzB9XSw5OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIFRyYW5zcG9ydD1fZGVyZXFfKCcuLi90cmFuc3BvcnQnKTt2YXIgcGFyc2VyPV9kZXJlcV8oJ2VuZ2luZS5pby1wYXJzZXInKTt2YXIgcGFyc2Vxcz1fZGVyZXFfKCdwYXJzZXFzJyk7dmFyIGluaGVyaXQ9X2RlcmVxXygnY29tcG9uZW50LWluaGVyaXQnKTt2YXIgeWVhc3Q9X2RlcmVxXygneWVhc3QnKTt2YXIgZGVidWc9X2RlcmVxXygnZGVidWcnKSgnZW5naW5lLmlvLWNsaWVudDp3ZWJzb2NrZXQnKTt2YXIgQnJvd3NlcldlYlNvY2tldD1nbG9iYWwuV2ViU29ja2V0IHx8IGdsb2JhbC5Nb3pXZWJTb2NrZXQ7IC8qKlxuICogR2V0IGVpdGhlciB0aGUgYFdlYlNvY2tldGAgb3IgYE1veldlYlNvY2tldGAgZ2xvYmFsc1xuICogaW4gdGhlIGJyb3dzZXIgb3IgdGhlIFdlYlNvY2tldC1jb21wYXRpYmxlIGludGVyZmFjZVxuICogZXhwb3NlZCBieSBgd3NgIGZvciBOb2RlIGVudmlyb25tZW50LlxuICovdmFyIFdlYlNvY2tldD1Ccm93c2VyV2ViU29ja2V0IHx8ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJz9udWxsOl9kZXJlcV8oJ3dzJykpOyAvKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovbW9kdWxlLmV4cG9ydHMgPSBXUzsgLyoqXG4gKiBXZWJTb2NrZXQgdHJhbnNwb3J0IGNvbnN0cnVjdG9yLlxuICpcbiAqIEBhcGkge09iamVjdH0gY29ubmVjdGlvbiBvcHRpb25zXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gV1Mob3B0cyl7dmFyIGZvcmNlQmFzZTY0PW9wdHMgJiYgb3B0cy5mb3JjZUJhc2U2NDtpZihmb3JjZUJhc2U2NCl7dGhpcy5zdXBwb3J0c0JpbmFyeSA9IGZhbHNlO310aGlzLnBlck1lc3NhZ2VEZWZsYXRlID0gb3B0cy5wZXJNZXNzYWdlRGVmbGF0ZTtUcmFuc3BvcnQuY2FsbCh0aGlzLG9wdHMpO30gLyoqXG4gKiBJbmhlcml0cyBmcm9tIFRyYW5zcG9ydC5cbiAqL2luaGVyaXQoV1MsVHJhbnNwb3J0KTsgLyoqXG4gKiBUcmFuc3BvcnQgbmFtZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovV1MucHJvdG90eXBlLm5hbWUgPSAnd2Vic29ja2V0JzsgLypcbiAqIFdlYlNvY2tldHMgc3VwcG9ydCBiaW5hcnlcbiAqL1dTLnByb3RvdHlwZS5zdXBwb3J0c0JpbmFyeSA9IHRydWU7IC8qKlxuICogT3BlbnMgc29ja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovV1MucHJvdG90eXBlLmRvT3BlbiA9IGZ1bmN0aW9uKCl7aWYoIXRoaXMuY2hlY2soKSl7IC8vIGxldCBwcm9iZSB0aW1lb3V0XG5yZXR1cm47fXZhciBzZWxmPXRoaXM7dmFyIHVyaT10aGlzLnVyaSgpO3ZhciBwcm90b2NvbHM9dm9pZCAwO3ZhciBvcHRzPXthZ2VudDp0aGlzLmFnZW50LHBlck1lc3NhZ2VEZWZsYXRlOnRoaXMucGVyTWVzc2FnZURlZmxhdGV9OyAvLyBTU0wgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbm9wdHMucGZ4ID0gdGhpcy5wZng7b3B0cy5rZXkgPSB0aGlzLmtleTtvcHRzLnBhc3NwaHJhc2UgPSB0aGlzLnBhc3NwaHJhc2U7b3B0cy5jZXJ0ID0gdGhpcy5jZXJ0O29wdHMuY2EgPSB0aGlzLmNhO29wdHMuY2lwaGVycyA9IHRoaXMuY2lwaGVycztvcHRzLnJlamVjdFVuYXV0aG9yaXplZCA9IHRoaXMucmVqZWN0VW5hdXRob3JpemVkO2lmKHRoaXMuZXh0cmFIZWFkZXJzKXtvcHRzLmhlYWRlcnMgPSB0aGlzLmV4dHJhSGVhZGVyczt9dGhpcy53cyA9IEJyb3dzZXJXZWJTb2NrZXQ/bmV3IFdlYlNvY2tldCh1cmkpOm5ldyBXZWJTb2NrZXQodXJpLHByb3RvY29scyxvcHRzKTtpZih0aGlzLndzLmJpbmFyeVR5cGUgPT09IHVuZGVmaW5lZCl7dGhpcy5zdXBwb3J0c0JpbmFyeSA9IGZhbHNlO31pZih0aGlzLndzLnN1cHBvcnRzICYmIHRoaXMud3Muc3VwcG9ydHMuYmluYXJ5KXt0aGlzLnN1cHBvcnRzQmluYXJ5ID0gdHJ1ZTt0aGlzLndzLmJpbmFyeVR5cGUgPSAnYnVmZmVyJzt9ZWxzZSB7dGhpcy53cy5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJzt9dGhpcy5hZGRFdmVudExpc3RlbmVycygpO307IC8qKlxuICogQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHNvY2tldFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovV1MucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXJzID0gZnVuY3Rpb24oKXt2YXIgc2VsZj10aGlzO3RoaXMud3Mub25vcGVuID0gZnVuY3Rpb24oKXtzZWxmLm9uT3BlbigpO307dGhpcy53cy5vbmNsb3NlID0gZnVuY3Rpb24oKXtzZWxmLm9uQ2xvc2UoKTt9O3RoaXMud3Mub25tZXNzYWdlID0gZnVuY3Rpb24oZXYpe3NlbGYub25EYXRhKGV2LmRhdGEpO307dGhpcy53cy5vbmVycm9yID0gZnVuY3Rpb24oZSl7c2VsZi5vbkVycm9yKCd3ZWJzb2NrZXQgZXJyb3InLGUpO307fTsgLyoqXG4gKiBPdmVycmlkZSBgb25EYXRhYCB0byB1c2UgYSB0aW1lciBvbiBpT1MuXG4gKiBTZWU6IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL21sb3VnaHJhbi8yMDUyMDA2XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9pZigndW5kZWZpbmVkJyAhPSB0eXBlb2YgbmF2aWdhdG9yICYmIC9pUGFkfGlQaG9uZXxpUG9kL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSl7V1MucHJvdG90eXBlLm9uRGF0YSA9IGZ1bmN0aW9uKGRhdGEpe3ZhciBzZWxmPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe1RyYW5zcG9ydC5wcm90b3R5cGUub25EYXRhLmNhbGwoc2VsZixkYXRhKTt9LDApO307fSAvKipcbiAqIFdyaXRlcyBkYXRhIHRvIHNvY2tldC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBvZiBwYWNrZXRzLlxuICogQGFwaSBwcml2YXRlXG4gKi9XUy5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbihwYWNrZXRzKXt2YXIgc2VsZj10aGlzO3RoaXMud3JpdGFibGUgPSBmYWxzZTsgLy8gZW5jb2RlUGFja2V0IGVmZmljaWVudCBhcyBpdCB1c2VzIFdTIGZyYW1pbmdcbi8vIG5vIG5lZWQgZm9yIGVuY29kZVBheWxvYWRcbnZhciB0b3RhbD1wYWNrZXRzLmxlbmd0aDtmb3IodmFyIGk9MCxsPXRvdGFsO2kgPCBsO2krKykgeyhmdW5jdGlvbihwYWNrZXQpe3BhcnNlci5lbmNvZGVQYWNrZXQocGFja2V0LHNlbGYuc3VwcG9ydHNCaW5hcnksZnVuY3Rpb24oZGF0YSl7aWYoIUJyb3dzZXJXZWJTb2NrZXQpeyAvLyBhbHdheXMgY3JlYXRlIGEgbmV3IG9iamVjdCAoR0gtNDM3KVxudmFyIG9wdHM9e307aWYocGFja2V0Lm9wdGlvbnMpe29wdHMuY29tcHJlc3MgPSBwYWNrZXQub3B0aW9ucy5jb21wcmVzczt9aWYoc2VsZi5wZXJNZXNzYWdlRGVmbGF0ZSl7dmFyIGxlbj0nc3RyaW5nJyA9PSB0eXBlb2YgZGF0YT9nbG9iYWwuQnVmZmVyLmJ5dGVMZW5ndGgoZGF0YSk6ZGF0YS5sZW5ndGg7aWYobGVuIDwgc2VsZi5wZXJNZXNzYWdlRGVmbGF0ZS50aHJlc2hvbGQpe29wdHMuY29tcHJlc3MgPSBmYWxzZTt9fX0gLy9Tb21ldGltZXMgdGhlIHdlYnNvY2tldCBoYXMgYWxyZWFkeSBiZWVuIGNsb3NlZCBidXQgdGhlIGJyb3dzZXIgZGlkbid0XG4vL2hhdmUgYSBjaGFuY2Ugb2YgaW5mb3JtaW5nIHVzIGFib3V0IGl0IHlldCwgaW4gdGhhdCBjYXNlIHNlbmQgd2lsbFxuLy90aHJvdyBhbiBlcnJvclxudHJ5e2lmKEJyb3dzZXJXZWJTb2NrZXQpeyAvLyBUeXBlRXJyb3IgaXMgdGhyb3duIHdoZW4gcGFzc2luZyB0aGUgc2Vjb25kIGFyZ3VtZW50IG9uIFNhZmFyaVxuc2VsZi53cy5zZW5kKGRhdGEpO31lbHNlIHtzZWxmLndzLnNlbmQoZGF0YSxvcHRzKTt9fWNhdGNoKGUpIHtkZWJ1Zygnd2Vic29ja2V0IGNsb3NlZCBiZWZvcmUgb25jbG9zZSBldmVudCcpO30tLXRvdGFsIHx8IGRvbmUoKTt9KTt9KShwYWNrZXRzW2ldKTt9ZnVuY3Rpb24gZG9uZSgpe3NlbGYuZW1pdCgnZmx1c2gnKTsgLy8gZmFrZSBkcmFpblxuLy8gZGVmZXIgdG8gbmV4dCB0aWNrIHRvIGFsbG93IFNvY2tldCB0byBjbGVhciB3cml0ZUJ1ZmZlclxuc2V0VGltZW91dChmdW5jdGlvbigpe3NlbGYud3JpdGFibGUgPSB0cnVlO3NlbGYuZW1pdCgnZHJhaW4nKTt9LDApO319OyAvKipcbiAqIENhbGxlZCB1cG9uIGNsb3NlXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9XUy5wcm90b3R5cGUub25DbG9zZSA9IGZ1bmN0aW9uKCl7VHJhbnNwb3J0LnByb3RvdHlwZS5vbkNsb3NlLmNhbGwodGhpcyk7fTsgLyoqXG4gKiBDbG9zZXMgc29ja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovV1MucHJvdG90eXBlLmRvQ2xvc2UgPSBmdW5jdGlvbigpe2lmKHR5cGVvZiB0aGlzLndzICE9PSAndW5kZWZpbmVkJyl7dGhpcy53cy5jbG9zZSgpO319OyAvKipcbiAqIEdlbmVyYXRlcyB1cmkgZm9yIGNvbm5lY3Rpb24uXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9XUy5wcm90b3R5cGUudXJpID0gZnVuY3Rpb24oKXt2YXIgcXVlcnk9dGhpcy5xdWVyeSB8fCB7fTt2YXIgc2NoZW1hPXRoaXMuc2VjdXJlPyd3c3MnOid3cyc7dmFyIHBvcnQ9Jyc7IC8vIGF2b2lkIHBvcnQgaWYgZGVmYXVsdCBmb3Igc2NoZW1hXG5pZih0aGlzLnBvcnQgJiYgKCd3c3MnID09IHNjaGVtYSAmJiB0aGlzLnBvcnQgIT0gNDQzIHx8ICd3cycgPT0gc2NoZW1hICYmIHRoaXMucG9ydCAhPSA4MCkpe3BvcnQgPSAnOicgKyB0aGlzLnBvcnQ7fSAvLyBhcHBlbmQgdGltZXN0YW1wIHRvIFVSSVxuaWYodGhpcy50aW1lc3RhbXBSZXF1ZXN0cyl7cXVlcnlbdGhpcy50aW1lc3RhbXBQYXJhbV0gPSB5ZWFzdCgpO30gLy8gY29tbXVuaWNhdGUgYmluYXJ5IHN1cHBvcnQgY2FwYWJpbGl0aWVzXG5pZighdGhpcy5zdXBwb3J0c0JpbmFyeSl7cXVlcnkuYjY0ID0gMTt9cXVlcnkgPSBwYXJzZXFzLmVuY29kZShxdWVyeSk7IC8vIHByZXBlbmQgPyB0byBxdWVyeVxuaWYocXVlcnkubGVuZ3RoKXtxdWVyeSA9ICc/JyArIHF1ZXJ5O312YXIgaXB2Nj10aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSAhPT0gLTE7cmV0dXJuIHNjaGVtYSArICc6Ly8nICsgKGlwdjY/J1snICsgdGhpcy5ob3N0bmFtZSArICddJzp0aGlzLmhvc3RuYW1lKSArIHBvcnQgKyB0aGlzLnBhdGggKyBxdWVyeTt9OyAvKipcbiAqIEZlYXR1cmUgZGV0ZWN0aW9uIGZvciBXZWJTb2NrZXQuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn0gd2hldGhlciB0aGlzIHRyYW5zcG9ydCBpcyBhdmFpbGFibGUuXG4gKiBAYXBpIHB1YmxpY1xuICovV1MucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKXtyZXR1cm4gISFXZWJTb2NrZXQgJiYgISgnX19pbml0aWFsaXplJyBpbiBXZWJTb2NrZXQgJiYgdGhpcy5uYW1lID09PSBXUy5wcm90b3R5cGUubmFtZSk7fTt9KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7XCIuLi90cmFuc3BvcnRcIjo0LFwiY29tcG9uZW50LWluaGVyaXRcIjoxNixcImRlYnVnXCI6MTcsXCJlbmdpbmUuaW8tcGFyc2VyXCI6MTksXCJwYXJzZXFzXCI6MjcsXCJ3c1wiOnVuZGVmaW5lZCxcInllYXN0XCI6MzB9XSwxMDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8vIGJyb3dzZXIgc2hpbSBmb3IgeG1saHR0cHJlcXVlc3QgbW9kdWxlXG52YXIgaGFzQ09SUz1fZGVyZXFfKCdoYXMtY29ycycpO21vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3B0cyl7dmFyIHhkb21haW49b3B0cy54ZG9tYWluOyAvLyBzY2hlbWUgbXVzdCBiZSBzYW1lIHdoZW4gdXNpZ24gWERvbWFpblJlcXVlc3Rcbi8vIGh0dHA6Ly9ibG9ncy5tc2RuLmNvbS9iL2llaW50ZXJuYWxzL2FyY2hpdmUvMjAxMC8wNS8xMy94ZG9tYWlucmVxdWVzdC1yZXN0cmljdGlvbnMtbGltaXRhdGlvbnMtYW5kLXdvcmthcm91bmRzLmFzcHhcbnZhciB4c2NoZW1lPW9wdHMueHNjaGVtZTsgLy8gWERvbWFpblJlcXVlc3QgaGFzIGEgZmxvdyBvZiBub3Qgc2VuZGluZyBjb29raWUsIHRoZXJlZm9yZSBpdCBzaG91bGQgYmUgZGlzYWJsZWQgYXMgYSBkZWZhdWx0LlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL0F1dG9tYXR0aWMvZW5naW5lLmlvLWNsaWVudC9wdWxsLzIxN1xudmFyIGVuYWJsZXNYRFI9b3B0cy5lbmFibGVzWERSOyAvLyBYTUxIdHRwUmVxdWVzdCBjYW4gYmUgZGlzYWJsZWQgb24gSUVcbnRyeXtpZigndW5kZWZpbmVkJyAhPSB0eXBlb2YgWE1MSHR0cFJlcXVlc3QgJiYgKCF4ZG9tYWluIHx8IGhhc0NPUlMpKXtyZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7fX1jYXRjaChlKSB7fSAvLyBVc2UgWERvbWFpblJlcXVlc3QgZm9yIElFOCBpZiBlbmFibGVzWERSIGlzIHRydWVcbi8vIGJlY2F1c2UgbG9hZGluZyBiYXIga2VlcHMgZmxhc2hpbmcgd2hlbiB1c2luZyBqc29ucC1wb2xsaW5nXG4vLyBodHRwczovL2dpdGh1Yi5jb20veXVqaW9zYWthL3NvY2tlLmlvLWllOC1sb2FkaW5nLWV4YW1wbGVcbnRyeXtpZigndW5kZWZpbmVkJyAhPSB0eXBlb2YgWERvbWFpblJlcXVlc3QgJiYgIXhzY2hlbWUgJiYgZW5hYmxlc1hEUil7cmV0dXJuIG5ldyBYRG9tYWluUmVxdWVzdCgpO319Y2F0Y2goZSkge31pZigheGRvbWFpbil7dHJ5e3JldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTt9Y2F0Y2goZSkge319fTt9LHtcImhhcy1jb3JzXCI6MjJ9XSwxMTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHMgPSBhZnRlcjtmdW5jdGlvbiBhZnRlcihjb3VudCxjYWxsYmFjayxlcnJfY2Ipe3ZhciBiYWlsPWZhbHNlO2Vycl9jYiA9IGVycl9jYiB8fCBub29wO3Byb3h5LmNvdW50ID0gY291bnQ7cmV0dXJuIGNvdW50ID09PSAwP2NhbGxiYWNrKCk6cHJveHk7ZnVuY3Rpb24gcHJveHkoZXJyLHJlc3VsdCl7aWYocHJveHkuY291bnQgPD0gMCl7dGhyb3cgbmV3IEVycm9yKCdhZnRlciBjYWxsZWQgdG9vIG1hbnkgdGltZXMnKTt9LS1wcm94eS5jb3VudDsgLy8gYWZ0ZXIgZmlyc3QgZXJyb3IsIHJlc3QgYXJlIHBhc3NlZCB0byBlcnJfY2JcbmlmKGVycil7YmFpbCA9IHRydWU7Y2FsbGJhY2soZXJyKTsgLy8gZnV0dXJlIGVycm9yIGNhbGxiYWNrcyB3aWxsIGdvIHRvIGVycm9yIGhhbmRsZXJcbmNhbGxiYWNrID0gZXJyX2NiO31lbHNlIGlmKHByb3h5LmNvdW50ID09PSAwICYmICFiYWlsKXtjYWxsYmFjayhudWxsLHJlc3VsdCk7fX19ZnVuY3Rpb24gbm9vcCgpe319LHt9XSwxMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogQW4gYWJzdHJhY3Rpb24gZm9yIHNsaWNpbmcgYW4gYXJyYXlidWZmZXIgZXZlbiB3aGVuXG4gKiBBcnJheUJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgaXMgbm90IHN1cHBvcnRlZFxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFycmF5YnVmZmVyLHN0YXJ0LGVuZCl7dmFyIGJ5dGVzPWFycmF5YnVmZmVyLmJ5dGVMZW5ndGg7c3RhcnQgPSBzdGFydCB8fCAwO2VuZCA9IGVuZCB8fCBieXRlcztpZihhcnJheWJ1ZmZlci5zbGljZSl7cmV0dXJuIGFycmF5YnVmZmVyLnNsaWNlKHN0YXJ0LGVuZCk7fWlmKHN0YXJ0IDwgMCl7c3RhcnQgKz0gYnl0ZXM7fWlmKGVuZCA8IDApe2VuZCArPSBieXRlczt9aWYoZW5kID4gYnl0ZXMpe2VuZCA9IGJ5dGVzO31pZihzdGFydCA+PSBieXRlcyB8fCBzdGFydCA+PSBlbmQgfHwgYnl0ZXMgPT09IDApe3JldHVybiBuZXcgQXJyYXlCdWZmZXIoMCk7fXZhciBhYnY9bmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpO3ZhciByZXN1bHQ9bmV3IFVpbnQ4QXJyYXkoZW5kIC0gc3RhcnQpO2Zvcih2YXIgaT1zdGFydCxpaT0wO2kgPCBlbmQ7aSsrLGlpKyspIHtyZXN1bHRbaWldID0gYWJ2W2ldO31yZXR1cm4gcmVzdWx0LmJ1ZmZlcjt9O30se31dLDEzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLypcbiAqIGJhc2U2NC1hcnJheWJ1ZmZlclxuICogaHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3ZoL2Jhc2U2NC1hcnJheWJ1ZmZlclxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBOaWtsYXMgdm9uIEhlcnR6ZW5cbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqLyhmdW5jdGlvbihjaGFycyl7XCJ1c2Ugc3RyaWN0XCI7ZXhwb3J0cy5lbmNvZGUgPSBmdW5jdGlvbihhcnJheWJ1ZmZlcil7dmFyIGJ5dGVzPW5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKSxpLGxlbj1ieXRlcy5sZW5ndGgsYmFzZTY0PVwiXCI7Zm9yKGkgPSAwO2kgPCBsZW47aSArPSAzKSB7YmFzZTY0ICs9IGNoYXJzW2J5dGVzW2ldID4+IDJdO2Jhc2U2NCArPSBjaGFyc1soYnl0ZXNbaV0gJiAzKSA8PCA0IHwgYnl0ZXNbaSArIDFdID4+IDRdO2Jhc2U2NCArPSBjaGFyc1soYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIgfCBieXRlc1tpICsgMl0gPj4gNl07YmFzZTY0ICs9IGNoYXJzW2J5dGVzW2kgKyAyXSAmIDYzXTt9aWYobGVuICUgMyA9PT0gMil7YmFzZTY0ID0gYmFzZTY0LnN1YnN0cmluZygwLGJhc2U2NC5sZW5ndGggLSAxKSArIFwiPVwiO31lbHNlIGlmKGxlbiAlIDMgPT09IDEpe2Jhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCxiYXNlNjQubGVuZ3RoIC0gMikgKyBcIj09XCI7fXJldHVybiBiYXNlNjQ7fTtleHBvcnRzLmRlY29kZSA9IGZ1bmN0aW9uKGJhc2U2NCl7dmFyIGJ1ZmZlckxlbmd0aD1iYXNlNjQubGVuZ3RoICogMC43NSxsZW49YmFzZTY0Lmxlbmd0aCxpLHA9MCxlbmNvZGVkMSxlbmNvZGVkMixlbmNvZGVkMyxlbmNvZGVkNDtpZihiYXNlNjRbYmFzZTY0Lmxlbmd0aCAtIDFdID09PSBcIj1cIil7YnVmZmVyTGVuZ3RoLS07aWYoYmFzZTY0W2Jhc2U2NC5sZW5ndGggLSAyXSA9PT0gXCI9XCIpe2J1ZmZlckxlbmd0aC0tO319dmFyIGFycmF5YnVmZmVyPW5ldyBBcnJheUJ1ZmZlcihidWZmZXJMZW5ndGgpLGJ5dGVzPW5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKTtmb3IoaSA9IDA7aSA8IGxlbjtpICs9IDQpIHtlbmNvZGVkMSA9IGNoYXJzLmluZGV4T2YoYmFzZTY0W2ldKTtlbmNvZGVkMiA9IGNoYXJzLmluZGV4T2YoYmFzZTY0W2kgKyAxXSk7ZW5jb2RlZDMgPSBjaGFycy5pbmRleE9mKGJhc2U2NFtpICsgMl0pO2VuY29kZWQ0ID0gY2hhcnMuaW5kZXhPZihiYXNlNjRbaSArIDNdKTtieXRlc1twKytdID0gZW5jb2RlZDEgPDwgMiB8IGVuY29kZWQyID4+IDQ7Ynl0ZXNbcCsrXSA9IChlbmNvZGVkMiAmIDE1KSA8PCA0IHwgZW5jb2RlZDMgPj4gMjtieXRlc1twKytdID0gKGVuY29kZWQzICYgMykgPDwgNiB8IGVuY29kZWQ0ICYgNjM7fXJldHVybiBhcnJheWJ1ZmZlcjt9O30pKFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiKTt9LHt9XSwxNDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCl7IC8qKlxuICogQ3JlYXRlIGEgYmxvYiBidWlsZGVyIGV2ZW4gd2hlbiB2ZW5kb3IgcHJlZml4ZXMgZXhpc3RcbiAqL3ZhciBCbG9iQnVpbGRlcj1nbG9iYWwuQmxvYkJ1aWxkZXIgfHwgZ2xvYmFsLldlYktpdEJsb2JCdWlsZGVyIHx8IGdsb2JhbC5NU0Jsb2JCdWlsZGVyIHx8IGdsb2JhbC5Nb3pCbG9iQnVpbGRlcjsgLyoqXG4gKiBDaGVjayBpZiBCbG9iIGNvbnN0cnVjdG9yIGlzIHN1cHBvcnRlZFxuICovdmFyIGJsb2JTdXBwb3J0ZWQ9KGZ1bmN0aW9uKCl7dHJ5e3ZhciBhPW5ldyBCbG9iKFsnaGknXSk7cmV0dXJuIGEuc2l6ZSA9PT0gMjt9Y2F0Y2goZSkge3JldHVybiBmYWxzZTt9fSkoKTsgLyoqXG4gKiBDaGVjayBpZiBCbG9iIGNvbnN0cnVjdG9yIHN1cHBvcnRzIEFycmF5QnVmZmVyVmlld3NcbiAqIEZhaWxzIGluIFNhZmFyaSA2LCBzbyB3ZSBuZWVkIHRvIG1hcCB0byBBcnJheUJ1ZmZlcnMgdGhlcmUuXG4gKi92YXIgYmxvYlN1cHBvcnRzQXJyYXlCdWZmZXJWaWV3PWJsb2JTdXBwb3J0ZWQgJiYgKGZ1bmN0aW9uKCl7dHJ5e3ZhciBiPW5ldyBCbG9iKFtuZXcgVWludDhBcnJheShbMSwyXSldKTtyZXR1cm4gYi5zaXplID09PSAyO31jYXRjaChlKSB7cmV0dXJuIGZhbHNlO319KSgpOyAvKipcbiAqIENoZWNrIGlmIEJsb2JCdWlsZGVyIGlzIHN1cHBvcnRlZFxuICovdmFyIGJsb2JCdWlsZGVyU3VwcG9ydGVkPUJsb2JCdWlsZGVyICYmIEJsb2JCdWlsZGVyLnByb3RvdHlwZS5hcHBlbmQgJiYgQmxvYkJ1aWxkZXIucHJvdG90eXBlLmdldEJsb2I7IC8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgbWFwcyBBcnJheUJ1ZmZlclZpZXdzIHRvIEFycmF5QnVmZmVyc1xuICogVXNlZCBieSBCbG9iQnVpbGRlciBjb25zdHJ1Y3RvciBhbmQgb2xkIGJyb3dzZXJzIHRoYXQgZGlkbid0XG4gKiBzdXBwb3J0IGl0IGluIHRoZSBCbG9iIGNvbnN0cnVjdG9yLlxuICovZnVuY3Rpb24gbWFwQXJyYXlCdWZmZXJWaWV3cyhhcnkpe2Zvcih2YXIgaT0wO2kgPCBhcnkubGVuZ3RoO2krKykge3ZhciBjaHVuaz1hcnlbaV07aWYoY2h1bmsuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe3ZhciBidWY9Y2h1bmsuYnVmZmVyOyAvLyBpZiB0aGlzIGlzIGEgc3ViYXJyYXksIG1ha2UgYSBjb3B5IHNvIHdlIG9ubHlcbi8vIGluY2x1ZGUgdGhlIHN1YmFycmF5IHJlZ2lvbiBmcm9tIHRoZSB1bmRlcmx5aW5nIGJ1ZmZlclxuaWYoY2h1bmsuYnl0ZUxlbmd0aCAhPT0gYnVmLmJ5dGVMZW5ndGgpe3ZhciBjb3B5PW5ldyBVaW50OEFycmF5KGNodW5rLmJ5dGVMZW5ndGgpO2NvcHkuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZixjaHVuay5ieXRlT2Zmc2V0LGNodW5rLmJ5dGVMZW5ndGgpKTtidWYgPSBjb3B5LmJ1ZmZlcjt9YXJ5W2ldID0gYnVmO319fWZ1bmN0aW9uIEJsb2JCdWlsZGVyQ29uc3RydWN0b3IoYXJ5LG9wdGlvbnMpe29wdGlvbnMgPSBvcHRpb25zIHx8IHt9O3ZhciBiYj1uZXcgQmxvYkJ1aWxkZXIoKTttYXBBcnJheUJ1ZmZlclZpZXdzKGFyeSk7Zm9yKHZhciBpPTA7aSA8IGFyeS5sZW5ndGg7aSsrKSB7YmIuYXBwZW5kKGFyeVtpXSk7fXJldHVybiBvcHRpb25zLnR5cGU/YmIuZ2V0QmxvYihvcHRpb25zLnR5cGUpOmJiLmdldEJsb2IoKTt9O2Z1bmN0aW9uIEJsb2JDb25zdHJ1Y3Rvcihhcnksb3B0aW9ucyl7bWFwQXJyYXlCdWZmZXJWaWV3cyhhcnkpO3JldHVybiBuZXcgQmxvYihhcnksb3B0aW9ucyB8fCB7fSk7fTttb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe2lmKGJsb2JTdXBwb3J0ZWQpe3JldHVybiBibG9iU3VwcG9ydHNBcnJheUJ1ZmZlclZpZXc/Z2xvYmFsLkJsb2I6QmxvYkNvbnN0cnVjdG9yO31lbHNlIGlmKGJsb2JCdWlsZGVyU3VwcG9ydGVkKXtyZXR1cm4gQmxvYkJ1aWxkZXJDb25zdHJ1Y3Rvcjt9ZWxzZSB7cmV0dXJuIHVuZGVmaW5lZDt9fSkoKTt9KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7fV0sMTU6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7IC8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIEVtaXR0ZXIob2JqKXtpZihvYmopcmV0dXJuIG1peGluKG9iaik7fTsgLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gbWl4aW4ob2JqKXtmb3IodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge29ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTt9cmV0dXJuIG9iajt9IC8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL0VtaXR0ZXIucHJvdG90eXBlLm9uID0gRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LGZuKXt0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307KHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKS5wdXNoKGZuKTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL0VtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCxmbil7dmFyIHNlbGY9dGhpczt0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307ZnVuY3Rpb24gb24oKXtzZWxmLm9mZihldmVudCxvbik7Zm4uYXBwbHkodGhpcyxhcmd1bWVudHMpO31vbi5mbiA9IGZuO3RoaXMub24oZXZlbnQsb24pO3JldHVybiB0aGlzO307IC8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovRW1pdHRlci5wcm90b3R5cGUub2ZmID0gRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsZm4pe3RoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTsgLy8gYWxsXG5pZigwID09IGFyZ3VtZW50cy5sZW5ndGgpe3RoaXMuX2NhbGxiYWNrcyA9IHt9O3JldHVybiB0aGlzO30gLy8gc3BlY2lmaWMgZXZlbnRcbnZhciBjYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtpZighY2FsbGJhY2tzKXJldHVybiB0aGlzOyAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG5pZigxID09IGFyZ3VtZW50cy5sZW5ndGgpe2RlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO3JldHVybiB0aGlzO30gLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbnZhciBjYjtmb3IodmFyIGk9MDtpIDwgY2FsbGJhY2tzLmxlbmd0aDtpKyspIHtjYiA9IGNhbGxiYWNrc1tpXTtpZihjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKXtjYWxsYmFja3Muc3BsaWNlKGksMSk7YnJlYWs7fX1yZXR1cm4gdGhpczt9OyAvKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXt0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307dmFyIGFyZ3M9W10uc2xpY2UuY2FsbChhcmd1bWVudHMsMSksY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc1tldmVudF07aWYoY2FsbGJhY2tzKXtjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7Zm9yKHZhciBpPTAsbGVuPWNhbGxiYWNrcy5sZW5ndGg7aSA8IGxlbjsrK2kpIHtjYWxsYmFja3NbaV0uYXBwbHkodGhpcyxhcmdzKTt9fXJldHVybiB0aGlzO307IC8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL0VtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXt0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307cmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107fTsgLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL0VtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtyZXR1cm4gISF0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO307fSx7fV0sMTY6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe21vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSxiKXt2YXIgZm49ZnVuY3Rpb24gZm4oKXt9O2ZuLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO2EucHJvdG90eXBlID0gbmV3IGZuKCk7YS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhO307fSx7fV0sMTc6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfZGVyZXFfKCcuL2RlYnVnJyk7ZXhwb3J0cy5sb2cgPSBsb2c7ZXhwb3J0cy5mb3JtYXRBcmdzID0gZm9ybWF0QXJncztleHBvcnRzLnNhdmUgPSBzYXZlO2V4cG9ydHMubG9hZCA9IGxvYWQ7ZXhwb3J0cy51c2VDb2xvcnMgPSB1c2VDb2xvcnM7ZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZSAmJiAndW5kZWZpbmVkJyAhPSB0eXBlb2YgY2hyb21lLnN0b3JhZ2U/Y2hyb21lLnN0b3JhZ2UubG9jYWw6bG9jYWxzdG9yYWdlKCk7IC8qKlxuICogQ29sb3JzLlxuICovZXhwb3J0cy5jb2xvcnMgPSBbJ2xpZ2h0c2VhZ3JlZW4nLCdmb3Jlc3RncmVlbicsJ2dvbGRlbnJvZCcsJ2RvZGdlcmJsdWUnLCdkYXJrb3JjaGlkJywnY3JpbXNvbiddOyAvKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovZnVuY3Rpb24gdXNlQ29sb3JzKCl7IC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG5yZXR1cm4gJ1dlYmtpdEFwcGVhcmFuY2UnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSB8fCAgLy8gaXMgZmlyZWJ1Zz8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzk4MTIwLzM3Njc3M1xud2luZG93LmNvbnNvbGUgJiYgKGNvbnNvbGUuZmlyZWJ1ZyB8fCBjb25zb2xlLmV4Y2VwdGlvbiAmJiBjb25zb2xlLnRhYmxlKSB8fCAgLy8gaXMgZmlyZWZveCA+PSB2MzE/XG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1Rvb2xzL1dlYl9Db25zb2xlI1N0eWxpbmdfbWVzc2FnZXNcbm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwxMCkgPj0gMzE7fSAvKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL2V4cG9ydHMuZm9ybWF0dGVycy5qID0gZnVuY3Rpb24odil7cmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpO307IC8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBmb3JtYXRBcmdzKCl7dmFyIGFyZ3M9YXJndW1lbnRzO3ZhciB1c2VDb2xvcnM9dGhpcy51c2VDb2xvcnM7YXJnc1swXSA9ICh1c2VDb2xvcnM/JyVjJzonJykgKyB0aGlzLm5hbWVzcGFjZSArICh1c2VDb2xvcnM/JyAlYyc6JyAnKSArIGFyZ3NbMF0gKyAodXNlQ29sb3JzPyclYyAnOicgJykgKyAnKycgKyBleHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7aWYoIXVzZUNvbG9ycylyZXR1cm4gYXJnczt2YXIgYz0nY29sb3I6ICcgKyB0aGlzLmNvbG9yO2FyZ3MgPSBbYXJnc1swXSxjLCdjb2xvcjogaW5oZXJpdCddLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzLDEpKTsgLy8gdGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbi8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbi8vIGZpZ3VyZSBvdXQgdGhlIGNvcnJlY3QgaW5kZXggdG8gaW5zZXJ0IHRoZSBDU1MgaW50b1xudmFyIGluZGV4PTA7dmFyIGxhc3RDPTA7YXJnc1swXS5yZXBsYWNlKC8lW2EteiVdL2csZnVuY3Rpb24obWF0Y2gpe2lmKCclJScgPT09IG1hdGNoKXJldHVybjtpbmRleCsrO2lmKCclYycgPT09IG1hdGNoKXsgLy8gd2Ugb25seSBhcmUgaW50ZXJlc3RlZCBpbiB0aGUgKmxhc3QqICVjXG4vLyAodGhlIHVzZXIgbWF5IGhhdmUgcHJvdmlkZWQgdGhlaXIgb3duKVxubGFzdEMgPSBpbmRleDt9fSk7YXJncy5zcGxpY2UobGFzdEMsMCxjKTtyZXR1cm4gYXJnczt9IC8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBsb2coKXsgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbi8vIHRoZSBgY29uc29sZS5sb2dgIGZ1bmN0aW9uIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG5yZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlICYmIGNvbnNvbGUubG9nICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLGNvbnNvbGUsYXJndW1lbnRzKTt9IC8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKXt0cnl7aWYobnVsbCA9PSBuYW1lc3BhY2VzKXtleHBvcnRzLnN0b3JhZ2UucmVtb3ZlSXRlbSgnZGVidWcnKTt9ZWxzZSB7ZXhwb3J0cy5zdG9yYWdlLmRlYnVnID0gbmFtZXNwYWNlczt9fWNhdGNoKGUpIHt9fSAvKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gbG9hZCgpe3ZhciByO3RyeXtyID0gZXhwb3J0cy5zdG9yYWdlLmRlYnVnO31jYXRjaChlKSB7fXJldHVybiByO30gLyoqXG4gKiBFbmFibGUgbmFtZXNwYWNlcyBsaXN0ZWQgaW4gYGxvY2FsU3RvcmFnZS5kZWJ1Z2AgaW5pdGlhbGx5LlxuICovZXhwb3J0cy5lbmFibGUobG9hZCgpKTsgLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIGxvY2Fsc3RvcmFnZSgpe3RyeXtyZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZTt9Y2F0Y2goZSkge319fSx7XCIuL2RlYnVnXCI6MTh9XSwxODpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztleHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtleHBvcnRzLmRpc2FibGUgPSBkaXNhYmxlO2V4cG9ydHMuZW5hYmxlID0gZW5hYmxlO2V4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7ZXhwb3J0cy5odW1hbml6ZSA9IF9kZXJlcV8oJ21zJyk7IC8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcywgYW5kIG5hbWVzIHRvIHNraXAuXG4gKi9leHBvcnRzLm5hbWVzID0gW107ZXhwb3J0cy5za2lwcyA9IFtdOyAvKipcbiAqIE1hcCBvZiBzcGVjaWFsIFwiJW5cIiBoYW5kbGluZyBmdW5jdGlvbnMsIGZvciB0aGUgZGVidWcgXCJmb3JtYXRcIiBhcmd1bWVudC5cbiAqXG4gKiBWYWxpZCBrZXkgbmFtZXMgYXJlIGEgc2luZ2xlLCBsb3dlcmNhc2VkIGxldHRlciwgaS5lLiBcIm5cIi5cbiAqL2V4cG9ydHMuZm9ybWF0dGVycyA9IHt9OyAvKipcbiAqIFByZXZpb3VzbHkgYXNzaWduZWQgY29sb3IuXG4gKi92YXIgcHJldkNvbG9yPTA7IC8qKlxuICogUHJldmlvdXMgbG9nIHRpbWVzdGFtcC5cbiAqL3ZhciBwcmV2VGltZTsgLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIHNlbGVjdENvbG9yKCl7cmV0dXJuIGV4cG9ydHMuY29sb3JzW3ByZXZDb2xvcisrICUgZXhwb3J0cy5jb2xvcnMubGVuZ3RoXTt9IC8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gZGVidWcobmFtZXNwYWNlKXsgLy8gZGVmaW5lIHRoZSBgZGlzYWJsZWRgIHZlcnNpb25cbmZ1bmN0aW9uIGRpc2FibGVkKCl7fWRpc2FibGVkLmVuYWJsZWQgPSBmYWxzZTsgLy8gZGVmaW5lIHRoZSBgZW5hYmxlZGAgdmVyc2lvblxuZnVuY3Rpb24gZW5hYmxlZCgpe3ZhciBzZWxmPWVuYWJsZWQ7IC8vIHNldCBgZGlmZmAgdGltZXN0YW1wXG52YXIgY3Vycj0rbmV3IERhdGUoKTt2YXIgbXM9Y3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtzZWxmLmRpZmYgPSBtcztzZWxmLnByZXYgPSBwcmV2VGltZTtzZWxmLmN1cnIgPSBjdXJyO3ByZXZUaW1lID0gY3VycjsgLy8gYWRkIHRoZSBgY29sb3JgIGlmIG5vdCBzZXRcbmlmKG51bGwgPT0gc2VsZi51c2VDb2xvcnMpc2VsZi51c2VDb2xvcnMgPSBleHBvcnRzLnVzZUNvbG9ycygpO2lmKG51bGwgPT0gc2VsZi5jb2xvciAmJiBzZWxmLnVzZUNvbG9ycylzZWxmLmNvbG9yID0gc2VsZWN0Q29sb3IoKTt2YXIgYXJncz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO2FyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtpZignc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0peyAvLyBhbnl0aGluZyBlbHNlIGxldCdzIGluc3BlY3Qgd2l0aCAlb1xuYXJncyA9IFsnJW8nXS5jb25jYXQoYXJncyk7fSAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xudmFyIGluZGV4PTA7YXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16JV0pL2csZnVuY3Rpb24obWF0Y2gsZm9ybWF0KXsgLy8gaWYgd2UgZW5jb3VudGVyIGFuIGVzY2FwZWQgJSB0aGVuIGRvbid0IGluY3JlYXNlIHRoZSBhcnJheSBpbmRleFxuaWYobWF0Y2ggPT09ICclJScpcmV0dXJuIG1hdGNoO2luZGV4Kys7dmFyIGZvcm1hdHRlcj1leHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtpZignZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKXt2YXIgdmFsPWFyZ3NbaW5kZXhdO21hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZix2YWwpOyAvLyBub3cgd2UgbmVlZCB0byByZW1vdmUgYGFyZ3NbaW5kZXhdYCBzaW5jZSBpdCdzIGlubGluZWQgaW4gdGhlIGBmb3JtYXRgXG5hcmdzLnNwbGljZShpbmRleCwxKTtpbmRleC0tO31yZXR1cm4gbWF0Y2g7fSk7aWYoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGV4cG9ydHMuZm9ybWF0QXJncyl7YXJncyA9IGV4cG9ydHMuZm9ybWF0QXJncy5hcHBseShzZWxmLGFyZ3MpO312YXIgbG9nRm49ZW5hYmxlZC5sb2cgfHwgZXhwb3J0cy5sb2cgfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtsb2dGbi5hcHBseShzZWxmLGFyZ3MpO31lbmFibGVkLmVuYWJsZWQgPSB0cnVlO3ZhciBmbj1leHBvcnRzLmVuYWJsZWQobmFtZXNwYWNlKT9lbmFibGVkOmRpc2FibGVkO2ZuLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtyZXR1cm4gZm47fSAvKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcyl7ZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO3ZhciBzcGxpdD0obmFtZXNwYWNlcyB8fCAnJykuc3BsaXQoL1tcXHMsXSsvKTt2YXIgbGVuPXNwbGl0Lmxlbmd0aDtmb3IodmFyIGk9MDtpIDwgbGVuO2krKykge2lmKCFzcGxpdFtpXSljb250aW51ZTsgLy8gaWdub3JlIGVtcHR5IHN0cmluZ3Ncbm5hbWVzcGFjZXMgPSBzcGxpdFtpXS5yZXBsYWNlKC9cXCovZywnLio/Jyk7aWYobmFtZXNwYWNlc1swXSA9PT0gJy0nKXtleHBvcnRzLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzLnN1YnN0cigxKSArICckJykpO31lbHNlIHtleHBvcnRzLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzICsgJyQnKSk7fX19IC8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIGRpc2FibGUoKXtleHBvcnRzLmVuYWJsZSgnJyk7fSAvKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBlbmFibGVkKG5hbWUpe3ZhciBpLGxlbjtmb3IoaSA9IDAsbGVuID0gZXhwb3J0cy5za2lwcy5sZW5ndGg7aSA8IGxlbjtpKyspIHtpZihleHBvcnRzLnNraXBzW2ldLnRlc3QobmFtZSkpe3JldHVybiBmYWxzZTt9fWZvcihpID0gMCxsZW4gPSBleHBvcnRzLm5hbWVzLmxlbmd0aDtpIDwgbGVuO2krKykge2lmKGV4cG9ydHMubmFtZXNbaV0udGVzdChuYW1lKSl7cmV0dXJuIHRydWU7fX1yZXR1cm4gZmFsc2U7fSAvKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBjb2VyY2UodmFsKXtpZih2YWwgaW5zdGFuY2VvZiBFcnJvcilyZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO3JldHVybiB2YWw7fX0se1wibXNcIjoyNX1dLDE5OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIGtleXM9X2RlcmVxXygnLi9rZXlzJyk7dmFyIGhhc0JpbmFyeT1fZGVyZXFfKCdoYXMtYmluYXJ5Jyk7dmFyIHNsaWNlQnVmZmVyPV9kZXJlcV8oJ2FycmF5YnVmZmVyLnNsaWNlJyk7dmFyIGJhc2U2NGVuY29kZXI9X2RlcmVxXygnYmFzZTY0LWFycmF5YnVmZmVyJyk7dmFyIGFmdGVyPV9kZXJlcV8oJ2FmdGVyJyk7dmFyIHV0Zjg9X2RlcmVxXygndXRmOCcpOyAvKipcbiAqIENoZWNrIGlmIHdlIGFyZSBydW5uaW5nIGFuIGFuZHJvaWQgYnJvd3Nlci4gVGhhdCByZXF1aXJlcyB1cyB0byB1c2VcbiAqIEFycmF5QnVmZmVyIHdpdGggcG9sbGluZyB0cmFuc3BvcnRzLi4uXG4gKlxuICogaHR0cDovL2doaW5kYS5uZXQvanBlZy1ibG9iLWFqYXgtYW5kcm9pZC9cbiAqL3ZhciBpc0FuZHJvaWQ9bmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZC9pKTsgLyoqXG4gKiBDaGVjayBpZiB3ZSBhcmUgcnVubmluZyBpbiBQaGFudG9tSlMuXG4gKiBVcGxvYWRpbmcgYSBCbG9iIHdpdGggUGhhbnRvbUpTIGRvZXMgbm90IHdvcmsgY29ycmVjdGx5LCBhcyByZXBvcnRlZCBoZXJlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2FyaXlhL3BoYW50b21qcy9pc3N1ZXMvMTEzOTVcbiAqIEB0eXBlIGJvb2xlYW5cbiAqL3ZhciBpc1BoYW50b21KUz0vUGhhbnRvbUpTL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTsgLyoqXG4gKiBXaGVuIHRydWUsIGF2b2lkcyB1c2luZyBCbG9icyB0byBlbmNvZGUgcGF5bG9hZHMuXG4gKiBAdHlwZSBib29sZWFuXG4gKi92YXIgZG9udFNlbmRCbG9icz1pc0FuZHJvaWQgfHwgaXNQaGFudG9tSlM7IC8qKlxuICogQ3VycmVudCBwcm90b2NvbCB2ZXJzaW9uLlxuICovZXhwb3J0cy5wcm90b2NvbCA9IDM7IC8qKlxuICogUGFja2V0IHR5cGVzLlxuICovdmFyIHBhY2tldHM9ZXhwb3J0cy5wYWNrZXRzID0ge29wZW46MCwgLy8gbm9uLXdzXG5jbG9zZToxLCAvLyBub24td3NcbnBpbmc6Mixwb25nOjMsbWVzc2FnZTo0LHVwZ3JhZGU6NSxub29wOjZ9O3ZhciBwYWNrZXRzbGlzdD1rZXlzKHBhY2tldHMpOyAvKipcbiAqIFByZW1hZGUgZXJyb3IgcGFja2V0LlxuICovdmFyIGVycj17dHlwZTonZXJyb3InLGRhdGE6J3BhcnNlciBlcnJvcid9OyAvKipcbiAqIENyZWF0ZSBhIGJsb2IgYXBpIGV2ZW4gZm9yIGJsb2IgYnVpbGRlciB3aGVuIHZlbmRvciBwcmVmaXhlcyBleGlzdFxuICovdmFyIEJsb2I9X2RlcmVxXygnYmxvYicpOyAvKipcbiAqIEVuY29kZXMgYSBwYWNrZXQuXG4gKlxuICogICAgIDxwYWNrZXQgdHlwZSBpZD4gWyA8ZGF0YT4gXVxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgIDVoZWxsbyB3b3JsZFxuICogICAgIDNcbiAqICAgICA0XG4gKlxuICogQmluYXJ5IGlzIGVuY29kZWQgaW4gYW4gaWRlbnRpY2FsIHByaW5jaXBsZVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovZXhwb3J0cy5lbmNvZGVQYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQsc3VwcG9ydHNCaW5hcnksdXRmOGVuY29kZSxjYWxsYmFjayl7aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygc3VwcG9ydHNCaW5hcnkpe2NhbGxiYWNrID0gc3VwcG9ydHNCaW5hcnk7c3VwcG9ydHNCaW5hcnkgPSBmYWxzZTt9aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXRmOGVuY29kZSl7Y2FsbGJhY2sgPSB1dGY4ZW5jb2RlO3V0ZjhlbmNvZGUgPSBudWxsO312YXIgZGF0YT1wYWNrZXQuZGF0YSA9PT0gdW5kZWZpbmVkP3VuZGVmaW5lZDpwYWNrZXQuZGF0YS5idWZmZXIgfHwgcGFja2V0LmRhdGE7aWYoZ2xvYmFsLkFycmF5QnVmZmVyICYmIGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7cmV0dXJuIGVuY29kZUFycmF5QnVmZmVyKHBhY2tldCxzdXBwb3J0c0JpbmFyeSxjYWxsYmFjayk7fWVsc2UgaWYoQmxvYiAmJiBkYXRhIGluc3RhbmNlb2YgZ2xvYmFsLkJsb2Ipe3JldHVybiBlbmNvZGVCbG9iKHBhY2tldCxzdXBwb3J0c0JpbmFyeSxjYWxsYmFjayk7fSAvLyBtaWdodCBiZSBhbiBvYmplY3Qgd2l0aCB7IGJhc2U2NDogdHJ1ZSwgZGF0YTogZGF0YUFzQmFzZTY0U3RyaW5nIH1cbmlmKGRhdGEgJiYgZGF0YS5iYXNlNjQpe3JldHVybiBlbmNvZGVCYXNlNjRPYmplY3QocGFja2V0LGNhbGxiYWNrKTt9IC8vIFNlbmRpbmcgZGF0YSBhcyBhIHV0Zi04IHN0cmluZ1xudmFyIGVuY29kZWQ9cGFja2V0c1twYWNrZXQudHlwZV07IC8vIGRhdGEgZnJhZ21lbnQgaXMgb3B0aW9uYWxcbmlmKHVuZGVmaW5lZCAhPT0gcGFja2V0LmRhdGEpe2VuY29kZWQgKz0gdXRmOGVuY29kZT91dGY4LmVuY29kZShTdHJpbmcocGFja2V0LmRhdGEpKTpTdHJpbmcocGFja2V0LmRhdGEpO31yZXR1cm4gY2FsbGJhY2soJycgKyBlbmNvZGVkKTt9O2Z1bmN0aW9uIGVuY29kZUJhc2U2NE9iamVjdChwYWNrZXQsY2FsbGJhY2speyAvLyBwYWNrZXQgZGF0YSBpcyBhbiBvYmplY3QgeyBiYXNlNjQ6IHRydWUsIGRhdGE6IGRhdGFBc0Jhc2U2NFN0cmluZyB9XG52YXIgbWVzc2FnZT0nYicgKyBleHBvcnRzLnBhY2tldHNbcGFja2V0LnR5cGVdICsgcGFja2V0LmRhdGEuZGF0YTtyZXR1cm4gY2FsbGJhY2sobWVzc2FnZSk7fSAvKipcbiAqIEVuY29kZSBwYWNrZXQgaGVscGVycyBmb3IgYmluYXJ5IHR5cGVzXG4gKi9mdW5jdGlvbiBlbmNvZGVBcnJheUJ1ZmZlcihwYWNrZXQsc3VwcG9ydHNCaW5hcnksY2FsbGJhY2spe2lmKCFzdXBwb3J0c0JpbmFyeSl7cmV0dXJuIGV4cG9ydHMuZW5jb2RlQmFzZTY0UGFja2V0KHBhY2tldCxjYWxsYmFjayk7fXZhciBkYXRhPXBhY2tldC5kYXRhO3ZhciBjb250ZW50QXJyYXk9bmV3IFVpbnQ4QXJyYXkoZGF0YSk7dmFyIHJlc3VsdEJ1ZmZlcj1uZXcgVWludDhBcnJheSgxICsgZGF0YS5ieXRlTGVuZ3RoKTtyZXN1bHRCdWZmZXJbMF0gPSBwYWNrZXRzW3BhY2tldC50eXBlXTtmb3IodmFyIGk9MDtpIDwgY29udGVudEFycmF5Lmxlbmd0aDtpKyspIHtyZXN1bHRCdWZmZXJbaSArIDFdID0gY29udGVudEFycmF5W2ldO31yZXR1cm4gY2FsbGJhY2socmVzdWx0QnVmZmVyLmJ1ZmZlcik7fWZ1bmN0aW9uIGVuY29kZUJsb2JBc0FycmF5QnVmZmVyKHBhY2tldCxzdXBwb3J0c0JpbmFyeSxjYWxsYmFjayl7aWYoIXN1cHBvcnRzQmluYXJ5KXtyZXR1cm4gZXhwb3J0cy5lbmNvZGVCYXNlNjRQYWNrZXQocGFja2V0LGNhbGxiYWNrKTt9dmFyIGZyPW5ldyBGaWxlUmVhZGVyKCk7ZnIub25sb2FkID0gZnVuY3Rpb24oKXtwYWNrZXQuZGF0YSA9IGZyLnJlc3VsdDtleHBvcnRzLmVuY29kZVBhY2tldChwYWNrZXQsc3VwcG9ydHNCaW5hcnksdHJ1ZSxjYWxsYmFjayk7fTtyZXR1cm4gZnIucmVhZEFzQXJyYXlCdWZmZXIocGFja2V0LmRhdGEpO31mdW5jdGlvbiBlbmNvZGVCbG9iKHBhY2tldCxzdXBwb3J0c0JpbmFyeSxjYWxsYmFjayl7aWYoIXN1cHBvcnRzQmluYXJ5KXtyZXR1cm4gZXhwb3J0cy5lbmNvZGVCYXNlNjRQYWNrZXQocGFja2V0LGNhbGxiYWNrKTt9aWYoZG9udFNlbmRCbG9icyl7cmV0dXJuIGVuY29kZUJsb2JBc0FycmF5QnVmZmVyKHBhY2tldCxzdXBwb3J0c0JpbmFyeSxjYWxsYmFjayk7fXZhciBsZW5ndGg9bmV3IFVpbnQ4QXJyYXkoMSk7bGVuZ3RoWzBdID0gcGFja2V0c1twYWNrZXQudHlwZV07dmFyIGJsb2I9bmV3IEJsb2IoW2xlbmd0aC5idWZmZXIscGFja2V0LmRhdGFdKTtyZXR1cm4gY2FsbGJhY2soYmxvYik7fSAvKipcbiAqIEVuY29kZXMgYSBwYWNrZXQgd2l0aCBiaW5hcnkgZGF0YSBpbiBhIGJhc2U2NCBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0LCBoYXMgYHR5cGVgIGFuZCBgZGF0YWBcbiAqIEByZXR1cm4ge1N0cmluZ30gYmFzZTY0IGVuY29kZWQgbWVzc2FnZVxuICovZXhwb3J0cy5lbmNvZGVCYXNlNjRQYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQsY2FsbGJhY2spe3ZhciBtZXNzYWdlPSdiJyArIGV4cG9ydHMucGFja2V0c1twYWNrZXQudHlwZV07aWYoQmxvYiAmJiBwYWNrZXQuZGF0YSBpbnN0YW5jZW9mIGdsb2JhbC5CbG9iKXt2YXIgZnI9bmV3IEZpbGVSZWFkZXIoKTtmci5vbmxvYWQgPSBmdW5jdGlvbigpe3ZhciBiNjQ9ZnIucmVzdWx0LnNwbGl0KCcsJylbMV07Y2FsbGJhY2sobWVzc2FnZSArIGI2NCk7fTtyZXR1cm4gZnIucmVhZEFzRGF0YVVSTChwYWNrZXQuZGF0YSk7fXZhciBiNjRkYXRhO3RyeXtiNjRkYXRhID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLG5ldyBVaW50OEFycmF5KHBhY2tldC5kYXRhKSk7fWNhdGNoKGUpIHsgLy8gaVBob25lIFNhZmFyaSBkb2Vzbid0IGxldCB5b3UgYXBwbHkgd2l0aCB0eXBlZCBhcnJheXNcbnZhciB0eXBlZD1uZXcgVWludDhBcnJheShwYWNrZXQuZGF0YSk7dmFyIGJhc2ljPW5ldyBBcnJheSh0eXBlZC5sZW5ndGgpO2Zvcih2YXIgaT0wO2kgPCB0eXBlZC5sZW5ndGg7aSsrKSB7YmFzaWNbaV0gPSB0eXBlZFtpXTt9YjY0ZGF0YSA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCxiYXNpYyk7fW1lc3NhZ2UgKz0gZ2xvYmFsLmJ0b2EoYjY0ZGF0YSk7cmV0dXJuIGNhbGxiYWNrKG1lc3NhZ2UpO307IC8qKlxuICogRGVjb2RlcyBhIHBhY2tldC4gQ2hhbmdlcyBmb3JtYXQgdG8gQmxvYiBpZiByZXF1ZXN0ZWQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSB3aXRoIGB0eXBlYCBhbmQgYGRhdGFgIChpZiBhbnkpXG4gKiBAYXBpIHByaXZhdGVcbiAqL2V4cG9ydHMuZGVjb2RlUGFja2V0ID0gZnVuY3Rpb24oZGF0YSxiaW5hcnlUeXBlLHV0ZjhkZWNvZGUpeyAvLyBTdHJpbmcgZGF0YVxuaWYodHlwZW9mIGRhdGEgPT0gJ3N0cmluZycgfHwgZGF0YSA9PT0gdW5kZWZpbmVkKXtpZihkYXRhLmNoYXJBdCgwKSA9PSAnYicpe3JldHVybiBleHBvcnRzLmRlY29kZUJhc2U2NFBhY2tldChkYXRhLnN1YnN0cigxKSxiaW5hcnlUeXBlKTt9aWYodXRmOGRlY29kZSl7dHJ5e2RhdGEgPSB1dGY4LmRlY29kZShkYXRhKTt9Y2F0Y2goZSkge3JldHVybiBlcnI7fX12YXIgdHlwZT1kYXRhLmNoYXJBdCgwKTtpZihOdW1iZXIodHlwZSkgIT0gdHlwZSB8fCAhcGFja2V0c2xpc3RbdHlwZV0pe3JldHVybiBlcnI7fWlmKGRhdGEubGVuZ3RoID4gMSl7cmV0dXJuIHt0eXBlOnBhY2tldHNsaXN0W3R5cGVdLGRhdGE6ZGF0YS5zdWJzdHJpbmcoMSl9O31lbHNlIHtyZXR1cm4ge3R5cGU6cGFja2V0c2xpc3RbdHlwZV19O319dmFyIGFzQXJyYXk9bmV3IFVpbnQ4QXJyYXkoZGF0YSk7dmFyIHR5cGU9YXNBcnJheVswXTt2YXIgcmVzdD1zbGljZUJ1ZmZlcihkYXRhLDEpO2lmKEJsb2IgJiYgYmluYXJ5VHlwZSA9PT0gJ2Jsb2InKXtyZXN0ID0gbmV3IEJsb2IoW3Jlc3RdKTt9cmV0dXJuIHt0eXBlOnBhY2tldHNsaXN0W3R5cGVdLGRhdGE6cmVzdH07fTsgLyoqXG4gKiBEZWNvZGVzIGEgcGFja2V0IGVuY29kZWQgaW4gYSBiYXNlNjQgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGJhc2U2NCBlbmNvZGVkIG1lc3NhZ2VcbiAqIEByZXR1cm4ge09iamVjdH0gd2l0aCBgdHlwZWAgYW5kIGBkYXRhYCAoaWYgYW55KVxuICovZXhwb3J0cy5kZWNvZGVCYXNlNjRQYWNrZXQgPSBmdW5jdGlvbihtc2csYmluYXJ5VHlwZSl7dmFyIHR5cGU9cGFja2V0c2xpc3RbbXNnLmNoYXJBdCgwKV07aWYoIWdsb2JhbC5BcnJheUJ1ZmZlcil7cmV0dXJuIHt0eXBlOnR5cGUsZGF0YTp7YmFzZTY0OnRydWUsZGF0YTptc2cuc3Vic3RyKDEpfX07fXZhciBkYXRhPWJhc2U2NGVuY29kZXIuZGVjb2RlKG1zZy5zdWJzdHIoMSkpO2lmKGJpbmFyeVR5cGUgPT09ICdibG9iJyAmJiBCbG9iKXtkYXRhID0gbmV3IEJsb2IoW2RhdGFdKTt9cmV0dXJuIHt0eXBlOnR5cGUsZGF0YTpkYXRhfTt9OyAvKipcbiAqIEVuY29kZXMgbXVsdGlwbGUgbWVzc2FnZXMgKHBheWxvYWQpLlxuICpcbiAqICAgICA8bGVuZ3RoPjpkYXRhXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgMTE6aGVsbG8gd29ybGQyOmhpXG4gKlxuICogSWYgYW55IGNvbnRlbnRzIGFyZSBiaW5hcnksIHRoZXkgd2lsbCBiZSBlbmNvZGVkIGFzIGJhc2U2NCBzdHJpbmdzLiBCYXNlNjRcbiAqIGVuY29kZWQgc3RyaW5ncyBhcmUgbWFya2VkIHdpdGggYSBiIGJlZm9yZSB0aGUgbGVuZ3RoIHNwZWNpZmllclxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhY2tldHNcbiAqIEBhcGkgcHJpdmF0ZVxuICovZXhwb3J0cy5lbmNvZGVQYXlsb2FkID0gZnVuY3Rpb24ocGFja2V0cyxzdXBwb3J0c0JpbmFyeSxjYWxsYmFjayl7aWYodHlwZW9mIHN1cHBvcnRzQmluYXJ5ID09ICdmdW5jdGlvbicpe2NhbGxiYWNrID0gc3VwcG9ydHNCaW5hcnk7c3VwcG9ydHNCaW5hcnkgPSBudWxsO312YXIgaXNCaW5hcnk9aGFzQmluYXJ5KHBhY2tldHMpO2lmKHN1cHBvcnRzQmluYXJ5ICYmIGlzQmluYXJ5KXtpZihCbG9iICYmICFkb250U2VuZEJsb2JzKXtyZXR1cm4gZXhwb3J0cy5lbmNvZGVQYXlsb2FkQXNCbG9iKHBhY2tldHMsY2FsbGJhY2spO31yZXR1cm4gZXhwb3J0cy5lbmNvZGVQYXlsb2FkQXNBcnJheUJ1ZmZlcihwYWNrZXRzLGNhbGxiYWNrKTt9aWYoIXBhY2tldHMubGVuZ3RoKXtyZXR1cm4gY2FsbGJhY2soJzA6Jyk7fWZ1bmN0aW9uIHNldExlbmd0aEhlYWRlcihtZXNzYWdlKXtyZXR1cm4gbWVzc2FnZS5sZW5ndGggKyAnOicgKyBtZXNzYWdlO31mdW5jdGlvbiBlbmNvZGVPbmUocGFja2V0LGRvbmVDYWxsYmFjayl7ZXhwb3J0cy5lbmNvZGVQYWNrZXQocGFja2V0LCFpc0JpbmFyeT9mYWxzZTpzdXBwb3J0c0JpbmFyeSx0cnVlLGZ1bmN0aW9uKG1lc3NhZ2Upe2RvbmVDYWxsYmFjayhudWxsLHNldExlbmd0aEhlYWRlcihtZXNzYWdlKSk7fSk7fW1hcChwYWNrZXRzLGVuY29kZU9uZSxmdW5jdGlvbihlcnIscmVzdWx0cyl7cmV0dXJuIGNhbGxiYWNrKHJlc3VsdHMuam9pbignJykpO30pO307IC8qKlxuICogQXN5bmMgYXJyYXkgbWFwIHVzaW5nIGFmdGVyXG4gKi9mdW5jdGlvbiBtYXAoYXJ5LGVhY2gsZG9uZSl7dmFyIHJlc3VsdD1uZXcgQXJyYXkoYXJ5Lmxlbmd0aCk7dmFyIG5leHQ9YWZ0ZXIoYXJ5Lmxlbmd0aCxkb25lKTt2YXIgZWFjaFdpdGhJbmRleD1mdW5jdGlvbiBlYWNoV2l0aEluZGV4KGksZWwsY2Ipe2VhY2goZWwsZnVuY3Rpb24oZXJyb3IsbXNnKXtyZXN1bHRbaV0gPSBtc2c7Y2IoZXJyb3IscmVzdWx0KTt9KTt9O2Zvcih2YXIgaT0wO2kgPCBhcnkubGVuZ3RoO2krKykge2VhY2hXaXRoSW5kZXgoaSxhcnlbaV0sbmV4dCk7fX0gLypcbiAqIERlY29kZXMgZGF0YSB3aGVuIGEgcGF5bG9hZCBpcyBtYXliZSBleHBlY3RlZC4gUG9zc2libGUgYmluYXJ5IGNvbnRlbnRzIGFyZVxuICogZGVjb2RlZCBmcm9tIHRoZWlyIGJhc2U2NCByZXByZXNlbnRhdGlvblxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhLCBjYWxsYmFjayBtZXRob2RcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLmRlY29kZVBheWxvYWQgPSBmdW5jdGlvbihkYXRhLGJpbmFyeVR5cGUsY2FsbGJhY2spe2lmKHR5cGVvZiBkYXRhICE9ICdzdHJpbmcnKXtyZXR1cm4gZXhwb3J0cy5kZWNvZGVQYXlsb2FkQXNCaW5hcnkoZGF0YSxiaW5hcnlUeXBlLGNhbGxiYWNrKTt9aWYodHlwZW9mIGJpbmFyeVR5cGUgPT09ICdmdW5jdGlvbicpe2NhbGxiYWNrID0gYmluYXJ5VHlwZTtiaW5hcnlUeXBlID0gbnVsbDt9dmFyIHBhY2tldDtpZihkYXRhID09ICcnKXsgLy8gcGFyc2VyIGVycm9yIC0gaWdub3JpbmcgcGF5bG9hZFxucmV0dXJuIGNhbGxiYWNrKGVyciwwLDEpO312YXIgbGVuZ3RoPScnLG4sbXNnO2Zvcih2YXIgaT0wLGw9ZGF0YS5sZW5ndGg7aSA8IGw7aSsrKSB7dmFyIGNocj1kYXRhLmNoYXJBdChpKTtpZignOicgIT0gY2hyKXtsZW5ndGggKz0gY2hyO31lbHNlIHtpZignJyA9PSBsZW5ndGggfHwgbGVuZ3RoICE9IChuID0gTnVtYmVyKGxlbmd0aCkpKXsgLy8gcGFyc2VyIGVycm9yIC0gaWdub3JpbmcgcGF5bG9hZFxucmV0dXJuIGNhbGxiYWNrKGVyciwwLDEpO31tc2cgPSBkYXRhLnN1YnN0cihpICsgMSxuKTtpZihsZW5ndGggIT0gbXNnLmxlbmd0aCl7IC8vIHBhcnNlciBlcnJvciAtIGlnbm9yaW5nIHBheWxvYWRcbnJldHVybiBjYWxsYmFjayhlcnIsMCwxKTt9aWYobXNnLmxlbmd0aCl7cGFja2V0ID0gZXhwb3J0cy5kZWNvZGVQYWNrZXQobXNnLGJpbmFyeVR5cGUsdHJ1ZSk7aWYoZXJyLnR5cGUgPT0gcGFja2V0LnR5cGUgJiYgZXJyLmRhdGEgPT0gcGFja2V0LmRhdGEpeyAvLyBwYXJzZXIgZXJyb3IgaW4gaW5kaXZpZHVhbCBwYWNrZXQgLSBpZ25vcmluZyBwYXlsb2FkXG5yZXR1cm4gY2FsbGJhY2soZXJyLDAsMSk7fXZhciByZXQ9Y2FsbGJhY2socGFja2V0LGkgKyBuLGwpO2lmKGZhbHNlID09PSByZXQpcmV0dXJuO30gLy8gYWR2YW5jZSBjdXJzb3JcbmkgKz0gbjtsZW5ndGggPSAnJzt9fWlmKGxlbmd0aCAhPSAnJyl7IC8vIHBhcnNlciBlcnJvciAtIGlnbm9yaW5nIHBheWxvYWRcbnJldHVybiBjYWxsYmFjayhlcnIsMCwxKTt9fTsgLyoqXG4gKiBFbmNvZGVzIG11bHRpcGxlIG1lc3NhZ2VzIChwYXlsb2FkKSBhcyBiaW5hcnkuXG4gKlxuICogPDEgPSBiaW5hcnksIDAgPSBzdHJpbmc+PG51bWJlciBmcm9tIDAtOT48bnVtYmVyIGZyb20gMC05PlsuLi5dPG51bWJlclxuICogMjU1PjxkYXRhPlxuICpcbiAqIEV4YW1wbGU6XG4gKiAxIDMgMjU1IDEgMiAzLCBpZiB0aGUgYmluYXJ5IGNvbnRlbnRzIGFyZSBpbnRlcnByZXRlZCBhcyA4IGJpdCBpbnRlZ2Vyc1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhY2tldHNcbiAqIEByZXR1cm4ge0FycmF5QnVmZmVyfSBlbmNvZGVkIHBheWxvYWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovZXhwb3J0cy5lbmNvZGVQYXlsb2FkQXNBcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKHBhY2tldHMsY2FsbGJhY2spe2lmKCFwYWNrZXRzLmxlbmd0aCl7cmV0dXJuIGNhbGxiYWNrKG5ldyBBcnJheUJ1ZmZlcigwKSk7fWZ1bmN0aW9uIGVuY29kZU9uZShwYWNrZXQsZG9uZUNhbGxiYWNrKXtleHBvcnRzLmVuY29kZVBhY2tldChwYWNrZXQsdHJ1ZSx0cnVlLGZ1bmN0aW9uKGRhdGEpe3JldHVybiBkb25lQ2FsbGJhY2sobnVsbCxkYXRhKTt9KTt9bWFwKHBhY2tldHMsZW5jb2RlT25lLGZ1bmN0aW9uKGVycixlbmNvZGVkUGFja2V0cyl7dmFyIHRvdGFsTGVuZ3RoPWVuY29kZWRQYWNrZXRzLnJlZHVjZShmdW5jdGlvbihhY2MscCl7dmFyIGxlbjtpZih0eXBlb2YgcCA9PT0gJ3N0cmluZycpe2xlbiA9IHAubGVuZ3RoO31lbHNlIHtsZW4gPSBwLmJ5dGVMZW5ndGg7fXJldHVybiBhY2MgKyBsZW4udG9TdHJpbmcoKS5sZW5ndGggKyBsZW4gKyAyOyAvLyBzdHJpbmcvYmluYXJ5IGlkZW50aWZpZXIgKyBzZXBhcmF0b3IgPSAyXG59LDApO3ZhciByZXN1bHRBcnJheT1uZXcgVWludDhBcnJheSh0b3RhbExlbmd0aCk7dmFyIGJ1ZmZlckluZGV4PTA7ZW5jb2RlZFBhY2tldHMuZm9yRWFjaChmdW5jdGlvbihwKXt2YXIgaXNTdHJpbmc9dHlwZW9mIHAgPT09ICdzdHJpbmcnO3ZhciBhYj1wO2lmKGlzU3RyaW5nKXt2YXIgdmlldz1uZXcgVWludDhBcnJheShwLmxlbmd0aCk7Zm9yKHZhciBpPTA7aSA8IHAubGVuZ3RoO2krKykge3ZpZXdbaV0gPSBwLmNoYXJDb2RlQXQoaSk7fWFiID0gdmlldy5idWZmZXI7fWlmKGlzU3RyaW5nKXsgLy8gbm90IHRydWUgYmluYXJ5XG5yZXN1bHRBcnJheVtidWZmZXJJbmRleCsrXSA9IDA7fWVsc2UgeyAvLyB0cnVlIGJpbmFyeVxucmVzdWx0QXJyYXlbYnVmZmVySW5kZXgrK10gPSAxO312YXIgbGVuU3RyPWFiLmJ5dGVMZW5ndGgudG9TdHJpbmcoKTtmb3IodmFyIGk9MDtpIDwgbGVuU3RyLmxlbmd0aDtpKyspIHtyZXN1bHRBcnJheVtidWZmZXJJbmRleCsrXSA9IHBhcnNlSW50KGxlblN0cltpXSk7fXJlc3VsdEFycmF5W2J1ZmZlckluZGV4KytdID0gMjU1O3ZhciB2aWV3PW5ldyBVaW50OEFycmF5KGFiKTtmb3IodmFyIGk9MDtpIDwgdmlldy5sZW5ndGg7aSsrKSB7cmVzdWx0QXJyYXlbYnVmZmVySW5kZXgrK10gPSB2aWV3W2ldO319KTtyZXR1cm4gY2FsbGJhY2socmVzdWx0QXJyYXkuYnVmZmVyKTt9KTt9OyAvKipcbiAqIEVuY29kZSBhcyBCbG9iXG4gKi9leHBvcnRzLmVuY29kZVBheWxvYWRBc0Jsb2IgPSBmdW5jdGlvbihwYWNrZXRzLGNhbGxiYWNrKXtmdW5jdGlvbiBlbmNvZGVPbmUocGFja2V0LGRvbmVDYWxsYmFjayl7ZXhwb3J0cy5lbmNvZGVQYWNrZXQocGFja2V0LHRydWUsdHJ1ZSxmdW5jdGlvbihlbmNvZGVkKXt2YXIgYmluYXJ5SWRlbnRpZmllcj1uZXcgVWludDhBcnJheSgxKTtiaW5hcnlJZGVudGlmaWVyWzBdID0gMTtpZih0eXBlb2YgZW5jb2RlZCA9PT0gJ3N0cmluZycpe3ZhciB2aWV3PW5ldyBVaW50OEFycmF5KGVuY29kZWQubGVuZ3RoKTtmb3IodmFyIGk9MDtpIDwgZW5jb2RlZC5sZW5ndGg7aSsrKSB7dmlld1tpXSA9IGVuY29kZWQuY2hhckNvZGVBdChpKTt9ZW5jb2RlZCA9IHZpZXcuYnVmZmVyO2JpbmFyeUlkZW50aWZpZXJbMF0gPSAwO312YXIgbGVuPWVuY29kZWQgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcj9lbmNvZGVkLmJ5dGVMZW5ndGg6ZW5jb2RlZC5zaXplO3ZhciBsZW5TdHI9bGVuLnRvU3RyaW5nKCk7dmFyIGxlbmd0aEFyeT1uZXcgVWludDhBcnJheShsZW5TdHIubGVuZ3RoICsgMSk7Zm9yKHZhciBpPTA7aSA8IGxlblN0ci5sZW5ndGg7aSsrKSB7bGVuZ3RoQXJ5W2ldID0gcGFyc2VJbnQobGVuU3RyW2ldKTt9bGVuZ3RoQXJ5W2xlblN0ci5sZW5ndGhdID0gMjU1O2lmKEJsb2Ipe3ZhciBibG9iPW5ldyBCbG9iKFtiaW5hcnlJZGVudGlmaWVyLmJ1ZmZlcixsZW5ndGhBcnkuYnVmZmVyLGVuY29kZWRdKTtkb25lQ2FsbGJhY2sobnVsbCxibG9iKTt9fSk7fW1hcChwYWNrZXRzLGVuY29kZU9uZSxmdW5jdGlvbihlcnIscmVzdWx0cyl7cmV0dXJuIGNhbGxiYWNrKG5ldyBCbG9iKHJlc3VsdHMpKTt9KTt9OyAvKlxuICogRGVjb2RlcyBkYXRhIHdoZW4gYSBwYXlsb2FkIGlzIG1heWJlIGV4cGVjdGVkLiBTdHJpbmdzIGFyZSBkZWNvZGVkIGJ5XG4gKiBpbnRlcnByZXRpbmcgZWFjaCBieXRlIGFzIGEga2V5IGNvZGUgZm9yIGVudHJpZXMgbWFya2VkIHRvIHN0YXJ0IHdpdGggMC4gU2VlXG4gKiBkZXNjcmlwdGlvbiBvZiBlbmNvZGVQYXlsb2FkQXNCaW5hcnlcbiAqXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBkYXRhLCBjYWxsYmFjayBtZXRob2RcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLmRlY29kZVBheWxvYWRBc0JpbmFyeSA9IGZ1bmN0aW9uKGRhdGEsYmluYXJ5VHlwZSxjYWxsYmFjayl7aWYodHlwZW9mIGJpbmFyeVR5cGUgPT09ICdmdW5jdGlvbicpe2NhbGxiYWNrID0gYmluYXJ5VHlwZTtiaW5hcnlUeXBlID0gbnVsbDt9dmFyIGJ1ZmZlclRhaWw9ZGF0YTt2YXIgYnVmZmVycz1bXTt2YXIgbnVtYmVyVG9vTG9uZz1mYWxzZTt3aGlsZShidWZmZXJUYWlsLmJ5dGVMZW5ndGggPiAwKSB7dmFyIHRhaWxBcnJheT1uZXcgVWludDhBcnJheShidWZmZXJUYWlsKTt2YXIgaXNTdHJpbmc9dGFpbEFycmF5WzBdID09PSAwO3ZhciBtc2dMZW5ndGg9Jyc7Zm9yKHZhciBpPTE7O2krKykge2lmKHRhaWxBcnJheVtpXSA9PSAyNTUpYnJlYWs7aWYobXNnTGVuZ3RoLmxlbmd0aCA+IDMxMCl7bnVtYmVyVG9vTG9uZyA9IHRydWU7YnJlYWs7fW1zZ0xlbmd0aCArPSB0YWlsQXJyYXlbaV07fWlmKG51bWJlclRvb0xvbmcpcmV0dXJuIGNhbGxiYWNrKGVyciwwLDEpO2J1ZmZlclRhaWwgPSBzbGljZUJ1ZmZlcihidWZmZXJUYWlsLDIgKyBtc2dMZW5ndGgubGVuZ3RoKTttc2dMZW5ndGggPSBwYXJzZUludChtc2dMZW5ndGgpO3ZhciBtc2c9c2xpY2VCdWZmZXIoYnVmZmVyVGFpbCwwLG1zZ0xlbmd0aCk7aWYoaXNTdHJpbmcpe3RyeXttc2cgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsbmV3IFVpbnQ4QXJyYXkobXNnKSk7fWNhdGNoKGUpIHsgLy8gaVBob25lIFNhZmFyaSBkb2Vzbid0IGxldCB5b3UgYXBwbHkgdG8gdHlwZWQgYXJyYXlzXG52YXIgdHlwZWQ9bmV3IFVpbnQ4QXJyYXkobXNnKTttc2cgPSAnJztmb3IodmFyIGk9MDtpIDwgdHlwZWQubGVuZ3RoO2krKykge21zZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHR5cGVkW2ldKTt9fX1idWZmZXJzLnB1c2gobXNnKTtidWZmZXJUYWlsID0gc2xpY2VCdWZmZXIoYnVmZmVyVGFpbCxtc2dMZW5ndGgpO312YXIgdG90YWw9YnVmZmVycy5sZW5ndGg7YnVmZmVycy5mb3JFYWNoKGZ1bmN0aW9uKGJ1ZmZlcixpKXtjYWxsYmFjayhleHBvcnRzLmRlY29kZVBhY2tldChidWZmZXIsYmluYXJ5VHlwZSx0cnVlKSxpLHRvdGFsKTt9KTt9O30pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHtcIi4va2V5c1wiOjIwLFwiYWZ0ZXJcIjoxMSxcImFycmF5YnVmZmVyLnNsaWNlXCI6MTIsXCJiYXNlNjQtYXJyYXlidWZmZXJcIjoxMyxcImJsb2JcIjoxNCxcImhhcy1iaW5hcnlcIjoyMSxcInV0ZjhcIjoyOX1dLDIwOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBHZXRzIHRoZSBrZXlzIGZvciBhbiBvYmplY3QuXG4gKlxuICogQHJldHVybiB7QXJyYXl9IGtleXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovbW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKG9iail7dmFyIGFycj1bXTt2YXIgaGFzPU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7Zm9yKHZhciBpIGluIG9iaikge2lmKGhhcy5jYWxsKG9iaixpKSl7YXJyLnB1c2goaSk7fX1yZXR1cm4gYXJyO307fSx7fV0sMjE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKlxuICogTW9kdWxlIHJlcXVpcmVtZW50cy5cbiAqL3ZhciBpc0FycmF5PV9kZXJlcV8oJ2lzYXJyYXknKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gaGFzQmluYXJ5OyAvKipcbiAqIENoZWNrcyBmb3IgYmluYXJ5IGRhdGEuXG4gKlxuICogUmlnaHQgbm93IG9ubHkgQnVmZmVyIGFuZCBBcnJheUJ1ZmZlciBhcmUgc3VwcG9ydGVkLi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYW55dGhpbmdcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBoYXNCaW5hcnkoZGF0YSl7ZnVuY3Rpb24gX2hhc0JpbmFyeShvYmope2lmKCFvYmopcmV0dXJuIGZhbHNlO2lmKGdsb2JhbC5CdWZmZXIgJiYgZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlcihvYmopIHx8IGdsb2JhbC5BcnJheUJ1ZmZlciAmJiBvYmogaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciB8fCBnbG9iYWwuQmxvYiAmJiBvYmogaW5zdGFuY2VvZiBCbG9iIHx8IGdsb2JhbC5GaWxlICYmIG9iaiBpbnN0YW5jZW9mIEZpbGUpe3JldHVybiB0cnVlO31pZihpc0FycmF5KG9iaikpe2Zvcih2YXIgaT0wO2kgPCBvYmoubGVuZ3RoO2krKykge2lmKF9oYXNCaW5hcnkob2JqW2ldKSl7cmV0dXJuIHRydWU7fX19ZWxzZSBpZihvYmogJiYgJ29iamVjdCcgPT0gdHlwZW9mIG9iail7aWYob2JqLnRvSlNPTil7b2JqID0gb2JqLnRvSlNPTigpO31mb3IodmFyIGtleSBpbiBvYmopIHtpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLGtleSkgJiYgX2hhc0JpbmFyeShvYmpba2V5XSkpe3JldHVybiB0cnVlO319fXJldHVybiBmYWxzZTt9cmV0dXJuIF9oYXNCaW5hcnkoZGF0YSk7fX0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHtcImlzYXJyYXlcIjoyNH1dLDIyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqXG4gKiBMb2dpYyBib3Jyb3dlZCBmcm9tIE1vZGVybml6cjpcbiAqXG4gKiAgIC0gaHR0cHM6Ly9naXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvYmxvYi9tYXN0ZXIvZmVhdHVyZS1kZXRlY3RzL2NvcnMuanNcbiAqL3RyeXttb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcgJiYgJ3dpdGhDcmVkZW50aWFscycgaW4gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7fWNhdGNoKGVycikgeyAvLyBpZiBYTUxIdHRwIHN1cHBvcnQgaXMgZGlzYWJsZWQgaW4gSUUgdGhlbiBpdCB3aWxsIHRocm93XG4vLyB3aGVuIHRyeWluZyB0byBjcmVhdGVcbm1vZHVsZS5leHBvcnRzID0gZmFsc2U7fX0se31dLDIzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXt2YXIgaW5kZXhPZj1bXS5pbmRleE9mO21vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLG9iail7aWYoaW5kZXhPZilyZXR1cm4gYXJyLmluZGV4T2Yob2JqKTtmb3IodmFyIGk9MDtpIDwgYXJyLmxlbmd0aDsrK2kpIHtpZihhcnJbaV0gPT09IG9iailyZXR1cm4gaTt9cmV0dXJuIC0xO307fSx7fV0sMjQ6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe21vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihhcnIpe3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO307fSx7fV0sMjU6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIEhlbHBlcnMuXG4gKi92YXIgcz0xMDAwO3ZhciBtPXMgKiA2MDt2YXIgaD1tICogNjA7dmFyIGQ9aCAqIDI0O3ZhciB5PWQgKiAzNjUuMjU7IC8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7U3RyaW5nfE51bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCxvcHRpb25zKXtvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtpZignc3RyaW5nJyA9PSB0eXBlb2YgdmFsKXJldHVybiBwYXJzZSh2YWwpO3JldHVybiBvcHRpb25zLmxvbmc/bG9uZyh2YWwpOnNob3J0KHZhbCk7fTsgLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBwYXJzZShzdHIpe3N0ciA9ICcnICsgc3RyO2lmKHN0ci5sZW5ndGggPiAxMDAwMClyZXR1cm47dmFyIG1hdGNoPS9eKCg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKTtpZighbWF0Y2gpcmV0dXJuO3ZhciBuPXBhcnNlRmxvYXQobWF0Y2hbMV0pO3ZhciB0eXBlPShtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO3N3aXRjaCh0eXBlKXtjYXNlICd5ZWFycyc6Y2FzZSAneWVhcic6Y2FzZSAneXJzJzpjYXNlICd5cic6Y2FzZSAneSc6cmV0dXJuIG4gKiB5O2Nhc2UgJ2RheXMnOmNhc2UgJ2RheSc6Y2FzZSAnZCc6cmV0dXJuIG4gKiBkO2Nhc2UgJ2hvdXJzJzpjYXNlICdob3VyJzpjYXNlICdocnMnOmNhc2UgJ2hyJzpjYXNlICdoJzpyZXR1cm4gbiAqIGg7Y2FzZSAnbWludXRlcyc6Y2FzZSAnbWludXRlJzpjYXNlICdtaW5zJzpjYXNlICdtaW4nOmNhc2UgJ20nOnJldHVybiBuICogbTtjYXNlICdzZWNvbmRzJzpjYXNlICdzZWNvbmQnOmNhc2UgJ3NlY3MnOmNhc2UgJ3NlYyc6Y2FzZSAncyc6cmV0dXJuIG4gKiBzO2Nhc2UgJ21pbGxpc2Vjb25kcyc6Y2FzZSAnbWlsbGlzZWNvbmQnOmNhc2UgJ21zZWNzJzpjYXNlICdtc2VjJzpjYXNlICdtcyc6cmV0dXJuIG47fX0gLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIHNob3J0KG1zKXtpZihtcyA+PSBkKXJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCc7aWYobXMgPj0gaClyZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO2lmKG1zID49IG0pcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztpZihtcyA+PSBzKXJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncyc7cmV0dXJuIG1zICsgJ21zJzt9IC8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIGxvbmcobXMpe3JldHVybiBwbHVyYWwobXMsZCwnZGF5JykgfHwgcGx1cmFsKG1zLGgsJ2hvdXInKSB8fCBwbHVyYWwobXMsbSwnbWludXRlJykgfHwgcGx1cmFsKG1zLHMsJ3NlY29uZCcpIHx8IG1zICsgJyBtcyc7fSAvKipcbiAqIFBsdXJhbGl6YXRpb24gaGVscGVyLlxuICovZnVuY3Rpb24gcGx1cmFsKG1zLG4sbmFtZSl7aWYobXMgPCBuKXJldHVybjtpZihtcyA8IG4gKiAxLjUpcmV0dXJuIE1hdGguZmxvb3IobXMgLyBuKSArICcgJyArIG5hbWU7cmV0dXJuIE1hdGguY2VpbChtcyAvIG4pICsgJyAnICsgbmFtZSArICdzJzt9fSx7fV0sMjY6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKipcbiAqIEpTT04gcGFyc2UuXG4gKlxuICogQHNlZSBCYXNlZCBvbiBqUXVlcnkjcGFyc2VKU09OIChNSVQpIGFuZCBKU09OMlxuICogQGFwaSBwcml2YXRlXG4gKi92YXIgcnZhbGlkY2hhcnM9L15bXFxdLDp7fVxcc10qJC87dmFyIHJ2YWxpZGVzY2FwZT0vXFxcXCg/OltcIlxcXFxcXC9iZm5ydF18dVswLTlhLWZBLUZdezR9KS9nO3ZhciBydmFsaWR0b2tlbnM9L1wiW15cIlxcXFxcXG5cXHJdKlwifHRydWV8ZmFsc2V8bnVsbHwtP1xcZCsoPzpcXC5cXGQqKT8oPzpbZUVdWytcXC1dP1xcZCspPy9nO3ZhciBydmFsaWRicmFjZXM9Lyg/Ol58OnwsKSg/OlxccypcXFspKy9nO3ZhciBydHJpbUxlZnQ9L15cXHMrLzt2YXIgcnRyaW1SaWdodD0vXFxzKyQvO21vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2Vqc29uKGRhdGEpe2lmKCdzdHJpbmcnICE9IHR5cGVvZiBkYXRhIHx8ICFkYXRhKXtyZXR1cm4gbnVsbDt9ZGF0YSA9IGRhdGEucmVwbGFjZShydHJpbUxlZnQsJycpLnJlcGxhY2UocnRyaW1SaWdodCwnJyk7IC8vIEF0dGVtcHQgdG8gcGFyc2UgdXNpbmcgdGhlIG5hdGl2ZSBKU09OIHBhcnNlciBmaXJzdFxuaWYoZ2xvYmFsLkpTT04gJiYgSlNPTi5wYXJzZSl7cmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7fWlmKHJ2YWxpZGNoYXJzLnRlc3QoZGF0YS5yZXBsYWNlKHJ2YWxpZGVzY2FwZSwnQCcpLnJlcGxhY2UocnZhbGlkdG9rZW5zLCddJykucmVwbGFjZShydmFsaWRicmFjZXMsJycpKSl7cmV0dXJuIG5ldyBGdW5jdGlvbigncmV0dXJuICcgKyBkYXRhKSgpO319O30pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHt9XSwyNzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogQ29tcGlsZXMgYSBxdWVyeXN0cmluZ1xuICogUmV0dXJucyBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9leHBvcnRzLmVuY29kZSA9IGZ1bmN0aW9uKG9iail7dmFyIHN0cj0nJztmb3IodmFyIGkgaW4gb2JqKSB7aWYob2JqLmhhc093blByb3BlcnR5KGkpKXtpZihzdHIubGVuZ3RoKXN0ciArPSAnJic7c3RyICs9IGVuY29kZVVSSUNvbXBvbmVudChpKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChvYmpbaV0pO319cmV0dXJuIHN0cjt9OyAvKipcbiAqIFBhcnNlcyBhIHNpbXBsZSBxdWVyeXN0cmluZyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBxc1xuICogQGFwaSBwcml2YXRlXG4gKi9leHBvcnRzLmRlY29kZSA9IGZ1bmN0aW9uKHFzKXt2YXIgcXJ5PXt9O3ZhciBwYWlycz1xcy5zcGxpdCgnJicpO2Zvcih2YXIgaT0wLGw9cGFpcnMubGVuZ3RoO2kgPCBsO2krKykge3ZhciBwYWlyPXBhaXJzW2ldLnNwbGl0KCc9Jyk7cXJ5W2RlY29kZVVSSUNvbXBvbmVudChwYWlyWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSk7fXJldHVybiBxcnk7fTt9LHt9XSwyODpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogUGFyc2VzIGFuIFVSSVxuICpcbiAqIEBhdXRob3IgU3RldmVuIExldml0aGFuIDxzdGV2ZW5sZXZpdGhhbi5jb20+IChNSVQgbGljZW5zZSlcbiAqIEBhcGkgcHJpdmF0ZVxuICovdmFyIHJlPS9eKD86KD8hW146QF0rOlteOkBcXC9dKkApKGh0dHB8aHR0cHN8d3N8d3NzKTpcXC9cXC8pPygoPzooKFteOkBdKikoPzo6KFteOkBdKikpPyk/QCk/KCg/OlthLWYwLTldezAsNH06KXsyLDd9W2EtZjAtOV17MCw0fXxbXjpcXC8/I10qKSg/OjooXFxkKikpPykoKChcXC8oPzpbXj8jXSg/IVtePyNcXC9dKlxcLltePyNcXC8uXSsoPzpbPyNdfCQpKSkqXFwvPyk/KFtePyNcXC9dKikpKD86XFw/KFteI10qKSk/KD86IyguKikpPykvO3ZhciBwYXJ0cz1bJ3NvdXJjZScsJ3Byb3RvY29sJywnYXV0aG9yaXR5JywndXNlckluZm8nLCd1c2VyJywncGFzc3dvcmQnLCdob3N0JywncG9ydCcsJ3JlbGF0aXZlJywncGF0aCcsJ2RpcmVjdG9yeScsJ2ZpbGUnLCdxdWVyeScsJ2FuY2hvciddO21vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2V1cmkoc3RyKXt2YXIgc3JjPXN0cixiPXN0ci5pbmRleE9mKCdbJyksZT1zdHIuaW5kZXhPZignXScpO2lmKGIgIT0gLTEgJiYgZSAhPSAtMSl7c3RyID0gc3RyLnN1YnN0cmluZygwLGIpICsgc3RyLnN1YnN0cmluZyhiLGUpLnJlcGxhY2UoLzovZywnOycpICsgc3RyLnN1YnN0cmluZyhlLHN0ci5sZW5ndGgpO312YXIgbT1yZS5leGVjKHN0ciB8fCAnJyksdXJpPXt9LGk9MTQ7d2hpbGUoaS0tKSB7dXJpW3BhcnRzW2ldXSA9IG1baV0gfHwgJyc7fWlmKGIgIT0gLTEgJiYgZSAhPSAtMSl7dXJpLnNvdXJjZSA9IHNyYzt1cmkuaG9zdCA9IHVyaS5ob3N0LnN1YnN0cmluZygxLHVyaS5ob3N0Lmxlbmd0aCAtIDEpLnJlcGxhY2UoLzsvZywnOicpO3VyaS5hdXRob3JpdHkgPSB1cmkuYXV0aG9yaXR5LnJlcGxhY2UoJ1snLCcnKS5yZXBsYWNlKCddJywnJykucmVwbGFjZSgvOy9nLCc6Jyk7dXJpLmlwdjZ1cmkgPSB0cnVlO31yZXR1cm4gdXJpO307fSx7fV0sMjk6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKiEgaHR0cHM6Ly9tdGhzLmJlL3V0ZjhqcyB2Mi4wLjAgYnkgQG1hdGhpYXMgKi87KGZ1bmN0aW9uKHJvb3QpeyAvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgYGV4cG9ydHNgXG52YXIgZnJlZUV4cG9ydHM9dHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0czsgLy8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWBcbnZhciBmcmVlTW9kdWxlPXR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTsgLy8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAsIGZyb20gTm9kZS5qcyBvciBCcm93c2VyaWZpZWQgY29kZSxcbi8vIGFuZCB1c2UgaXQgYXMgYHJvb3RgXG52YXIgZnJlZUdsb2JhbD10eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtpZihmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCl7cm9vdCA9IGZyZWVHbG9iYWw7fSAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi92YXIgc3RyaW5nRnJvbUNoYXJDb2RlPVN0cmluZy5mcm9tQ2hhckNvZGU7IC8vIFRha2VuIGZyb20gaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlXG5mdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZyl7dmFyIG91dHB1dD1bXTt2YXIgY291bnRlcj0wO3ZhciBsZW5ndGg9c3RyaW5nLmxlbmd0aDt2YXIgdmFsdWU7dmFyIGV4dHJhO3doaWxlKGNvdW50ZXIgPCBsZW5ndGgpIHt2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7aWYodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKXsgLy8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5leHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7aWYoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApeyAvLyBsb3cgc3Vycm9nYXRlXG5vdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO31lbHNlIHsgLy8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcbi8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxub3V0cHV0LnB1c2godmFsdWUpO2NvdW50ZXItLTt9fWVsc2Uge291dHB1dC5wdXNoKHZhbHVlKTt9fXJldHVybiBvdXRwdXQ7fSAvLyBUYWtlbiBmcm9tIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZVxuZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSl7dmFyIGxlbmd0aD1hcnJheS5sZW5ndGg7dmFyIGluZGV4PS0xO3ZhciB2YWx1ZTt2YXIgb3V0cHV0PScnO3doaWxlKCsraW5kZXggPCBsZW5ndGgpIHt2YWx1ZSA9IGFycmF5W2luZGV4XTtpZih2YWx1ZSA+IDB4RkZGRil7dmFsdWUgLT0gMHgxMDAwMDtvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTt2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7fW91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO31yZXR1cm4gb3V0cHV0O31mdW5jdGlvbiBjaGVja1NjYWxhclZhbHVlKGNvZGVQb2ludCl7aWYoY29kZVBvaW50ID49IDB4RDgwMCAmJiBjb2RlUG9pbnQgPD0gMHhERkZGKXt0aHJvdyBFcnJvcignTG9uZSBzdXJyb2dhdGUgVSsnICsgY29kZVBvaW50LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpICsgJyBpcyBub3QgYSBzY2FsYXIgdmFsdWUnKTt9fSAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9mdW5jdGlvbiBjcmVhdGVCeXRlKGNvZGVQb2ludCxzaGlmdCl7cmV0dXJuIHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQgPj4gc2hpZnQgJiAweDNGIHwgMHg4MCk7fWZ1bmN0aW9uIGVuY29kZUNvZGVQb2ludChjb2RlUG9pbnQpe2lmKChjb2RlUG9pbnQgJiAweEZGRkZGRjgwKSA9PSAwKXsgLy8gMS1ieXRlIHNlcXVlbmNlXG5yZXR1cm4gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCk7fXZhciBzeW1ib2w9Jyc7aWYoKGNvZGVQb2ludCAmIDB4RkZGRkY4MDApID09IDApeyAvLyAyLWJ5dGUgc2VxdWVuY2VcbnN5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQgPj4gNiAmIDB4MUYgfCAweEMwKTt9ZWxzZSBpZigoY29kZVBvaW50ICYgMHhGRkZGMDAwMCkgPT0gMCl7IC8vIDMtYnl0ZSBzZXF1ZW5jZVxuY2hlY2tTY2FsYXJWYWx1ZShjb2RlUG9pbnQpO3N5bWJvbCA9IHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQgPj4gMTIgJiAweDBGIHwgMHhFMCk7c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LDYpO31lbHNlIGlmKChjb2RlUG9pbnQgJiAweEZGRTAwMDAwKSA9PSAwKXsgLy8gNC1ieXRlIHNlcXVlbmNlXG5zeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50ID4+IDE4ICYgMHgwNyB8IDB4RjApO3N5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCwxMik7c3ltYm9sICs9IGNyZWF0ZUJ5dGUoY29kZVBvaW50LDYpO31zeW1ib2wgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCAmIDB4M0YgfCAweDgwKTtyZXR1cm4gc3ltYm9sO31mdW5jdGlvbiB1dGY4ZW5jb2RlKHN0cmluZyl7dmFyIGNvZGVQb2ludHM9dWNzMmRlY29kZShzdHJpbmcpO3ZhciBsZW5ndGg9Y29kZVBvaW50cy5sZW5ndGg7dmFyIGluZGV4PS0xO3ZhciBjb2RlUG9pbnQ7dmFyIGJ5dGVTdHJpbmc9Jyc7d2hpbGUoKytpbmRleCA8IGxlbmd0aCkge2NvZGVQb2ludCA9IGNvZGVQb2ludHNbaW5kZXhdO2J5dGVTdHJpbmcgKz0gZW5jb2RlQ29kZVBvaW50KGNvZGVQb2ludCk7fXJldHVybiBieXRlU3RyaW5nO30gLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovZnVuY3Rpb24gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKXtpZihieXRlSW5kZXggPj0gYnl0ZUNvdW50KXt0aHJvdyBFcnJvcignSW52YWxpZCBieXRlIGluZGV4Jyk7fXZhciBjb250aW51YXRpb25CeXRlPWJ5dGVBcnJheVtieXRlSW5kZXhdICYgMHhGRjtieXRlSW5kZXgrKztpZigoY29udGludWF0aW9uQnl0ZSAmIDB4QzApID09IDB4ODApe3JldHVybiBjb250aW51YXRpb25CeXRlICYgMHgzRjt9IC8vIElmIHdlIGVuZCB1cCBoZXJlLCBpdOKAmXMgbm90IGEgY29udGludWF0aW9uIGJ5dGVcbnRocm93IEVycm9yKCdJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlJyk7fWZ1bmN0aW9uIGRlY29kZVN5bWJvbCgpe3ZhciBieXRlMTt2YXIgYnl0ZTI7dmFyIGJ5dGUzO3ZhciBieXRlNDt2YXIgY29kZVBvaW50O2lmKGJ5dGVJbmRleCA+IGJ5dGVDb3VudCl7dGhyb3cgRXJyb3IoJ0ludmFsaWQgYnl0ZSBpbmRleCcpO31pZihieXRlSW5kZXggPT0gYnl0ZUNvdW50KXtyZXR1cm4gZmFsc2U7fSAvLyBSZWFkIGZpcnN0IGJ5dGVcbmJ5dGUxID0gYnl0ZUFycmF5W2J5dGVJbmRleF0gJiAweEZGO2J5dGVJbmRleCsrOyAvLyAxLWJ5dGUgc2VxdWVuY2UgKG5vIGNvbnRpbnVhdGlvbiBieXRlcylcbmlmKChieXRlMSAmIDB4ODApID09IDApe3JldHVybiBieXRlMTt9IC8vIDItYnl0ZSBzZXF1ZW5jZVxuaWYoKGJ5dGUxICYgMHhFMCkgPT0gMHhDMCl7dmFyIGJ5dGUyPXJlYWRDb250aW51YXRpb25CeXRlKCk7Y29kZVBvaW50ID0gKGJ5dGUxICYgMHgxRikgPDwgNiB8IGJ5dGUyO2lmKGNvZGVQb2ludCA+PSAweDgwKXtyZXR1cm4gY29kZVBvaW50O31lbHNlIHt0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO319IC8vIDMtYnl0ZSBzZXF1ZW5jZSAobWF5IGluY2x1ZGUgdW5wYWlyZWQgc3Vycm9nYXRlcylcbmlmKChieXRlMSAmIDB4RjApID09IDB4RTApe2J5dGUyID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtieXRlMyA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7Y29kZVBvaW50ID0gKGJ5dGUxICYgMHgwRikgPDwgMTIgfCBieXRlMiA8PCA2IHwgYnl0ZTM7aWYoY29kZVBvaW50ID49IDB4MDgwMCl7Y2hlY2tTY2FsYXJWYWx1ZShjb2RlUG9pbnQpO3JldHVybiBjb2RlUG9pbnQ7fWVsc2Uge3Rocm93IEVycm9yKCdJbnZhbGlkIGNvbnRpbnVhdGlvbiBieXRlJyk7fX0gLy8gNC1ieXRlIHNlcXVlbmNlXG5pZigoYnl0ZTEgJiAweEY4KSA9PSAweEYwKXtieXRlMiA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7Ynl0ZTMgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO2J5dGU0ID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtjb2RlUG9pbnQgPSAoYnl0ZTEgJiAweDBGKSA8PCAweDEyIHwgYnl0ZTIgPDwgMHgwQyB8IGJ5dGUzIDw8IDB4MDYgfCBieXRlNDtpZihjb2RlUG9pbnQgPj0gMHgwMTAwMDAgJiYgY29kZVBvaW50IDw9IDB4MTBGRkZGKXtyZXR1cm4gY29kZVBvaW50O319dGhyb3cgRXJyb3IoJ0ludmFsaWQgVVRGLTggZGV0ZWN0ZWQnKTt9dmFyIGJ5dGVBcnJheTt2YXIgYnl0ZUNvdW50O3ZhciBieXRlSW5kZXg7ZnVuY3Rpb24gdXRmOGRlY29kZShieXRlU3RyaW5nKXtieXRlQXJyYXkgPSB1Y3MyZGVjb2RlKGJ5dGVTdHJpbmcpO2J5dGVDb3VudCA9IGJ5dGVBcnJheS5sZW5ndGg7Ynl0ZUluZGV4ID0gMDt2YXIgY29kZVBvaW50cz1bXTt2YXIgdG1wO3doaWxlKCh0bXAgPSBkZWNvZGVTeW1ib2woKSkgIT09IGZhbHNlKSB7Y29kZVBvaW50cy5wdXNoKHRtcCk7fXJldHVybiB1Y3MyZW5jb2RlKGNvZGVQb2ludHMpO30gLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovdmFyIHV0Zjg9eyd2ZXJzaW9uJzonMi4wLjAnLCdlbmNvZGUnOnV0ZjhlbmNvZGUsJ2RlY29kZSc6dXRmOGRlY29kZX07IC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuLy8gbGlrZSB0aGUgZm9sbG93aW5nOlxuaWYodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpe2RlZmluZShmdW5jdGlvbigpe3JldHVybiB1dGY4O30pO31lbHNlIGlmKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSl7aWYoZnJlZU1vZHVsZSl7IC8vIGluIE5vZGUuanMgb3IgUmluZ29KUyB2MC44LjArXG5mcmVlTW9kdWxlLmV4cG9ydHMgPSB1dGY4O31lbHNlIHsgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cbnZhciBvYmplY3Q9e307dmFyIGhhc093blByb3BlcnR5PW9iamVjdC5oYXNPd25Qcm9wZXJ0eTtmb3IodmFyIGtleSBpbiB1dGY4KSB7aGFzT3duUHJvcGVydHkuY2FsbCh1dGY4LGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSB1dGY4W2tleV0pO319fWVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5yb290LnV0ZjggPSB1dGY4O319KSh0aGlzKTt9KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7fV0sMzA6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyd1c2Ugc3RyaWN0Jzt2YXIgYWxwaGFiZXQ9JzAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6LV8nLnNwbGl0KCcnKSxsZW5ndGg9NjQsbWFwPXt9LHNlZWQ9MCxpPTAscHJldjsgLyoqXG4gKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBzcGVjaWZpZWQgbnVtYmVyLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW0gVGhlIG51bWJlciB0byBjb252ZXJ0LlxuICogQHJldHVybnMge1N0cmluZ30gVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbnVtYmVyLlxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIGVuY29kZShudW0pe3ZhciBlbmNvZGVkPScnO2RvIHtlbmNvZGVkID0gYWxwaGFiZXRbbnVtICUgbGVuZ3RoXSArIGVuY29kZWQ7bnVtID0gTWF0aC5mbG9vcihudW0gLyBsZW5ndGgpO313aGlsZShudW0gPiAwKTtyZXR1cm4gZW5jb2RlZDt9IC8qKlxuICogUmV0dXJuIHRoZSBpbnRlZ2VyIHZhbHVlIHNwZWNpZmllZCBieSB0aGUgZ2l2ZW4gc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIHN0cmluZyB0byBjb252ZXJ0LlxuICogQHJldHVybnMge051bWJlcn0gVGhlIGludGVnZXIgdmFsdWUgcmVwcmVzZW50ZWQgYnkgdGhlIHN0cmluZy5cbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBkZWNvZGUoc3RyKXt2YXIgZGVjb2RlZD0wO2ZvcihpID0gMDtpIDwgc3RyLmxlbmd0aDtpKyspIHtkZWNvZGVkID0gZGVjb2RlZCAqIGxlbmd0aCArIG1hcFtzdHIuY2hhckF0KGkpXTt9cmV0dXJuIGRlY29kZWQ7fSAvKipcbiAqIFllYXN0OiBBIHRpbnkgZ3Jvd2luZyBpZCBnZW5lcmF0b3IuXG4gKlxuICogQHJldHVybnMge1N0cmluZ30gQSB1bmlxdWUgaWQuXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24geWVhc3QoKXt2YXIgbm93PWVuY29kZSgrbmV3IERhdGUoKSk7aWYobm93ICE9PSBwcmV2KXJldHVybiBzZWVkID0gMCxwcmV2ID0gbm93O3JldHVybiBub3cgKyAnLicgKyBlbmNvZGUoc2VlZCsrKTt9IC8vXG4vLyBNYXAgZWFjaCBjaGFyYWN0ZXIgdG8gaXRzIGluZGV4LlxuLy9cbmZvcig7aSA8IGxlbmd0aDtpKyspIG1hcFthbHBoYWJldFtpXV0gPSBpOyAvL1xuLy8gRXhwb3NlIHRoZSBgeWVhc3RgLCBgZW5jb2RlYCBhbmQgYGRlY29kZWAgZnVuY3Rpb25zLlxuLy9cbnllYXN0LmVuY29kZSA9IGVuY29kZTt5ZWFzdC5kZWNvZGUgPSBkZWNvZGU7bW9kdWxlLmV4cG9ydHMgPSB5ZWFzdDt9LHt9XSwzMTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL3ZhciB1cmw9X2RlcmVxXygnLi91cmwnKTt2YXIgcGFyc2VyPV9kZXJlcV8oJ3NvY2tldC5pby1wYXJzZXInKTt2YXIgTWFuYWdlcj1fZGVyZXFfKCcuL21hbmFnZXInKTt2YXIgZGVidWc9X2RlcmVxXygnZGVidWcnKSgnc29ja2V0LmlvLWNsaWVudCcpOyAvKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gbG9va3VwOyAvKipcbiAqIE1hbmFnZXJzIGNhY2hlLlxuICovdmFyIGNhY2hlPWV4cG9ydHMubWFuYWdlcnMgPSB7fTsgLyoqXG4gKiBMb29rcyB1cCBhbiBleGlzdGluZyBgTWFuYWdlcmAgZm9yIG11bHRpcGxleGluZy5cbiAqIElmIHRoZSB1c2VyIHN1bW1vbnM6XG4gKlxuICogICBgaW8oJ2h0dHA6Ly9sb2NhbGhvc3QvYScpO2BcbiAqICAgYGlvKCdodHRwOi8vbG9jYWxob3N0L2InKTtgXG4gKlxuICogV2UgcmV1c2UgdGhlIGV4aXN0aW5nIGluc3RhbmNlIGJhc2VkIG9uIHNhbWUgc2NoZW1lL3BvcnQvaG9zdCxcbiAqIGFuZCB3ZSBpbml0aWFsaXplIHNvY2tldHMgZm9yIGVhY2ggbmFtZXNwYWNlLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBsb29rdXAodXJpLG9wdHMpe2lmKHR5cGVvZiB1cmkgPT0gJ29iamVjdCcpe29wdHMgPSB1cmk7dXJpID0gdW5kZWZpbmVkO31vcHRzID0gb3B0cyB8fCB7fTt2YXIgcGFyc2VkPXVybCh1cmkpO3ZhciBzb3VyY2U9cGFyc2VkLnNvdXJjZTt2YXIgaWQ9cGFyc2VkLmlkO3ZhciBwYXRoPXBhcnNlZC5wYXRoO3ZhciBzYW1lTmFtZXNwYWNlPWNhY2hlW2lkXSAmJiBwYXRoIGluIGNhY2hlW2lkXS5uc3BzO3ZhciBuZXdDb25uZWN0aW9uPW9wdHMuZm9yY2VOZXcgfHwgb3B0c1snZm9yY2UgbmV3IGNvbm5lY3Rpb24nXSB8fCBmYWxzZSA9PT0gb3B0cy5tdWx0aXBsZXggfHwgc2FtZU5hbWVzcGFjZTt2YXIgaW87aWYobmV3Q29ubmVjdGlvbil7ZGVidWcoJ2lnbm9yaW5nIHNvY2tldCBjYWNoZSBmb3IgJXMnLHNvdXJjZSk7aW8gPSBNYW5hZ2VyKHNvdXJjZSxvcHRzKTt9ZWxzZSB7aWYoIWNhY2hlW2lkXSl7ZGVidWcoJ25ldyBpbyBpbnN0YW5jZSBmb3IgJXMnLHNvdXJjZSk7Y2FjaGVbaWRdID0gTWFuYWdlcihzb3VyY2Usb3B0cyk7fWlvID0gY2FjaGVbaWRdO31yZXR1cm4gaW8uc29ja2V0KHBhcnNlZC5wYXRoKTt9IC8qKlxuICogUHJvdG9jb2wgdmVyc2lvbi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5wcm90b2NvbCA9IHBhcnNlci5wcm90b2NvbDsgLyoqXG4gKiBgY29ubmVjdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVyaVxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMuY29ubmVjdCA9IGxvb2t1cDsgLyoqXG4gKiBFeHBvc2UgY29uc3RydWN0b3JzIGZvciBzdGFuZGFsb25lIGJ1aWxkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLk1hbmFnZXIgPSBfZGVyZXFfKCcuL21hbmFnZXInKTtleHBvcnRzLlNvY2tldCA9IF9kZXJlcV8oJy4vc29ja2V0Jyk7fSx7XCIuL21hbmFnZXJcIjozMixcIi4vc29ja2V0XCI6MzQsXCIuL3VybFwiOjM1LFwiZGVidWdcIjozOSxcInNvY2tldC5pby1wYXJzZXJcIjo0N31dLDMyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIGVpbz1fZGVyZXFfKCdlbmdpbmUuaW8tY2xpZW50Jyk7dmFyIFNvY2tldD1fZGVyZXFfKCcuL3NvY2tldCcpO3ZhciBFbWl0dGVyPV9kZXJlcV8oJ2NvbXBvbmVudC1lbWl0dGVyJyk7dmFyIHBhcnNlcj1fZGVyZXFfKCdzb2NrZXQuaW8tcGFyc2VyJyk7dmFyIG9uPV9kZXJlcV8oJy4vb24nKTt2YXIgYmluZD1fZGVyZXFfKCdjb21wb25lbnQtYmluZCcpO3ZhciBkZWJ1Zz1fZGVyZXFfKCdkZWJ1ZycpKCdzb2NrZXQuaW8tY2xpZW50Om1hbmFnZXInKTt2YXIgaW5kZXhPZj1fZGVyZXFfKCdpbmRleG9mJyk7dmFyIEJhY2tvZmY9X2RlcmVxXygnYmFja28yJyk7IC8qKlxuICogSUU2KyBoYXNPd25Qcm9wZXJ0eVxuICovdmFyIGhhcz1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5OyAvKipcbiAqIE1vZHVsZSBleHBvcnRzXG4gKi9tb2R1bGUuZXhwb3J0cyA9IE1hbmFnZXI7IC8qKlxuICogYE1hbmFnZXJgIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBlbmdpbmUgaW5zdGFuY2Ugb3IgZW5naW5lIHVyaS9vcHRzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIE1hbmFnZXIodXJpLG9wdHMpe2lmKCEodGhpcyBpbnN0YW5jZW9mIE1hbmFnZXIpKXJldHVybiBuZXcgTWFuYWdlcih1cmksb3B0cyk7aWYodXJpICYmICdvYmplY3QnID09IHR5cGVvZiB1cmkpe29wdHMgPSB1cmk7dXJpID0gdW5kZWZpbmVkO31vcHRzID0gb3B0cyB8fCB7fTtvcHRzLnBhdGggPSBvcHRzLnBhdGggfHwgJy9zb2NrZXQuaW8nO3RoaXMubnNwcyA9IHt9O3RoaXMuc3VicyA9IFtdO3RoaXMub3B0cyA9IG9wdHM7dGhpcy5yZWNvbm5lY3Rpb24ob3B0cy5yZWNvbm5lY3Rpb24gIT09IGZhbHNlKTt0aGlzLnJlY29ubmVjdGlvbkF0dGVtcHRzKG9wdHMucmVjb25uZWN0aW9uQXR0ZW1wdHMgfHwgSW5maW5pdHkpO3RoaXMucmVjb25uZWN0aW9uRGVsYXkob3B0cy5yZWNvbm5lY3Rpb25EZWxheSB8fCAxMDAwKTt0aGlzLnJlY29ubmVjdGlvbkRlbGF5TWF4KG9wdHMucmVjb25uZWN0aW9uRGVsYXlNYXggfHwgNTAwMCk7dGhpcy5yYW5kb21pemF0aW9uRmFjdG9yKG9wdHMucmFuZG9taXphdGlvbkZhY3RvciB8fCAwLjUpO3RoaXMuYmFja29mZiA9IG5ldyBCYWNrb2ZmKHttaW46dGhpcy5yZWNvbm5lY3Rpb25EZWxheSgpLG1heDp0aGlzLnJlY29ubmVjdGlvbkRlbGF5TWF4KCksaml0dGVyOnRoaXMucmFuZG9taXphdGlvbkZhY3RvcigpfSk7dGhpcy50aW1lb3V0KG51bGwgPT0gb3B0cy50aW1lb3V0PzIwMDAwOm9wdHMudGltZW91dCk7dGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NlZCc7dGhpcy51cmkgPSB1cmk7dGhpcy5jb25uZWN0aW5nID0gW107dGhpcy5sYXN0UGluZyA9IG51bGw7dGhpcy5lbmNvZGluZyA9IGZhbHNlO3RoaXMucGFja2V0QnVmZmVyID0gW107dGhpcy5lbmNvZGVyID0gbmV3IHBhcnNlci5FbmNvZGVyKCk7dGhpcy5kZWNvZGVyID0gbmV3IHBhcnNlci5EZWNvZGVyKCk7dGhpcy5hdXRvQ29ubmVjdCA9IG9wdHMuYXV0b0Nvbm5lY3QgIT09IGZhbHNlO2lmKHRoaXMuYXV0b0Nvbm5lY3QpdGhpcy5vcGVuKCk7fSAvKipcbiAqIFByb3BhZ2F0ZSBnaXZlbiBldmVudCB0byBzb2NrZXRzIGFuZCBlbWl0IG9uIGB0aGlzYFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovTWFuYWdlci5wcm90b3R5cGUuZW1pdEFsbCA9IGZ1bmN0aW9uKCl7dGhpcy5lbWl0LmFwcGx5KHRoaXMsYXJndW1lbnRzKTtmb3IodmFyIG5zcCBpbiB0aGlzLm5zcHMpIHtpZihoYXMuY2FsbCh0aGlzLm5zcHMsbnNwKSl7dGhpcy5uc3BzW25zcF0uZW1pdC5hcHBseSh0aGlzLm5zcHNbbnNwXSxhcmd1bWVudHMpO319fTsgLyoqXG4gKiBVcGRhdGUgYHNvY2tldC5pZGAgb2YgYWxsIHNvY2tldHNcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLnVwZGF0ZVNvY2tldElkcyA9IGZ1bmN0aW9uKCl7Zm9yKHZhciBuc3AgaW4gdGhpcy5uc3BzKSB7aWYoaGFzLmNhbGwodGhpcy5uc3BzLG5zcCkpe3RoaXMubnNwc1tuc3BdLmlkID0gdGhpcy5lbmdpbmUuaWQ7fX19OyAvKipcbiAqIE1peCBpbiBgRW1pdHRlcmAuXG4gKi9FbWl0dGVyKE1hbmFnZXIucHJvdG90eXBlKTsgLyoqXG4gKiBTZXRzIHRoZSBgcmVjb25uZWN0aW9uYCBjb25maWcuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSB0cnVlL2ZhbHNlIGlmIGl0IHNob3VsZCBhdXRvbWF0aWNhbGx5IHJlY29ubmVjdFxuICogQHJldHVybiB7TWFuYWdlcn0gc2VsZiBvciB2YWx1ZVxuICogQGFwaSBwdWJsaWNcbiAqL01hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdGlvbiA9IGZ1bmN0aW9uKHYpe2lmKCFhcmd1bWVudHMubGVuZ3RoKXJldHVybiB0aGlzLl9yZWNvbm5lY3Rpb247dGhpcy5fcmVjb25uZWN0aW9uID0gISF2O3JldHVybiB0aGlzO307IC8qKlxuICogU2V0cyB0aGUgcmVjb25uZWN0aW9uIGF0dGVtcHRzIGNvbmZpZy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbWF4IHJlY29ubmVjdGlvbiBhdHRlbXB0cyBiZWZvcmUgZ2l2aW5nIHVwXG4gKiBAcmV0dXJuIHtNYW5hZ2VyfSBzZWxmIG9yIHZhbHVlXG4gKiBAYXBpIHB1YmxpY1xuICovTWFuYWdlci5wcm90b3R5cGUucmVjb25uZWN0aW9uQXR0ZW1wdHMgPSBmdW5jdGlvbih2KXtpZighYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5fcmVjb25uZWN0aW9uQXR0ZW1wdHM7dGhpcy5fcmVjb25uZWN0aW9uQXR0ZW1wdHMgPSB2O3JldHVybiB0aGlzO307IC8qKlxuICogU2V0cyB0aGUgZGVsYXkgYmV0d2VlbiByZWNvbm5lY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheVxuICogQHJldHVybiB7TWFuYWdlcn0gc2VsZiBvciB2YWx1ZVxuICogQGFwaSBwdWJsaWNcbiAqL01hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdGlvbkRlbGF5ID0gZnVuY3Rpb24odil7aWYoIWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuX3JlY29ubmVjdGlvbkRlbGF5O3RoaXMuX3JlY29ubmVjdGlvbkRlbGF5ID0gdjt0aGlzLmJhY2tvZmYgJiYgdGhpcy5iYWNrb2ZmLnNldE1pbih2KTtyZXR1cm4gdGhpczt9O01hbmFnZXIucHJvdG90eXBlLnJhbmRvbWl6YXRpb25GYWN0b3IgPSBmdW5jdGlvbih2KXtpZighYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5fcmFuZG9taXphdGlvbkZhY3Rvcjt0aGlzLl9yYW5kb21pemF0aW9uRmFjdG9yID0gdjt0aGlzLmJhY2tvZmYgJiYgdGhpcy5iYWNrb2ZmLnNldEppdHRlcih2KTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFNldHMgdGhlIG1heGltdW0gZGVsYXkgYmV0d2VlbiByZWNvbm5lY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheVxuICogQHJldHVybiB7TWFuYWdlcn0gc2VsZiBvciB2YWx1ZVxuICogQGFwaSBwdWJsaWNcbiAqL01hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdGlvbkRlbGF5TWF4ID0gZnVuY3Rpb24odil7aWYoIWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuX3JlY29ubmVjdGlvbkRlbGF5TWF4O3RoaXMuX3JlY29ubmVjdGlvbkRlbGF5TWF4ID0gdjt0aGlzLmJhY2tvZmYgJiYgdGhpcy5iYWNrb2ZmLnNldE1heCh2KTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFNldHMgdGhlIGNvbm5lY3Rpb24gdGltZW91dC4gYGZhbHNlYCB0byBkaXNhYmxlXG4gKlxuICogQHJldHVybiB7TWFuYWdlcn0gc2VsZiBvciB2YWx1ZVxuICogQGFwaSBwdWJsaWNcbiAqL01hbmFnZXIucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbih2KXtpZighYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5fdGltZW91dDt0aGlzLl90aW1lb3V0ID0gdjtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFN0YXJ0cyB0cnlpbmcgdG8gcmVjb25uZWN0IGlmIHJlY29ubmVjdGlvbiBpcyBlbmFibGVkIGFuZCB3ZSBoYXZlIG5vdFxuICogc3RhcnRlZCByZWNvbm5lY3RpbmcgeWV0XG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5tYXliZVJlY29ubmVjdE9uT3BlbiA9IGZ1bmN0aW9uKCl7IC8vIE9ubHkgdHJ5IHRvIHJlY29ubmVjdCBpZiBpdCdzIHRoZSBmaXJzdCB0aW1lIHdlJ3JlIGNvbm5lY3RpbmdcbmlmKCF0aGlzLnJlY29ubmVjdGluZyAmJiB0aGlzLl9yZWNvbm5lY3Rpb24gJiYgdGhpcy5iYWNrb2ZmLmF0dGVtcHRzID09PSAwKXsgLy8ga2VlcHMgcmVjb25uZWN0aW9uIGZyb20gZmlyaW5nIHR3aWNlIGZvciB0aGUgc2FtZSByZWNvbm5lY3Rpb24gbG9vcFxudGhpcy5yZWNvbm5lY3QoKTt9fTsgLyoqXG4gKiBTZXRzIHRoZSBjdXJyZW50IHRyYW5zcG9ydCBgc29ja2V0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25hbCwgY2FsbGJhY2tcbiAqIEByZXR1cm4ge01hbmFnZXJ9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5vcGVuID0gTWFuYWdlci5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKGZuKXtkZWJ1ZygncmVhZHlTdGF0ZSAlcycsdGhpcy5yZWFkeVN0YXRlKTtpZih+dGhpcy5yZWFkeVN0YXRlLmluZGV4T2YoJ29wZW4nKSlyZXR1cm4gdGhpcztkZWJ1Zygnb3BlbmluZyAlcycsdGhpcy51cmkpO3RoaXMuZW5naW5lID0gZWlvKHRoaXMudXJpLHRoaXMub3B0cyk7dmFyIHNvY2tldD10aGlzLmVuZ2luZTt2YXIgc2VsZj10aGlzO3RoaXMucmVhZHlTdGF0ZSA9ICdvcGVuaW5nJzt0aGlzLnNraXBSZWNvbm5lY3QgPSBmYWxzZTsgLy8gZW1pdCBgb3BlbmBcbnZhciBvcGVuU3ViPW9uKHNvY2tldCwnb3BlbicsZnVuY3Rpb24oKXtzZWxmLm9ub3BlbigpO2ZuICYmIGZuKCk7fSk7IC8vIGVtaXQgYGNvbm5lY3RfZXJyb3JgXG52YXIgZXJyb3JTdWI9b24oc29ja2V0LCdlcnJvcicsZnVuY3Rpb24oZGF0YSl7ZGVidWcoJ2Nvbm5lY3RfZXJyb3InKTtzZWxmLmNsZWFudXAoKTtzZWxmLnJlYWR5U3RhdGUgPSAnY2xvc2VkJztzZWxmLmVtaXRBbGwoJ2Nvbm5lY3RfZXJyb3InLGRhdGEpO2lmKGZuKXt2YXIgZXJyPW5ldyBFcnJvcignQ29ubmVjdGlvbiBlcnJvcicpO2Vyci5kYXRhID0gZGF0YTtmbihlcnIpO31lbHNlIHsgLy8gT25seSBkbyB0aGlzIGlmIHRoZXJlIGlzIG5vIGZuIHRvIGhhbmRsZSB0aGUgZXJyb3JcbnNlbGYubWF5YmVSZWNvbm5lY3RPbk9wZW4oKTt9fSk7IC8vIGVtaXQgYGNvbm5lY3RfdGltZW91dGBcbmlmKGZhbHNlICE9PSB0aGlzLl90aW1lb3V0KXt2YXIgdGltZW91dD10aGlzLl90aW1lb3V0O2RlYnVnKCdjb25uZWN0IGF0dGVtcHQgd2lsbCB0aW1lb3V0IGFmdGVyICVkJyx0aW1lb3V0KTsgLy8gc2V0IHRpbWVyXG52YXIgdGltZXI9c2V0VGltZW91dChmdW5jdGlvbigpe2RlYnVnKCdjb25uZWN0IGF0dGVtcHQgdGltZWQgb3V0IGFmdGVyICVkJyx0aW1lb3V0KTtvcGVuU3ViLmRlc3Ryb3koKTtzb2NrZXQuY2xvc2UoKTtzb2NrZXQuZW1pdCgnZXJyb3InLCd0aW1lb3V0Jyk7c2VsZi5lbWl0QWxsKCdjb25uZWN0X3RpbWVvdXQnLHRpbWVvdXQpO30sdGltZW91dCk7dGhpcy5zdWJzLnB1c2goe2Rlc3Ryb3k6ZnVuY3Rpb24gZGVzdHJveSgpe2NsZWFyVGltZW91dCh0aW1lcik7fX0pO310aGlzLnN1YnMucHVzaChvcGVuU3ViKTt0aGlzLnN1YnMucHVzaChlcnJvclN1Yik7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiB0cmFuc3BvcnQgb3Blbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLm9ub3BlbiA9IGZ1bmN0aW9uKCl7ZGVidWcoJ29wZW4nKTsgLy8gY2xlYXIgb2xkIHN1YnNcbnRoaXMuY2xlYW51cCgpOyAvLyBtYXJrIGFzIG9wZW5cbnRoaXMucmVhZHlTdGF0ZSA9ICdvcGVuJzt0aGlzLmVtaXQoJ29wZW4nKTsgLy8gYWRkIG5ldyBzdWJzXG52YXIgc29ja2V0PXRoaXMuZW5naW5lO3RoaXMuc3Vicy5wdXNoKG9uKHNvY2tldCwnZGF0YScsYmluZCh0aGlzLCdvbmRhdGEnKSkpO3RoaXMuc3Vicy5wdXNoKG9uKHNvY2tldCwncGluZycsYmluZCh0aGlzLCdvbnBpbmcnKSkpO3RoaXMuc3Vicy5wdXNoKG9uKHNvY2tldCwncG9uZycsYmluZCh0aGlzLCdvbnBvbmcnKSkpO3RoaXMuc3Vicy5wdXNoKG9uKHNvY2tldCwnZXJyb3InLGJpbmQodGhpcywnb25lcnJvcicpKSk7dGhpcy5zdWJzLnB1c2gob24oc29ja2V0LCdjbG9zZScsYmluZCh0aGlzLCdvbmNsb3NlJykpKTt0aGlzLnN1YnMucHVzaChvbih0aGlzLmRlY29kZXIsJ2RlY29kZWQnLGJpbmQodGhpcywnb25kZWNvZGVkJykpKTt9OyAvKipcbiAqIENhbGxlZCB1cG9uIGEgcGluZy5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLm9ucGluZyA9IGZ1bmN0aW9uKCl7dGhpcy5sYXN0UGluZyA9IG5ldyBEYXRlKCk7dGhpcy5lbWl0QWxsKCdwaW5nJyk7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBhIHBhY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLm9ucG9uZyA9IGZ1bmN0aW9uKCl7dGhpcy5lbWl0QWxsKCdwb25nJyxuZXcgRGF0ZSgpIC0gdGhpcy5sYXN0UGluZyk7fTsgLyoqXG4gKiBDYWxsZWQgd2l0aCBkYXRhLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovTWFuYWdlci5wcm90b3R5cGUub25kYXRhID0gZnVuY3Rpb24oZGF0YSl7dGhpcy5kZWNvZGVyLmFkZChkYXRhKTt9OyAvKipcbiAqIENhbGxlZCB3aGVuIHBhcnNlciBmdWxseSBkZWNvZGVzIGEgcGFja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovTWFuYWdlci5wcm90b3R5cGUub25kZWNvZGVkID0gZnVuY3Rpb24ocGFja2V0KXt0aGlzLmVtaXQoJ3BhY2tldCcscGFja2V0KTt9OyAvKipcbiAqIENhbGxlZCB1cG9uIHNvY2tldCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLm9uZXJyb3IgPSBmdW5jdGlvbihlcnIpe2RlYnVnKCdlcnJvcicsZXJyKTt0aGlzLmVtaXRBbGwoJ2Vycm9yJyxlcnIpO307IC8qKlxuICogQ3JlYXRlcyBhIG5ldyBzb2NrZXQgZm9yIHRoZSBnaXZlbiBgbnNwYC5cbiAqXG4gKiBAcmV0dXJuIHtTb2NrZXR9XG4gKiBAYXBpIHB1YmxpY1xuICovTWFuYWdlci5wcm90b3R5cGUuc29ja2V0ID0gZnVuY3Rpb24obnNwKXt2YXIgc29ja2V0PXRoaXMubnNwc1tuc3BdO2lmKCFzb2NrZXQpe3NvY2tldCA9IG5ldyBTb2NrZXQodGhpcyxuc3ApO3RoaXMubnNwc1tuc3BdID0gc29ja2V0O3ZhciBzZWxmPXRoaXM7c29ja2V0Lm9uKCdjb25uZWN0aW5nJyxvbkNvbm5lY3RpbmcpO3NvY2tldC5vbignY29ubmVjdCcsZnVuY3Rpb24oKXtzb2NrZXQuaWQgPSBzZWxmLmVuZ2luZS5pZDt9KTtpZih0aGlzLmF1dG9Db25uZWN0KXsgLy8gbWFudWFsbHkgY2FsbCBoZXJlIHNpbmNlIGNvbm5lY3RpbmcgZXZuZXQgaXMgZmlyZWQgYmVmb3JlIGxpc3RlbmluZ1xub25Db25uZWN0aW5nKCk7fX1mdW5jdGlvbiBvbkNvbm5lY3RpbmcoKXtpZighIH5pbmRleE9mKHNlbGYuY29ubmVjdGluZyxzb2NrZXQpKXtzZWxmLmNvbm5lY3RpbmcucHVzaChzb2NrZXQpO319cmV0dXJuIHNvY2tldDt9OyAvKipcbiAqIENhbGxlZCB1cG9uIGEgc29ja2V0IGNsb3NlLlxuICpcbiAqIEBwYXJhbSB7U29ja2V0fSBzb2NrZXRcbiAqL01hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbihzb2NrZXQpe3ZhciBpbmRleD1pbmRleE9mKHRoaXMuY29ubmVjdGluZyxzb2NrZXQpO2lmKH5pbmRleCl0aGlzLmNvbm5lY3Rpbmcuc3BsaWNlKGluZGV4LDEpO2lmKHRoaXMuY29ubmVjdGluZy5sZW5ndGgpcmV0dXJuO3RoaXMuY2xvc2UoKTt9OyAvKipcbiAqIFdyaXRlcyBhIHBhY2tldC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLnBhY2tldCA9IGZ1bmN0aW9uKHBhY2tldCl7ZGVidWcoJ3dyaXRpbmcgcGFja2V0ICVqJyxwYWNrZXQpO3ZhciBzZWxmPXRoaXM7aWYoIXNlbGYuZW5jb2RpbmcpeyAvLyBlbmNvZGUsIHRoZW4gd3JpdGUgdG8gZW5naW5lIHdpdGggcmVzdWx0XG5zZWxmLmVuY29kaW5nID0gdHJ1ZTt0aGlzLmVuY29kZXIuZW5jb2RlKHBhY2tldCxmdW5jdGlvbihlbmNvZGVkUGFja2V0cyl7Zm9yKHZhciBpPTA7aSA8IGVuY29kZWRQYWNrZXRzLmxlbmd0aDtpKyspIHtzZWxmLmVuZ2luZS53cml0ZShlbmNvZGVkUGFja2V0c1tpXSxwYWNrZXQub3B0aW9ucyk7fXNlbGYuZW5jb2RpbmcgPSBmYWxzZTtzZWxmLnByb2Nlc3NQYWNrZXRRdWV1ZSgpO30pO31lbHNlIHsgLy8gYWRkIHBhY2tldCB0byB0aGUgcXVldWVcbnNlbGYucGFja2V0QnVmZmVyLnB1c2gocGFja2V0KTt9fTsgLyoqXG4gKiBJZiBwYWNrZXQgYnVmZmVyIGlzIG5vbi1lbXB0eSwgYmVnaW5zIGVuY29kaW5nIHRoZVxuICogbmV4dCBwYWNrZXQgaW4gbGluZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLnByb2Nlc3NQYWNrZXRRdWV1ZSA9IGZ1bmN0aW9uKCl7aWYodGhpcy5wYWNrZXRCdWZmZXIubGVuZ3RoID4gMCAmJiAhdGhpcy5lbmNvZGluZyl7dmFyIHBhY2s9dGhpcy5wYWNrZXRCdWZmZXIuc2hpZnQoKTt0aGlzLnBhY2tldChwYWNrKTt9fTsgLyoqXG4gKiBDbGVhbiB1cCB0cmFuc3BvcnQgc3Vic2NyaXB0aW9ucyBhbmQgcGFja2V0IGJ1ZmZlci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbigpe2RlYnVnKCdjbGVhbnVwJyk7dmFyIHN1Yjt3aGlsZShzdWIgPSB0aGlzLnN1YnMuc2hpZnQoKSkgc3ViLmRlc3Ryb3koKTt0aGlzLnBhY2tldEJ1ZmZlciA9IFtdO3RoaXMuZW5jb2RpbmcgPSBmYWxzZTt0aGlzLmxhc3RQaW5nID0gbnVsbDt0aGlzLmRlY29kZXIuZGVzdHJveSgpO307IC8qKlxuICogQ2xvc2UgdGhlIGN1cnJlbnQgc29ja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovTWFuYWdlci5wcm90b3R5cGUuY2xvc2UgPSBNYW5hZ2VyLnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtkZWJ1ZygnZGlzY29ubmVjdCcpO3RoaXMuc2tpcFJlY29ubmVjdCA9IHRydWU7dGhpcy5yZWNvbm5lY3RpbmcgPSBmYWxzZTtpZignb3BlbmluZycgPT0gdGhpcy5yZWFkeVN0YXRlKXsgLy8gYG9uY2xvc2VgIHdpbGwgbm90IGZpcmUgYmVjYXVzZVxuLy8gYW4gb3BlbiBldmVudCBuZXZlciBoYXBwZW5lZFxudGhpcy5jbGVhbnVwKCk7fXRoaXMuYmFja29mZi5yZXNldCgpO3RoaXMucmVhZHlTdGF0ZSA9ICdjbG9zZWQnO2lmKHRoaXMuZW5naW5lKXRoaXMuZW5naW5lLmNsb3NlKCk7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBlbmdpbmUgY2xvc2UuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5vbmNsb3NlID0gZnVuY3Rpb24ocmVhc29uKXtkZWJ1Zygnb25jbG9zZScpO3RoaXMuY2xlYW51cCgpO3RoaXMuYmFja29mZi5yZXNldCgpO3RoaXMucmVhZHlTdGF0ZSA9ICdjbG9zZWQnO3RoaXMuZW1pdCgnY2xvc2UnLHJlYXNvbik7aWYodGhpcy5fcmVjb25uZWN0aW9uICYmICF0aGlzLnNraXBSZWNvbm5lY3Qpe3RoaXMucmVjb25uZWN0KCk7fX07IC8qKlxuICogQXR0ZW1wdCBhIHJlY29ubmVjdGlvbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdCA9IGZ1bmN0aW9uKCl7aWYodGhpcy5yZWNvbm5lY3RpbmcgfHwgdGhpcy5za2lwUmVjb25uZWN0KXJldHVybiB0aGlzO3ZhciBzZWxmPXRoaXM7aWYodGhpcy5iYWNrb2ZmLmF0dGVtcHRzID49IHRoaXMuX3JlY29ubmVjdGlvbkF0dGVtcHRzKXtkZWJ1ZygncmVjb25uZWN0IGZhaWxlZCcpO3RoaXMuYmFja29mZi5yZXNldCgpO3RoaXMuZW1pdEFsbCgncmVjb25uZWN0X2ZhaWxlZCcpO3RoaXMucmVjb25uZWN0aW5nID0gZmFsc2U7fWVsc2Uge3ZhciBkZWxheT10aGlzLmJhY2tvZmYuZHVyYXRpb24oKTtkZWJ1Zygnd2lsbCB3YWl0ICVkbXMgYmVmb3JlIHJlY29ubmVjdCBhdHRlbXB0JyxkZWxheSk7dGhpcy5yZWNvbm5lY3RpbmcgPSB0cnVlO3ZhciB0aW1lcj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aWYoc2VsZi5za2lwUmVjb25uZWN0KXJldHVybjtkZWJ1ZygnYXR0ZW1wdGluZyByZWNvbm5lY3QnKTtzZWxmLmVtaXRBbGwoJ3JlY29ubmVjdF9hdHRlbXB0JyxzZWxmLmJhY2tvZmYuYXR0ZW1wdHMpO3NlbGYuZW1pdEFsbCgncmVjb25uZWN0aW5nJyxzZWxmLmJhY2tvZmYuYXR0ZW1wdHMpOyAvLyBjaGVjayBhZ2FpbiBmb3IgdGhlIGNhc2Ugc29ja2V0IGNsb3NlZCBpbiBhYm92ZSBldmVudHNcbmlmKHNlbGYuc2tpcFJlY29ubmVjdClyZXR1cm47c2VsZi5vcGVuKGZ1bmN0aW9uKGVycil7aWYoZXJyKXtkZWJ1ZygncmVjb25uZWN0IGF0dGVtcHQgZXJyb3InKTtzZWxmLnJlY29ubmVjdGluZyA9IGZhbHNlO3NlbGYucmVjb25uZWN0KCk7c2VsZi5lbWl0QWxsKCdyZWNvbm5lY3RfZXJyb3InLGVyci5kYXRhKTt9ZWxzZSB7ZGVidWcoJ3JlY29ubmVjdCBzdWNjZXNzJyk7c2VsZi5vbnJlY29ubmVjdCgpO319KTt9LGRlbGF5KTt0aGlzLnN1YnMucHVzaCh7ZGVzdHJveTpmdW5jdGlvbiBkZXN0cm95KCl7Y2xlYXJUaW1lb3V0KHRpbWVyKTt9fSk7fX07IC8qKlxuICogQ2FsbGVkIHVwb24gc3VjY2Vzc2Z1bCByZWNvbm5lY3QuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5vbnJlY29ubmVjdCA9IGZ1bmN0aW9uKCl7dmFyIGF0dGVtcHQ9dGhpcy5iYWNrb2ZmLmF0dGVtcHRzO3RoaXMucmVjb25uZWN0aW5nID0gZmFsc2U7dGhpcy5iYWNrb2ZmLnJlc2V0KCk7dGhpcy51cGRhdGVTb2NrZXRJZHMoKTt0aGlzLmVtaXRBbGwoJ3JlY29ubmVjdCcsYXR0ZW1wdCk7fTt9LHtcIi4vb25cIjozMyxcIi4vc29ja2V0XCI6MzQsXCJiYWNrbzJcIjozNixcImNvbXBvbmVudC1iaW5kXCI6MzcsXCJjb21wb25lbnQtZW1pdHRlclwiOjM4LFwiZGVidWdcIjozOSxcImVuZ2luZS5pby1jbGllbnRcIjoxLFwiaW5kZXhvZlwiOjQyLFwic29ja2V0LmlvLXBhcnNlclwiOjQ3fV0sMzM6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovbW9kdWxlLmV4cG9ydHMgPSBvbjsgLyoqXG4gKiBIZWxwZXIgZm9yIHN1YnNjcmlwdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8RXZlbnRFbWl0dGVyfSBvYmogd2l0aCBgRW1pdHRlcmAgbWl4aW4gb3IgYEV2ZW50RW1pdHRlcmBcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBuYW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIG9uKG9iaixldixmbil7b2JqLm9uKGV2LGZuKTtyZXR1cm4ge2Rlc3Ryb3k6ZnVuY3Rpb24gZGVzdHJveSgpe29iai5yZW1vdmVMaXN0ZW5lcihldixmbik7fX07fX0se31dLDM0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIHBhcnNlcj1fZGVyZXFfKCdzb2NrZXQuaW8tcGFyc2VyJyk7dmFyIEVtaXR0ZXI9X2RlcmVxXygnY29tcG9uZW50LWVtaXR0ZXInKTt2YXIgdG9BcnJheT1fZGVyZXFfKCd0by1hcnJheScpO3ZhciBvbj1fZGVyZXFfKCcuL29uJyk7dmFyIGJpbmQ9X2RlcmVxXygnY29tcG9uZW50LWJpbmQnKTt2YXIgZGVidWc9X2RlcmVxXygnZGVidWcnKSgnc29ja2V0LmlvLWNsaWVudDpzb2NrZXQnKTt2YXIgaGFzQmluPV9kZXJlcV8oJ2hhcy1iaW5hcnknKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFNvY2tldDsgLyoqXG4gKiBJbnRlcm5hbCBldmVudHMgKGJsYWNrbGlzdGVkKS5cbiAqIFRoZXNlIGV2ZW50cyBjYW4ndCBiZSBlbWl0dGVkIGJ5IHRoZSB1c2VyLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovdmFyIGV2ZW50cz17Y29ubmVjdDoxLGNvbm5lY3RfZXJyb3I6MSxjb25uZWN0X3RpbWVvdXQ6MSxjb25uZWN0aW5nOjEsZGlzY29ubmVjdDoxLGVycm9yOjEscmVjb25uZWN0OjEscmVjb25uZWN0X2F0dGVtcHQ6MSxyZWNvbm5lY3RfZmFpbGVkOjEscmVjb25uZWN0X2Vycm9yOjEscmVjb25uZWN0aW5nOjEscGluZzoxLHBvbmc6MX07IC8qKlxuICogU2hvcnRjdXQgdG8gYEVtaXR0ZXIjZW1pdGAuXG4gKi92YXIgZW1pdD1FbWl0dGVyLnByb3RvdHlwZS5lbWl0OyAvKipcbiAqIGBTb2NrZXRgIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBTb2NrZXQoaW8sbnNwKXt0aGlzLmlvID0gaW87dGhpcy5uc3AgPSBuc3A7dGhpcy5qc29uID0gdGhpczsgLy8gY29tcGF0XG50aGlzLmlkcyA9IDA7dGhpcy5hY2tzID0ge307dGhpcy5yZWNlaXZlQnVmZmVyID0gW107dGhpcy5zZW5kQnVmZmVyID0gW107dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTt0aGlzLmRpc2Nvbm5lY3RlZCA9IHRydWU7aWYodGhpcy5pby5hdXRvQ29ubmVjdCl0aGlzLm9wZW4oKTt9IC8qKlxuICogTWl4IGluIGBFbWl0dGVyYC5cbiAqL0VtaXR0ZXIoU29ja2V0LnByb3RvdHlwZSk7IC8qKlxuICogU3Vic2NyaWJlIHRvIG9wZW4sIGNsb3NlIGFuZCBwYWNrZXQgZXZlbnRzXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLnN1YkV2ZW50cyA9IGZ1bmN0aW9uKCl7aWYodGhpcy5zdWJzKXJldHVybjt2YXIgaW89dGhpcy5pbzt0aGlzLnN1YnMgPSBbb24oaW8sJ29wZW4nLGJpbmQodGhpcywnb25vcGVuJykpLG9uKGlvLCdwYWNrZXQnLGJpbmQodGhpcywnb25wYWNrZXQnKSksb24oaW8sJ2Nsb3NlJyxiaW5kKHRoaXMsJ29uY2xvc2UnKSldO307IC8qKlxuICogXCJPcGVuc1wiIHRoZSBzb2NrZXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1NvY2tldC5wcm90b3R5cGUub3BlbiA9IFNvY2tldC5wcm90b3R5cGUuY29ubmVjdCA9IGZ1bmN0aW9uKCl7aWYodGhpcy5jb25uZWN0ZWQpcmV0dXJuIHRoaXM7dGhpcy5zdWJFdmVudHMoKTt0aGlzLmlvLm9wZW4oKTsgLy8gZW5zdXJlIG9wZW5cbmlmKCdvcGVuJyA9PSB0aGlzLmlvLnJlYWR5U3RhdGUpdGhpcy5vbm9wZW4oKTt0aGlzLmVtaXQoJ2Nvbm5lY3RpbmcnKTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFNlbmRzIGEgYG1lc3NhZ2VgIGV2ZW50LlxuICpcbiAqIEByZXR1cm4ge1NvY2tldH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1NvY2tldC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKCl7dmFyIGFyZ3M9dG9BcnJheShhcmd1bWVudHMpO2FyZ3MudW5zaGlmdCgnbWVzc2FnZScpO3RoaXMuZW1pdC5hcHBseSh0aGlzLGFyZ3MpO3JldHVybiB0aGlzO307IC8qKlxuICogT3ZlcnJpZGUgYGVtaXRgLlxuICogSWYgdGhlIGV2ZW50IGlzIGluIGBldmVudHNgLCBpdCdzIGVtaXR0ZWQgbm9ybWFsbHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IG5hbWVcbiAqIEByZXR1cm4ge1NvY2tldH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1NvY2tldC5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2KXtpZihldmVudHMuaGFzT3duUHJvcGVydHkoZXYpKXtlbWl0LmFwcGx5KHRoaXMsYXJndW1lbnRzKTtyZXR1cm4gdGhpczt9dmFyIGFyZ3M9dG9BcnJheShhcmd1bWVudHMpO3ZhciBwYXJzZXJUeXBlPXBhcnNlci5FVkVOVDsgLy8gZGVmYXVsdFxuaWYoaGFzQmluKGFyZ3MpKXtwYXJzZXJUeXBlID0gcGFyc2VyLkJJTkFSWV9FVkVOVDt9IC8vIGJpbmFyeVxudmFyIHBhY2tldD17dHlwZTpwYXJzZXJUeXBlLGRhdGE6YXJnc307cGFja2V0Lm9wdGlvbnMgPSB7fTtwYWNrZXQub3B0aW9ucy5jb21wcmVzcyA9ICF0aGlzLmZsYWdzIHx8IGZhbHNlICE9PSB0aGlzLmZsYWdzLmNvbXByZXNzOyAvLyBldmVudCBhY2sgY2FsbGJhY2tcbmlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSl7ZGVidWcoJ2VtaXR0aW5nIHBhY2tldCB3aXRoIGFjayBpZCAlZCcsdGhpcy5pZHMpO3RoaXMuYWNrc1t0aGlzLmlkc10gPSBhcmdzLnBvcCgpO3BhY2tldC5pZCA9IHRoaXMuaWRzKys7fWlmKHRoaXMuY29ubmVjdGVkKXt0aGlzLnBhY2tldChwYWNrZXQpO31lbHNlIHt0aGlzLnNlbmRCdWZmZXIucHVzaChwYWNrZXQpO31kZWxldGUgdGhpcy5mbGFncztyZXR1cm4gdGhpczt9OyAvKipcbiAqIFNlbmRzIGEgcGFja2V0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXRcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQpe3BhY2tldC5uc3AgPSB0aGlzLm5zcDt0aGlzLmlvLnBhY2tldChwYWNrZXQpO307IC8qKlxuICogQ2FsbGVkIHVwb24gZW5naW5lIGBvcGVuYC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25vcGVuID0gZnVuY3Rpb24oKXtkZWJ1ZygndHJhbnNwb3J0IGlzIG9wZW4gLSBjb25uZWN0aW5nJyk7IC8vIHdyaXRlIGNvbm5lY3QgcGFja2V0IGlmIG5lY2Vzc2FyeVxuaWYoJy8nICE9IHRoaXMubnNwKXt0aGlzLnBhY2tldCh7dHlwZTpwYXJzZXIuQ09OTkVDVH0pO319OyAvKipcbiAqIENhbGxlZCB1cG9uIGVuZ2luZSBgY2xvc2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByZWFzb25cbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vbmNsb3NlID0gZnVuY3Rpb24ocmVhc29uKXtkZWJ1ZygnY2xvc2UgKCVzKScscmVhc29uKTt0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO3RoaXMuZGlzY29ubmVjdGVkID0gdHJ1ZTtkZWxldGUgdGhpcy5pZDt0aGlzLmVtaXQoJ2Rpc2Nvbm5lY3QnLHJlYXNvbik7fTsgLyoqXG4gKiBDYWxsZWQgd2l0aCBzb2NrZXQgcGFja2V0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXRcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vbnBhY2tldCA9IGZ1bmN0aW9uKHBhY2tldCl7aWYocGFja2V0Lm5zcCAhPSB0aGlzLm5zcClyZXR1cm47c3dpdGNoKHBhY2tldC50eXBlKXtjYXNlIHBhcnNlci5DT05ORUNUOnRoaXMub25jb25uZWN0KCk7YnJlYWs7Y2FzZSBwYXJzZXIuRVZFTlQ6dGhpcy5vbmV2ZW50KHBhY2tldCk7YnJlYWs7Y2FzZSBwYXJzZXIuQklOQVJZX0VWRU5UOnRoaXMub25ldmVudChwYWNrZXQpO2JyZWFrO2Nhc2UgcGFyc2VyLkFDSzp0aGlzLm9uYWNrKHBhY2tldCk7YnJlYWs7Y2FzZSBwYXJzZXIuQklOQVJZX0FDSzp0aGlzLm9uYWNrKHBhY2tldCk7YnJlYWs7Y2FzZSBwYXJzZXIuRElTQ09OTkVDVDp0aGlzLm9uZGlzY29ubmVjdCgpO2JyZWFrO2Nhc2UgcGFyc2VyLkVSUk9SOnRoaXMuZW1pdCgnZXJyb3InLHBhY2tldC5kYXRhKTticmVhazt9fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBhIHNlcnZlciBldmVudC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25ldmVudCA9IGZ1bmN0aW9uKHBhY2tldCl7dmFyIGFyZ3M9cGFja2V0LmRhdGEgfHwgW107ZGVidWcoJ2VtaXR0aW5nIGV2ZW50ICVqJyxhcmdzKTtpZihudWxsICE9IHBhY2tldC5pZCl7ZGVidWcoJ2F0dGFjaGluZyBhY2sgY2FsbGJhY2sgdG8gZXZlbnQnKTthcmdzLnB1c2godGhpcy5hY2socGFja2V0LmlkKSk7fWlmKHRoaXMuY29ubmVjdGVkKXtlbWl0LmFwcGx5KHRoaXMsYXJncyk7fWVsc2Uge3RoaXMucmVjZWl2ZUJ1ZmZlci5wdXNoKGFyZ3MpO319OyAvKipcbiAqIFByb2R1Y2VzIGFuIGFjayBjYWxsYmFjayB0byBlbWl0IHdpdGggYW4gZXZlbnQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLmFjayA9IGZ1bmN0aW9uKGlkKXt2YXIgc2VsZj10aGlzO3ZhciBzZW50PWZhbHNlO3JldHVybiBmdW5jdGlvbigpeyAvLyBwcmV2ZW50IGRvdWJsZSBjYWxsYmFja3NcbmlmKHNlbnQpcmV0dXJuO3NlbnQgPSB0cnVlO3ZhciBhcmdzPXRvQXJyYXkoYXJndW1lbnRzKTtkZWJ1Zygnc2VuZGluZyBhY2sgJWonLGFyZ3MpO3ZhciB0eXBlPWhhc0JpbihhcmdzKT9wYXJzZXIuQklOQVJZX0FDSzpwYXJzZXIuQUNLO3NlbGYucGFja2V0KHt0eXBlOnR5cGUsaWQ6aWQsZGF0YTphcmdzfSk7fTt9OyAvKipcbiAqIENhbGxlZCB1cG9uIGEgc2VydmVyIGFja25vd2xlZ2VtZW50LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXRcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vbmFjayA9IGZ1bmN0aW9uKHBhY2tldCl7dmFyIGFjaz10aGlzLmFja3NbcGFja2V0LmlkXTtpZignZnVuY3Rpb24nID09IHR5cGVvZiBhY2spe2RlYnVnKCdjYWxsaW5nIGFjayAlcyB3aXRoICVqJyxwYWNrZXQuaWQscGFja2V0LmRhdGEpO2Fjay5hcHBseSh0aGlzLHBhY2tldC5kYXRhKTtkZWxldGUgdGhpcy5hY2tzW3BhY2tldC5pZF07fWVsc2Uge2RlYnVnKCdiYWQgYWNrICVzJyxwYWNrZXQuaWQpO319OyAvKipcbiAqIENhbGxlZCB1cG9uIHNlcnZlciBjb25uZWN0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vbmNvbm5lY3QgPSBmdW5jdGlvbigpe3RoaXMuY29ubmVjdGVkID0gdHJ1ZTt0aGlzLmRpc2Nvbm5lY3RlZCA9IGZhbHNlO3RoaXMuZW1pdCgnY29ubmVjdCcpO3RoaXMuZW1pdEJ1ZmZlcmVkKCk7fTsgLyoqXG4gKiBFbWl0IGJ1ZmZlcmVkIGV2ZW50cyAocmVjZWl2ZWQgYW5kIGVtaXR0ZWQpLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5lbWl0QnVmZmVyZWQgPSBmdW5jdGlvbigpe3ZhciBpO2ZvcihpID0gMDtpIDwgdGhpcy5yZWNlaXZlQnVmZmVyLmxlbmd0aDtpKyspIHtlbWl0LmFwcGx5KHRoaXMsdGhpcy5yZWNlaXZlQnVmZmVyW2ldKTt9dGhpcy5yZWNlaXZlQnVmZmVyID0gW107Zm9yKGkgPSAwO2kgPCB0aGlzLnNlbmRCdWZmZXIubGVuZ3RoO2krKykge3RoaXMucGFja2V0KHRoaXMuc2VuZEJ1ZmZlcltpXSk7fXRoaXMuc2VuZEJ1ZmZlciA9IFtdO307IC8qKlxuICogQ2FsbGVkIHVwb24gc2VydmVyIGRpc2Nvbm5lY3QuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9uZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7ZGVidWcoJ3NlcnZlciBkaXNjb25uZWN0ICglcyknLHRoaXMubnNwKTt0aGlzLmRlc3Ryb3koKTt0aGlzLm9uY2xvc2UoJ2lvIHNlcnZlciBkaXNjb25uZWN0Jyk7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBmb3JjZWQgY2xpZW50L3NlcnZlciBzaWRlIGRpc2Nvbm5lY3Rpb25zLFxuICogdGhpcyBtZXRob2QgZW5zdXJlcyB0aGUgbWFuYWdlciBzdG9wcyB0cmFja2luZyB1cyBhbmRcbiAqIHRoYXQgcmVjb25uZWN0aW9ucyBkb24ndCBnZXQgdHJpZ2dlcmVkIGZvciB0aGlzLlxuICpcbiAqIEBhcGkgcHJpdmF0ZS5cbiAqL1NvY2tldC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCl7aWYodGhpcy5zdWJzKXsgLy8gY2xlYW4gc3Vic2NyaXB0aW9ucyB0byBhdm9pZCByZWNvbm5lY3Rpb25zXG5mb3IodmFyIGk9MDtpIDwgdGhpcy5zdWJzLmxlbmd0aDtpKyspIHt0aGlzLnN1YnNbaV0uZGVzdHJveSgpO310aGlzLnN1YnMgPSBudWxsO310aGlzLmlvLmRlc3Ryb3kodGhpcyk7fTsgLyoqXG4gKiBEaXNjb25uZWN0cyB0aGUgc29ja2V0IG1hbnVhbGx5LlxuICpcbiAqIEByZXR1cm4ge1NvY2tldH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1NvY2tldC5wcm90b3R5cGUuY2xvc2UgPSBTb2NrZXQucHJvdG90eXBlLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe2lmKHRoaXMuY29ubmVjdGVkKXtkZWJ1ZygncGVyZm9ybWluZyBkaXNjb25uZWN0ICglcyknLHRoaXMubnNwKTt0aGlzLnBhY2tldCh7dHlwZTpwYXJzZXIuRElTQ09OTkVDVH0pO30gLy8gcmVtb3ZlIHNvY2tldCBmcm9tIHBvb2xcbnRoaXMuZGVzdHJveSgpO2lmKHRoaXMuY29ubmVjdGVkKXsgLy8gZmlyZSBldmVudHNcbnRoaXMub25jbG9zZSgnaW8gY2xpZW50IGRpc2Nvbm5lY3QnKTt9cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBTZXRzIHRoZSBjb21wcmVzcyBmbGFnLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaWYgYHRydWVgLCBjb21wcmVzc2VzIHRoZSBzZW5kaW5nIGRhdGFcbiAqIEByZXR1cm4ge1NvY2tldH0gc2VsZlxuICogQGFwaSBwdWJsaWNcbiAqL1NvY2tldC5wcm90b3R5cGUuY29tcHJlc3MgPSBmdW5jdGlvbihjb21wcmVzcyl7dGhpcy5mbGFncyA9IHRoaXMuZmxhZ3MgfHwge307dGhpcy5mbGFncy5jb21wcmVzcyA9IGNvbXByZXNzO3JldHVybiB0aGlzO307fSx7XCIuL29uXCI6MzMsXCJjb21wb25lbnQtYmluZFwiOjM3LFwiY29tcG9uZW50LWVtaXR0ZXJcIjozOCxcImRlYnVnXCI6MzksXCJoYXMtYmluYXJ5XCI6NDEsXCJzb2NrZXQuaW8tcGFyc2VyXCI6NDcsXCJ0by1hcnJheVwiOjUxfV0sMzU6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi92YXIgcGFyc2V1cmk9X2RlcmVxXygncGFyc2V1cmknKTt2YXIgZGVidWc9X2RlcmVxXygnZGVidWcnKSgnc29ja2V0LmlvLWNsaWVudDp1cmwnKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gdXJsOyAvKipcbiAqIFVSTCBwYXJzZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtPYmplY3R9IEFuIG9iamVjdCBtZWFudCB0byBtaW1pYyB3aW5kb3cubG9jYXRpb24uXG4gKiAgICAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gd2luZG93LmxvY2F0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIHVybCh1cmksbG9jKXt2YXIgb2JqPXVyaTsgLy8gZGVmYXVsdCB0byB3aW5kb3cubG9jYXRpb25cbnZhciBsb2M9bG9jIHx8IGdsb2JhbC5sb2NhdGlvbjtpZihudWxsID09IHVyaSl1cmkgPSBsb2MucHJvdG9jb2wgKyAnLy8nICsgbG9jLmhvc3Q7IC8vIHJlbGF0aXZlIHBhdGggc3VwcG9ydFxuaWYoJ3N0cmluZycgPT0gdHlwZW9mIHVyaSl7aWYoJy8nID09IHVyaS5jaGFyQXQoMCkpe2lmKCcvJyA9PSB1cmkuY2hhckF0KDEpKXt1cmkgPSBsb2MucHJvdG9jb2wgKyB1cmk7fWVsc2Uge3VyaSA9IGxvYy5ob3N0ICsgdXJpO319aWYoIS9eKGh0dHBzP3x3c3M/KTpcXC9cXC8vLnRlc3QodXJpKSl7ZGVidWcoJ3Byb3RvY29sLWxlc3MgdXJsICVzJyx1cmkpO2lmKCd1bmRlZmluZWQnICE9IHR5cGVvZiBsb2Mpe3VyaSA9IGxvYy5wcm90b2NvbCArICcvLycgKyB1cmk7fWVsc2Uge3VyaSA9ICdodHRwczovLycgKyB1cmk7fX0gLy8gcGFyc2VcbmRlYnVnKCdwYXJzZSAlcycsdXJpKTtvYmogPSBwYXJzZXVyaSh1cmkpO30gLy8gbWFrZSBzdXJlIHdlIHRyZWF0IGBsb2NhbGhvc3Q6ODBgIGFuZCBgbG9jYWxob3N0YCBlcXVhbGx5XG5pZighb2JqLnBvcnQpe2lmKC9eKGh0dHB8d3MpJC8udGVzdChvYmoucHJvdG9jb2wpKXtvYmoucG9ydCA9ICc4MCc7fWVsc2UgaWYoL14oaHR0cHx3cylzJC8udGVzdChvYmoucHJvdG9jb2wpKXtvYmoucG9ydCA9ICc0NDMnO319b2JqLnBhdGggPSBvYmoucGF0aCB8fCAnLyc7dmFyIGlwdjY9b2JqLmhvc3QuaW5kZXhPZignOicpICE9PSAtMTt2YXIgaG9zdD1pcHY2PydbJyArIG9iai5ob3N0ICsgJ10nOm9iai5ob3N0OyAvLyBkZWZpbmUgdW5pcXVlIGlkXG5vYmouaWQgPSBvYmoucHJvdG9jb2wgKyAnOi8vJyArIGhvc3QgKyAnOicgKyBvYmoucG9ydDsgLy8gZGVmaW5lIGhyZWZcbm9iai5ocmVmID0gb2JqLnByb3RvY29sICsgJzovLycgKyBob3N0ICsgKGxvYyAmJiBsb2MucG9ydCA9PSBvYmoucG9ydD8nJzonOicgKyBvYmoucG9ydCk7cmV0dXJuIG9iajt9fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se1wiZGVidWdcIjozOSxcInBhcnNldXJpXCI6NDV9XSwzNjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogRXhwb3NlIGBCYWNrb2ZmYC5cbiAqL21vZHVsZS5leHBvcnRzID0gQmFja29mZjsgLyoqXG4gKiBJbml0aWFsaXplIGJhY2tvZmYgdGltZXIgd2l0aCBgb3B0c2AuXG4gKlxuICogLSBgbWluYCBpbml0aWFsIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzIFsxMDBdXG4gKiAtIGBtYXhgIG1heCB0aW1lb3V0IFsxMDAwMF1cbiAqIC0gYGppdHRlcmAgWzBdXG4gKiAtIGBmYWN0b3JgIFsyXVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gQmFja29mZihvcHRzKXtvcHRzID0gb3B0cyB8fCB7fTt0aGlzLm1zID0gb3B0cy5taW4gfHwgMTAwO3RoaXMubWF4ID0gb3B0cy5tYXggfHwgMTAwMDA7dGhpcy5mYWN0b3IgPSBvcHRzLmZhY3RvciB8fCAyO3RoaXMuaml0dGVyID0gb3B0cy5qaXR0ZXIgPiAwICYmIG9wdHMuaml0dGVyIDw9IDE/b3B0cy5qaXR0ZXI6MDt0aGlzLmF0dGVtcHRzID0gMDt9IC8qKlxuICogUmV0dXJuIHRoZSBiYWNrb2ZmIGR1cmF0aW9uLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9CYWNrb2ZmLnByb3RvdHlwZS5kdXJhdGlvbiA9IGZ1bmN0aW9uKCl7dmFyIG1zPXRoaXMubXMgKiBNYXRoLnBvdyh0aGlzLmZhY3Rvcix0aGlzLmF0dGVtcHRzKyspO2lmKHRoaXMuaml0dGVyKXt2YXIgcmFuZD1NYXRoLnJhbmRvbSgpO3ZhciBkZXZpYXRpb249TWF0aC5mbG9vcihyYW5kICogdGhpcy5qaXR0ZXIgKiBtcyk7bXMgPSAoTWF0aC5mbG9vcihyYW5kICogMTApICYgMSkgPT0gMD9tcyAtIGRldmlhdGlvbjptcyArIGRldmlhdGlvbjt9cmV0dXJuIE1hdGgubWluKG1zLHRoaXMubWF4KSB8IDA7fTsgLyoqXG4gKiBSZXNldCB0aGUgbnVtYmVyIG9mIGF0dGVtcHRzLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9CYWNrb2ZmLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCl7dGhpcy5hdHRlbXB0cyA9IDA7fTsgLyoqXG4gKiBTZXQgdGhlIG1pbmltdW0gZHVyYXRpb25cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovQmFja29mZi5wcm90b3R5cGUuc2V0TWluID0gZnVuY3Rpb24obWluKXt0aGlzLm1zID0gbWluO307IC8qKlxuICogU2V0IHRoZSBtYXhpbXVtIGR1cmF0aW9uXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL0JhY2tvZmYucHJvdG90eXBlLnNldE1heCA9IGZ1bmN0aW9uKG1heCl7dGhpcy5tYXggPSBtYXg7fTsgLyoqXG4gKiBTZXQgdGhlIGppdHRlclxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9CYWNrb2ZmLnByb3RvdHlwZS5zZXRKaXR0ZXIgPSBmdW5jdGlvbihqaXR0ZXIpe3RoaXMuaml0dGVyID0gaml0dGVyO307fSx7fV0sMzc6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIFNsaWNlIHJlZmVyZW5jZS5cbiAqL3ZhciBzbGljZT1bXS5zbGljZTsgLyoqXG4gKiBCaW5kIGBvYmpgIHRvIGBmbmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGZuIG9yIHN0cmluZ1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosZm4pe2lmKCdzdHJpbmcnID09IHR5cGVvZiBmbilmbiA9IG9ialtmbl07aWYoJ2Z1bmN0aW9uJyAhPSB0eXBlb2YgZm4pdGhyb3cgbmV3IEVycm9yKCdiaW5kKCkgcmVxdWlyZXMgYSBmdW5jdGlvbicpO3ZhciBhcmdzPXNsaWNlLmNhbGwoYXJndW1lbnRzLDIpO3JldHVybiBmdW5jdGlvbigpe3JldHVybiBmbi5hcHBseShvYmosYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7fTt9O30se31dLDM4OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovbW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyOyAvKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBFbWl0dGVyKG9iail7aWYob2JqKXJldHVybiBtaXhpbihvYmopO307IC8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIG1peGluKG9iail7Zm9yKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07fXJldHVybiBvYmo7fSAvKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5vbiA9IEVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCxmbil7dGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9Oyh0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXSkucHVzaChmbik7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsZm4pe2Z1bmN0aW9uIG9uKCl7dGhpcy5vZmYoZXZlbnQsb24pO2ZuLmFwcGx5KHRoaXMsYXJndW1lbnRzKTt9b24uZm4gPSBmbjt0aGlzLm9uKGV2ZW50LG9uKTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL0VtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LGZuKXt0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307IC8vIGFsbFxuaWYoMCA9PSBhcmd1bWVudHMubGVuZ3RoKXt0aGlzLl9jYWxsYmFja3MgPSB7fTtyZXR1cm4gdGhpczt9IC8vIHNwZWNpZmljIGV2ZW50XG52YXIgY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07aWYoIWNhbGxiYWNrcylyZXR1cm4gdGhpczsgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuaWYoMSA9PSBhcmd1bWVudHMubGVuZ3RoKXtkZWxldGUgdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtyZXR1cm4gdGhpczt9IC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG52YXIgY2I7Zm9yKHZhciBpPTA7aSA8IGNhbGxiYWNrcy5sZW5ndGg7aSsrKSB7Y2IgPSBjYWxsYmFja3NbaV07aWYoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbil7Y2FsbGJhY2tzLnNwbGljZShpLDEpO2JyZWFrO319cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL0VtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7dGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O3ZhciBhcmdzPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpLGNhbGxiYWNrcz10aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO2lmKGNhbGxiYWNrcyl7Y2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO2Zvcih2YXIgaT0wLGxlbj1jYWxsYmFja3MubGVuZ3RoO2kgPCBsZW47KytpKSB7Y2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsYXJncyk7fX1yZXR1cm4gdGhpczt9OyAvKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7dGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O3JldHVybiB0aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdIHx8IFtdO307IC8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7cmV0dXJuICEhdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDt9O30se31dLDM5OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXthcmd1bWVudHNbNF1bMTddWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKTt9LHtcIi4vZGVidWdcIjo0MCxcImR1cFwiOjE3fV0sNDA6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe2FyZ3VtZW50c1s0XVsxOF1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpO30se1wiZHVwXCI6MTgsXCJtc1wiOjQ0fV0sNDE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKlxuICogTW9kdWxlIHJlcXVpcmVtZW50cy5cbiAqL3ZhciBpc0FycmF5PV9kZXJlcV8oJ2lzYXJyYXknKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gaGFzQmluYXJ5OyAvKipcbiAqIENoZWNrcyBmb3IgYmluYXJ5IGRhdGEuXG4gKlxuICogUmlnaHQgbm93IG9ubHkgQnVmZmVyIGFuZCBBcnJheUJ1ZmZlciBhcmUgc3VwcG9ydGVkLi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYW55dGhpbmdcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBoYXNCaW5hcnkoZGF0YSl7ZnVuY3Rpb24gX2hhc0JpbmFyeShvYmope2lmKCFvYmopcmV0dXJuIGZhbHNlO2lmKGdsb2JhbC5CdWZmZXIgJiYgZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlciAmJiBnbG9iYWwuQnVmZmVyLmlzQnVmZmVyKG9iaikgfHwgZ2xvYmFsLkFycmF5QnVmZmVyICYmIG9iaiBpbnN0YW5jZW9mIEFycmF5QnVmZmVyIHx8IGdsb2JhbC5CbG9iICYmIG9iaiBpbnN0YW5jZW9mIEJsb2IgfHwgZ2xvYmFsLkZpbGUgJiYgb2JqIGluc3RhbmNlb2YgRmlsZSl7cmV0dXJuIHRydWU7fWlmKGlzQXJyYXkob2JqKSl7Zm9yKHZhciBpPTA7aSA8IG9iai5sZW5ndGg7aSsrKSB7aWYoX2hhc0JpbmFyeShvYmpbaV0pKXtyZXR1cm4gdHJ1ZTt9fX1lbHNlIGlmKG9iaiAmJiAnb2JqZWN0JyA9PSB0eXBlb2Ygb2JqKXsgLy8gc2VlOiBodHRwczovL2dpdGh1Yi5jb20vQXV0b21hdHRpYy9oYXMtYmluYXJ5L3B1bGwvNFxuaWYob2JqLnRvSlNPTiAmJiAnZnVuY3Rpb24nID09IHR5cGVvZiBvYmoudG9KU09OKXtvYmogPSBvYmoudG9KU09OKCk7fWZvcih2YXIga2V5IGluIG9iaikge2lmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosa2V5KSAmJiBfaGFzQmluYXJ5KG9ialtrZXldKSl7cmV0dXJuIHRydWU7fX19cmV0dXJuIGZhbHNlO31yZXR1cm4gX2hhc0JpbmFyeShkYXRhKTt9fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se1wiaXNhcnJheVwiOjQzfV0sNDI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe2FyZ3VtZW50c1s0XVsyM11bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpO30se1wiZHVwXCI6MjN9XSw0MzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7YXJndW1lbnRzWzRdWzI0XVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cyk7fSx7XCJkdXBcIjoyNH1dLDQ0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXthcmd1bWVudHNbNF1bMjVdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKTt9LHtcImR1cFwiOjI1fV0sNDU6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe2FyZ3VtZW50c1s0XVsyOF1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpO30se1wiZHVwXCI6Mjh9XSw0NjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCl7IC8qZ2xvYmFsIEJsb2IsRmlsZSovIC8qKlxuICogTW9kdWxlIHJlcXVpcmVtZW50c1xuICovdmFyIGlzQXJyYXk9X2RlcmVxXygnaXNhcnJheScpO3ZhciBpc0J1Zj1fZGVyZXFfKCcuL2lzLWJ1ZmZlcicpOyAvKipcbiAqIFJlcGxhY2VzIGV2ZXJ5IEJ1ZmZlciB8IEFycmF5QnVmZmVyIGluIHBhY2tldCB3aXRoIGEgbnVtYmVyZWQgcGxhY2Vob2xkZXIuXG4gKiBBbnl0aGluZyB3aXRoIGJsb2JzIG9yIGZpbGVzIHNob3VsZCBiZSBmZWQgdGhyb3VnaCByZW1vdmVCbG9icyBiZWZvcmUgY29taW5nXG4gKiBoZXJlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXQgLSBzb2NrZXQuaW8gZXZlbnQgcGFja2V0XG4gKiBAcmV0dXJuIHtPYmplY3R9IHdpdGggZGVjb25zdHJ1Y3RlZCBwYWNrZXQgYW5kIGxpc3Qgb2YgYnVmZmVyc1xuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMuZGVjb25zdHJ1Y3RQYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQpe3ZhciBidWZmZXJzPVtdO3ZhciBwYWNrZXREYXRhPXBhY2tldC5kYXRhO2Z1bmN0aW9uIF9kZWNvbnN0cnVjdFBhY2tldChkYXRhKXtpZighZGF0YSlyZXR1cm4gZGF0YTtpZihpc0J1ZihkYXRhKSl7dmFyIHBsYWNlaG9sZGVyPXtfcGxhY2Vob2xkZXI6dHJ1ZSxudW06YnVmZmVycy5sZW5ndGh9O2J1ZmZlcnMucHVzaChkYXRhKTtyZXR1cm4gcGxhY2Vob2xkZXI7fWVsc2UgaWYoaXNBcnJheShkYXRhKSl7dmFyIG5ld0RhdGE9bmV3IEFycmF5KGRhdGEubGVuZ3RoKTtmb3IodmFyIGk9MDtpIDwgZGF0YS5sZW5ndGg7aSsrKSB7bmV3RGF0YVtpXSA9IF9kZWNvbnN0cnVjdFBhY2tldChkYXRhW2ldKTt9cmV0dXJuIG5ld0RhdGE7fWVsc2UgaWYoJ29iamVjdCcgPT0gdHlwZW9mIGRhdGEgJiYgIShkYXRhIGluc3RhbmNlb2YgRGF0ZSkpe3ZhciBuZXdEYXRhPXt9O2Zvcih2YXIga2V5IGluIGRhdGEpIHtuZXdEYXRhW2tleV0gPSBfZGVjb25zdHJ1Y3RQYWNrZXQoZGF0YVtrZXldKTt9cmV0dXJuIG5ld0RhdGE7fXJldHVybiBkYXRhO312YXIgcGFjaz1wYWNrZXQ7cGFjay5kYXRhID0gX2RlY29uc3RydWN0UGFja2V0KHBhY2tldERhdGEpO3BhY2suYXR0YWNobWVudHMgPSBidWZmZXJzLmxlbmd0aDsgLy8gbnVtYmVyIG9mIGJpbmFyeSAnYXR0YWNobWVudHMnXG5yZXR1cm4ge3BhY2tldDpwYWNrLGJ1ZmZlcnM6YnVmZmVyc307fTsgLyoqXG4gKiBSZWNvbnN0cnVjdHMgYSBiaW5hcnkgcGFja2V0IGZyb20gaXRzIHBsYWNlaG9sZGVyIHBhY2tldCBhbmQgYnVmZmVyc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXQgLSBldmVudCBwYWNrZXQgd2l0aCBwbGFjZWhvbGRlcnNcbiAqIEBwYXJhbSB7QXJyYXl9IGJ1ZmZlcnMgLSBiaW5hcnkgYnVmZmVycyB0byBwdXQgaW4gcGxhY2Vob2xkZXIgcG9zaXRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R9IHJlY29uc3RydWN0ZWQgcGFja2V0XG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5yZWNvbnN0cnVjdFBhY2tldCA9IGZ1bmN0aW9uKHBhY2tldCxidWZmZXJzKXt2YXIgY3VyUGxhY2VIb2xkZXI9MDtmdW5jdGlvbiBfcmVjb25zdHJ1Y3RQYWNrZXQoZGF0YSl7aWYoZGF0YSAmJiBkYXRhLl9wbGFjZWhvbGRlcil7dmFyIGJ1Zj1idWZmZXJzW2RhdGEubnVtXTsgLy8gYXBwcm9wcmlhdGUgYnVmZmVyIChzaG91bGQgYmUgbmF0dXJhbCBvcmRlciBhbnl3YXkpXG5yZXR1cm4gYnVmO31lbHNlIGlmKGlzQXJyYXkoZGF0YSkpe2Zvcih2YXIgaT0wO2kgPCBkYXRhLmxlbmd0aDtpKyspIHtkYXRhW2ldID0gX3JlY29uc3RydWN0UGFja2V0KGRhdGFbaV0pO31yZXR1cm4gZGF0YTt9ZWxzZSBpZihkYXRhICYmICdvYmplY3QnID09IHR5cGVvZiBkYXRhKXtmb3IodmFyIGtleSBpbiBkYXRhKSB7ZGF0YVtrZXldID0gX3JlY29uc3RydWN0UGFja2V0KGRhdGFba2V5XSk7fXJldHVybiBkYXRhO31yZXR1cm4gZGF0YTt9cGFja2V0LmRhdGEgPSBfcmVjb25zdHJ1Y3RQYWNrZXQocGFja2V0LmRhdGEpO3BhY2tldC5hdHRhY2htZW50cyA9IHVuZGVmaW5lZDsgLy8gbm8gbG9uZ2VyIHVzZWZ1bFxucmV0dXJuIHBhY2tldDt9OyAvKipcbiAqIEFzeW5jaHJvbm91c2x5IHJlbW92ZXMgQmxvYnMgb3IgRmlsZXMgZnJvbSBkYXRhIHZpYVxuICogRmlsZVJlYWRlcidzIHJlYWRBc0FycmF5QnVmZmVyIG1ldGhvZC4gVXNlZCBiZWZvcmUgZW5jb2RpbmdcbiAqIGRhdGEgYXMgbXNncGFjay4gQ2FsbHMgY2FsbGJhY2sgd2l0aCB0aGUgYmxvYmxlc3MgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBhcGkgcHJpdmF0ZVxuICovZXhwb3J0cy5yZW1vdmVCbG9icyA9IGZ1bmN0aW9uKGRhdGEsY2FsbGJhY2spe2Z1bmN0aW9uIF9yZW1vdmVCbG9icyhvYmosY3VyS2V5LGNvbnRhaW5pbmdPYmplY3Qpe2lmKCFvYmopcmV0dXJuIG9iajsgLy8gY29udmVydCBhbnkgYmxvYlxuaWYoZ2xvYmFsLkJsb2IgJiYgb2JqIGluc3RhbmNlb2YgQmxvYiB8fCBnbG9iYWwuRmlsZSAmJiBvYmogaW5zdGFuY2VvZiBGaWxlKXtwZW5kaW5nQmxvYnMrKzsgLy8gYXN5bmMgZmlsZXJlYWRlclxudmFyIGZpbGVSZWFkZXI9bmV3IEZpbGVSZWFkZXIoKTtmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7IC8vIHRoaXMucmVzdWx0ID09IGFycmF5YnVmZmVyXG5pZihjb250YWluaW5nT2JqZWN0KXtjb250YWluaW5nT2JqZWN0W2N1cktleV0gPSB0aGlzLnJlc3VsdDt9ZWxzZSB7YmxvYmxlc3NEYXRhID0gdGhpcy5yZXN1bHQ7fSAvLyBpZiBub3RoaW5nIHBlbmRpbmcgaXRzIGNhbGxiYWNrIHRpbWVcbmlmKCEgLS1wZW5kaW5nQmxvYnMpe2NhbGxiYWNrKGJsb2JsZXNzRGF0YSk7fX07ZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihvYmopOyAvLyBibG9iIC0+IGFycmF5YnVmZmVyXG59ZWxzZSBpZihpc0FycmF5KG9iaikpeyAvLyBoYW5kbGUgYXJyYXlcbmZvcih2YXIgaT0wO2kgPCBvYmoubGVuZ3RoO2krKykge19yZW1vdmVCbG9icyhvYmpbaV0saSxvYmopO319ZWxzZSBpZihvYmogJiYgJ29iamVjdCcgPT0gdHlwZW9mIG9iaiAmJiAhaXNCdWYob2JqKSl7IC8vIGFuZCBvYmplY3RcbmZvcih2YXIga2V5IGluIG9iaikge19yZW1vdmVCbG9icyhvYmpba2V5XSxrZXksb2JqKTt9fX12YXIgcGVuZGluZ0Jsb2JzPTA7dmFyIGJsb2JsZXNzRGF0YT1kYXRhO19yZW1vdmVCbG9icyhibG9ibGVzc0RhdGEpO2lmKCFwZW5kaW5nQmxvYnMpe2NhbGxiYWNrKGJsb2JsZXNzRGF0YSk7fX07fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se1wiLi9pcy1idWZmZXJcIjo0OCxcImlzYXJyYXlcIjo0M31dLDQ3OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIGRlYnVnPV9kZXJlcV8oJ2RlYnVnJykoJ3NvY2tldC5pby1wYXJzZXInKTt2YXIganNvbj1fZGVyZXFfKCdqc29uMycpO3ZhciBpc0FycmF5PV9kZXJlcV8oJ2lzYXJyYXknKTt2YXIgRW1pdHRlcj1fZGVyZXFfKCdjb21wb25lbnQtZW1pdHRlcicpO3ZhciBiaW5hcnk9X2RlcmVxXygnLi9iaW5hcnknKTt2YXIgaXNCdWY9X2RlcmVxXygnLi9pcy1idWZmZXInKTsgLyoqXG4gKiBQcm90b2NvbCB2ZXJzaW9uLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLnByb3RvY29sID0gNDsgLyoqXG4gKiBQYWNrZXQgdHlwZXMuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMudHlwZXMgPSBbJ0NPTk5FQ1QnLCdESVNDT05ORUNUJywnRVZFTlQnLCdCSU5BUllfRVZFTlQnLCdBQ0snLCdCSU5BUllfQUNLJywnRVJST1InXTsgLyoqXG4gKiBQYWNrZXQgdHlwZSBgY29ubmVjdGAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMuQ09OTkVDVCA9IDA7IC8qKlxuICogUGFja2V0IHR5cGUgYGRpc2Nvbm5lY3RgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLkRJU0NPTk5FQ1QgPSAxOyAvKipcbiAqIFBhY2tldCB0eXBlIGBldmVudGAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMuRVZFTlQgPSAyOyAvKipcbiAqIFBhY2tldCB0eXBlIGBhY2tgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLkFDSyA9IDM7IC8qKlxuICogUGFja2V0IHR5cGUgYGVycm9yYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5FUlJPUiA9IDQ7IC8qKlxuICogUGFja2V0IHR5cGUgJ2JpbmFyeSBldmVudCdcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5CSU5BUllfRVZFTlQgPSA1OyAvKipcbiAqIFBhY2tldCB0eXBlIGBiaW5hcnkgYWNrYC4gRm9yIGFja3Mgd2l0aCBiaW5hcnkgYXJndW1lbnRzLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLkJJTkFSWV9BQ0sgPSA2OyAvKipcbiAqIEVuY29kZXIgY29uc3RydWN0b3IuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMuRW5jb2RlciA9IEVuY29kZXI7IC8qKlxuICogRGVjb2RlciBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5EZWNvZGVyID0gRGVjb2RlcjsgLyoqXG4gKiBBIHNvY2tldC5pbyBFbmNvZGVyIGluc3RhbmNlXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIEVuY29kZXIoKXt9IC8qKlxuICogRW5jb2RlIGEgcGFja2V0IGFzIGEgc2luZ2xlIHN0cmluZyBpZiBub24tYmluYXJ5LCBvciBhcyBhXG4gKiBidWZmZXIgc2VxdWVuY2UsIGRlcGVuZGluZyBvbiBwYWNrZXQgdHlwZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIC0gcGFja2V0IG9iamVjdFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBmdW5jdGlvbiB0byBoYW5kbGUgZW5jb2RpbmdzIChsaWtlbHkgZW5naW5lLndyaXRlKVxuICogQHJldHVybiBDYWxscyBjYWxsYmFjayB3aXRoIEFycmF5IG9mIGVuY29kaW5nc1xuICogQGFwaSBwdWJsaWNcbiAqL0VuY29kZXIucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKG9iaixjYWxsYmFjayl7ZGVidWcoJ2VuY29kaW5nIHBhY2tldCAlaicsb2JqKTtpZihleHBvcnRzLkJJTkFSWV9FVkVOVCA9PSBvYmoudHlwZSB8fCBleHBvcnRzLkJJTkFSWV9BQ0sgPT0gb2JqLnR5cGUpe2VuY29kZUFzQmluYXJ5KG9iaixjYWxsYmFjayk7fWVsc2Uge3ZhciBlbmNvZGluZz1lbmNvZGVBc1N0cmluZyhvYmopO2NhbGxiYWNrKFtlbmNvZGluZ10pO319OyAvKipcbiAqIEVuY29kZSBwYWNrZXQgYXMgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXRcbiAqIEByZXR1cm4ge1N0cmluZ30gZW5jb2RlZFxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBlbmNvZGVBc1N0cmluZyhvYmope3ZhciBzdHI9Jyc7dmFyIG5zcD1mYWxzZTsgLy8gZmlyc3QgaXMgdHlwZVxuc3RyICs9IG9iai50eXBlOyAvLyBhdHRhY2htZW50cyBpZiB3ZSBoYXZlIHRoZW1cbmlmKGV4cG9ydHMuQklOQVJZX0VWRU5UID09IG9iai50eXBlIHx8IGV4cG9ydHMuQklOQVJZX0FDSyA9PSBvYmoudHlwZSl7c3RyICs9IG9iai5hdHRhY2htZW50cztzdHIgKz0gJy0nO30gLy8gaWYgd2UgaGF2ZSBhIG5hbWVzcGFjZSBvdGhlciB0aGFuIGAvYFxuLy8gd2UgYXBwZW5kIGl0IGZvbGxvd2VkIGJ5IGEgY29tbWEgYCxgXG5pZihvYmoubnNwICYmICcvJyAhPSBvYmoubnNwKXtuc3AgPSB0cnVlO3N0ciArPSBvYmoubnNwO30gLy8gaW1tZWRpYXRlbHkgZm9sbG93ZWQgYnkgdGhlIGlkXG5pZihudWxsICE9IG9iai5pZCl7aWYobnNwKXtzdHIgKz0gJywnO25zcCA9IGZhbHNlO31zdHIgKz0gb2JqLmlkO30gLy8ganNvbiBkYXRhXG5pZihudWxsICE9IG9iai5kYXRhKXtpZihuc3Apc3RyICs9ICcsJztzdHIgKz0ganNvbi5zdHJpbmdpZnkob2JqLmRhdGEpO31kZWJ1ZygnZW5jb2RlZCAlaiBhcyAlcycsb2JqLHN0cik7cmV0dXJuIHN0cjt9IC8qKlxuICogRW5jb2RlIHBhY2tldCBhcyAnYnVmZmVyIHNlcXVlbmNlJyBieSByZW1vdmluZyBibG9icywgYW5kXG4gKiBkZWNvbnN0cnVjdGluZyBwYWNrZXQgaW50byBvYmplY3Qgd2l0aCBwbGFjZWhvbGRlcnMgYW5kXG4gKiBhIGxpc3Qgb2YgYnVmZmVycy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAcmV0dXJuIHtCdWZmZXJ9IGVuY29kZWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gZW5jb2RlQXNCaW5hcnkob2JqLGNhbGxiYWNrKXtmdW5jdGlvbiB3cml0ZUVuY29kaW5nKGJsb2JsZXNzRGF0YSl7dmFyIGRlY29uc3RydWN0aW9uPWJpbmFyeS5kZWNvbnN0cnVjdFBhY2tldChibG9ibGVzc0RhdGEpO3ZhciBwYWNrPWVuY29kZUFzU3RyaW5nKGRlY29uc3RydWN0aW9uLnBhY2tldCk7dmFyIGJ1ZmZlcnM9ZGVjb25zdHJ1Y3Rpb24uYnVmZmVycztidWZmZXJzLnVuc2hpZnQocGFjayk7IC8vIGFkZCBwYWNrZXQgaW5mbyB0byBiZWdpbm5pbmcgb2YgZGF0YSBsaXN0XG5jYWxsYmFjayhidWZmZXJzKTsgLy8gd3JpdGUgYWxsIHRoZSBidWZmZXJzXG59YmluYXJ5LnJlbW92ZUJsb2JzKG9iaix3cml0ZUVuY29kaW5nKTt9IC8qKlxuICogQSBzb2NrZXQuaW8gRGVjb2RlciBpbnN0YW5jZVxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gZGVjb2RlclxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIERlY29kZXIoKXt0aGlzLnJlY29uc3RydWN0b3IgPSBudWxsO30gLyoqXG4gKiBNaXggaW4gYEVtaXR0ZXJgIHdpdGggRGVjb2Rlci5cbiAqL0VtaXR0ZXIoRGVjb2Rlci5wcm90b3R5cGUpOyAvKipcbiAqIERlY29kZXMgYW4gZWNvZGVkIHBhY2tldCBzdHJpbmcgaW50byBwYWNrZXQgSlNPTi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gb2JqIC0gZW5jb2RlZCBwYWNrZXRcbiAqIEByZXR1cm4ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHB1YmxpY1xuICovRGVjb2Rlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24ob2JqKXt2YXIgcGFja2V0O2lmKCdzdHJpbmcnID09IHR5cGVvZiBvYmope3BhY2tldCA9IGRlY29kZVN0cmluZyhvYmopO2lmKGV4cG9ydHMuQklOQVJZX0VWRU5UID09IHBhY2tldC50eXBlIHx8IGV4cG9ydHMuQklOQVJZX0FDSyA9PSBwYWNrZXQudHlwZSl7IC8vIGJpbmFyeSBwYWNrZXQncyBqc29uXG50aGlzLnJlY29uc3RydWN0b3IgPSBuZXcgQmluYXJ5UmVjb25zdHJ1Y3RvcihwYWNrZXQpOyAvLyBubyBhdHRhY2htZW50cywgbGFiZWxlZCBiaW5hcnkgYnV0IG5vIGJpbmFyeSBkYXRhIHRvIGZvbGxvd1xuaWYodGhpcy5yZWNvbnN0cnVjdG9yLnJlY29uUGFjay5hdHRhY2htZW50cyA9PT0gMCl7dGhpcy5lbWl0KCdkZWNvZGVkJyxwYWNrZXQpO319ZWxzZSB7IC8vIG5vbi1iaW5hcnkgZnVsbCBwYWNrZXRcbnRoaXMuZW1pdCgnZGVjb2RlZCcscGFja2V0KTt9fWVsc2UgaWYoaXNCdWYob2JqKSB8fCBvYmouYmFzZTY0KXsgLy8gcmF3IGJpbmFyeSBkYXRhXG5pZighdGhpcy5yZWNvbnN0cnVjdG9yKXt0aHJvdyBuZXcgRXJyb3IoJ2dvdCBiaW5hcnkgZGF0YSB3aGVuIG5vdCByZWNvbnN0cnVjdGluZyBhIHBhY2tldCcpO31lbHNlIHtwYWNrZXQgPSB0aGlzLnJlY29uc3RydWN0b3IudGFrZUJpbmFyeURhdGEob2JqKTtpZihwYWNrZXQpeyAvLyByZWNlaXZlZCBmaW5hbCBidWZmZXJcbnRoaXMucmVjb25zdHJ1Y3RvciA9IG51bGw7dGhpcy5lbWl0KCdkZWNvZGVkJyxwYWNrZXQpO319fWVsc2Uge3Rocm93IG5ldyBFcnJvcignVW5rbm93biB0eXBlOiAnICsgb2JqKTt9fTsgLyoqXG4gKiBEZWNvZGUgYSBwYWNrZXQgU3RyaW5nIChKU09OIGRhdGEpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fSBwYWNrZXRcbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gZGVjb2RlU3RyaW5nKHN0cil7dmFyIHA9e307dmFyIGk9MDsgLy8gbG9vayB1cCB0eXBlXG5wLnR5cGUgPSBOdW1iZXIoc3RyLmNoYXJBdCgwKSk7aWYobnVsbCA9PSBleHBvcnRzLnR5cGVzW3AudHlwZV0pcmV0dXJuIGVycm9yKCk7IC8vIGxvb2sgdXAgYXR0YWNobWVudHMgaWYgdHlwZSBiaW5hcnlcbmlmKGV4cG9ydHMuQklOQVJZX0VWRU5UID09IHAudHlwZSB8fCBleHBvcnRzLkJJTkFSWV9BQ0sgPT0gcC50eXBlKXt2YXIgYnVmPScnO3doaWxlKHN0ci5jaGFyQXQoKytpKSAhPSAnLScpIHtidWYgKz0gc3RyLmNoYXJBdChpKTtpZihpID09IHN0ci5sZW5ndGgpYnJlYWs7fWlmKGJ1ZiAhPSBOdW1iZXIoYnVmKSB8fCBzdHIuY2hhckF0KGkpICE9ICctJyl7dGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIGF0dGFjaG1lbnRzJyk7fXAuYXR0YWNobWVudHMgPSBOdW1iZXIoYnVmKTt9IC8vIGxvb2sgdXAgbmFtZXNwYWNlIChpZiBhbnkpXG5pZignLycgPT0gc3RyLmNoYXJBdChpICsgMSkpe3AubnNwID0gJyc7d2hpbGUoKytpKSB7dmFyIGM9c3RyLmNoYXJBdChpKTtpZignLCcgPT0gYylicmVhaztwLm5zcCArPSBjO2lmKGkgPT0gc3RyLmxlbmd0aClicmVhazt9fWVsc2Uge3AubnNwID0gJy8nO30gLy8gbG9vayB1cCBpZFxudmFyIG5leHQ9c3RyLmNoYXJBdChpICsgMSk7aWYoJycgIT09IG5leHQgJiYgTnVtYmVyKG5leHQpID09IG5leHQpe3AuaWQgPSAnJzt3aGlsZSgrK2kpIHt2YXIgYz1zdHIuY2hhckF0KGkpO2lmKG51bGwgPT0gYyB8fCBOdW1iZXIoYykgIT0gYyl7LS1pO2JyZWFrO31wLmlkICs9IHN0ci5jaGFyQXQoaSk7aWYoaSA9PSBzdHIubGVuZ3RoKWJyZWFrO31wLmlkID0gTnVtYmVyKHAuaWQpO30gLy8gbG9vayB1cCBqc29uIGRhdGFcbmlmKHN0ci5jaGFyQXQoKytpKSl7dHJ5e3AuZGF0YSA9IGpzb24ucGFyc2Uoc3RyLnN1YnN0cihpKSk7fWNhdGNoKGUpIHtyZXR1cm4gZXJyb3IoKTt9fWRlYnVnKCdkZWNvZGVkICVzIGFzICVqJyxzdHIscCk7cmV0dXJuIHA7fSAvKipcbiAqIERlYWxsb2NhdGVzIGEgcGFyc2VyJ3MgcmVzb3VyY2VzXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL0RlY29kZXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe2lmKHRoaXMucmVjb25zdHJ1Y3Rvcil7dGhpcy5yZWNvbnN0cnVjdG9yLmZpbmlzaGVkUmVjb25zdHJ1Y3Rpb24oKTt9fTsgLyoqXG4gKiBBIG1hbmFnZXIgb2YgYSBiaW5hcnkgZXZlbnQncyAnYnVmZmVyIHNlcXVlbmNlJy4gU2hvdWxkXG4gKiBiZSBjb25zdHJ1Y3RlZCB3aGVuZXZlciBhIHBhY2tldCBvZiB0eXBlIEJJTkFSWV9FVkVOVCBpc1xuICogZGVjb2RlZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAcmV0dXJuIHtCaW5hcnlSZWNvbnN0cnVjdG9yfSBpbml0aWFsaXplZCByZWNvbnN0cnVjdG9yXG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIEJpbmFyeVJlY29uc3RydWN0b3IocGFja2V0KXt0aGlzLnJlY29uUGFjayA9IHBhY2tldDt0aGlzLmJ1ZmZlcnMgPSBbXTt9IC8qKlxuICogTWV0aG9kIHRvIGJlIGNhbGxlZCB3aGVuIGJpbmFyeSBkYXRhIHJlY2VpdmVkIGZyb20gY29ubmVjdGlvblxuICogYWZ0ZXIgYSBCSU5BUllfRVZFTlQgcGFja2V0LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyIHwgQXJyYXlCdWZmZXJ9IGJpbkRhdGEgLSB0aGUgcmF3IGJpbmFyeSBkYXRhIHJlY2VpdmVkXG4gKiBAcmV0dXJuIHtudWxsIHwgT2JqZWN0fSByZXR1cm5zIG51bGwgaWYgbW9yZSBiaW5hcnkgZGF0YSBpcyBleHBlY3RlZCBvclxuICogICBhIHJlY29uc3RydWN0ZWQgcGFja2V0IG9iamVjdCBpZiBhbGwgYnVmZmVycyBoYXZlIGJlZW4gcmVjZWl2ZWQuXG4gKiBAYXBpIHByaXZhdGVcbiAqL0JpbmFyeVJlY29uc3RydWN0b3IucHJvdG90eXBlLnRha2VCaW5hcnlEYXRhID0gZnVuY3Rpb24oYmluRGF0YSl7dGhpcy5idWZmZXJzLnB1c2goYmluRGF0YSk7aWYodGhpcy5idWZmZXJzLmxlbmd0aCA9PSB0aGlzLnJlY29uUGFjay5hdHRhY2htZW50cyl7IC8vIGRvbmUgd2l0aCBidWZmZXIgbGlzdFxudmFyIHBhY2tldD1iaW5hcnkucmVjb25zdHJ1Y3RQYWNrZXQodGhpcy5yZWNvblBhY2ssdGhpcy5idWZmZXJzKTt0aGlzLmZpbmlzaGVkUmVjb25zdHJ1Y3Rpb24oKTtyZXR1cm4gcGFja2V0O31yZXR1cm4gbnVsbDt9OyAvKipcbiAqIENsZWFucyB1cCBiaW5hcnkgcGFja2V0IHJlY29uc3RydWN0aW9uIHZhcmlhYmxlcy5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL0JpbmFyeVJlY29uc3RydWN0b3IucHJvdG90eXBlLmZpbmlzaGVkUmVjb25zdHJ1Y3Rpb24gPSBmdW5jdGlvbigpe3RoaXMucmVjb25QYWNrID0gbnVsbDt0aGlzLmJ1ZmZlcnMgPSBbXTt9O2Z1bmN0aW9uIGVycm9yKGRhdGEpe3JldHVybiB7dHlwZTpleHBvcnRzLkVSUk9SLGRhdGE6J3BhcnNlciBlcnJvcid9O319LHtcIi4vYmluYXJ5XCI6NDYsXCIuL2lzLWJ1ZmZlclwiOjQ4LFwiY29tcG9uZW50LWVtaXR0ZXJcIjo0OSxcImRlYnVnXCI6MzksXCJpc2FycmF5XCI6NDMsXCJqc29uM1wiOjUwfV0sNDg6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpe21vZHVsZS5leHBvcnRzID0gaXNCdWY7IC8qKlxuICogUmV0dXJucyB0cnVlIGlmIG9iaiBpcyBhIGJ1ZmZlciBvciBhbiBhcnJheWJ1ZmZlci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIGlzQnVmKG9iail7cmV0dXJuIGdsb2JhbC5CdWZmZXIgJiYgZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlcihvYmopIHx8IGdsb2JhbC5BcnJheUJ1ZmZlciAmJiBvYmogaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcjt9fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se31dLDQ5OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXthcmd1bWVudHNbNF1bMTVdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKTt9LHtcImR1cFwiOjE1fV0sNTA6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKiEgSlNPTiB2My4zLjIgfCBodHRwOi8vYmVzdGllanMuZ2l0aHViLmlvL2pzb24zIHwgQ29weXJpZ2h0IDIwMTItMjAxNCwgS2l0IENhbWJyaWRnZSB8IGh0dHA6Ly9raXQubWl0LWxpY2Vuc2Uub3JnICovOyhmdW5jdGlvbigpeyAvLyBEZXRlY3QgdGhlIGBkZWZpbmVgIGZ1bmN0aW9uIGV4cG9zZWQgYnkgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLiBUaGVcbi8vIHN0cmljdCBgZGVmaW5lYCBjaGVjayBpcyBuZWNlc3NhcnkgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBgci5qc2AuXG52YXIgaXNMb2FkZXI9dHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQ7IC8vIEEgc2V0IG9mIHR5cGVzIHVzZWQgdG8gZGlzdGluZ3Vpc2ggb2JqZWN0cyBmcm9tIHByaW1pdGl2ZXMuXG52YXIgb2JqZWN0VHlwZXM9e1wiZnVuY3Rpb25cIjp0cnVlLFwib2JqZWN0XCI6dHJ1ZX07IC8vIERldGVjdCB0aGUgYGV4cG9ydHNgIG9iamVjdCBleHBvc2VkIGJ5IENvbW1vbkpTIGltcGxlbWVudGF0aW9ucy5cbnZhciBmcmVlRXhwb3J0cz1vYmplY3RUeXBlc1t0eXBlb2YgZXhwb3J0c10gJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzOyAvLyBVc2UgdGhlIGBnbG9iYWxgIG9iamVjdCBleHBvc2VkIGJ5IE5vZGUgKGluY2x1ZGluZyBCcm93c2VyaWZ5IHZpYVxuLy8gYGluc2VydC1tb2R1bGUtZ2xvYmFsc2ApLCBOYXJ3aGFsLCBhbmQgUmluZ28gYXMgdGhlIGRlZmF1bHQgY29udGV4dCxcbi8vIGFuZCB0aGUgYHdpbmRvd2Agb2JqZWN0IGluIGJyb3dzZXJzLiBSaGlubyBleHBvcnRzIGEgYGdsb2JhbGAgZnVuY3Rpb25cbi8vIGluc3RlYWQuXG52YXIgcm9vdD1vYmplY3RUeXBlc1t0eXBlb2Ygd2luZG93XSAmJiB3aW5kb3cgfHwgdGhpcyxmcmVlR2xvYmFsPWZyZWVFeHBvcnRzICYmIG9iamVjdFR5cGVzW3R5cGVvZiBtb2R1bGVdICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIHR5cGVvZiBnbG9iYWwgPT0gXCJvYmplY3RcIiAmJiBnbG9iYWw7aWYoZnJlZUdsb2JhbCAmJiAoZnJlZUdsb2JhbFtcImdsb2JhbFwiXSA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsW1wid2luZG93XCJdID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWxbXCJzZWxmXCJdID09PSBmcmVlR2xvYmFsKSl7cm9vdCA9IGZyZWVHbG9iYWw7fSAvLyBQdWJsaWM6IEluaXRpYWxpemVzIEpTT04gMyB1c2luZyB0aGUgZ2l2ZW4gYGNvbnRleHRgIG9iamVjdCwgYXR0YWNoaW5nIHRoZVxuLy8gYHN0cmluZ2lmeWAgYW5kIGBwYXJzZWAgZnVuY3Rpb25zIHRvIHRoZSBzcGVjaWZpZWQgYGV4cG9ydHNgIG9iamVjdC5cbmZ1bmN0aW9uIHJ1bkluQ29udGV4dChjb250ZXh0LGV4cG9ydHMpe2NvbnRleHQgfHwgKGNvbnRleHQgPSByb290W1wiT2JqZWN0XCJdKCkpO2V4cG9ydHMgfHwgKGV4cG9ydHMgPSByb290W1wiT2JqZWN0XCJdKCkpOyAvLyBOYXRpdmUgY29uc3RydWN0b3IgYWxpYXNlcy5cbnZhciBOdW1iZXI9Y29udGV4dFtcIk51bWJlclwiXSB8fCByb290W1wiTnVtYmVyXCJdLFN0cmluZz1jb250ZXh0W1wiU3RyaW5nXCJdIHx8IHJvb3RbXCJTdHJpbmdcIl0sT2JqZWN0PWNvbnRleHRbXCJPYmplY3RcIl0gfHwgcm9vdFtcIk9iamVjdFwiXSxEYXRlPWNvbnRleHRbXCJEYXRlXCJdIHx8IHJvb3RbXCJEYXRlXCJdLFN5bnRheEVycm9yPWNvbnRleHRbXCJTeW50YXhFcnJvclwiXSB8fCByb290W1wiU3ludGF4RXJyb3JcIl0sVHlwZUVycm9yPWNvbnRleHRbXCJUeXBlRXJyb3JcIl0gfHwgcm9vdFtcIlR5cGVFcnJvclwiXSxNYXRoPWNvbnRleHRbXCJNYXRoXCJdIHx8IHJvb3RbXCJNYXRoXCJdLG5hdGl2ZUpTT049Y29udGV4dFtcIkpTT05cIl0gfHwgcm9vdFtcIkpTT05cIl07IC8vIERlbGVnYXRlIHRvIHRoZSBuYXRpdmUgYHN0cmluZ2lmeWAgYW5kIGBwYXJzZWAgaW1wbGVtZW50YXRpb25zLlxuaWYodHlwZW9mIG5hdGl2ZUpTT04gPT0gXCJvYmplY3RcIiAmJiBuYXRpdmVKU09OKXtleHBvcnRzLnN0cmluZ2lmeSA9IG5hdGl2ZUpTT04uc3RyaW5naWZ5O2V4cG9ydHMucGFyc2UgPSBuYXRpdmVKU09OLnBhcnNlO30gLy8gQ29udmVuaWVuY2UgYWxpYXNlcy5cbnZhciBvYmplY3RQcm90bz1PYmplY3QucHJvdG90eXBlLGdldENsYXNzPW9iamVjdFByb3RvLnRvU3RyaW5nLGlzUHJvcGVydHksZm9yRWFjaCx1bmRlZjsgLy8gVGVzdCB0aGUgYERhdGUjZ2V0VVRDKmAgbWV0aG9kcy4gQmFzZWQgb24gd29yayBieSBAWWFmZmxlLlxudmFyIGlzRXh0ZW5kZWQ9bmV3IERhdGUoLTM1MDk4MjczMzQ1NzMyOTIpO3RyeXsgLy8gVGhlIGBnZXRVVENGdWxsWWVhcmAsIGBNb250aGAsIGFuZCBgRGF0ZWAgbWV0aG9kcyByZXR1cm4gbm9uc2Vuc2ljYWxcbi8vIHJlc3VsdHMgZm9yIGNlcnRhaW4gZGF0ZXMgaW4gT3BlcmEgPj0gMTAuNTMuXG5pc0V4dGVuZGVkID0gaXNFeHRlbmRlZC5nZXRVVENGdWxsWWVhcigpID09IC0xMDkyNTIgJiYgaXNFeHRlbmRlZC5nZXRVVENNb250aCgpID09PSAwICYmIGlzRXh0ZW5kZWQuZ2V0VVRDRGF0ZSgpID09PSAxICYmICAvLyBTYWZhcmkgPCAyLjAuMiBzdG9yZXMgdGhlIGludGVybmFsIG1pbGxpc2Vjb25kIHRpbWUgdmFsdWUgY29ycmVjdGx5LFxuLy8gYnV0IGNsaXBzIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGRhdGUgbWV0aG9kcyB0byB0aGUgcmFuZ2Ugb2Zcbi8vIHNpZ25lZCAzMi1iaXQgaW50ZWdlcnMgKFstMiAqKiAzMSwgMiAqKiAzMSAtIDFdKS5cbmlzRXh0ZW5kZWQuZ2V0VVRDSG91cnMoKSA9PSAxMCAmJiBpc0V4dGVuZGVkLmdldFVUQ01pbnV0ZXMoKSA9PSAzNyAmJiBpc0V4dGVuZGVkLmdldFVUQ1NlY29uZHMoKSA9PSA2ICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTWlsbGlzZWNvbmRzKCkgPT0gNzA4O31jYXRjaChleGNlcHRpb24pIHt9IC8vIEludGVybmFsOiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG5hdGl2ZSBgSlNPTi5zdHJpbmdpZnlgIGFuZCBgcGFyc2VgXG4vLyBpbXBsZW1lbnRhdGlvbnMgYXJlIHNwZWMtY29tcGxpYW50LiBCYXNlZCBvbiB3b3JrIGJ5IEtlbiBTbnlkZXIuXG5mdW5jdGlvbiBoYXMobmFtZSl7aWYoaGFzW25hbWVdICE9PSB1bmRlZil7IC8vIFJldHVybiBjYWNoZWQgZmVhdHVyZSB0ZXN0IHJlc3VsdC5cbnJldHVybiBoYXNbbmFtZV07fXZhciBpc1N1cHBvcnRlZDtpZihuYW1lID09IFwiYnVnLXN0cmluZy1jaGFyLWluZGV4XCIpeyAvLyBJRSA8PSA3IGRvZXNuJ3Qgc3VwcG9ydCBhY2Nlc3Npbmcgc3RyaW5nIGNoYXJhY3RlcnMgdXNpbmcgc3F1YXJlXG4vLyBicmFja2V0IG5vdGF0aW9uLiBJRSA4IG9ubHkgc3VwcG9ydHMgdGhpcyBmb3IgcHJpbWl0aXZlcy5cbmlzU3VwcG9ydGVkID0gXCJhXCJbMF0gIT0gXCJhXCI7fWVsc2UgaWYobmFtZSA9PSBcImpzb25cIil7IC8vIEluZGljYXRlcyB3aGV0aGVyIGJvdGggYEpTT04uc3RyaW5naWZ5YCBhbmQgYEpTT04ucGFyc2VgIGFyZVxuLy8gc3VwcG9ydGVkLlxuaXNTdXBwb3J0ZWQgPSBoYXMoXCJqc29uLXN0cmluZ2lmeVwiKSAmJiBoYXMoXCJqc29uLXBhcnNlXCIpO31lbHNlIHt2YXIgdmFsdWUsc2VyaWFsaXplZD1cIntcXFwiYVxcXCI6WzEsdHJ1ZSxmYWxzZSxudWxsLFxcXCJcXFxcdTAwMDBcXFxcYlxcXFxuXFxcXGZcXFxcclxcXFx0XFxcIl19XCI7IC8vIFRlc3QgYEpTT04uc3RyaW5naWZ5YC5cbmlmKG5hbWUgPT0gXCJqc29uLXN0cmluZ2lmeVwiKXt2YXIgc3RyaW5naWZ5PWV4cG9ydHMuc3RyaW5naWZ5LHN0cmluZ2lmeVN1cHBvcnRlZD10eXBlb2Ygc3RyaW5naWZ5ID09IFwiZnVuY3Rpb25cIiAmJiBpc0V4dGVuZGVkO2lmKHN0cmluZ2lmeVN1cHBvcnRlZCl7IC8vIEEgdGVzdCBmdW5jdGlvbiBvYmplY3Qgd2l0aCBhIGN1c3RvbSBgdG9KU09OYCBtZXRob2QuXG4odmFsdWUgPSBmdW5jdGlvbigpe3JldHVybiAxO30pLnRvSlNPTiA9IHZhbHVlO3RyeXtzdHJpbmdpZnlTdXBwb3J0ZWQgPSAgLy8gRmlyZWZveCAzLjFiMSBhbmQgYjIgc2VyaWFsaXplIHN0cmluZywgbnVtYmVyLCBhbmQgYm9vbGVhblxuLy8gcHJpbWl0aXZlcyBhcyBvYmplY3QgbGl0ZXJhbHMuXG5zdHJpbmdpZnkoMCkgPT09IFwiMFwiICYmICAvLyBGRiAzLjFiMSwgYjIsIGFuZCBKU09OIDIgc2VyaWFsaXplIHdyYXBwZWQgcHJpbWl0aXZlcyBhcyBvYmplY3Rcbi8vIGxpdGVyYWxzLlxuc3RyaW5naWZ5KG5ldyBOdW1iZXIoKSkgPT09IFwiMFwiICYmIHN0cmluZ2lmeShuZXcgU3RyaW5nKCkpID09ICdcIlwiJyAmJiAgLy8gRkYgMy4xYjEsIDIgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIHZhbHVlIGlzIGBudWxsYCwgYHVuZGVmaW5lZGAsIG9yXG4vLyBkb2VzIG5vdCBkZWZpbmUgYSBjYW5vbmljYWwgSlNPTiByZXByZXNlbnRhdGlvbiAodGhpcyBhcHBsaWVzIHRvXG4vLyBvYmplY3RzIHdpdGggYHRvSlNPTmAgcHJvcGVydGllcyBhcyB3ZWxsLCAqdW5sZXNzKiB0aGV5IGFyZSBuZXN0ZWRcbi8vIHdpdGhpbiBhbiBvYmplY3Qgb3IgYXJyYXkpLlxuc3RyaW5naWZ5KGdldENsYXNzKSA9PT0gdW5kZWYgJiYgIC8vIElFIDggc2VyaWFsaXplcyBgdW5kZWZpbmVkYCBhcyBgXCJ1bmRlZmluZWRcImAuIFNhZmFyaSA8PSA1LjEuNyBhbmRcbi8vIEZGIDMuMWIzIHBhc3MgdGhpcyB0ZXN0Llxuc3RyaW5naWZ5KHVuZGVmKSA9PT0gdW5kZWYgJiYgIC8vIFNhZmFyaSA8PSA1LjEuNyBhbmQgRkYgMy4xYjMgdGhyb3cgYEVycm9yYHMgYW5kIGBUeXBlRXJyb3Jgcyxcbi8vIHJlc3BlY3RpdmVseSwgaWYgdGhlIHZhbHVlIGlzIG9taXR0ZWQgZW50aXJlbHkuXG5zdHJpbmdpZnkoKSA9PT0gdW5kZWYgJiYgIC8vIEZGIDMuMWIxLCAyIHRocm93IGFuIGVycm9yIGlmIHRoZSBnaXZlbiB2YWx1ZSBpcyBub3QgYSBudW1iZXIsXG4vLyBzdHJpbmcsIGFycmF5LCBvYmplY3QsIEJvb2xlYW4sIG9yIGBudWxsYCBsaXRlcmFsLiBUaGlzIGFwcGxpZXMgdG9cbi8vIG9iamVjdHMgd2l0aCBjdXN0b20gYHRvSlNPTmAgbWV0aG9kcyBhcyB3ZWxsLCB1bmxlc3MgdGhleSBhcmUgbmVzdGVkXG4vLyBpbnNpZGUgb2JqZWN0IG9yIGFycmF5IGxpdGVyYWxzLiBZVUkgMy4wLjBiMSBpZ25vcmVzIGN1c3RvbSBgdG9KU09OYFxuLy8gbWV0aG9kcyBlbnRpcmVseS5cbnN0cmluZ2lmeSh2YWx1ZSkgPT09IFwiMVwiICYmIHN0cmluZ2lmeShbdmFsdWVdKSA9PSBcIlsxXVwiICYmICAvLyBQcm90b3R5cGUgPD0gMS42LjEgc2VyaWFsaXplcyBgW3VuZGVmaW5lZF1gIGFzIGBcIltdXCJgIGluc3RlYWQgb2Zcbi8vIGBcIltudWxsXVwiYC5cbnN0cmluZ2lmeShbdW5kZWZdKSA9PSBcIltudWxsXVwiICYmICAvLyBZVUkgMy4wLjBiMSBmYWlscyB0byBzZXJpYWxpemUgYG51bGxgIGxpdGVyYWxzLlxuc3RyaW5naWZ5KG51bGwpID09IFwibnVsbFwiICYmICAvLyBGRiAzLjFiMSwgMiBoYWx0cyBzZXJpYWxpemF0aW9uIGlmIGFuIGFycmF5IGNvbnRhaW5zIGEgZnVuY3Rpb246XG4vLyBgWzEsIHRydWUsIGdldENsYXNzLCAxXWAgc2VyaWFsaXplcyBhcyBcIlsxLHRydWUsXSxcIi4gRkYgMy4xYjNcbi8vIGVsaWRlcyBub24tSlNPTiB2YWx1ZXMgZnJvbSBvYmplY3RzIGFuZCBhcnJheXMsIHVubGVzcyB0aGV5XG4vLyBkZWZpbmUgY3VzdG9tIGB0b0pTT05gIG1ldGhvZHMuXG5zdHJpbmdpZnkoW3VuZGVmLGdldENsYXNzLG51bGxdKSA9PSBcIltudWxsLG51bGwsbnVsbF1cIiAmJiAgLy8gU2ltcGxlIHNlcmlhbGl6YXRpb24gdGVzdC4gRkYgMy4xYjEgdXNlcyBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZXNcbi8vIHdoZXJlIGNoYXJhY3RlciBlc2NhcGUgY29kZXMgYXJlIGV4cGVjdGVkIChlLmcuLCBgXFxiYCA9PiBgXFx1MDAwOGApLlxuc3RyaW5naWZ5KHtcImFcIjpbdmFsdWUsdHJ1ZSxmYWxzZSxudWxsLFwiXFx4MDBcXGJcXG5cXGZcXHJcXHRcIl19KSA9PSBzZXJpYWxpemVkICYmICAvLyBGRiAzLjFiMSBhbmQgYjIgaWdub3JlIHRoZSBgZmlsdGVyYCBhbmQgYHdpZHRoYCBhcmd1bWVudHMuXG5zdHJpbmdpZnkobnVsbCx2YWx1ZSkgPT09IFwiMVwiICYmIHN0cmluZ2lmeShbMSwyXSxudWxsLDEpID09IFwiW1xcbiAxLFxcbiAyXFxuXVwiICYmICAvLyBKU09OIDIsIFByb3RvdHlwZSA8PSAxLjcsIGFuZCBvbGRlciBXZWJLaXQgYnVpbGRzIGluY29ycmVjdGx5XG4vLyBzZXJpYWxpemUgZXh0ZW5kZWQgeWVhcnMuXG5zdHJpbmdpZnkobmV3IERhdGUoLTguNjRlMTUpKSA9PSAnXCItMjcxODIxLTA0LTIwVDAwOjAwOjAwLjAwMFpcIicgJiYgIC8vIFRoZSBtaWxsaXNlY29uZHMgYXJlIG9wdGlvbmFsIGluIEVTIDUsIGJ1dCByZXF1aXJlZCBpbiA1LjEuXG5zdHJpbmdpZnkobmV3IERhdGUoOC42NGUxNSkpID09ICdcIisyNzU3NjAtMDktMTNUMDA6MDA6MDAuMDAwWlwiJyAmJiAgLy8gRmlyZWZveCA8PSAxMS4wIGluY29ycmVjdGx5IHNlcmlhbGl6ZXMgeWVhcnMgcHJpb3IgdG8gMCBhcyBuZWdhdGl2ZVxuLy8gZm91ci1kaWdpdCB5ZWFycyBpbnN0ZWFkIG9mIHNpeC1kaWdpdCB5ZWFycy4gQ3JlZGl0czogQFlhZmZsZS5cbnN0cmluZ2lmeShuZXcgRGF0ZSgtNjIxOTg3NTUyZTUpKSA9PSAnXCItMDAwMDAxLTAxLTAxVDAwOjAwOjAwLjAwMFpcIicgJiYgIC8vIFNhZmFyaSA8PSA1LjEuNSBhbmQgT3BlcmEgPj0gMTAuNTMgaW5jb3JyZWN0bHkgc2VyaWFsaXplIG1pbGxpc2Vjb25kXG4vLyB2YWx1ZXMgbGVzcyB0aGFuIDEwMDAuIENyZWRpdHM6IEBZYWZmbGUuXG5zdHJpbmdpZnkobmV3IERhdGUoLTEpKSA9PSAnXCIxOTY5LTEyLTMxVDIzOjU5OjU5Ljk5OVpcIic7fWNhdGNoKGV4Y2VwdGlvbikge3N0cmluZ2lmeVN1cHBvcnRlZCA9IGZhbHNlO319aXNTdXBwb3J0ZWQgPSBzdHJpbmdpZnlTdXBwb3J0ZWQ7fSAvLyBUZXN0IGBKU09OLnBhcnNlYC5cbmlmKG5hbWUgPT0gXCJqc29uLXBhcnNlXCIpe3ZhciBwYXJzZT1leHBvcnRzLnBhcnNlO2lmKHR5cGVvZiBwYXJzZSA9PSBcImZ1bmN0aW9uXCIpe3RyeXsgLy8gRkYgMy4xYjEsIGIyIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGEgYmFyZSBsaXRlcmFsIGlzIHByb3ZpZGVkLlxuLy8gQ29uZm9ybWluZyBpbXBsZW1lbnRhdGlvbnMgc2hvdWxkIGFsc28gY29lcmNlIHRoZSBpbml0aWFsIGFyZ3VtZW50IHRvXG4vLyBhIHN0cmluZyBwcmlvciB0byBwYXJzaW5nLlxuaWYocGFyc2UoXCIwXCIpID09PSAwICYmICFwYXJzZShmYWxzZSkpeyAvLyBTaW1wbGUgcGFyc2luZyB0ZXN0LlxudmFsdWUgPSBwYXJzZShzZXJpYWxpemVkKTt2YXIgcGFyc2VTdXBwb3J0ZWQ9dmFsdWVbXCJhXCJdLmxlbmd0aCA9PSA1ICYmIHZhbHVlW1wiYVwiXVswXSA9PT0gMTtpZihwYXJzZVN1cHBvcnRlZCl7dHJ5eyAvLyBTYWZhcmkgPD0gNS4xLjIgYW5kIEZGIDMuMWIxIGFsbG93IHVuZXNjYXBlZCB0YWJzIGluIHN0cmluZ3MuXG5wYXJzZVN1cHBvcnRlZCA9ICFwYXJzZSgnXCJcXHRcIicpO31jYXRjaChleGNlcHRpb24pIHt9aWYocGFyc2VTdXBwb3J0ZWQpe3RyeXsgLy8gRkYgNC4wIGFuZCA0LjAuMSBhbGxvdyBsZWFkaW5nIGArYCBzaWducyBhbmQgbGVhZGluZ1xuLy8gZGVjaW1hbCBwb2ludHMuIEZGIDQuMCwgNC4wLjEsIGFuZCBJRSA5LTEwIGFsc28gYWxsb3dcbi8vIGNlcnRhaW4gb2N0YWwgbGl0ZXJhbHMuXG5wYXJzZVN1cHBvcnRlZCA9IHBhcnNlKFwiMDFcIikgIT09IDE7fWNhdGNoKGV4Y2VwdGlvbikge319aWYocGFyc2VTdXBwb3J0ZWQpe3RyeXsgLy8gRkYgNC4wLCA0LjAuMSwgYW5kIFJoaW5vIDEuN1IzLVI0IGFsbG93IHRyYWlsaW5nIGRlY2ltYWxcbi8vIHBvaW50cy4gVGhlc2UgZW52aXJvbm1lbnRzLCBhbG9uZyB3aXRoIEZGIDMuMWIxIGFuZCAyLFxuLy8gYWxzbyBhbGxvdyB0cmFpbGluZyBjb21tYXMgaW4gSlNPTiBvYmplY3RzIGFuZCBhcnJheXMuXG5wYXJzZVN1cHBvcnRlZCA9IHBhcnNlKFwiMS5cIikgIT09IDE7fWNhdGNoKGV4Y2VwdGlvbikge319fX19Y2F0Y2goZXhjZXB0aW9uKSB7cGFyc2VTdXBwb3J0ZWQgPSBmYWxzZTt9fWlzU3VwcG9ydGVkID0gcGFyc2VTdXBwb3J0ZWQ7fX1yZXR1cm4gaGFzW25hbWVdID0gISFpc1N1cHBvcnRlZDt9aWYoIWhhcyhcImpzb25cIikpeyAvLyBDb21tb24gYFtbQ2xhc3NdXWAgbmFtZSBhbGlhc2VzLlxudmFyIGZ1bmN0aW9uQ2xhc3M9XCJbb2JqZWN0IEZ1bmN0aW9uXVwiLGRhdGVDbGFzcz1cIltvYmplY3QgRGF0ZV1cIixudW1iZXJDbGFzcz1cIltvYmplY3QgTnVtYmVyXVwiLHN0cmluZ0NsYXNzPVwiW29iamVjdCBTdHJpbmddXCIsYXJyYXlDbGFzcz1cIltvYmplY3QgQXJyYXldXCIsYm9vbGVhbkNsYXNzPVwiW29iamVjdCBCb29sZWFuXVwiOyAvLyBEZXRlY3QgaW5jb21wbGV0ZSBzdXBwb3J0IGZvciBhY2Nlc3Npbmcgc3RyaW5nIGNoYXJhY3RlcnMgYnkgaW5kZXguXG52YXIgY2hhckluZGV4QnVnZ3k9aGFzKFwiYnVnLXN0cmluZy1jaGFyLWluZGV4XCIpOyAvLyBEZWZpbmUgYWRkaXRpb25hbCB1dGlsaXR5IG1ldGhvZHMgaWYgdGhlIGBEYXRlYCBtZXRob2RzIGFyZSBidWdneS5cbmlmKCFpc0V4dGVuZGVkKXt2YXIgZmxvb3I9TWF0aC5mbG9vcjsgLy8gQSBtYXBwaW5nIGJldHdlZW4gdGhlIG1vbnRocyBvZiB0aGUgeWVhciBhbmQgdGhlIG51bWJlciBvZiBkYXlzIGJldHdlZW5cbi8vIEphbnVhcnkgMXN0IGFuZCB0aGUgZmlyc3Qgb2YgdGhlIHJlc3BlY3RpdmUgbW9udGguXG52YXIgTW9udGhzPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdOyAvLyBJbnRlcm5hbDogQ2FsY3VsYXRlcyB0aGUgbnVtYmVyIG9mIGRheXMgYmV0d2VlbiB0aGUgVW5peCBlcG9jaCBhbmQgdGhlXG4vLyBmaXJzdCBkYXkgb2YgdGhlIGdpdmVuIG1vbnRoLlxudmFyIGdldERheT1mdW5jdGlvbiBnZXREYXkoeWVhcixtb250aCl7cmV0dXJuIE1vbnRoc1ttb250aF0gKyAzNjUgKiAoeWVhciAtIDE5NzApICsgZmxvb3IoKHllYXIgLSAxOTY5ICsgKG1vbnRoID0gKyhtb250aCA+IDEpKSkgLyA0KSAtIGZsb29yKCh5ZWFyIC0gMTkwMSArIG1vbnRoKSAvIDEwMCkgKyBmbG9vcigoeWVhciAtIDE2MDEgKyBtb250aCkgLyA0MDApO307fSAvLyBJbnRlcm5hbDogRGV0ZXJtaW5lcyBpZiBhIHByb3BlcnR5IGlzIGEgZGlyZWN0IHByb3BlcnR5IG9mIHRoZSBnaXZlblxuLy8gb2JqZWN0LiBEZWxlZ2F0ZXMgdG8gdGhlIG5hdGl2ZSBgT2JqZWN0I2hhc093blByb3BlcnR5YCBtZXRob2QuXG5pZighKGlzUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eSkpe2lzUHJvcGVydHkgPSBmdW5jdGlvbihwcm9wZXJ0eSl7dmFyIG1lbWJlcnM9e30sY29uc3RydWN0b3I7aWYoKG1lbWJlcnMuX19wcm90b19fID0gbnVsbCxtZW1iZXJzLl9fcHJvdG9fXyA9IHsgLy8gVGhlICpwcm90byogcHJvcGVydHkgY2Fubm90IGJlIHNldCBtdWx0aXBsZSB0aW1lcyBpbiByZWNlbnRcbi8vIHZlcnNpb25zIG9mIEZpcmVmb3ggYW5kIFNlYU1vbmtleS5cblwidG9TdHJpbmdcIjoxfSxtZW1iZXJzKS50b1N0cmluZyAhPSBnZXRDbGFzcyl7IC8vIFNhZmFyaSA8PSAyLjAuMyBkb2Vzbid0IGltcGxlbWVudCBgT2JqZWN0I2hhc093blByb3BlcnR5YCwgYnV0XG4vLyBzdXBwb3J0cyB0aGUgbXV0YWJsZSAqcHJvdG8qIHByb3BlcnR5LlxuaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uKHByb3BlcnR5KXsgLy8gQ2FwdHVyZSBhbmQgYnJlYWsgdGhlIG9iamVjdCdzIHByb3RvdHlwZSBjaGFpbiAoc2VlIHNlY3Rpb24gOC42LjJcbi8vIG9mIHRoZSBFUyA1LjEgc3BlYykuIFRoZSBwYXJlbnRoZXNpemVkIGV4cHJlc3Npb24gcHJldmVudHMgYW5cbi8vIHVuc2FmZSB0cmFuc2Zvcm1hdGlvbiBieSB0aGUgQ2xvc3VyZSBDb21waWxlci5cbnZhciBvcmlnaW5hbD10aGlzLl9fcHJvdG9fXyxyZXN1bHQ9KHByb3BlcnR5IGluICh0aGlzLl9fcHJvdG9fXyA9IG51bGwsdGhpcykpOyAvLyBSZXN0b3JlIHRoZSBvcmlnaW5hbCBwcm90b3R5cGUgY2hhaW4uXG50aGlzLl9fcHJvdG9fXyA9IG9yaWdpbmFsO3JldHVybiByZXN1bHQ7fTt9ZWxzZSB7IC8vIENhcHR1cmUgYSByZWZlcmVuY2UgdG8gdGhlIHRvcC1sZXZlbCBgT2JqZWN0YCBjb25zdHJ1Y3Rvci5cbmNvbnN0cnVjdG9yID0gbWVtYmVycy5jb25zdHJ1Y3RvcjsgLy8gVXNlIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IHRvIHNpbXVsYXRlIGBPYmplY3QjaGFzT3duUHJvcGVydHlgIGluXG4vLyBvdGhlciBlbnZpcm9ubWVudHMuXG5pc1Byb3BlcnR5ID0gZnVuY3Rpb24ocHJvcGVydHkpe3ZhciBwYXJlbnQ9KHRoaXMuY29uc3RydWN0b3IgfHwgY29uc3RydWN0b3IpLnByb3RvdHlwZTtyZXR1cm4gcHJvcGVydHkgaW4gdGhpcyAmJiAhKHByb3BlcnR5IGluIHBhcmVudCAmJiB0aGlzW3Byb3BlcnR5XSA9PT0gcGFyZW50W3Byb3BlcnR5XSk7fTt9bWVtYmVycyA9IG51bGw7cmV0dXJuIGlzUHJvcGVydHkuY2FsbCh0aGlzLHByb3BlcnR5KTt9O30gLy8gSW50ZXJuYWw6IE5vcm1hbGl6ZXMgdGhlIGBmb3IuLi5pbmAgaXRlcmF0aW9uIGFsZ29yaXRobSBhY3Jvc3Ncbi8vIGVudmlyb25tZW50cy4gRWFjaCBlbnVtZXJhdGVkIGtleSBpcyB5aWVsZGVkIHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi5cbmZvckVhY2ggPSBmdW5jdGlvbihvYmplY3QsY2FsbGJhY2spe3ZhciBzaXplPTAsUHJvcGVydGllcyxtZW1iZXJzLHByb3BlcnR5OyAvLyBUZXN0cyBmb3IgYnVncyBpbiB0aGUgY3VycmVudCBlbnZpcm9ubWVudCdzIGBmb3IuLi5pbmAgYWxnb3JpdGhtLiBUaGVcbi8vIGB2YWx1ZU9mYCBwcm9wZXJ0eSBpbmhlcml0cyB0aGUgbm9uLWVudW1lcmFibGUgZmxhZyBmcm9tXG4vLyBgT2JqZWN0LnByb3RvdHlwZWAgaW4gb2xkZXIgdmVyc2lvbnMgb2YgSUUsIE5ldHNjYXBlLCBhbmQgTW96aWxsYS5cbihQcm9wZXJ0aWVzID0gZnVuY3Rpb24oKXt0aGlzLnZhbHVlT2YgPSAwO30pLnByb3RvdHlwZS52YWx1ZU9mID0gMDsgLy8gSXRlcmF0ZSBvdmVyIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBgUHJvcGVydGllc2AgY2xhc3MuXG5tZW1iZXJzID0gbmV3IFByb3BlcnRpZXMoKTtmb3IocHJvcGVydHkgaW4gbWVtYmVycykgeyAvLyBJZ25vcmUgYWxsIHByb3BlcnRpZXMgaW5oZXJpdGVkIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLlxuaWYoaXNQcm9wZXJ0eS5jYWxsKG1lbWJlcnMscHJvcGVydHkpKXtzaXplKys7fX1Qcm9wZXJ0aWVzID0gbWVtYmVycyA9IG51bGw7IC8vIE5vcm1hbGl6ZSB0aGUgaXRlcmF0aW9uIGFsZ29yaXRobS5cbmlmKCFzaXplKXsgLy8gQSBsaXN0IG9mIG5vbi1lbnVtZXJhYmxlIHByb3BlcnRpZXMgaW5oZXJpdGVkIGZyb20gYE9iamVjdC5wcm90b3R5cGVgLlxubWVtYmVycyA9IFtcInZhbHVlT2ZcIixcInRvU3RyaW5nXCIsXCJ0b0xvY2FsZVN0cmluZ1wiLFwicHJvcGVydHlJc0VudW1lcmFibGVcIixcImlzUHJvdG90eXBlT2ZcIixcImhhc093blByb3BlcnR5XCIsXCJjb25zdHJ1Y3RvclwiXTsgLy8gSUUgPD0gOCwgTW96aWxsYSAxLjAsIGFuZCBOZXRzY2FwZSA2LjIgaWdub3JlIHNoYWRvd2VkIG5vbi1lbnVtZXJhYmxlXG4vLyBwcm9wZXJ0aWVzLlxuZm9yRWFjaCA9IGZ1bmN0aW9uKG9iamVjdCxjYWxsYmFjayl7dmFyIGlzRnVuY3Rpb249Z2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MscHJvcGVydHksbGVuZ3RoO3ZhciBoYXNQcm9wZXJ0eT0haXNGdW5jdGlvbiAmJiB0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yICE9IFwiZnVuY3Rpb25cIiAmJiBvYmplY3RUeXBlc1t0eXBlb2Ygb2JqZWN0Lmhhc093blByb3BlcnR5XSAmJiBvYmplY3QuaGFzT3duUHJvcGVydHkgfHwgaXNQcm9wZXJ0eTtmb3IocHJvcGVydHkgaW4gb2JqZWN0KSB7IC8vIEdlY2tvIDw9IDEuMCBlbnVtZXJhdGVzIHRoZSBgcHJvdG90eXBlYCBwcm9wZXJ0eSBvZiBmdW5jdGlvbnMgdW5kZXJcbi8vIGNlcnRhaW4gY29uZGl0aW9uczsgSUUgZG9lcyBub3QuXG5pZighKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgaGFzUHJvcGVydHkuY2FsbChvYmplY3QscHJvcGVydHkpKXtjYWxsYmFjayhwcm9wZXJ0eSk7fX0gLy8gTWFudWFsbHkgaW52b2tlIHRoZSBjYWxsYmFjayBmb3IgZWFjaCBub24tZW51bWVyYWJsZSBwcm9wZXJ0eS5cbmZvcihsZW5ndGggPSBtZW1iZXJzLmxlbmd0aDtwcm9wZXJ0eSA9IG1lbWJlcnNbLS1sZW5ndGhdO2hhc1Byb3BlcnR5LmNhbGwob2JqZWN0LHByb3BlcnR5KSAmJiBjYWxsYmFjayhwcm9wZXJ0eSkpO307fWVsc2UgaWYoc2l6ZSA9PSAyKXsgLy8gU2FmYXJpIDw9IDIuMC40IGVudW1lcmF0ZXMgc2hhZG93ZWQgcHJvcGVydGllcyB0d2ljZS5cbmZvckVhY2ggPSBmdW5jdGlvbihvYmplY3QsY2FsbGJhY2speyAvLyBDcmVhdGUgYSBzZXQgb2YgaXRlcmF0ZWQgcHJvcGVydGllcy5cbnZhciBtZW1iZXJzPXt9LGlzRnVuY3Rpb249Z2V0Q2xhc3MuY2FsbChvYmplY3QpID09IGZ1bmN0aW9uQ2xhc3MscHJvcGVydHk7Zm9yKHByb3BlcnR5IGluIG9iamVjdCkgeyAvLyBTdG9yZSBlYWNoIHByb3BlcnR5IG5hbWUgdG8gcHJldmVudCBkb3VibGUgZW51bWVyYXRpb24uIFRoZVxuLy8gYHByb3RvdHlwZWAgcHJvcGVydHkgb2YgZnVuY3Rpb25zIGlzIG5vdCBlbnVtZXJhdGVkIGR1ZSB0byBjcm9zcy1cbi8vIGVudmlyb25tZW50IGluY29uc2lzdGVuY2llcy5cbmlmKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiAhaXNQcm9wZXJ0eS5jYWxsKG1lbWJlcnMscHJvcGVydHkpICYmIChtZW1iZXJzW3Byb3BlcnR5XSA9IDEpICYmIGlzUHJvcGVydHkuY2FsbChvYmplY3QscHJvcGVydHkpKXtjYWxsYmFjayhwcm9wZXJ0eSk7fX19O31lbHNlIHsgLy8gTm8gYnVncyBkZXRlY3RlZDsgdXNlIHRoZSBzdGFuZGFyZCBgZm9yLi4uaW5gIGFsZ29yaXRobS5cbmZvckVhY2ggPSBmdW5jdGlvbihvYmplY3QsY2FsbGJhY2spe3ZhciBpc0Z1bmN0aW9uPWdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLHByb3BlcnR5LGlzQ29uc3RydWN0b3I7Zm9yKHByb3BlcnR5IGluIG9iamVjdCkge2lmKCEoaXNGdW5jdGlvbiAmJiBwcm9wZXJ0eSA9PSBcInByb3RvdHlwZVwiKSAmJiBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LHByb3BlcnR5KSAmJiAhKGlzQ29uc3RydWN0b3IgPSBwcm9wZXJ0eSA9PT0gXCJjb25zdHJ1Y3RvclwiKSl7Y2FsbGJhY2socHJvcGVydHkpO319IC8vIE1hbnVhbGx5IGludm9rZSB0aGUgY2FsbGJhY2sgZm9yIHRoZSBgY29uc3RydWN0b3JgIHByb3BlcnR5IGR1ZSB0b1xuLy8gY3Jvc3MtZW52aXJvbm1lbnQgaW5jb25zaXN0ZW5jaWVzLlxuaWYoaXNDb25zdHJ1Y3RvciB8fCBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LHByb3BlcnR5ID0gXCJjb25zdHJ1Y3RvclwiKSl7Y2FsbGJhY2socHJvcGVydHkpO319O31yZXR1cm4gZm9yRWFjaChvYmplY3QsY2FsbGJhY2spO307IC8vIFB1YmxpYzogU2VyaWFsaXplcyBhIEphdmFTY3JpcHQgYHZhbHVlYCBhcyBhIEpTT04gc3RyaW5nLiBUaGUgb3B0aW9uYWxcbi8vIGBmaWx0ZXJgIGFyZ3VtZW50IG1heSBzcGVjaWZ5IGVpdGhlciBhIGZ1bmN0aW9uIHRoYXQgYWx0ZXJzIGhvdyBvYmplY3QgYW5kXG4vLyBhcnJheSBtZW1iZXJzIGFyZSBzZXJpYWxpemVkLCBvciBhbiBhcnJheSBvZiBzdHJpbmdzIGFuZCBudW1iZXJzIHRoYXRcbi8vIGluZGljYXRlcyB3aGljaCBwcm9wZXJ0aWVzIHNob3VsZCBiZSBzZXJpYWxpemVkLiBUaGUgb3B0aW9uYWwgYHdpZHRoYFxuLy8gYXJndW1lbnQgbWF5IGJlIGVpdGhlciBhIHN0cmluZyBvciBudW1iZXIgdGhhdCBzcGVjaWZpZXMgdGhlIGluZGVudGF0aW9uXG4vLyBsZXZlbCBvZiB0aGUgb3V0cHV0LlxuaWYoIWhhcyhcImpzb24tc3RyaW5naWZ5XCIpKXsgLy8gSW50ZXJuYWw6IEEgbWFwIG9mIGNvbnRyb2wgY2hhcmFjdGVycyBhbmQgdGhlaXIgZXNjYXBlZCBlcXVpdmFsZW50cy5cbnZhciBFc2NhcGVzPXs5MjpcIlxcXFxcXFxcXCIsMzQ6J1xcXFxcIicsODpcIlxcXFxiXCIsMTI6XCJcXFxcZlwiLDEwOlwiXFxcXG5cIiwxMzpcIlxcXFxyXCIsOTpcIlxcXFx0XCJ9OyAvLyBJbnRlcm5hbDogQ29udmVydHMgYHZhbHVlYCBpbnRvIGEgemVyby1wYWRkZWQgc3RyaW5nIHN1Y2ggdGhhdCBpdHNcbi8vIGxlbmd0aCBpcyBhdCBsZWFzdCBlcXVhbCB0byBgd2lkdGhgLiBUaGUgYHdpZHRoYCBtdXN0IGJlIDw9IDYuXG52YXIgbGVhZGluZ1plcm9lcz1cIjAwMDAwMFwiO3ZhciB0b1BhZGRlZFN0cmluZz1mdW5jdGlvbiB0b1BhZGRlZFN0cmluZyh3aWR0aCx2YWx1ZSl7IC8vIFRoZSBgfHwgMGAgZXhwcmVzc2lvbiBpcyBuZWNlc3NhcnkgdG8gd29yayBhcm91bmQgYSBidWcgaW5cbi8vIE9wZXJhIDw9IDcuNTR1MiB3aGVyZSBgMCA9PSAtMGAsIGJ1dCBgU3RyaW5nKC0wKSAhPT0gXCIwXCJgLlxucmV0dXJuIChsZWFkaW5nWmVyb2VzICsgKHZhbHVlIHx8IDApKS5zbGljZSgtd2lkdGgpO307IC8vIEludGVybmFsOiBEb3VibGUtcXVvdGVzIGEgc3RyaW5nIGB2YWx1ZWAsIHJlcGxhY2luZyBhbGwgQVNDSUkgY29udHJvbFxuLy8gY2hhcmFjdGVycyAoY2hhcmFjdGVycyB3aXRoIGNvZGUgdW5pdCB2YWx1ZXMgYmV0d2VlbiAwIGFuZCAzMSkgd2l0aFxuLy8gdGhlaXIgZXNjYXBlZCBlcXVpdmFsZW50cy4gVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGVcbi8vIGBRdW90ZSh2YWx1ZSlgIG9wZXJhdGlvbiBkZWZpbmVkIGluIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMuXG52YXIgdW5pY29kZVByZWZpeD1cIlxcXFx1MDBcIjt2YXIgcXVvdGU9ZnVuY3Rpb24gcXVvdGUodmFsdWUpe3ZhciByZXN1bHQ9J1wiJyxpbmRleD0wLGxlbmd0aD12YWx1ZS5sZW5ndGgsdXNlQ2hhckluZGV4PSFjaGFySW5kZXhCdWdneSB8fCBsZW5ndGggPiAxMDt2YXIgc3ltYm9scz11c2VDaGFySW5kZXggJiYgKGNoYXJJbmRleEJ1Z2d5P3ZhbHVlLnNwbGl0KFwiXCIpOnZhbHVlKTtmb3IoO2luZGV4IDwgbGVuZ3RoO2luZGV4KyspIHt2YXIgY2hhckNvZGU9dmFsdWUuY2hhckNvZGVBdChpbmRleCk7IC8vIElmIHRoZSBjaGFyYWN0ZXIgaXMgYSBjb250cm9sIGNoYXJhY3RlciwgYXBwZW5kIGl0cyBVbmljb2RlIG9yXG4vLyBzaG9ydGhhbmQgZXNjYXBlIHNlcXVlbmNlOyBvdGhlcndpc2UsIGFwcGVuZCB0aGUgY2hhcmFjdGVyIGFzLWlzLlxuc3dpdGNoKGNoYXJDb2RlKXtjYXNlIDg6Y2FzZSA5OmNhc2UgMTA6Y2FzZSAxMjpjYXNlIDEzOmNhc2UgMzQ6Y2FzZSA5MjpyZXN1bHQgKz0gRXNjYXBlc1tjaGFyQ29kZV07YnJlYWs7ZGVmYXVsdDppZihjaGFyQ29kZSA8IDMyKXtyZXN1bHQgKz0gdW5pY29kZVByZWZpeCArIHRvUGFkZGVkU3RyaW5nKDIsY2hhckNvZGUudG9TdHJpbmcoMTYpKTticmVhazt9cmVzdWx0ICs9IHVzZUNoYXJJbmRleD9zeW1ib2xzW2luZGV4XTp2YWx1ZS5jaGFyQXQoaW5kZXgpO319cmV0dXJuIHJlc3VsdCArICdcIic7fTsgLy8gSW50ZXJuYWw6IFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZXMgYW4gb2JqZWN0LiBJbXBsZW1lbnRzIHRoZVxuLy8gYFN0cihrZXksIGhvbGRlcilgLCBgSk8odmFsdWUpYCwgYW5kIGBKQSh2YWx1ZSlgIG9wZXJhdGlvbnMuXG52YXIgc2VyaWFsaXplPWZ1bmN0aW9uIHNlcmlhbGl6ZShwcm9wZXJ0eSxvYmplY3QsY2FsbGJhY2sscHJvcGVydGllcyx3aGl0ZXNwYWNlLGluZGVudGF0aW9uLHN0YWNrKXt2YXIgdmFsdWUsY2xhc3NOYW1lLHllYXIsbW9udGgsZGF0ZSx0aW1lLGhvdXJzLG1pbnV0ZXMsc2Vjb25kcyxtaWxsaXNlY29uZHMscmVzdWx0cyxlbGVtZW50LGluZGV4LGxlbmd0aCxwcmVmaXgscmVzdWx0O3RyeXsgLy8gTmVjZXNzYXJ5IGZvciBob3N0IG9iamVjdCBzdXBwb3J0LlxudmFsdWUgPSBvYmplY3RbcHJvcGVydHldO31jYXRjaChleGNlcHRpb24pIHt9aWYodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIgJiYgdmFsdWUpe2NsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO2lmKGNsYXNzTmFtZSA9PSBkYXRlQ2xhc3MgJiYgIWlzUHJvcGVydHkuY2FsbCh2YWx1ZSxcInRvSlNPTlwiKSl7aWYodmFsdWUgPiAtMSAvIDAgJiYgdmFsdWUgPCAxIC8gMCl7IC8vIERhdGVzIGFyZSBzZXJpYWxpemVkIGFjY29yZGluZyB0byB0aGUgYERhdGUjdG9KU09OYCBtZXRob2Rcbi8vIHNwZWNpZmllZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS45LjUuNDQuIFNlZSBzZWN0aW9uIDE1LjkuMS4xNVxuLy8gZm9yIHRoZSBJU08gODYwMSBkYXRlIHRpbWUgc3RyaW5nIGZvcm1hdC5cbmlmKGdldERheSl7IC8vIE1hbnVhbGx5IGNvbXB1dGUgdGhlIHllYXIsIG1vbnRoLCBkYXRlLCBob3VycywgbWludXRlcyxcbi8vIHNlY29uZHMsIGFuZCBtaWxsaXNlY29uZHMgaWYgdGhlIGBnZXRVVEMqYCBtZXRob2RzIGFyZVxuLy8gYnVnZ3kuIEFkYXB0ZWQgZnJvbSBAWWFmZmxlJ3MgYGRhdGUtc2hpbWAgcHJvamVjdC5cbmRhdGUgPSBmbG9vcih2YWx1ZSAvIDg2NGU1KTtmb3IoeWVhciA9IGZsb29yKGRhdGUgLyAzNjUuMjQyNSkgKyAxOTcwIC0gMTtnZXREYXkoeWVhciArIDEsMCkgPD0gZGF0ZTt5ZWFyKyspO2Zvcihtb250aCA9IGZsb29yKChkYXRlIC0gZ2V0RGF5KHllYXIsMCkpIC8gMzAuNDIpO2dldERheSh5ZWFyLG1vbnRoICsgMSkgPD0gZGF0ZTttb250aCsrKTtkYXRlID0gMSArIGRhdGUgLSBnZXREYXkoeWVhcixtb250aCk7IC8vIFRoZSBgdGltZWAgdmFsdWUgc3BlY2lmaWVzIHRoZSB0aW1lIHdpdGhpbiB0aGUgZGF5IChzZWUgRVNcbi8vIDUuMSBzZWN0aW9uIDE1LjkuMS4yKS4gVGhlIGZvcm11bGEgYChBICUgQiArIEIpICUgQmAgaXMgdXNlZFxuLy8gdG8gY29tcHV0ZSBgQSBtb2R1bG8gQmAsIGFzIHRoZSBgJWAgb3BlcmF0b3IgZG9lcyBub3Rcbi8vIGNvcnJlc3BvbmQgdG8gdGhlIGBtb2R1bG9gIG9wZXJhdGlvbiBmb3IgbmVnYXRpdmUgbnVtYmVycy5cbnRpbWUgPSAodmFsdWUgJSA4NjRlNSArIDg2NGU1KSAlIDg2NGU1OyAvLyBUaGUgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMsIGFuZCBtaWxsaXNlY29uZHMgYXJlIG9idGFpbmVkIGJ5XG4vLyBkZWNvbXBvc2luZyB0aGUgdGltZSB3aXRoaW4gdGhlIGRheS4gU2VlIHNlY3Rpb24gMTUuOS4xLjEwLlxuaG91cnMgPSBmbG9vcih0aW1lIC8gMzZlNSkgJSAyNDttaW51dGVzID0gZmxvb3IodGltZSAvIDZlNCkgJSA2MDtzZWNvbmRzID0gZmxvb3IodGltZSAvIDFlMykgJSA2MDttaWxsaXNlY29uZHMgPSB0aW1lICUgMWUzO31lbHNlIHt5ZWFyID0gdmFsdWUuZ2V0VVRDRnVsbFllYXIoKTttb250aCA9IHZhbHVlLmdldFVUQ01vbnRoKCk7ZGF0ZSA9IHZhbHVlLmdldFVUQ0RhdGUoKTtob3VycyA9IHZhbHVlLmdldFVUQ0hvdXJzKCk7bWludXRlcyA9IHZhbHVlLmdldFVUQ01pbnV0ZXMoKTtzZWNvbmRzID0gdmFsdWUuZ2V0VVRDU2Vjb25kcygpO21pbGxpc2Vjb25kcyA9IHZhbHVlLmdldFVUQ01pbGxpc2Vjb25kcygpO30gLy8gU2VyaWFsaXplIGV4dGVuZGVkIHllYXJzIGNvcnJlY3RseS5cbnZhbHVlID0gKHllYXIgPD0gMCB8fCB5ZWFyID49IDFlND8oeWVhciA8IDA/XCItXCI6XCIrXCIpICsgdG9QYWRkZWRTdHJpbmcoNix5ZWFyIDwgMD8teWVhcjp5ZWFyKTp0b1BhZGRlZFN0cmluZyg0LHllYXIpKSArIFwiLVwiICsgdG9QYWRkZWRTdHJpbmcoMixtb250aCArIDEpICsgXCItXCIgKyB0b1BhZGRlZFN0cmluZygyLGRhdGUpICsgIC8vIE1vbnRocywgZGF0ZXMsIGhvdXJzLCBtaW51dGVzLCBhbmQgc2Vjb25kcyBzaG91bGQgaGF2ZSB0d29cbi8vIGRpZ2l0czsgbWlsbGlzZWNvbmRzIHNob3VsZCBoYXZlIHRocmVlLlxuXCJUXCIgKyB0b1BhZGRlZFN0cmluZygyLGhvdXJzKSArIFwiOlwiICsgdG9QYWRkZWRTdHJpbmcoMixtaW51dGVzKSArIFwiOlwiICsgdG9QYWRkZWRTdHJpbmcoMixzZWNvbmRzKSArICAvLyBNaWxsaXNlY29uZHMgYXJlIG9wdGlvbmFsIGluIEVTIDUuMCwgYnV0IHJlcXVpcmVkIGluIDUuMS5cblwiLlwiICsgdG9QYWRkZWRTdHJpbmcoMyxtaWxsaXNlY29uZHMpICsgXCJaXCI7fWVsc2Uge3ZhbHVlID0gbnVsbDt9fWVsc2UgaWYodHlwZW9mIHZhbHVlLnRvSlNPTiA9PSBcImZ1bmN0aW9uXCIgJiYgKGNsYXNzTmFtZSAhPSBudW1iZXJDbGFzcyAmJiBjbGFzc05hbWUgIT0gc3RyaW5nQ2xhc3MgJiYgY2xhc3NOYW1lICE9IGFycmF5Q2xhc3MgfHwgaXNQcm9wZXJ0eS5jYWxsKHZhbHVlLFwidG9KU09OXCIpKSl7IC8vIFByb3RvdHlwZSA8PSAxLjYuMSBhZGRzIG5vbi1zdGFuZGFyZCBgdG9KU09OYCBtZXRob2RzIHRvIHRoZVxuLy8gYE51bWJlcmAsIGBTdHJpbmdgLCBgRGF0ZWAsIGFuZCBgQXJyYXlgIHByb3RvdHlwZXMuIEpTT04gM1xuLy8gaWdub3JlcyBhbGwgYHRvSlNPTmAgbWV0aG9kcyBvbiB0aGVzZSBvYmplY3RzIHVubGVzcyB0aGV5IGFyZVxuLy8gZGVmaW5lZCBkaXJlY3RseSBvbiBhbiBpbnN0YW5jZS5cbnZhbHVlID0gdmFsdWUudG9KU09OKHByb3BlcnR5KTt9fWlmKGNhbGxiYWNrKXsgLy8gSWYgYSByZXBsYWNlbWVudCBmdW5jdGlvbiB3YXMgcHJvdmlkZWQsIGNhbGwgaXQgdG8gb2J0YWluIHRoZSB2YWx1ZVxuLy8gZm9yIHNlcmlhbGl6YXRpb24uXG52YWx1ZSA9IGNhbGxiYWNrLmNhbGwob2JqZWN0LHByb3BlcnR5LHZhbHVlKTt9aWYodmFsdWUgPT09IG51bGwpe3JldHVybiBcIm51bGxcIjt9Y2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbCh2YWx1ZSk7aWYoY2xhc3NOYW1lID09IGJvb2xlYW5DbGFzcyl7IC8vIEJvb2xlYW5zIGFyZSByZXByZXNlbnRlZCBsaXRlcmFsbHkuXG5yZXR1cm4gXCJcIiArIHZhbHVlO31lbHNlIGlmKGNsYXNzTmFtZSA9PSBudW1iZXJDbGFzcyl7IC8vIEpTT04gbnVtYmVycyBtdXN0IGJlIGZpbml0ZS4gYEluZmluaXR5YCBhbmQgYE5hTmAgYXJlIHNlcmlhbGl6ZWQgYXNcbi8vIGBcIm51bGxcImAuXG5yZXR1cm4gdmFsdWUgPiAtMSAvIDAgJiYgdmFsdWUgPCAxIC8gMD9cIlwiICsgdmFsdWU6XCJudWxsXCI7fWVsc2UgaWYoY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzKXsgLy8gU3RyaW5ncyBhcmUgZG91YmxlLXF1b3RlZCBhbmQgZXNjYXBlZC5cbnJldHVybiBxdW90ZShcIlwiICsgdmFsdWUpO30gLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIG9iamVjdHMgYW5kIGFycmF5cy5cbmlmKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiKXsgLy8gQ2hlY2sgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGlzIGlzIGEgbGluZWFyIHNlYXJjaDsgcGVyZm9ybWFuY2Vcbi8vIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZiB1bmlxdWUgbmVzdGVkIG9iamVjdHMuXG5mb3IobGVuZ3RoID0gc3RhY2subGVuZ3RoO2xlbmd0aC0tOykge2lmKHN0YWNrW2xlbmd0aF0gPT09IHZhbHVlKXsgLy8gQ3ljbGljIHN0cnVjdHVyZXMgY2Fubm90IGJlIHNlcmlhbGl6ZWQgYnkgYEpTT04uc3RyaW5naWZ5YC5cbnRocm93IFR5cGVFcnJvcigpO319IC8vIEFkZCB0aGUgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbnN0YWNrLnB1c2godmFsdWUpO3Jlc3VsdHMgPSBbXTsgLy8gU2F2ZSB0aGUgY3VycmVudCBpbmRlbnRhdGlvbiBsZXZlbCBhbmQgaW5kZW50IG9uZSBhZGRpdGlvbmFsIGxldmVsLlxucHJlZml4ID0gaW5kZW50YXRpb247aW5kZW50YXRpb24gKz0gd2hpdGVzcGFjZTtpZihjbGFzc05hbWUgPT0gYXJyYXlDbGFzcyl7IC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBhcnJheSBlbGVtZW50cy5cbmZvcihpbmRleCA9IDAsbGVuZ3RoID0gdmFsdWUubGVuZ3RoO2luZGV4IDwgbGVuZ3RoO2luZGV4KyspIHtlbGVtZW50ID0gc2VyaWFsaXplKGluZGV4LHZhbHVlLGNhbGxiYWNrLHByb3BlcnRpZXMsd2hpdGVzcGFjZSxpbmRlbnRhdGlvbixzdGFjayk7cmVzdWx0cy5wdXNoKGVsZW1lbnQgPT09IHVuZGVmP1wibnVsbFwiOmVsZW1lbnQpO31yZXN1bHQgPSByZXN1bHRzLmxlbmd0aD93aGl0ZXNwYWNlP1wiW1xcblwiICsgaW5kZW50YXRpb24gKyByZXN1bHRzLmpvaW4oXCIsXFxuXCIgKyBpbmRlbnRhdGlvbikgKyBcIlxcblwiICsgcHJlZml4ICsgXCJdXCI6XCJbXCIgKyByZXN1bHRzLmpvaW4oXCIsXCIpICsgXCJdXCI6XCJbXVwiO31lbHNlIHsgLy8gUmVjdXJzaXZlbHkgc2VyaWFsaXplIG9iamVjdCBtZW1iZXJzLiBNZW1iZXJzIGFyZSBzZWxlY3RlZCBmcm9tXG4vLyBlaXRoZXIgYSB1c2VyLXNwZWNpZmllZCBsaXN0IG9mIHByb3BlcnR5IG5hbWVzLCBvciB0aGUgb2JqZWN0XG4vLyBpdHNlbGYuXG5mb3JFYWNoKHByb3BlcnRpZXMgfHwgdmFsdWUsZnVuY3Rpb24ocHJvcGVydHkpe3ZhciBlbGVtZW50PXNlcmlhbGl6ZShwcm9wZXJ0eSx2YWx1ZSxjYWxsYmFjayxwcm9wZXJ0aWVzLHdoaXRlc3BhY2UsaW5kZW50YXRpb24sc3RhY2spO2lmKGVsZW1lbnQgIT09IHVuZGVmKXsgLy8gQWNjb3JkaW5nIHRvIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjM6IFwiSWYgYGdhcGAge3doaXRlc3BhY2V9XG4vLyBpcyBub3QgdGhlIGVtcHR5IHN0cmluZywgbGV0IGBtZW1iZXJgIHtxdW90ZShwcm9wZXJ0eSkgKyBcIjpcIn1cbi8vIGJlIHRoZSBjb25jYXRlbmF0aW9uIG9mIGBtZW1iZXJgIGFuZCB0aGUgYHNwYWNlYCBjaGFyYWN0ZXIuXCJcbi8vIFRoZSBcImBzcGFjZWAgY2hhcmFjdGVyXCIgcmVmZXJzIHRvIHRoZSBsaXRlcmFsIHNwYWNlXG4vLyBjaGFyYWN0ZXIsIG5vdCB0aGUgYHNwYWNlYCB7d2lkdGh9IGFyZ3VtZW50IHByb3ZpZGVkIHRvXG4vLyBgSlNPTi5zdHJpbmdpZnlgLlxucmVzdWx0cy5wdXNoKHF1b3RlKHByb3BlcnR5KSArIFwiOlwiICsgKHdoaXRlc3BhY2U/XCIgXCI6XCJcIikgKyBlbGVtZW50KTt9fSk7cmVzdWx0ID0gcmVzdWx0cy5sZW5ndGg/d2hpdGVzcGFjZT9cIntcXG5cIiArIGluZGVudGF0aW9uICsgcmVzdWx0cy5qb2luKFwiLFxcblwiICsgaW5kZW50YXRpb24pICsgXCJcXG5cIiArIHByZWZpeCArIFwifVwiOlwie1wiICsgcmVzdWx0cy5qb2luKFwiLFwiKSArIFwifVwiOlwie31cIjt9IC8vIFJlbW92ZSB0aGUgb2JqZWN0IGZyb20gdGhlIHRyYXZlcnNlZCBvYmplY3Qgc3RhY2suXG5zdGFjay5wb3AoKTtyZXR1cm4gcmVzdWx0O319OyAvLyBQdWJsaWM6IGBKU09OLnN0cmluZ2lmeWAuIFNlZSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLlxuZXhwb3J0cy5zdHJpbmdpZnkgPSBmdW5jdGlvbihzb3VyY2UsZmlsdGVyLHdpZHRoKXt2YXIgd2hpdGVzcGFjZSxjYWxsYmFjayxwcm9wZXJ0aWVzLGNsYXNzTmFtZTtpZihvYmplY3RUeXBlc1t0eXBlb2YgZmlsdGVyXSAmJiBmaWx0ZXIpe2lmKChjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKGZpbHRlcikpID09IGZ1bmN0aW9uQ2xhc3Mpe2NhbGxiYWNrID0gZmlsdGVyO31lbHNlIGlmKGNsYXNzTmFtZSA9PSBhcnJheUNsYXNzKXsgLy8gQ29udmVydCB0aGUgcHJvcGVydHkgbmFtZXMgYXJyYXkgaW50byBhIG1ha2VzaGlmdCBzZXQuXG5wcm9wZXJ0aWVzID0ge307Zm9yKHZhciBpbmRleD0wLGxlbmd0aD1maWx0ZXIubGVuZ3RoLHZhbHVlO2luZGV4IDwgbGVuZ3RoO3ZhbHVlID0gZmlsdGVyW2luZGV4KytdLChjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHZhbHVlKSxjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3MgfHwgY2xhc3NOYW1lID09IG51bWJlckNsYXNzKSAmJiAocHJvcGVydGllc1t2YWx1ZV0gPSAxKSk7fX1pZih3aWR0aCl7aWYoKGNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwod2lkdGgpKSA9PSBudW1iZXJDbGFzcyl7IC8vIENvbnZlcnQgdGhlIGB3aWR0aGAgdG8gYW4gaW50ZWdlciBhbmQgY3JlYXRlIGEgc3RyaW5nIGNvbnRhaW5pbmdcbi8vIGB3aWR0aGAgbnVtYmVyIG9mIHNwYWNlIGNoYXJhY3RlcnMuXG5pZigod2lkdGggLT0gd2lkdGggJSAxKSA+IDApe2Zvcih3aGl0ZXNwYWNlID0gXCJcIix3aWR0aCA+IDEwICYmICh3aWR0aCA9IDEwKTt3aGl0ZXNwYWNlLmxlbmd0aCA8IHdpZHRoO3doaXRlc3BhY2UgKz0gXCIgXCIpO319ZWxzZSBpZihjbGFzc05hbWUgPT0gc3RyaW5nQ2xhc3Mpe3doaXRlc3BhY2UgPSB3aWR0aC5sZW5ndGggPD0gMTA/d2lkdGg6d2lkdGguc2xpY2UoMCwxMCk7fX0gLy8gT3BlcmEgPD0gNy41NHUyIGRpc2NhcmRzIHRoZSB2YWx1ZXMgYXNzb2NpYXRlZCB3aXRoIGVtcHR5IHN0cmluZyBrZXlzXG4vLyAoYFwiXCJgKSBvbmx5IGlmIHRoZXkgYXJlIHVzZWQgZGlyZWN0bHkgd2l0aGluIGFuIG9iamVjdCBtZW1iZXIgbGlzdFxuLy8gKGUuZy4sIGAhKFwiXCIgaW4geyBcIlwiOiAxfSlgKS5cbnJldHVybiBzZXJpYWxpemUoXCJcIiwodmFsdWUgPSB7fSx2YWx1ZVtcIlwiXSA9IHNvdXJjZSx2YWx1ZSksY2FsbGJhY2sscHJvcGVydGllcyx3aGl0ZXNwYWNlLFwiXCIsW10pO307fSAvLyBQdWJsaWM6IFBhcnNlcyBhIEpTT04gc291cmNlIHN0cmluZy5cbmlmKCFoYXMoXCJqc29uLXBhcnNlXCIpKXt2YXIgZnJvbUNoYXJDb2RlPVN0cmluZy5mcm9tQ2hhckNvZGU7IC8vIEludGVybmFsOiBBIG1hcCBvZiBlc2NhcGVkIGNvbnRyb2wgY2hhcmFjdGVycyBhbmQgdGhlaXIgdW5lc2NhcGVkXG4vLyBlcXVpdmFsZW50cy5cbnZhciBVbmVzY2FwZXM9ezkyOlwiXFxcXFwiLDM0OidcIicsNDc6XCIvXCIsOTg6XCJcXGJcIiwxMTY6XCJcXHRcIiwxMTA6XCJcXG5cIiwxMDI6XCJcXGZcIiwxMTQ6XCJcXHJcIn07IC8vIEludGVybmFsOiBTdG9yZXMgdGhlIHBhcnNlciBzdGF0ZS5cbnZhciBJbmRleCxTb3VyY2U7IC8vIEludGVybmFsOiBSZXNldHMgdGhlIHBhcnNlciBzdGF0ZSBhbmQgdGhyb3dzIGEgYFN5bnRheEVycm9yYC5cbnZhciBhYm9ydD1mdW5jdGlvbiBhYm9ydCgpe0luZGV4ID0gU291cmNlID0gbnVsbDt0aHJvdyBTeW50YXhFcnJvcigpO307IC8vIEludGVybmFsOiBSZXR1cm5zIHRoZSBuZXh0IHRva2VuLCBvciBgXCIkXCJgIGlmIHRoZSBwYXJzZXIgaGFzIHJlYWNoZWRcbi8vIHRoZSBlbmQgb2YgdGhlIHNvdXJjZSBzdHJpbmcuIEEgdG9rZW4gbWF5IGJlIGEgc3RyaW5nLCBudW1iZXIsIGBudWxsYFxuLy8gbGl0ZXJhbCwgb3IgQm9vbGVhbiBsaXRlcmFsLlxudmFyIGxleD1mdW5jdGlvbiBsZXgoKXt2YXIgc291cmNlPVNvdXJjZSxsZW5ndGg9c291cmNlLmxlbmd0aCx2YWx1ZSxiZWdpbixwb3NpdGlvbixpc1NpZ25lZCxjaGFyQ29kZTt3aGlsZShJbmRleCA8IGxlbmd0aCkge2NoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO3N3aXRjaChjaGFyQ29kZSl7Y2FzZSA5OmNhc2UgMTA6Y2FzZSAxMzpjYXNlIDMyOiAvLyBTa2lwIHdoaXRlc3BhY2UgdG9rZW5zLCBpbmNsdWRpbmcgdGFicywgY2FycmlhZ2UgcmV0dXJucywgbGluZVxuLy8gZmVlZHMsIGFuZCBzcGFjZSBjaGFyYWN0ZXJzLlxuSW5kZXgrKzticmVhaztjYXNlIDEyMzpjYXNlIDEyNTpjYXNlIDkxOmNhc2UgOTM6Y2FzZSA1ODpjYXNlIDQ0OiAvLyBQYXJzZSBhIHB1bmN0dWF0b3IgdG9rZW4gKGB7YCwgYH1gLCBgW2AsIGBdYCwgYDpgLCBvciBgLGApIGF0XG4vLyB0aGUgY3VycmVudCBwb3NpdGlvbi5cbnZhbHVlID0gY2hhckluZGV4QnVnZ3k/c291cmNlLmNoYXJBdChJbmRleCk6c291cmNlW0luZGV4XTtJbmRleCsrO3JldHVybiB2YWx1ZTtjYXNlIDM0OiAvLyBgXCJgIGRlbGltaXRzIGEgSlNPTiBzdHJpbmc7IGFkdmFuY2UgdG8gdGhlIG5leHQgY2hhcmFjdGVyIGFuZFxuLy8gYmVnaW4gcGFyc2luZyB0aGUgc3RyaW5nLiBTdHJpbmcgdG9rZW5zIGFyZSBwcmVmaXhlZCB3aXRoIHRoZVxuLy8gc2VudGluZWwgYEBgIGNoYXJhY3RlciB0byBkaXN0aW5ndWlzaCB0aGVtIGZyb20gcHVuY3R1YXRvcnMgYW5kXG4vLyBlbmQtb2Ytc3RyaW5nIHRva2Vucy5cbmZvcih2YWx1ZSA9IFwiQFwiLEluZGV4Kys7SW5kZXggPCBsZW5ndGg7KSB7Y2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7aWYoY2hhckNvZGUgPCAzMil7IC8vIFVuZXNjYXBlZCBBU0NJSSBjb250cm9sIGNoYXJhY3RlcnMgKHRob3NlIHdpdGggYSBjb2RlIHVuaXRcbi8vIGxlc3MgdGhhbiB0aGUgc3BhY2UgY2hhcmFjdGVyKSBhcmUgbm90IHBlcm1pdHRlZC5cbmFib3J0KCk7fWVsc2UgaWYoY2hhckNvZGUgPT0gOTIpeyAvLyBBIHJldmVyc2Ugc29saWR1cyAoYFxcYCkgbWFya3MgdGhlIGJlZ2lubmluZyBvZiBhbiBlc2NhcGVkXG4vLyBjb250cm9sIGNoYXJhY3RlciAoaW5jbHVkaW5nIGBcImAsIGBcXGAsIGFuZCBgL2ApIG9yIFVuaWNvZGVcbi8vIGVzY2FwZSBzZXF1ZW5jZS5cbmNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7c3dpdGNoKGNoYXJDb2RlKXtjYXNlIDkyOmNhc2UgMzQ6Y2FzZSA0NzpjYXNlIDk4OmNhc2UgMTE2OmNhc2UgMTEwOmNhc2UgMTAyOmNhc2UgMTE0OiAvLyBSZXZpdmUgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMuXG52YWx1ZSArPSBVbmVzY2FwZXNbY2hhckNvZGVdO0luZGV4Kys7YnJlYWs7Y2FzZSAxMTc6IC8vIGBcXHVgIG1hcmtzIHRoZSBiZWdpbm5pbmcgb2YgYSBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZS5cbi8vIEFkdmFuY2UgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBhbmQgdmFsaWRhdGUgdGhlXG4vLyBmb3VyLWRpZ2l0IGNvZGUgcG9pbnQuXG5iZWdpbiA9ICsrSW5kZXg7Zm9yKHBvc2l0aW9uID0gSW5kZXggKyA0O0luZGV4IDwgcG9zaXRpb247SW5kZXgrKykge2NoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpOyAvLyBBIHZhbGlkIHNlcXVlbmNlIGNvbXByaXNlcyBmb3VyIGhleGRpZ2l0cyAoY2FzZS1cbi8vIGluc2Vuc2l0aXZlKSB0aGF0IGZvcm0gYSBzaW5nbGUgaGV4YWRlY2ltYWwgdmFsdWUuXG5pZighKGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3IHx8IGNoYXJDb2RlID49IDk3ICYmIGNoYXJDb2RlIDw9IDEwMiB8fCBjaGFyQ29kZSA+PSA2NSAmJiBjaGFyQ29kZSA8PSA3MCkpeyAvLyBJbnZhbGlkIFVuaWNvZGUgZXNjYXBlIHNlcXVlbmNlLlxuYWJvcnQoKTt9fSAvLyBSZXZpdmUgdGhlIGVzY2FwZWQgY2hhcmFjdGVyLlxudmFsdWUgKz0gZnJvbUNoYXJDb2RlKFwiMHhcIiArIHNvdXJjZS5zbGljZShiZWdpbixJbmRleCkpO2JyZWFrO2RlZmF1bHQ6IC8vIEludmFsaWQgZXNjYXBlIHNlcXVlbmNlLlxuYWJvcnQoKTt9fWVsc2Uge2lmKGNoYXJDb2RlID09IDM0KXsgLy8gQW4gdW5lc2NhcGVkIGRvdWJsZS1xdW90ZSBjaGFyYWN0ZXIgbWFya3MgdGhlIGVuZCBvZiB0aGVcbi8vIHN0cmluZy5cbmJyZWFrO31jaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtiZWdpbiA9IEluZGV4OyAvLyBPcHRpbWl6ZSBmb3IgdGhlIGNvbW1vbiBjYXNlIHdoZXJlIGEgc3RyaW5nIGlzIHZhbGlkLlxud2hpbGUoY2hhckNvZGUgPj0gMzIgJiYgY2hhckNvZGUgIT0gOTIgJiYgY2hhckNvZGUgIT0gMzQpIHtjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO30gLy8gQXBwZW5kIHRoZSBzdHJpbmcgYXMtaXMuXG52YWx1ZSArPSBzb3VyY2Uuc2xpY2UoYmVnaW4sSW5kZXgpO319aWYoc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpID09IDM0KXsgLy8gQWR2YW5jZSB0byB0aGUgbmV4dCBjaGFyYWN0ZXIgYW5kIHJldHVybiB0aGUgcmV2aXZlZCBzdHJpbmcuXG5JbmRleCsrO3JldHVybiB2YWx1ZTt9IC8vIFVudGVybWluYXRlZCBzdHJpbmcuXG5hYm9ydCgpO2RlZmF1bHQ6IC8vIFBhcnNlIG51bWJlcnMgYW5kIGxpdGVyYWxzLlxuYmVnaW4gPSBJbmRleDsgLy8gQWR2YW5jZSBwYXN0IHRoZSBuZWdhdGl2ZSBzaWduLCBpZiBvbmUgaXMgc3BlY2lmaWVkLlxuaWYoY2hhckNvZGUgPT0gNDUpe2lzU2lnbmVkID0gdHJ1ZTtjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO30gLy8gUGFyc2UgYW4gaW50ZWdlciBvciBmbG9hdGluZy1wb2ludCB2YWx1ZS5cbmlmKGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KXsgLy8gTGVhZGluZyB6ZXJvZXMgYXJlIGludGVycHJldGVkIGFzIG9jdGFsIGxpdGVyYWxzLlxuaWYoY2hhckNvZGUgPT0gNDggJiYgKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXggKyAxKSxjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1NykpeyAvLyBJbGxlZ2FsIG9jdGFsIGxpdGVyYWwuXG5hYm9ydCgpO31pc1NpZ25lZCA9IGZhbHNlOyAvLyBQYXJzZSB0aGUgaW50ZWdlciBjb21wb25lbnQuXG5mb3IoO0luZGV4IDwgbGVuZ3RoICYmIChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSxjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nyk7SW5kZXgrKyk7IC8vIEZsb2F0cyBjYW5ub3QgY29udGFpbiBhIGxlYWRpbmcgZGVjaW1hbCBwb2ludDsgaG93ZXZlciwgdGhpc1xuLy8gY2FzZSBpcyBhbHJlYWR5IGFjY291bnRlZCBmb3IgYnkgdGhlIHBhcnNlci5cbmlmKHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSA9PSA0Nil7cG9zaXRpb24gPSArK0luZGV4OyAvLyBQYXJzZSB0aGUgZGVjaW1hbCBjb21wb25lbnQuXG5mb3IoO3Bvc2l0aW9uIDwgbGVuZ3RoICYmIChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KHBvc2l0aW9uKSxjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nyk7cG9zaXRpb24rKyk7aWYocG9zaXRpb24gPT0gSW5kZXgpeyAvLyBJbGxlZ2FsIHRyYWlsaW5nIGRlY2ltYWwuXG5hYm9ydCgpO31JbmRleCA9IHBvc2l0aW9uO30gLy8gUGFyc2UgZXhwb25lbnRzLiBUaGUgYGVgIGRlbm90aW5nIHRoZSBleHBvbmVudCBpc1xuLy8gY2FzZS1pbnNlbnNpdGl2ZS5cbmNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO2lmKGNoYXJDb2RlID09IDEwMSB8fCBjaGFyQ29kZSA9PSA2OSl7Y2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTsgLy8gU2tpcCBwYXN0IHRoZSBzaWduIGZvbGxvd2luZyB0aGUgZXhwb25lbnQsIGlmIG9uZSBpc1xuLy8gc3BlY2lmaWVkLlxuaWYoY2hhckNvZGUgPT0gNDMgfHwgY2hhckNvZGUgPT0gNDUpe0luZGV4Kys7fSAvLyBQYXJzZSB0aGUgZXhwb25lbnRpYWwgY29tcG9uZW50LlxuZm9yKHBvc2l0aW9uID0gSW5kZXg7cG9zaXRpb24gPCBsZW5ndGggJiYgKGNoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQocG9zaXRpb24pLGNoYXJDb2RlID49IDQ4ICYmIGNoYXJDb2RlIDw9IDU3KTtwb3NpdGlvbisrKTtpZihwb3NpdGlvbiA9PSBJbmRleCl7IC8vIElsbGVnYWwgZW1wdHkgZXhwb25lbnQuXG5hYm9ydCgpO31JbmRleCA9IHBvc2l0aW9uO30gLy8gQ29lcmNlIHRoZSBwYXJzZWQgdmFsdWUgdG8gYSBKYXZhU2NyaXB0IG51bWJlci5cbnJldHVybiArc291cmNlLnNsaWNlKGJlZ2luLEluZGV4KTt9IC8vIEEgbmVnYXRpdmUgc2lnbiBtYXkgb25seSBwcmVjZWRlIG51bWJlcnMuXG5pZihpc1NpZ25lZCl7YWJvcnQoKTt9IC8vIGB0cnVlYCwgYGZhbHNlYCwgYW5kIGBudWxsYCBsaXRlcmFscy5cbmlmKHNvdXJjZS5zbGljZShJbmRleCxJbmRleCArIDQpID09IFwidHJ1ZVwiKXtJbmRleCArPSA0O3JldHVybiB0cnVlO31lbHNlIGlmKHNvdXJjZS5zbGljZShJbmRleCxJbmRleCArIDUpID09IFwiZmFsc2VcIil7SW5kZXggKz0gNTtyZXR1cm4gZmFsc2U7fWVsc2UgaWYoc291cmNlLnNsaWNlKEluZGV4LEluZGV4ICsgNCkgPT0gXCJudWxsXCIpe0luZGV4ICs9IDQ7cmV0dXJuIG51bGw7fSAvLyBVbnJlY29nbml6ZWQgdG9rZW4uXG5hYm9ydCgpO319IC8vIFJldHVybiB0aGUgc2VudGluZWwgYCRgIGNoYXJhY3RlciBpZiB0aGUgcGFyc2VyIGhhcyByZWFjaGVkIHRoZSBlbmRcbi8vIG9mIHRoZSBzb3VyY2Ugc3RyaW5nLlxucmV0dXJuIFwiJFwiO307IC8vIEludGVybmFsOiBQYXJzZXMgYSBKU09OIGB2YWx1ZWAgdG9rZW4uXG52YXIgZ2V0PWZ1bmN0aW9uIGdldCh2YWx1ZSl7dmFyIHJlc3VsdHMsaGFzTWVtYmVycztpZih2YWx1ZSA9PSBcIiRcIil7IC8vIFVuZXhwZWN0ZWQgZW5kIG9mIGlucHV0LlxuYWJvcnQoKTt9aWYodHlwZW9mIHZhbHVlID09IFwic3RyaW5nXCIpe2lmKChjaGFySW5kZXhCdWdneT92YWx1ZS5jaGFyQXQoMCk6dmFsdWVbMF0pID09IFwiQFwiKXsgLy8gUmVtb3ZlIHRoZSBzZW50aW5lbCBgQGAgY2hhcmFjdGVyLlxucmV0dXJuIHZhbHVlLnNsaWNlKDEpO30gLy8gUGFyc2Ugb2JqZWN0IGFuZCBhcnJheSBsaXRlcmFscy5cbmlmKHZhbHVlID09IFwiW1wiKXsgLy8gUGFyc2VzIGEgSlNPTiBhcnJheSwgcmV0dXJuaW5nIGEgbmV3IEphdmFTY3JpcHQgYXJyYXkuXG5yZXN1bHRzID0gW107Zm9yKDs7aGFzTWVtYmVycyB8fCAoaGFzTWVtYmVycyA9IHRydWUpKSB7dmFsdWUgPSBsZXgoKTsgLy8gQSBjbG9zaW5nIHNxdWFyZSBicmFja2V0IG1hcmtzIHRoZSBlbmQgb2YgdGhlIGFycmF5IGxpdGVyYWwuXG5pZih2YWx1ZSA9PSBcIl1cIil7YnJlYWs7fSAvLyBJZiB0aGUgYXJyYXkgbGl0ZXJhbCBjb250YWlucyBlbGVtZW50cywgdGhlIGN1cnJlbnQgdG9rZW5cbi8vIHNob3VsZCBiZSBhIGNvbW1hIHNlcGFyYXRpbmcgdGhlIHByZXZpb3VzIGVsZW1lbnQgZnJvbSB0aGVcbi8vIG5leHQuXG5pZihoYXNNZW1iZXJzKXtpZih2YWx1ZSA9PSBcIixcIil7dmFsdWUgPSBsZXgoKTtpZih2YWx1ZSA9PSBcIl1cIil7IC8vIFVuZXhwZWN0ZWQgdHJhaWxpbmcgYCxgIGluIGFycmF5IGxpdGVyYWwuXG5hYm9ydCgpO319ZWxzZSB7IC8vIEEgYCxgIG11c3Qgc2VwYXJhdGUgZWFjaCBhcnJheSBlbGVtZW50LlxuYWJvcnQoKTt9fSAvLyBFbGlzaW9ucyBhbmQgbGVhZGluZyBjb21tYXMgYXJlIG5vdCBwZXJtaXR0ZWQuXG5pZih2YWx1ZSA9PSBcIixcIil7YWJvcnQoKTt9cmVzdWx0cy5wdXNoKGdldCh2YWx1ZSkpO31yZXR1cm4gcmVzdWx0czt9ZWxzZSBpZih2YWx1ZSA9PSBcIntcIil7IC8vIFBhcnNlcyBhIEpTT04gb2JqZWN0LCByZXR1cm5pbmcgYSBuZXcgSmF2YVNjcmlwdCBvYmplY3QuXG5yZXN1bHRzID0ge307Zm9yKDs7aGFzTWVtYmVycyB8fCAoaGFzTWVtYmVycyA9IHRydWUpKSB7dmFsdWUgPSBsZXgoKTsgLy8gQSBjbG9zaW5nIGN1cmx5IGJyYWNlIG1hcmtzIHRoZSBlbmQgb2YgdGhlIG9iamVjdCBsaXRlcmFsLlxuaWYodmFsdWUgPT0gXCJ9XCIpe2JyZWFrO30gLy8gSWYgdGhlIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5zIG1lbWJlcnMsIHRoZSBjdXJyZW50IHRva2VuXG4vLyBzaG91bGQgYmUgYSBjb21tYSBzZXBhcmF0b3IuXG5pZihoYXNNZW1iZXJzKXtpZih2YWx1ZSA9PSBcIixcIil7dmFsdWUgPSBsZXgoKTtpZih2YWx1ZSA9PSBcIn1cIil7IC8vIFVuZXhwZWN0ZWQgdHJhaWxpbmcgYCxgIGluIG9iamVjdCBsaXRlcmFsLlxuYWJvcnQoKTt9fWVsc2UgeyAvLyBBIGAsYCBtdXN0IHNlcGFyYXRlIGVhY2ggb2JqZWN0IG1lbWJlci5cbmFib3J0KCk7fX0gLy8gTGVhZGluZyBjb21tYXMgYXJlIG5vdCBwZXJtaXR0ZWQsIG9iamVjdCBwcm9wZXJ0eSBuYW1lcyBtdXN0IGJlXG4vLyBkb3VibGUtcXVvdGVkIHN0cmluZ3MsIGFuZCBhIGA6YCBtdXN0IHNlcGFyYXRlIGVhY2ggcHJvcGVydHlcbi8vIG5hbWUgYW5kIHZhbHVlLlxuaWYodmFsdWUgPT0gXCIsXCIgfHwgdHlwZW9mIHZhbHVlICE9IFwic3RyaW5nXCIgfHwgKGNoYXJJbmRleEJ1Z2d5P3ZhbHVlLmNoYXJBdCgwKTp2YWx1ZVswXSkgIT0gXCJAXCIgfHwgbGV4KCkgIT0gXCI6XCIpe2Fib3J0KCk7fXJlc3VsdHNbdmFsdWUuc2xpY2UoMSldID0gZ2V0KGxleCgpKTt9cmV0dXJuIHJlc3VsdHM7fSAvLyBVbmV4cGVjdGVkIHRva2VuIGVuY291bnRlcmVkLlxuYWJvcnQoKTt9cmV0dXJuIHZhbHVlO307IC8vIEludGVybmFsOiBVcGRhdGVzIGEgdHJhdmVyc2VkIG9iamVjdCBtZW1iZXIuXG52YXIgdXBkYXRlPWZ1bmN0aW9uIHVwZGF0ZShzb3VyY2UscHJvcGVydHksY2FsbGJhY2spe3ZhciBlbGVtZW50PXdhbGsoc291cmNlLHByb3BlcnR5LGNhbGxiYWNrKTtpZihlbGVtZW50ID09PSB1bmRlZil7ZGVsZXRlIHNvdXJjZVtwcm9wZXJ0eV07fWVsc2Uge3NvdXJjZVtwcm9wZXJ0eV0gPSBlbGVtZW50O319OyAvLyBJbnRlcm5hbDogUmVjdXJzaXZlbHkgdHJhdmVyc2VzIGEgcGFyc2VkIEpTT04gb2JqZWN0LCBpbnZva2luZyB0aGVcbi8vIGBjYWxsYmFja2AgZnVuY3Rpb24gZm9yIGVhY2ggdmFsdWUuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4vLyBgV2Fsayhob2xkZXIsIG5hbWUpYCBvcGVyYXRpb24gZGVmaW5lZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS4xMi4yLlxudmFyIHdhbGs9ZnVuY3Rpb24gd2Fsayhzb3VyY2UscHJvcGVydHksY2FsbGJhY2spe3ZhciB2YWx1ZT1zb3VyY2VbcHJvcGVydHldLGxlbmd0aDtpZih0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZSl7IC8vIGBmb3JFYWNoYCBjYW4ndCBiZSB1c2VkIHRvIHRyYXZlcnNlIGFuIGFycmF5IGluIE9wZXJhIDw9IDguNTRcbi8vIGJlY2F1c2UgaXRzIGBPYmplY3QjaGFzT3duUHJvcGVydHlgIGltcGxlbWVudGF0aW9uIHJldHVybnMgYGZhbHNlYFxuLy8gZm9yIGFycmF5IGluZGljZXMgKGUuZy4sIGAhWzEsIDIsIDNdLmhhc093blByb3BlcnR5KFwiMFwiKWApLlxuaWYoZ2V0Q2xhc3MuY2FsbCh2YWx1ZSkgPT0gYXJyYXlDbGFzcyl7Zm9yKGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtsZW5ndGgtLTspIHt1cGRhdGUodmFsdWUsbGVuZ3RoLGNhbGxiYWNrKTt9fWVsc2Uge2ZvckVhY2godmFsdWUsZnVuY3Rpb24ocHJvcGVydHkpe3VwZGF0ZSh2YWx1ZSxwcm9wZXJ0eSxjYWxsYmFjayk7fSk7fX1yZXR1cm4gY2FsbGJhY2suY2FsbChzb3VyY2UscHJvcGVydHksdmFsdWUpO307IC8vIFB1YmxpYzogYEpTT04ucGFyc2VgLiBTZWUgRVMgNS4xIHNlY3Rpb24gMTUuMTIuMi5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihzb3VyY2UsY2FsbGJhY2spe3ZhciByZXN1bHQsdmFsdWU7SW5kZXggPSAwO1NvdXJjZSA9IFwiXCIgKyBzb3VyY2U7cmVzdWx0ID0gZ2V0KGxleCgpKTsgLy8gSWYgYSBKU09OIHN0cmluZyBjb250YWlucyBtdWx0aXBsZSB0b2tlbnMsIGl0IGlzIGludmFsaWQuXG5pZihsZXgoKSAhPSBcIiRcIil7YWJvcnQoKTt9IC8vIFJlc2V0IHRoZSBwYXJzZXIgc3RhdGUuXG5JbmRleCA9IFNvdXJjZSA9IG51bGw7cmV0dXJuIGNhbGxiYWNrICYmIGdldENsYXNzLmNhbGwoY2FsbGJhY2spID09IGZ1bmN0aW9uQ2xhc3M/d2FsaygodmFsdWUgPSB7fSx2YWx1ZVtcIlwiXSA9IHJlc3VsdCx2YWx1ZSksXCJcIixjYWxsYmFjayk6cmVzdWx0O307fX1leHBvcnRzW1wicnVuSW5Db250ZXh0XCJdID0gcnVuSW5Db250ZXh0O3JldHVybiBleHBvcnRzO31pZihmcmVlRXhwb3J0cyAmJiAhaXNMb2FkZXIpeyAvLyBFeHBvcnQgZm9yIENvbW1vbkpTIGVudmlyb25tZW50cy5cbnJ1bkluQ29udGV4dChyb290LGZyZWVFeHBvcnRzKTt9ZWxzZSB7IC8vIEV4cG9ydCBmb3Igd2ViIGJyb3dzZXJzIGFuZCBKYXZhU2NyaXB0IGVuZ2luZXMuXG52YXIgbmF0aXZlSlNPTj1yb290LkpTT04scHJldmlvdXNKU09OPXJvb3RbXCJKU09OM1wiXSxpc1Jlc3RvcmVkPWZhbHNlO3ZhciBKU09OMz1ydW5JbkNvbnRleHQocm9vdCxyb290W1wiSlNPTjNcIl0gPSB7IC8vIFB1YmxpYzogUmVzdG9yZXMgdGhlIG9yaWdpbmFsIHZhbHVlIG9mIHRoZSBnbG9iYWwgYEpTT05gIG9iamVjdCBhbmRcbi8vIHJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIGBKU09OM2Agb2JqZWN0LlxuXCJub0NvbmZsaWN0XCI6ZnVuY3Rpb24gbm9Db25mbGljdCgpe2lmKCFpc1Jlc3RvcmVkKXtpc1Jlc3RvcmVkID0gdHJ1ZTtyb290LkpTT04gPSBuYXRpdmVKU09OO3Jvb3RbXCJKU09OM1wiXSA9IHByZXZpb3VzSlNPTjtuYXRpdmVKU09OID0gcHJldmlvdXNKU09OID0gbnVsbDt9cmV0dXJuIEpTT04zO319KTtyb290LkpTT04gPSB7XCJwYXJzZVwiOkpTT04zLnBhcnNlLFwic3RyaW5naWZ5XCI6SlNPTjMuc3RyaW5naWZ5fTt9IC8vIEV4cG9ydCBmb3IgYXN5bmNocm9ub3VzIG1vZHVsZSBsb2FkZXJzLlxuaWYoaXNMb2FkZXIpe2RlZmluZShmdW5jdGlvbigpe3JldHVybiBKU09OMzt9KTt9fSkuY2FsbCh0aGlzKTt9KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7fV0sNTE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe21vZHVsZS5leHBvcnRzID0gdG9BcnJheTtmdW5jdGlvbiB0b0FycmF5KGxpc3QsaW5kZXgpe3ZhciBhcnJheT1bXTtpbmRleCA9IGluZGV4IHx8IDA7Zm9yKHZhciBpPWluZGV4IHx8IDA7aSA8IGxpc3QubGVuZ3RoO2krKykge2FycmF5W2kgLSBpbmRleF0gPSBsaXN0W2ldO31yZXR1cm4gYXJyYXk7fX0se31dfSx7fSxbMzFdKSgzMSk7fSk7fVxuXG5jYy5fUkZwb3AoKTsiXX0=
