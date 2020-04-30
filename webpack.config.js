const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
	plugins: [
		new HtmlWebpackPlugin({
			template: './dist/example.html',
			inject: false // ocb.min.js is already injected in our example HTML file
		})
	],
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'ocb.min.js',
		library: 'ocb',
		libraryTarget: 'umd',
		umdNamedDefine: true,
	}
};

module.exports = config;
