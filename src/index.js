/*jslint node: true */
'use strict';
const ws_api = require('./ws_api.js');

const rest_api = require('./rest_api.js');
const orders = require('./orders.js');
const balances = require('./balances.js');
const exchange = require('./exchange.js');
const account = require('./account.js');
const signing = require('./signing.js');


if (typeof window !== 'undefined')
	console.log('run in browser');
else
	console.log('not run in browser');


async function start(conf) {
	rest_api.setConfiguration(conf);
	orders.setConfiguration(conf);
	ws_api.setConfiguration(conf);
	account.setConfiguration(conf);
	signing.setConfiguration(conf);
	await exchange.start();
	await ws_api.connect();
}

exports.start = start;

exports.ws_api = ws_api;
exports.rest_api = rest_api;
exports.exchange = exchange;
exports.orders = orders;
exports.balances = balances;
exports.account = account;