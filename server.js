var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var express = require("express");
var methodOverride = require('method-override');
var mongoose = require("mongoose");
var morgan = require("morgan");



// Require all models
var db = require("./models");

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

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongo-scraper");

require("./routes/api-routes.js")(app);

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});