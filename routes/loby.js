var express = require('express');
const sqlite3 = require('sqlite3').verbose();

//app에서가져온 router
var router = express.Router();

//로비 페이지
router.get('/loby', function(req, res, next) {
    res.render('loby.html'); 
  });

//게임 스코어 페이지
router.get('/gameScore', function(req, res, next) {
    res.render('gameScore.html');
  });

router.get('/selectGameScore', function(req, res, next) {
  let db = new sqlite3.Database('./public/db/gameScore.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all('SELECT * FROM music ORDER BY score DESC LIMIT 5', (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }

    // HTML 표 생성
    let tableHtml = '<table> <tr><th>ranking</th><th>Email</th><th>Music</th><th>Score</th></tr>';
    var scoreLen = 0;
    rows.forEach((row) => {
      scoreLen = scoreLen + 1;
      tableHtml += `<tr><td>${scoreLen}</td><td>${row.email}</td><td>${row.musicNm}</td><td>${row.score}</td></tr>`;
    });

    tableHtml += '</table>';

    // 렌더링된 HTML을 클라이언트로 보냄
    res.header("Access-Control-Allow-Origin", "*");
    res.send(tableHtml);

    //close the database connection
    db.close((err) => {
      if (err) {
        console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
      } else {
        console.log('데이터베이스 연결이 종료되었습니다.');
        }
    });
  });
});
  
module.exports = router;