var express = require('express');

//app에서가져온 router
var router = express.Router();

const bodyParser = require('body-parser');
//json 사용,설정
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/leeG', function(req, res, next) {
    res.render('game.html');
});

router.post('/selectManageGrid', function(req, res) {
  console.log(req.user);
  var jsonsteer = {val:'기존'};
  if(req.user && req.user.id == 5){
    var jsonsteer = {val:'사람있음'};
  }
  res.json(jsonsteer);    
});





function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('미들웨어');
    return next(); // 로그인 상태면 다음 미들웨어로 이동
  }
  res.redirect('/./lee'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
}

module.exports = router;