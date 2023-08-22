var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

router.get('/lee', function(req, res, next) {
  res.render('gpt2.html');
});

module.exports = router;
