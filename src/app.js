const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: /http:\/\/(127(\.\d){3}|localhost)/}));
app.options('*', cors());

const toolsRoute = require('./routes/tools-route');
const articlesRoute = require('./routes/articles-route');

app.use(toolsRoute); 
app.use(articlesRoute);

module.exports = app
