const express = require('express');

const articlesControllerV2 = require('../controllers/articles-controller');

const router = express.Router();

router
    .route('/wiki/v1/:chain/articles')
    .get(articlesControllerV2.getTitles)
    .post(articlesControllerV2.createTitle);

router
    .route('/wiki/v1/:chain/articles/blockeds')
    .get(articlesControllerV2.getBlockeds);

router
    .route('/wiki/v1/:chain/articles/:titleURI')
    .get(articlesControllerV2.getOneTitle)
    .put(articlesControllerV2.updateOne);

router
    .route('/wiki/v1/:chain/articles/:titleURI/:postId')
    .get(articlesControllerV2.getAny);

router
    .route('/wiki/v1/:chain/articles/:titleURI/like')
    .post(articlesControllerV2.likeTitle);

router
    .route('/wiki/v1/:chain/articles/:titleURI/like/:postId')
    .post(articlesControllerV2.likeOne);

router
    .route('/wiki/v1/:chain/articles/:titleURI/dislike')
    .post(articlesControllerV2.dislikeTitle);

router
    .route('/wiki/v1/:chain/articles/:titleURI/dislike/:postId')
    .post(articlesControllerV2.dislikeOne);


module.exports = router;