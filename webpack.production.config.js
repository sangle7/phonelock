const webpack = require('webpack')
const path = require('path');

module.exports = {
	entry: [
		path.resolve(__dirname, 'src/main.js')
	],
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: 'bundle.js',
		publicPath: "/build/",
	},
	devtool: false,
	module: {
		loaders: [{
			test: /\.js?$/,
			loader: 'babel-loader'
		}, {
			test: /\.css$/,
			loader: 'style-loader!css-loader'
		}]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
	]
};