const path = require('path');


const config = {
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'ocb.min.js',
    library: 'ocb',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  }
};

module.exports = config;
