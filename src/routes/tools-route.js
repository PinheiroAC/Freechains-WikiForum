const express = require('express');

const toolsController = require('../controllers/tools-controller');

const router = express.Router();

router
    .route('/wiki/v1/keys')
    .post(toolsController.createKeys);

router
    .route('/wiki/v1/patch')
    .post(toolsController.createPatch);

router
    .route('/wiki/v1/wiki')
    .post(toolsController.createWiki);

module.exports = router; 
