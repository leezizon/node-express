const sqlite3 = require('sqlite3').verbose();
var express = require('express');

//app에서가져온 router
var router = express.Router();

//로그인세션, 데이터를 보내고 가져오기위한 라이브러리들
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const bodyParser = require('body-parser');

//세션키 사용,설정
router.use(expressSession({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session());
//json 사용,설정
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


// 사용자 데이터베이스 시뮬레이션 (실제로는 데이터베이스를 사용해야 합니다)

// Passport.js 로그인 전략 설정
passport.use(new LocalStrategy(
  (username, password, done) => {
    //세션 xx
    let db = new sqlite3.Database('./public/db/chinook.db', (err) => {
      if (err) {
          console.error(err.message);
      }
      console.log('Connected to the chinook database.');
    });

    //데이터베이스에서 사용자 확인
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [username, password], (err, row) => {
      if (err) {
            console.log('로그인 tlfvo');
            return done(null, false);
        }
        if (!row) {
          console.log('로dndjqtdma');
            return done(null, false);
        }
        console.log('로그인 성공');
        return done(null, row);
  });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  let db = new sqlite3.Database('./public/db/chinook.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  //데이터베이스에서 사용자 확인
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) {
          console.log('로그인 tlfvo');
          return done(null, false);
      }
      if (!row) {
        console.log('섹션로그인');
          return done(null, false);
      }
      console.log('섹션 로그인 성공');
      console.log(row);
      return done(null, row);
  });
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('미들웨어');
    return next(); // 로그인 상태면 다음 미들웨어로 이동
  }
  res.redirect('/lee'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
}


router.get('/lee', function(req, res, next) {
  if (req.isAuthenticated()) {
    req.session.destroy();
  }
  res.render('gpt2.html');
});

// 로그인 엔드포인트
router.post("/login", passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/lee',
  failureFlash: true
})
);

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/lee');
  });
});



router.get('/', ensureAuthenticated, (req, res) => {
  res.render('shop.html'); // 보호된 페이지 템플릿을 렌더링
});


