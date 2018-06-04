const Article = require('../models/Article');
const Comments = require('../models/Comment');

module.exports = app => {

    app.get('/', (req, res) => {
        Article.find().sort({
            scrapeDate: 1
        }).exec((err, docs) => {
            res.render('index', {
                docs
            });
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

    app.get('/article/:id', (req, res) => {
        let articleId = req.params.id;

        Article.findOne({
                _id: articleId
            })
            .populate({
                'path': 'comments',
                'options': {
                    'sort': {
                        'timestamp': -1
                    }
                }
            })
            .exec((err, article) => {
                if (err) {
                    console.log('THROW ERR', err.msg);
                } else {
                    res.render('articleview', {
                        article
                    });
                }
            });
    });

    app.post('/addcomment/:articleId', (req, res) => {

        let newComment = new Comments(req.body);

        newComment.save((err, comment) => {
            if (err) {
                console.log(err.msg);
            } else {
                Article.update({
                    '_id': req.params.articleId
                }, {
                    '$push': {
                        'comments': comment._id
                    }
                }, (err, newDoc) => {
                    res.redirect(`/article/${req.params.articleId}`);
                });
            }
        });
    });

    app.post('/deletecomment/:articleId/:commentId', (req, res) => {
        Article.update({
            '_id': req.params.articleId
        }, {
            '$pull': {
                'comments': req.params.commentId
            }
        }, (err, removedComment) => {
            Comments.remove({
                '_id': req.params.commentId
            }, (err, removed) => {
                console.log(removed);
                res.redirect(`/article/${req.params.articleId}`);
            });
        })
    });
};