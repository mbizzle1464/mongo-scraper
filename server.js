var axios = require("axios");
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
    extname: ".handlebars"
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
app.use(express.static("public"));

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongo-scraper");

// Scrape website to grab data to render to the page
axios.get("https://www.usatoday.com/sports/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every article with this class, and do the following:
    $("li.hgpm-item").each(function (i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.img = $(this)
            .children(".hgpm-link")
            .children(".hgpm-grid-wrap")
            .children("img")
            .attr('src');
        result.title = $(this)
            .children(".hgpm-link")
            .children(".hgpm-grid-wrap")
            .children(".hgpm-image-hed-wrap")
            .children("p")
            .text()
            .trim();
        result.link = $(this)
            .children(".hgpm-link")
            .attr('href');
        result.category = $(this)
            .children('.hgpm-link')
            .children(".hgpm-grid-wrap")
            .children(".hgsm-ssts-label-top-left")
            .text()
            .trim();
        // Create a new Article using the `result` object built from scraping
        db.Article
            .create(result)
            .then(dbArticle => {
                console.log("Article added to MongoDB");
                console.log(i);
            });
    });
});



// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});