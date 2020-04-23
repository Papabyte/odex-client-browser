
const { signMessage } = require('obyte/lib/utils');
const conf = require('./conf.js');

function signMessageWithHandle(message, handleResult) {
	console.log(message);
	handleResult(null, signMessage(message, conf));
}


exports.signMessage = signMessageWithHandle;
