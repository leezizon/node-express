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
  console.log('.deserializeUser');
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


///////////////////////////////////////////////////////////////////////
//디비설정//
//////////////////////////////////////////////////////////////
// const userPositionDb = new sqlite3.Database('./public/db/userPosition.db', (err) => {
//   if (err) {
//       console.error(err.message);
//   }
//   console.log('Connected to the chinook database.');
// });



//상품
router.get('/leePd2', function(req, res, next) {
  
  const param1 = req.query.param1;

  let dbIndex = 0;
  let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all('SELECT * FROM product LIMIT 6 OFFSET ?',[param1], (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }

    // HTML 표 생성
    let tableHtml = '';
    
    tableHtml += `<div class="horizontal-line"></div>`

    rows.forEach((row) => {
      dbIndex += 1;
      tableHtml += 
      `<section class="product" id="Pd${row.PdId}">
      <div class="product-detail">${row.PdNm}<img src="shopitem/${row.PdId}.png" alt="상품 이미지"></div>     
      <div class = "custom-buttons">
      <button id="getPdEx${row.PdId}"  class="custom-button2"><input type="hidden" class="hiddenField" value="${row.PdEx}">설명</button>
      <button id="getPd${row.PdId}"  class="custom-button"><input type="hidden" class="hiddenField" value="${row.PdPrice}원">담기</button>
      </div>
      </section>`
      if(dbIndex == 3){
        tableHtml += `<div class="horizontal-line"></div>`
      } 
    });

    tableHtml += `<div class="horizontal-line"></div>`

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

//상품구매
router.post('/save', function(req, res) {


  
  if (req.isAuthenticated() == false) {
    console.log('로그인해주세요');
    res.json('F');
    return;
  }
  var b_product_id = req.body.PdId;

  if (Array.isArray(b_product_id)) {
    console.log('이 변수는 배열입니다.');
  } else {
    b_product_id = [b_product_id];
  }

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

  async function processProducts(req, res) {
    try {
      const userRows = await getUserData(req.user.id);

      //업데이트할 변수들(유저 자산, 재고상황)
      let updatedUserMoney = userRows[0].Money;
      let updatedProductCnt;

      for (let i = 0; i < b_product_id.length; i++) {
        const productRows = await getProductData(parseInt(b_product_id[i].pdId));

        if (productRows.length > 0) {
          const row = productRows[0];
          b_product_cost = row.PdPrice;
          b_product_cnt = row.PdCnt;
          b_product_nm = row.PdNm;

          if (userRows.length > 0 && userRows[0].Money >= b_product_cost) {
            updatedProductCnt = b_product_cnt - parseInt(b_product_id[i].count);
            updatedUserMoney = updatedUserMoney - b_product_cost*parseInt(b_product_id[i].count);
            const updatedUserName = req.user.name;

            await PD_U_A_D(req.user.id, parseInt(b_product_id[i].pdId), updatedProductCnt, b_product_nm, updatedUserMoney, updatedUserName, parseInt(b_product_id[i].count));
          } else {
            res.json('N');
            return;
          }
        }
      }

      res.json('T');
      await shutDb();
    } catch (error) {
      console.error(error);
      res.status(500).json('Internal Server Error');
    }
  }


  // 유저 정보 조회
  function getUserData(userId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM user_M WHERE id = ?', [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 상품 정보 조회
  function getProductData(productId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM product WHERE PdId = ?', [productId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // db 업데이트 인서트
  async function PD_U_A_D(id, b_pd_id, b_pd_cnt, b_pd_nm, f_m, user_name, toBuyProductCount) {
    await updateProduct(id, b_pd_id, b_pd_cnt);
    await updateUserMoney(id, f_m, toBuyProductCount);
    await insertAssets(id, b_pd_nm, b_pd_id, 'Y', user_name, toBuyProductCount);
  }

  // 상품 정보 업데이트
  function updateProduct(id, b_pd_id, b_pd_cnt) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE product SET PdCnt = ? WHERE PdId = ?', [b_pd_cnt, b_pd_id], function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`Product Updated: ${this.changes} records changed.`);
          resolve();
        }
      });
    });
  }

  // 유저 돈 업데이트
  function updateUserMoney(id, f_m) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE user_M SET Money = ? WHERE id = ?', [f_m, id], function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`User Money Updated: ${this.changes} records changed.`);
          resolve();
        }
      });
    });
  }

  // 자산 정보 삽입
  function insertAssets(id, b_pd_nm, b_pd_id, useSn, user_name, toBuyProductCount) {
    return new Promise((resolve, reject) => {
      //물건갯수에 맞게 포문돌기
      for(let i =0; i < toBuyProductCount; i++){
        db.run('INSERT INTO assets (assetsWithUserId, PdNm, PdId, useSn, name) VALUES (?, ?, ?, ?, ?)', [id, b_pd_nm, b_pd_id, useSn, user_name], function (err) {
          if (err) {
            console.error(err.message);
            reject(err);
          } else {
            console.log(`Asset Inserted: ${this.changes} records changed.`);
            resolve();
          }
        });
      }
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
    });
  }

  processProducts(req, res);

})

