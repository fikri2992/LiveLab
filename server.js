var fs = require('fs');
var express = require('express')
var app = express();
var browserify = require('browserify-middleware')
var https = require('https')
var express = require('express');
var app = express();
var path = require('path');

//app.use(express.static(__dirname)); // Current directory is root
app.use(express.static(path.join(__dirname, '/public/'))); //  "public" off of current is root

app.listen(8081);
console.log('Listening on port 8081');