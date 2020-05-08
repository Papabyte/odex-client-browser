const EventEmitter = require('events').EventEmitter;
const WebSocket = window.WebSocket;

const account = require('./account.js');
const exchange = require('./exchange.js');
const conf = require('./conf.js');


class WsEmitter extends EventEmitter {

	constructor() {
		super();
		this.ws = null;
	}


	connect(onDone) {

		let self = this;
		if (!onDone)
			return new Promise(resolve => this.connect(resolve));

		if (self.ws) {
			if (self.ws.readyState === self.ws.OPEN) {
				console.log("odex ws already connected");
				return onDone();
			}
			if (!self.ws.done) {
				console.log("odex ws already connecting");
				self.once('done', onDone);
				return;
			}
			console.log("odex closing, will reopen");
		}
		console.log("will connect ws to " + conf.odex_ws_url );
		self.shouldClose = false;

		self.ws = new WebSocket(conf.odex_ws_url);

		self.ws.done = false;
		function finishConnection(_ws, err) {
			if (!_ws.done) {
				_ws.done = true;
				onDone(err);
				if (_ws)
					self.emit('done', err);
			}
		}

		let abandoned = false;
		let timeout = setTimeout(function () {
			abandoned = true;
			console.log("odex ws abandonned");
			finishConnection(self.ws, 'timeout');
			self.ws = null;
		}, 5000);

		self.ws.onopen = function onWsOpen() {
			console.log('odex ws opened');
			if (abandoned) {
				console.log("abandoned connection opened, will close");
				this.close();
				return;
			}
			clearTimeout(timeout);
			self.ws.last_ts = Date.now();
			console.log('connected');
			finishConnection(this);
			self.sendAddress(account.getOwnerAddress());
			self.emit('connected');
		};

		self.ws.onclose = function onWsClose() {
			console.log('odex ws closed');
			clearTimeout(timeout);
			self.ws = null;
			if (self.shouldClose)
				return;
			setTimeout(self.connect.bind(self), 1000);
			finishConnection(this, 'closed');
			self.emit('disconnected');
		};

		self.ws.onerror = function onWsError(e) {
			console.log("on error from Odex WS server");
		};

		self.ws.onmessage = function (message) { // 'this' is set to ws
			self.onWebsocketMessage(this, message);
		};
	}


	onWebsocketMessage(_ws, message) {
		if (_ws.readyState !== _ws.OPEN)
			return console.log("received a message on ODEX socket with ready state " + _ws.readyState);
		_ws.last_ts = Date.now();
		
		try {
			var objMessage = JSON.parse(message.data);
			var type = objMessage.event.type;
			var payload = objMessage.event.payload;
		}
		catch(e){
			return console.log('failed to json.parse message '+message);
		}
		
		let channel = objMessage.channel;
		this.emit(channel, type, payload);
	}

	isConnected() {
		return (this.ws && this.ws.readyState === this.ws.OPEN);
	}

	close() {
		this.shouldClose = true;
		this.ws.close();
	}

	send(message) {
		return new Promise(async (resolve)=>{
			let ws = this.ws;
			if (!ws || ws.readyState !== ws.OPEN) {
				let err = await this.connect();
				if (err)
					return err;
				ws = this.ws;
			}

			if (!ws)
				throw Error("no ws after connect");
			
			if (typeof message === 'object')
				message = JSON.stringify(message);

			try {
				ws.send(message); // this function can fail even if readyState was on OPEN
			} catch (e) {
				console.log('failed send ' + e.toString());
				return setTimeout(async ()=>{
					await this.send(message);
					resolve();
				}, 500)
			}
			resolve();
		});
	}

	async subscribeTrades(pairName) {
		let [baseToken, quoteToken] = exchange.getAssetsByPair(pairName);
		const message = {
			"channel": "trades",
			"event": {
				"type": "SUBSCRIBE",
				"payload": {
					"baseToken": baseToken,
					"quoteToken": quoteToken,
					"name": pairName,
				}
			}
		};
		return await this.send(message);
	}

	async subscribeOrderbook(pairName) {
		let [baseToken, quoteToken] = exchange.getAssetsByPair(pairName);
		const message = {
			"channel": "orderbook",
			"event": {
				"type": "SUBSCRIBE",
				"payload": {
					"baseToken": baseToken,
					"quoteToken": quoteToken,
					"name": pairName,
				}
			}
		};
		return await this.send(message);
	}

	async subscribeRawOrderbook(pairName) {
		let [baseToken, quoteToken] = exchange.getAssetsByPair(pairName);
		const message = {
			"channel": "raw_orderbook",
			"event": {
				"type": "SUBSCRIBE",
				"payload": {
					"baseToken": baseToken,
					"quoteToken": quoteToken,
					"name": pairName,
				}
			}
		};
		return await this.send(message);
	}

	async subscribeOrdersAndTrades(pairName) {
		await this.subscribeTrades(pairName);
		await this.subscribeOrderbook(pairName);
		await this.subscribeRawOrderbook(pairName);	
	}

	async subscribeOHLCV(pairName, from, to, duration, units) {
		let [baseToken, quoteToken] = exchange.getAssetsByPair(pairName);
		const message = {
			"channel": "ohlcv",
			"event": {
				"type": "SUBSCRIBE",
				"payload": {
					"baseToken": baseToken,
					"quoteToken": quoteToken,
					"name": pairName,
					"from": from,
					"to": to,
					"duration": duration,
					"units": units,
				}
			}
		};
		return await this.send(message);
	}

	async sendAddress(address) {
		const message = {
			"channel": "orders",
			"event": {
				"type": "ADDRESS",
				"payload": address,
			}
		};
		return await this.send(message);
	}

	async sendOrder(signedOrder) {
		const message = {
			"channel": "orders",
			"event": {
				"type": "NEW_ORDER",
				"payload": signedOrder,
			}
		};
		return await this.send(message);
	}

	async sendCancel(signedCancel) {
		const message = {
			"channel": "orders",
			"event": {
				"type": "CANCEL_ORDER",
				"payload": signedCancel,
			}
		};
		return await this.send(message);
	}
}

module.exports = new WsEmitter();