//상품
router.get('/leePd', function(req, res, next) {
  
  let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all('SELECT * FROM product', (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }

    // HTML 표 생성
    let tableHtml = '';

    rows.forEach((row) => {
      
      tableHtml += `
      <input type="text" value="${row.PdId}" id="Pd_${row.PdId}" style="display: none;">
      <section class="product">
      <img src="shopitem/${row.PdId}.png" alt="상품 이미지">
      <div class="product-details">
      <h2>${row.PdNm}</h2>
      <p>상품설명상품설명상품설명상품설명상품설명상품설명상품설명.</p>
      <p class="price">가격: ${row.PdPrice}</p>
      <p class="price">재고: ${row.PdCnt}</p>
      </div>
      <button onclick="postData(${row.PdId})">구매</button>
      </section>`
    });

    // 렌더링된 HTML을 클라이언트로 보냄
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
  res.header("Access-Control-Allow-Origin", "*");
  res.json('T');

  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
})

//상품구매
router.post('/save', function(req, res) {
  const b_product_id = req.body.PdId;
  var user_money = 100000;
  var b_product_cost = 100000; 
  var b_product_cnt = 100000; 
  var b_product_nm = ''; 

 let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db.all('SELECT * FROM user_M WHERE  id = ?' ,[req.user.id], (err, rows) => {
    rows.forEach((row) => {
      user_money = row.Money;
      db.all('SELECT * FROM product WHERE  PdId = ?' ,[b_product_id], (err, rows) => {
        rows.forEach((row) => {
          b_product_cost = row.PdPrice;
          b_product_cnt = row.PdCnt;
          b_product_nm = row.PdNm;
          //물건값보다 돈이 없으면 실패
          if (-1 < user_money - b_product_cost){
            PD_U_A_D(req.user.id, b_product_id,b_product_cnt-1,b_product_nm, user_money - b_product_cost, req.user.name);
            res.json('T');
          }else{
          }
        })
      });
    })
  });

  //db 업데이트 인서트
  function PD_U_A_D(id, b_pd_id,b_pd_cnt,b_pd_nm, f_m,user_name) {
  db.run('UPDATE product SET PdCnt = ? WHERE PdId = ?', [b_pd_cnt, b_pd_id], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
  });

  db.run('UPDATE user_M SET Money = ? WHERE id = ?', [f_m,id], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
  });

  db.run('INSERT INTO assets (assetsWithUserId, PdNm, PdId, useSn,name) VALUES (?, ?, ?, ?, ?)', [id,b_pd_nm,b_pd_id,'Y',user_name], function(err) {
    if (err) {
      return console.error(err.message);
      console.log('인서트에인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러 에러');
    }
    console.log(`레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
  });        
  }
  

  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });

})


//내 프로필과 (user) 상품 정보
router.get('/myPage',ensureAuthenticated, (req, res) => {
  res.render('myP.html' , { user: req.user });
});

router.get('/myPagePd',ensureAuthenticated, (req, res) => {
  console.log('내상품정보');

  let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db.all('SELECT * FROM user_M WHERE id = ?' ,[req.user.id], (err, rows) => {
    let ProfileHtml = '';

    rows.forEach((row) => {
      ProfileHtml += `
      <section class="profile">
            <h2>내 프로필</h2>
            <p>이름: ${req.user.name}</p>
            <p>이메일: ${req.user.email}</p>
        </section>
        <section class="points">
            <h2>지갑</h2>
            <p> Money: ${row.Money}</p>
            <p> Point: ${row.SpeP}</p>
      </section>
      `
    });

    db.all('SELECT * FROM assets WHERE assetsWithUserId = ?' ,[req.user.id], (err, rows) => {
      let tableHtml = '';
  
      rows.forEach((row) => {
        tableHtml += `
        <section class="product">
        <img src="shopitem/${row.PdId}.png" alt="상품 이미지">
        <div class="product-details">
        <h2>${row.PdNm}</h2>
        <p>상품설명상품설명상품설명상품설명상품설명상품설명상품설명.</p>
        </div>
        </section>`
      });
  
      // 렌더링된 HTML을 클라이언트로 보냄
      res.send({ profile : ProfileHtml, pd : tableHtml});
    })

  })

  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
})

router.get('/leeG', function(req, res, next) {
  res.render('game.html');
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

//유저포지션
router.get('/userPosition', function(req, res, next) {
  res.render('userPosition.html');
});

router.get('/whenSeq', function(req, res, next) {
  let whens = [];
  const db = new sqlite3.Database('./public/db/userPosition.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all('SELECT * FROM sixOfWhen ORDER BY whenV ASC', (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }
    var whenSn = 0;
    rows.forEach(row => {
      whenSn = whenSn +1;
      whens.push({sn: whenSn, idx : row.idx, when: row.whenV});
    });
    // 렌더링된 HTML을 클라이언트로 보냄
    res.header("Access-Control-Allow-Origin", "*");
    res.send({ whens : whens});
  });

  //close the database connection
  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
});

router.post('/selectUserPosition', function(req, res, next) {
  let cnt;
  let tableHtml;
  let positions = [];


  let query = `SELECT IDX,WHO,WHEN_EVENT,WHERE_EVENT,WHAT,X,Y,WHEN_EVENT_SEQ FROM sixPrinciples`;

  //타임슬라이더 조건
  // if (condition !== '') {
  //   query += ` WHERE WHEN_EVENT_SEQ = ?`;
  // }

  //위 타임슬라이더 조건에 맞을시
  // 쿼리 실행
  // const parameters = [];
  // if (condition !== '') {
  //   parameters.push(condition);
  // }

  const db = new sqlite3.Database('./public/db/userPosition.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all(query , (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }
    // HTML 표 생성
    tableHtml = '<table id ="myTable"> <tbody><tr><th>N</th><th>WHO</th><th>WHEN</th><th>WHERE</th><th>WHAT</th><th>X</th><th>Y</th></tr>';
    rows.forEach((row) => {
      tableHtml += `<tr><td>${row.IDX}</td><td>${row.WHO}</td><td>${row.WHEN_EVENT}</td><td>${row.WHERE_EVENT}</td><td>${row.WHAT}</td><td>${row.X}</td><td>${row.Y}</td></tr>`;
      positions.push({idx: row.IDX, who: row.WHO, when: row.WHEN_EVENT, where: row.WHERE_EVENT, what: row.WHAT, x: row.X, y: row.Y, whenSeq: row.WHEN_EVENT_SEQ})
    });
    tableHtml += '</tbody></table>';
      
    // 렌더링된 HTML을 클라이언트로 보냄
    res.header("Access-Control-Allow-Origin", "*");
    res.send({ pd : tableHtml, posi : positions});

  });

  //close the database connection
  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
});

//유저포지션받기
router.post('/insertData', (req, res) => {
  let { who, when, where, what, p_x, p_y } = req.body;

  let db = new sqlite3.Database('./public/db/userPosition.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });

  db.run('INSERT INTO sixPrinciples ( WHO, WHEN_EVENT, WHERE_EVENT, WHAT, X, Y) VALUES (?, ?, ?, ?, ? ,?)', [who, when, where, what, p_x, p_y], function(err) {
    if (err) {
      console.log('인서트에인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러인서트에 에러 에러');
      return console.error(err.message);
    }
    console.log(`레코드가 업데이트되었습니다: ${this.changes} 개의 레코드가 변경되었습니다.`);
  });

  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  });
  // 여기서는 가짜 응답을 보냄 (실제로는 디비에 데이터를 삽입하는 코드를 추가해야 함)
  res.json({ success: true, message: 'Data inserted successfully' });
});

//관리자 페이지
router.get('/manageGrid', ensureAuthenticated,(req, res) => {
    res.render('manage/crudGrid.html');
});

router.post('/selectManageGrid', function(req, res, next) {

  if (req.user.id == 5){
  // 조건에 사용할 변수
  const condition = req.body.inputValue; // 예시: 조건 변수

  // 업데이트할 쿼리 문자열 생성
  let query = `SELECT * FROM assets`;

  // 조건 변수가 빈 값이 아닌 경우에만 해당 조건을 포함
  if (condition !== '') {
    query += ` WHERE name = ?`;
  }

  // 쿼리 실행
  const parameters = [];
  if (condition !== '') {
    parameters.push(condition);
  }

  let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all(query, parameters, (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }

    // HTML 표 생성
    let tableHtml = '<table> <tr>   <th></th><th>유저번호</th><th>물건이름</th><th>사용중여부</th></tr>';
    rows.forEach((row) => {
      tableHtml += `<tr><td>${row.assetsId}</td><td>${row.name}</td><td>${row.PdNm}</td><td>${row.useSn}</td></tr>`;
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
  }else{
    res.send('<div>관리자만 조회할 수 있습니다</div>');    
  }

});

router.post('/selectManageMoneyGrid', function(req, res, next) {
  if (req.user.id == 5){
  // 조건에 사용할 변수
  const condition = req.body.inputValue; // 예시: 조건 변수

  // 업데이트할 쿼리 문자열 생성
  let query = `SELECT * FROM user_M`;

  // 조건 변수가 빈 값이 아닌 경우에만 해당 조건을 포함
  if (condition !== '') {
    query += ` WHERE name = ?`;
  }

  // 쿼리 실행
  const parameters = [];
  if (condition !== '') {
    parameters.push(condition);
  }
  
  let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all(query,parameters , (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }

    // HTML 표 생성
    let tableHtml = '<table> <tr><th>유저번호</th><th>자산</th><th>포인트</th></tr>';
    rows.forEach((row) => {
      tableHtml += `<tr><td>${row.name}</td><td>${row.Money}</td><td>${row.SpeP}</td></tr>`;
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
}else{
  res.send('<div>관리자만 조회할 수 있습니다</div>');
}
});

//로비 페이지
router.get('/loby', function(req, res, next) {
  res.render('loby.html'); 
});

module.exports = router;
