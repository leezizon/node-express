const sqlite3 = require('sqlite3').verbose();
var express = require('express');

//app에서가져온 router
var router = express.Router();

//로그인세션, 데이터를 보내고 가져오기위한 라이브러리들
const passport = require('passport');
const expressSession = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');

//세션키 사용,설정
router.use(expressSession(
  { secret: 'your-secret-key', 
  resave: false, 
  saveUninitialized: false ,    
  cookie: {
    // 쿠키 설정 (예: 세션 쿠키의 만료 시간 등)
    maxAge: 60 * 60 * 1000, // 1시간
    httpOnly: true, // HTTP 전용 쿠키로 설정
    secure: process.env.NODE_ENV === "production" ? true : false, //https 적용 시 true
    sameSite: process.env.NODE_ENV === "production" ? "none" : false,
  }
}));
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
        console.log(process.env.NODE_ENV);
        console.log('로그인 성공');
        return done(null, row);
    });

    db.close((err) => {
      if (err) {
        console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
      } else {
        console.log('데이터베이스 연결이 종료되었습니다.');
      }
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

  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
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
// router.post("/login", passport.authenticate('local', {
//   successRedirect: '/',
//   failureRedirect: '/lee',
//   failureFlash: true
// })
// );
// 로그인 엔드포인트
router.post("/login", (req, res, next) => {
  // passport.authenticate()를 사용하여 로그인 처리
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // 로그인 실패 시 실패 리디렉션
      return res.redirect('/lee');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // 로그인 성공 시 성공 리디렉션
      return res.redirect('/');
    });
  })(req, res, next);
});

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


router.post('/selectAllUser', function(req, res, next) {

  if (req.user.id == 5){

  let db = new sqlite3.Database('./public/db/shop.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all('SELECT * FROM user_M', (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }

    // HTML 표 생성
    let tableHtml = '<tr><th>유저번호</th><th>아이디</th><th>자산</th><th>포인트</th></tr>';
    rows.forEach((row) => {
      tableHtml += `<tr><td>${row.id}</td><td>${row.name}</td><td>${row.Money}</td><td>${row.SpeP}</td></tr>`;
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
  }else{
    res.send('<div>관리자만 조회할 수 있습니다</div>');    
  }

});

router.post('/insertUser', function(req, res, next) {

  if (req.user.id == 5){
    let db = new sqlite3.Database('./public/db/shop.db', (err) => {
      if (err) {
          console.error(err.message);
      }
      console.log('Connected to the chinook database.');
    });
  
    for(i=0;i<req.body.length;i++){
      db.run('UPDATE user_M SET Money = ? WHERE id = ?', [req.body[i].Money,req.body[i].id], function (err) {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`Asset Inserted: ${this.changes} records changed.`);
        }
      });
    }

    db.close((err) => {
      if (err) {
        console.error('데이터베이스 연결 종료 중 오류 발생:', err.message);
        res.send('오류');
      } else {
        console.log('데이터베이스 연결이 종료되었습니다.');
        res.send('성공');
      }
    });
  }

});

module.exports = router;
