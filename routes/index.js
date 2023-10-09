const sqlite3 = require('sqlite3').verbose();
var express = require('express');
var router = express.Router();

const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const bodyParser = require('body-parser');

router.use(expressSession({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
router.use(bodyParser.urlencoded({ extended: true }));
router.use(passport.initialize());
router.use(passport.session());

// 사용자 데이터베이스 시뮬레이션 (실제로는 데이터베이스를 사용해야 합니다)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

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
    db.get("SELECT * FROM student WHERE email = ? AND password = ?", [username, password], (err, row) => {
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
  const user = users.find(u => u.id === id);
  done(null, user);
});


function ensureAuthenticated(req, res, next) {
  console.log(req.isAuthenticated());
  if (req.isAuthenticated()) {
    console.log('미들웨어');
    return next(); // 로그인 상태면 다음 미들웨어로 이동
  }
  res.redirect('/lee'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
}

router.get('/', ensureAuthenticated, (req, res) => {
  res.render('shop.html'); // 보호된 페이지 템플릿을 렌더링
});

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


router.get('/leeQu', function(req, res, next) {
  
  let db = new sqlite3.Database('./public/db/chinook.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
  });
  
  db.all('SELECT * FROM student', (err, rows) => {
    if (err) {
      return res.send('데이터베이스에서 정보를 가져오지 못했습니다.');
    }
    console.log(rows);

    // HTML 표 생성
    let tableHtml = '<table>';

    rows.forEach((row) => {
      tableHtml += `<tr><td>${row.id}</td><td>${row.name}</td><td>${row.email}</td><td>${row.password}</td></tr>`;
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

    console.log('asdasdasd');
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
    console.log(rows);

    // HTML 표 생성
    let tableHtml = '';

    rows.forEach((row) => {
      tableHtml += `
      <section class="product">
      <img src="shopitem/ebool_${row.PdId}.png" alt="상품 이미지">
      <div class="product-details">
      <h2>${row.PdNm}</h2>
      <p>상품설명상품설명상품설명상품설명상품설명상품설명상품설명.</p>
      <p class="price">가격: ${row.PdPrice}</p>
      <p class="price">재고: ${row.PdCnt}</p>
      </div>
      <button>구매</button>
      //<button onclick="postData(this)">구매</button>
      </section>`
    });

    tableHtml += '';

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

    console.log('asdasdasd');
  });
});

router.get('/leeG', function(req, res, next) {
  res.render('game.html');
});

module.exports = router;
