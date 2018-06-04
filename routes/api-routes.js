var db = require('../models')

module.exports = function (app) {

    app.get("/comments", function (req, res) {
        db.Comment.find({}, function (error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.json(doc);
            }
        });
    });

    app.get("/articles", function (req, res) {
        db.Article.find({}, function (error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.json(doc);
            }
        });
    });

    app.get("/", function (req, res) {
        db.Article.find({}, function (error, found) {
            if (error) {
                res.send("ERROR")
            } else {
                var returnData = {
                    entry: found
                }
                res.render("index", returnData)
            }
        })
    });

    app.post("/articles/:id", function (req, res) {
        db.Comment
            .create(req.body)
            .then(newComment => {
                return db.Article.update({
                    _id: req.params.id
                }, {
                    $push: {
                        comment: newComment._id
                    }
                })
            })
            .then(returnData => {
                res.json(newComment)
            })
            .catch(err => {
                res.json(err)
            })
    });

    app.get("/articles/:id", function (req, res) {
        var id = req.params.id
        console.log(id)
        db.Article
            .findOne({
                _id: id
            })
            .populate("Comment")
            .then(ArticleComment => {
                res.send(ArticleComment)
            })

    });
}