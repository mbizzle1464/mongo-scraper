var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var methodOverride = require('method-override');

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;
// Initialize Express
var app = express();

// Use Express-handlebars for front end
var exphbs = require("express-handlebars");
app.set("views", "./views")
app.engine("handlebars", exphbs({
    extname: ".handlebars"
}));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
app.use(logger("dev"));
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
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongo-scraper");

//---- routes ----//
require('./routes/api-routes')(app);

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});