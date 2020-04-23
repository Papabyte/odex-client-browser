const { fromWif, getChash160 } = require('obyte/lib/utils');
const ecdsa = require('secp256k1');
const obyte = require('obyte');
const conf = require('./conf.js');

const client = new obyte.Client(conf.hub_ws_url, conf);

function getOwnerAddress() {
	const privateKey = fromWif(conf.wif, conf.testnet).privateKey;
	const definition = conf.definition || ['sig', { pubkey: ecdsa.publicKeyCreate(privateKey).toString('base64')}];
	return getChash160(definition);
}

async function getOwnerAddressBalance() {
	const address = getOwnerAddress();
	const result = await client.api.getBalances([address]);
	return result[address];
}

async function deposit(asset, amount) {

	const params = {
		asset,
		outputs: [
			{ address: conf.aa_address, amount }
		]
	};
	
	const result = await client.post.payment(params, conf);
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

	const result = await client.post.payment(params, conf);
	return result;
}


exports.getOwnerAddress = getOwnerAddress;
exports.getOwnerAddressBalance = getOwnerAddressBalance;
exports.deposit = deposit;
exports.withdraw = withdraw;