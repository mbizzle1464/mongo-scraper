var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var express = require("express");
var methodOverride = require('method-override');
var mongoose = require("mongoose");
var morgan = require("morgan");


var PORT = process.env.PORT || 3000;
// Initialize Express
var app = express();

// Use Express-handlebars for front end
app.set("views", "./views")
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// Use morgan for logging requests
app.use(morgan("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.text());
app.use(bodyParser.json({
    type: "application/vnd.api+json"
}));

// Use express.static to serve the public folder as a static directory
app.use('/public', express.static(__dirname + '/public'));
app.use('/bootstrap', express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use('/jquery', express.static(__dirname + "/node_modules/jquery/dist"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://heroku_b4156xjx:5j6v1ukiode339ohklrl5poqrc@ds145325.mlab.com:45325/heroku_b4156xjx"

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

let db = mongoose.connection;

// Show any mongoose errors
db.on("error", err => console.log(`Mongoose Error: ${err}`));

// Once logged in to the db through mongoose, log a success message
db.once("open", () => console.log('Mongoose connection successful'));

//---- routes ----//
require('./routes/api-routes')(app);

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
