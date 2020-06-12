# ODEX client browser library

Use this library to trade on [ODEX](https://odex.ooo) from a browser. It's a web version of [headless odex client](https://github.com/byteball/odex-client.git).


## JS bundle

The library can be used as a javascript bundle included in your webpage.

#### Build the bundle
Install Node 8 or superior

```sh
git clone https://github.com/byteball/odex-client-browser.git
cd odex-client-browser
npm install
npm run build
```
The created bundle `ocb.min.js` will be found in `dist` folder.
Check `example.html` for its usage.

## Library

The library can be included in a project using webpack (like vuejs or react-js)

#### Installation
Add odex-client-browser as a dependency in your package.json:
```json
	"dependencies": {
		"odex-client-browser": "git+https://github.com/byteball/odex-client-browser.git"
	}
```

#### Usage

Same functions as in [headless odex client](https://github.com/byteball/odex-client.git) are available. The main difference is that the account is not generated automatically but private key is to be provided in WIF format. See https://obytejs.com/utils/generate-wallet for instructions.

```js
const ocb = require('odex-client-browser');
let { orders, ws_api, rest_api, exchange, account } = ocb;

async function start() {
	await ocb.start({
		wif: "92miJ9H6AnWFVSoRbtNgzwRbzAesWEPrMRdDkCsXoxwddBYGA71"
	});

	// subscribe to new orders and trades on a pair
	await ws_api.subscribeOrdersAndTrades('GBYTE/USDC');
	ws_api.on('orders', (type, payload) => {
		console.error('received orders', type, payload);
	});
	ws_api.on('trades', (type, payload) => {
		console.error('received trades', type, payload);
	});

	// this will automatically update orders.assocMyOrders object which holds all my orders keyed by order hash. New orders will be automatically added, filled and cancelled orders will be automatically removed
	await orders.trackMyOrders();

	// place a new order, side is 'BUY' or 'SELL'
	await orders.createAndSendOrder('GBYTE/USDC', side, amount, price);

	// cancel an order
	await orders.createAndSendCancel(order_hash);
}

start();
```


## Trading balances

The library includes an Obyte wallet that holds your trading balances. You need to deposit funds to this wallet before trading. The wallet address is returned by `ocb.account.getAddress()`

Use these functions for balances management:

Deposit to Odex AA
```js
ocb.account.deposit(asset, amount)
```

Withdraw from Odex AA
```js
ocb.account.withdraw(asset, amount)
```

## Help

\#tech channel on discord https://discord.obyte.org.

