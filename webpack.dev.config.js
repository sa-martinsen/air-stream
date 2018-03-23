const path = require('path');

let buildConfig = {
    devtool: "source-map",
    entry: {
        'index': [path.resolve(__dirname, './debug/index.js')]
    },
    output: {
        path: path.resolve(__dirname, './debug/'),
        filename: 'debug.js'
    },
    module: {
        loaders:[
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    },
    watch: true,

};
module.exports = buildConfig;
