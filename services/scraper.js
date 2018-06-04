const axios = require("axios");
const cheerio = require('cheerio');
var db = require("../models");

module.exports = callback => {
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
};