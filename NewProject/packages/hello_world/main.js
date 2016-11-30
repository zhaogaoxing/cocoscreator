'use strict';

module.exports = {
	load(){
		//当package被正确加载的时候执行
	},

	unload(){
		//当package被正确卸载的时候执行
	},

	messages: {
		'say-hello' (){
			Editor.log('Hello World!');
		}
	},
};