//이름, 자산정보만 빼오기
router.get('/inShopMyMoney', (req, res) => {
  console.log('내상품정보2');

  if (req.isAuthenticated() == false) {
    console.log('로그인해주세요');
    return;
  }

  let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  console.log(req.user.id);
  db.all('SELECT * FROM user_M WHERE id = ?' ,[req.user.id], (err, rows) => {

    console.log(rows[0].Money);
    res.send({name:req.user.name, money:rows[0].Money});

  })

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
    //res.header("Access-Control-Allow-Origin", "*");
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

router.post('/selectUserPosition', async (req, res) => {
  let tableHtml;
  let selectHtml_who;
  let selectHtml_where;
  let selectHtml_when;
  let positions = [];


  let query = `SELECT IDX,WHO,WHEN_EVENT,WHERE_EVENT,WHAT,X,Y,WHEN_EVENT_SEQ,WHO_EVENT_SEQ FROM sixPrinciples`;
  let query_who = `SELECT * FROM sixOfWho`;
  let query_where = `SELECT * FROM sixOfWhere`;
  let query_when = `SELECT * FROM sixOfWhen`;

  
  const db = new sqlite3.Database('./public/db/userPosition.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  // db.all(query , (err, rows) => {
  //   if (err) {
  //     return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
  //   }
  //   // HTML 표 생성
  //   tableHtml = '<table id ="myTable"> <tbody><tr><th>N</th><th>WHO</th><th>WHEN</th><th>WHERE</th><th>WHAT</th><th>X</th><th>Y</th></tr>';
  //   rows.forEach((row) => {
  //     tableHtml += `<tr><td>${row.IDX}</td><td>${row.WHO}</td><td>${row.WHEN_EVENT}</td><td>${row.WHERE_EVENT}</td><td>${row.WHAT}</td><td>${row.X}</td><td>${row.Y}</td></tr>`;
  //     positions.push({idx: row.IDX, who: row.WHO, when: row.WHEN_EVENT, where: row.WHERE_EVENT, what: row.WHAT, x: row.X, y: row.Y, whenSeq: row.WHEN_EVENT_SEQ, whoSeq: row.WHO_EVENT_SEQ})
  //     console.log(row.WHO_EVENT_SEQ);
  //   });
  //   tableHtml += '</tbody></table>';
    
    

    // 렌더링된 HTML을 클라이언트로 보냄
    //res.header("Access-Control-Allow-Origin", "*");
    //res.send({ pd : tableHtml, posi : positions});

  //});
  



  // 여러 개의 쿼리를 비동기적으로 실행
  const queryAlls = await queryAll();  // 첫 번째 쿼리
  const queryWhos = await queryWho();  // 두 번째 쿼리
  const queryWheres = await queryWhere();  // 두 번째 쿼리
  const queryWhens = await queryWhen();  // 두 번째 쿼리
  

  // select옵션생성
  selectHtml_who = '<select>';
  queryWhos.forEach((row) => {
    selectHtml_who += `<option value="${row.idx}">${row.whoV}</option>`;
    console.log(row.whoV);
  });
  selectHtml_who += '</select>';

   selectHtml_when = '<select>';
  queryWhens.forEach((row) => {
    selectHtml_when += `<option value="${row.idx}">${row.whenV}</option>`;
    console.log(row.whenV);
  });
  selectHtml_when += '</select>';

   selectHtml_where = '<select>';
  queryWheres.forEach((row) => {
    selectHtml_where += `<option value="${row.idx}">${row.whereV}</option>`;
    console.log(row.whereV);
  });
  selectHtml_where += '</select>';

   // HTML 표 생성
  tableHtml = '<table id ="myTable"> <tbody><tr><th>N</th><th>WHO</th><th>WHEN</th><th>WHERE</th><th>WHAT</th><th>X</th><th>Y</th></tr>';
  queryAlls.forEach((row) => {
    tableHtml += `<tr><td>${row.IDX}</td><td>${row.WHO}</td><td>${row.WHEN_EVENT}</td><td>${row.WHERE_EVENT}</td><td>${row.WHAT}</td><td>${row.X}</td><td>${row.Y}</td></tr>`;
    //캐릭터 색 배치를 위해 쿼리 끼우기(row2.whoC를 추가하기위함)
    queryWhos.forEach((row2) => {
      //겹포문으로 수가 늘어나지않도록 같은 idx를 가진 row만 push
      if(row2.idx==row.WHO_EVENT_SEQ){
        positions.push({idx: row.IDX, who: row.WHO, when: row.WHEN_EVENT, where: row.WHERE_EVENT, what: row.WHAT, x: row.X, y: row.Y, whenSeq: row.WHEN_EVENT_SEQ, whoSeq: row.WHO_EVENT_SEQ, whoColor: row2.whoC });
        console.log(row2.whoC );
        console.log(row.WHO_EVENT_SEQ);
      }
    });
  });
  tableHtml += '</tbody></table>';
    
    

    // 렌더링된 HTML을 클라이언트로 보냄
    //res.header("Access-Control-Allow-Origin", "*");
  res.send({sh_who : selectHtml_who, sh_where : selectHtml_where, sh_when : selectHtml_when , pd : tableHtml, posi : positions});
    // 첫 번째 쿼리를 실행하는 함수

    function queryWho() {
      return new Promise((resolve, reject) => {
        db.all(query_who, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }

    function queryWhen() {
      return new Promise((resolve, reject) => {
        db.all(query_when, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }

    function queryWhere() {
      return new Promise((resolve, reject) => {
        db.all(query_where, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }

    function queryAll() {
      return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }

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

//상점프론트 예시
router.get('/front_ex', function(req, res, next) {
  res.render('front.html'); 
});

module.exports = router;
