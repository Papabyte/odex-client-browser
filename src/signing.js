
const { signMessage } = require('obyte/lib/utils');
let conf;

exports.setConfiguration = function(_conf){
	conf = _conf;
}

function signMessageWithHandle(message, handleResult) {
	console.log(message);
	handleResult(null, signMessage(message, conf));
}


exports.signMessage = signMessageWithHandle;
