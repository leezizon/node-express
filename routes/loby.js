var express = require('express');
const sqlite3 = require('sqlite3').verbose();

//app에서가져온 router
var router = express.Router();

//로비 페이지
router.get('/loby', function(req, res, next) {
    res.render('loby.html'); 
  });

//게임 순위 페이지
router.get('/gameRanking', function(req, res, next) {
  res.render('gameLank.html');
});

//게임 스코어 페이지
router.get('/gameScore', function(req, res, next) {
    res.render('gameScore.html');
  });

//게임유저관리 페이지
router.get('/gameUserManage', function(req, res, next) {
  res.render('gameManage.html');
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
    //res.header("Access-Control-Allow-Origin", "*");
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

//게임로그확인
router.get('/selectGameLog', function(req, res, next) {
  let db = new sqlite3.Database('./public/db/gameScore.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all('SELECT * FROM playLog', (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }

    // HTML 표 생성
    let tableHtml = '<table> <tr><th>name</th><th>ip</th><th>msg</th><th>Score</th><th>Date</th></tr>';
    var scoreLen = 0;
    rows.forEach((row) => {
      scoreLen = scoreLen + 1;
      tableHtml += `<tr><td>${row.userName}</td><td>${row.userIp}</td><td>${row.logMsg}</td><td>${row.score}</td><td>${row.logDate}</td></tr>`;
    });

    tableHtml += '</table>';

    // 렌더링된 HTML을 클라이언트로 보냄
    //res.header("Access-Control-Allow-Origin", "*");
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

router.post('/test', function(req, res) {
  let db = new sqlite3.Database('./public/db/gameScore.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db.run('INSERT INTO music ( email, musicNm,score) VALUES (?, ?, ?)', [req.body.enteredEmail,req.body.playMusic,req.body.playedScore], function(err) {
    if (err) {
      console.log('인서트에인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러 에러');
      return console.error(err.message);
    }
    console.log(`레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
  });    
  res.json('T');

  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
})

router.post('/gameStartLog', function(req, res) {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (req.isAuthenticated() == true) {
    req.body.userName = req.user.name;
  }else{
    res.json('F');
    return;
  }
  
  //필요한 디비 불러오기
  let db = new sqlite3.Database('./public/db/gameScore.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  let db2 = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });


  async function processGameStart(req, res) {
    try{
      const userRows = await getUserData(req.user.id);
      const chkResult = await gameThreeOut(req);

      if(chkResult == 'T'){
        await addStartLog(req);
        await updateUserMoney(req.user.id,userRows[0].Money-1);
      }

      res.json(chkResult);
      await shutDb();

    } catch (error) {
      console.error(error);
      res.status(500).json('Internal Server Error');
    }
  }
  
  function getUserData(userId) {
    return new Promise((resolve, reject) => {
      db2.all('SELECT * FROM user_M WHERE id = ?', [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  function gameThreeOut(forChkReq) {
    return new Promise((resolve, reject) => {
      const today = new Date();
      const todayKST = new Date(today.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
      const formattedDate = todayKST.toISOString().split('T')[0];

      db.all('SELECT userName, logDate, COUNT(*) AS play_count FROM playLog WHERE logDate = ? AND userName = ? AND state = ? GROUP BY userName, logDate',[formattedDate,forChkReq.user.name,'S'], (err, rows) => {
        rows.forEach((row) => {
            if(row.play_count >= 3){
              resolve('OUT');
            }else{
              resolve('T');
            }
        });
        if(rows.length == 0){
          resolve('T');
        }
      })
    });
  }

  function addStartLog(forLogReq) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO playLog ( userName, userIp, logMsg, logDate, state) VALUES (?, ?, ?, ?, ?)', [forLogReq.body.userName,clientIp,forLogReq.body.logMsgData,forLogReq.body.formattedDate,'S'], function(err) {
        if (err) {
          console.log('인서트에인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러 에러');
          reject(err);
        }
        console.log(`게임 스타트 레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
        resolve();
      });    
      //res.header("Access-Control-Allow-Origin", "*");
    });
  }

  function updateUserMoney(id, f_m) {
    return new Promise((resolve, reject) => {
      db2.run('UPDATE user_M SET Money = ? WHERE id = ?', [f_m, id], function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`User Money Updated: ${this.changes} records changed.`);
          resolve();
        }
      });
    });
  }
  
  
  //db끄기
  function shutDb(){
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
        } else {
          console.log('데이터베이스 연결이 종료되었습니다.');
        }
      });

      db2.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
        } else {
          console.log('데이터베이스 연결이 종료되었습니다.');
        }
      });
    });
  }

  processGameStart(req, res);
})

router.post('/gameEndLog', function(req, res) {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (req.isAuthenticated() == true) {
    req.body.userName = req.user.name;
  }else{
    res.json('F');
    return;
  }
  
  let db = new sqlite3.Database('./public/db/gameScore.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db.run('INSERT INTO playLog ( userName, userIp, logMsg, logDate, score, state) VALUES (?, ?, ?, ?, ?, ?)', [req.body.userName,clientIp,req.body.logMsgData,req.body.formattedDate,req.body.playedScore,'E'], function(err) {
    if (err) {
      console.log('인서트에인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러 에러');
      return console.error(err.message);
    }
    console.log(`레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
  });    
  //res.header("Access-Control-Allow-Origin", "*");
  res.json('T');

  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
})

router.post('/start777', function(req, res) {

  if (req.isAuthenticated() == true) {
    req.body.userName = req.user.name;
    res.json('T');
  }else{
    res.json('F');
    return;
  } 
})

router.post('/777EndLog', function(req, res) {
  if (req.isAuthenticated() == true) {
    req.body.userName = req.user.name;
    res.json('T');
  }else{
    res.json('F');
    return;
  }
  
  let db = new sqlite3.Database('./public/db/gameScore.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  let db2 = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  async function process777Start(req, res) {
    try{
      const userRows = await getUserData(req.user.id);
  
      await addStartLog(req);
      await updateUserMoney(req.user.id,userRows[0].Money-1);
  
      await shutDb();

    } catch (error) {
      console.error(error);
      res.status(500).json('Internal Server Error');
    }
  }

  function addStartLog(forLogReq) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO playLog ( userName, userIp, logMsg, logDate, score, state) VALUES (?, ?, ?, ?, ?, ?)', [forLogReq.body.userName,clientIp,forLogReq.body.logMsgData,forLogReq.body.formattedDate,req.body.playedScore,'E'], function(err) {
        if (err) {
          console.log('인서트에인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러 에러');
          reject(err);
        }
        console.log(`게임 스타트 레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
        resolve();
      });    
      //res.header("Access-Control-Allow-Origin", "*");
    });
  }

  function getUserData(userId) {
    return new Promise((resolve, reject) => {
      db2.all('SELECT * FROM user_M WHERE id = ?', [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  function updateUserMoney(id, f_m) {
    return new Promise((resolve, reject) => {
      db2.run('UPDATE user_M SET Money = ? WHERE id = ?', [f_m, id], function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`User Money Updated: ${this.changes} records changed.`);
          resolve();
        }
      });
    });
  }

  function shutDb(){
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
        } else {
          console.log('데이터베이스 연결이 종료되었습니다.');
        }
      });

      db2.close((err) => {
        if (err) {
          console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
        } else {
          console.log('데이터베이스 연결이 종료되었습니다.');
        }
      });
    });
  }
  process777Start(req, res);
})

module.exports = router;