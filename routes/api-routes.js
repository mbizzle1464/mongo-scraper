var path = require("path");
//console.log(__dirname);
console.log("*****************************************\n*****************************************\n*****************************************\n")
// console.log(path.join(__dirname, "../models/Article.js"));

const testFolder = '../models';
const fs = require('fs');

fs.readdir(testFolder, (err, files) => {
    console.log(files);
    files.forEach(file => {
        console.log(file);
        console.log("*****************************************\n*****************************************\n*****************************************\n");
    });

    var Article = require('/../models/Article');
    var Comments = require('/../models/Comment');
    var axios = require("axios");
    var cheerio = require('cheerio');


    module.exports = function (app) {

        app.get("/", function (req, res) {
            Article.find().sort({
                scrapeDate: 1
            }).exec(function (error, docs) {
                console.log(docs);
                if (error) {
                    res.send(error)
                } else {
                    res.render('index', {
                        docs
                    });
                }
            });
        });
        app.get("/articles", function (req, res) {
            Article.find().sort({
                scrapeDate: 1
            }).exec(function (error, docs) {
                console.log(docs);
                if (error) {
                    res.send(error)
                } else {
                    res.json(docs);
                }
            });
        });
        app.get("/comment", function (req, res) {
            Comments.find({}).exec(function (error, docs) {
                console.log(docs);
                if (error) {
                    res.send(error)
                } else {
                    res.json(docs);
                }
            });
        });

        app.get("/about", function (req, res) {
            res.render("about")
        });

        app.get("/scrape", function (req, res) {
            axios.get("https://www.usatoday.com/sports/").then(function (response) {

                // Then, we load that into cheerio and save it to $ for a shorthand selector
                var $ = cheerio.load(response.data);

                // Now, we grab every article with this class, and do the following:
                $("li.hgpm-item").each(function (i, element) {
                    // Save an empty result object
                    var result = {};
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
                    Article
                        .create(result)
                        .then(function (err, Article) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log("Article added to MongoDB");
                                console.log(i);
                            }
                        });
                });
                res.redirect('/')
            });
        });



        app.get("/article/:id", function (req, res) {
            var articleId = req.params.id;

            Article.findOne({
                _id: articleId
            }).populate({
                'path': 'comments',
                'options': {
                    'sort': {
                        'timestamp': -1
                    }
                }
            }).exec(function (err, article) {
                if (err) {
                    console.log('THROW ERR', err.msg);
                } else {
                    res.render('articleview', {
                        article
                    });
                }

            })
        });

        app.post("/addcomment/:articleId", function (req, res) {
            var newComment = new Comment(req.body);
            console.log("New Comment:" + newComment);

            newComment.save(function (err, comment) {
                if (err) {
                    console.log(err.msg);
                } else {
                    Article.update({
                        '_id': req.params.articleId
                    }, {
                        '$push': {
                            'comments': comment._id
                        }
                    }).exec(function (err, doc) {
                        console.log(doc);
                        if (err) {
                            console.log(err)
                        } else {
                            // res.json(doc)
                            res.redirect(`/article/${req.params.articleId}`);
                        }
                    });
                }
            });
        });

        app.post("/deletecomment/:articleId/:commentId", function (req, res) {
            Article.update({
                '_id': req.params.articleId
            }, {
                '$pull': {
                    'comments': req.params.commentId
                }
            }).then(function (err, removedComment) {
                if (err) {
                    console.log(err)
                } else {
                    Comment.remove({
                        '_id': req.params.commentId
                    }).then(function (err, removed) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(removed);
                            res.redirect(`/article/${req.params.articleId}`);
                        }
                    });
                }
            });
        });
    }
})

