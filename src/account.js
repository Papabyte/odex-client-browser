const { fromWif, getChash160 } = require('obyte/lib/utils');
const ecdsa = require('secp256k1');
const obyte = require('obyte');
const conf = require('./conf.js');


async function getBalance() {
	const address = getAddress();
	const client = new obyte.Client(conf.hub_ws_url, conf);
	const result = await client.api.getBalances([address]);
	client.close();
	return result[address];
}


function getAddress() {
	const privateKey = fromWif(conf.wif, conf.testnet).privateKey;
	const definition = conf.definition || ['sig', { pubkey: ecdsa.publicKeyCreate(privateKey).toString('base64')}];
	return getChash160(definition);
}

function getOwnerAddress() {
	return conf.owner_address || getAddress();
}

async function isAuthorizationGranted(){

	if (!conf.owner_address)
		return true;
	const client = new obyte.Client(conf.hub_ws_url, conf);

	const result = await client.api.getAaStateVars({
		address: conf.aa_address,
		var_prefix: `grant_${conf.owner_address}_to_${getAddress()}`,
	});
	client.close();

	if (Object.keys(result).length == 1)
		return true;
	else
		return false;
}


async function deposit(asset, amount) {

	const params = {
		asset,
		outputs: [
			{ address: conf.aa_address, amount }
		]
	};
	const client = new obyte.Client(conf.hub_ws_url, conf);
	const result = await client.post.payment(params, conf);
	client.close();
	return result;

}

async function withdraw(asset, amount) {
	asset = asset || 'base';
	const params = {
	outputs: [
		{ address: conf.aa_address, amount: 10000 }
	],
	data: {
		withdraw: 1,
		amount: amount,
		asset
	}
};
	const client = new obyte.Client(conf.hub_ws_url, conf);
	const result = await client.post.payment(params, conf);
	client.close();
	return result;
}


exports.getAddress = getAddress;
exports.getOwnerAddress = getOwnerAddress;
exports.getBalance = getBalance;
exports.deposit = deposit;
exports.withdraw = withdraw;
exports.isAuthorizationGranted = isAuthorizationGranted;