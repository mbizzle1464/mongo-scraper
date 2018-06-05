var db = require('../models')


module.exports = function (app) {

    app.get("/", function (req, res) {
        db.Article.find().sort({
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
        db.Article.find().sort({
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
        db.Comment.find({}).exec(function (error, docs) {
            console.log(docs);
            if (error) {
                res.send(error)
            } else {
                res.json(docs);
            }
        });
    });

    app.get('/scrape', (req, res) => {
        require('../services/scraper')(scrapedArticles => {
            scrapedArticles.forEach(article => {
                let entry = new Article(article);
                entry.save((err, doc) => {
                    try {
                        if (err) {
                            throw err
                        } else console.log(doc);
                    } catch (err) {
                        console.log(err.errmsg);
                    }
                });
            });
            res.redirect('/');
        });
    });

    app.get("/article/:id", function (req, res) {
        var articleId = req.params.id;

        db.Article.findOne({
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
        var newComment = new db.Comment(req.body);
        console.log("New Comment:" + newComment);   

        newComment.save(function (err, comment) {
            if (err) {
                console.log(err.msg);
            } else {
                db.Article.update({
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
        db.Article.update({
            '_id': req.params.articleId
        }, {
            '$pull': {
                'comments': req.params.commentId
            }
        }).then(function (err, removedComment) {
            if (err) {
                console.log(err)
            } else {
                db.Comment.remove({
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
};

