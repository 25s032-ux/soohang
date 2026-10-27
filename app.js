// ※ 주석 표기 규칙
//   [변경] 수업 시간 코드를 이 프로젝트(vin)에 맞게 바꾼 부분
//   [추가] 수업 시간 코드에 없던 새 코드
//   표기가 없는 코드는 수업 시간 코드와 같은 방식입니다.
const express = require('express');
const app = express();
const port = 3000;
const template = require('./template');
const sanitizeHtml = require('sanitize-html');
const mysql      = require('mysql2');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '1q2w3e4r5t',
  database : 'vin', // [변경] sunrin -> vin
  port : 3402
});
db.connect();

app.use(express.urlencoded({ extended: true }));

// [변경] 수업 코드는 teacher 목록을 DB에서 조회했지만, 상품 목록은 메인 페이지에만 보이므로 DB 조회를 뺌
function menu(id, callback) {
    callback(template.menu(id));
}

// [추가] 오류 메시지도 template으로 화면을 만들어 보여주는 함수
function showError(res, status, message) {
    menu(null, function(menuHtml){
        res.status(status).send(template.html(menuHtml, template.error(message)));
    });
}

// [변경] 메인 페이지: 소개 문구 아래에 상품 목록을 보여줌 (HTML은 template.home에서 만듦)
app.get('/', (req, res) => {
    db.query('SELECT product_id, product_name, category, price, level from product', function (err, products) {
        if (err) throw err;
        menu(null, function(menuHtml){
            res.send(template.html(menuHtml, template.home(products)));
        })
    });
});

/* ---------- 상품 등록 ---------- */
// [변경] 수업 코드의 teacher 등록 -> product 등록 (office 조회 없음)
app.get('/create', (req, res) => {
    menu(null, function(menuHtml){
        res.send(template.html(menuHtml, template.create()));
    });
});

// [변경] teacher -> product
app.post('/create', (req, res) => {
    const name = sanitizeHtml(req.body.name);
    const category = sanitizeHtml(req.body.category);
    const price = req.body.price === '' ? null : Number(req.body.price);
    const description = req.body.description === '' ? null : sanitizeHtml(req.body.description);
    // [변경] 레벨은 초기값 2로 저장하고, 이후 투표 결과로 바뀐다
    db.query(
        'insert into product (product_name, category, price, description, level) values (?, ?, ?, ?, 2)',
        [name, category, price, description], function (err, results) {
        if (err) throw err;
        res.redirect(`/${results.insertId}`);
    });
});

// [변경] teacher -> product
app.get('/update/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('select * from product where product_id=?',[id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }
        const product = results[0];
        menu(null, function(menuHtml){
            res.send(template.html(menuHtml, template.update(product)))
        });
    });
});

// [변경] teacher -> product
app.post('/update', (req, res) => {
    const id = Number(req.body.id);
    const name = sanitizeHtml(req.body.name);
    const category = sanitizeHtml(req.body.category);
    const price = req.body.price === '' ? null : Number(req.body.price);
    const description = req.body.description === '' ? null : sanitizeHtml(req.body.description);
    db.query(
        'update product set product_name=?, category=?, price=?, description=? where product_id =?',
        [name, category, price, description, id], function (err, results) {
        if (err) throw err;
        res.redirect(`/${id}`);
    });
});

// [변경] teacher -> product
app.get('/delete/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('select * from product where product_id=?',[id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }
        const product = results[0];
        menu(id, function(menuHtml){
            res.send(template.html(menuHtml, template.delete(product)))
        });
    });
});

// [변경] teacher -> product, 상품에 달린 투표(vote)를 먼저 삭제하는 쿼리가 추가됨
app.post('/delete', (req, res) => {
    const id = Number(req.body.id);
    // [추가] 상품에 달린 투표를 먼저 지우고 상품을 삭제한다
    db.query('delete from vote where product_id =?', [id], function (err, results) {
        if (err) throw err;
        db.query('delete from product where product_id =?', [id], function (err, results) {
            if (err) throw err;
            res.redirect(`/`);
        });
    });
});

/* ---------- [추가] 회원가입 ---------- */
app.get('/join', (req, res) => {
    menu(null, function(menuHtml){
        res.send(template.html(menuHtml, template.join()));
    });
});

app.post('/join', (req, res) => {
    const username = sanitizeHtml(req.body.username);
    const password = req.body.password;
    if (username === '' || password === '') {
        return showError(res, 400, '아이디와 비밀번호를 입력하세요.');
    }
    // 아이디 중복 확인
    db.query('select * from user where username=?', [username], function (err, results) {
        if (err) throw err;
        if (results.length > 0) {
            return showError(res, 400, '이미 사용 중인 아이디입니다.');
        }
        db.query('insert into user (username, password, point) values (?, ?, 0)',
            [username, password], function (err, results) {
            if (err) throw err;
            res.redirect('/');
        });
    });
});

/* ---------- [추가] 레벨 + 의류 카테고리 상품 검색 ---------- */
app.get('/search', (req, res) => {
    db.query('select category from product group by category', function (err, categories) {
        if (err) throw err;
        menu(null, function(menuHtml){
            res.send(template.html(menuHtml, template.search(categories)));
        });
    });
});

app.post('/search', (req, res) => {
    const keyword = sanitizeHtml(req.body.keyword);
    const level = req.body.level === '' ? null : Number(req.body.level);
    const category = req.body.category === '' ? null : sanitizeHtml(req.body.category);
    // [추가] 조건 검색: where + like + order by (선택하지 않은 조건은 null이라 전체가 조회됨)
    let sql = `select product_id, product_name, category, price, level from product
        where (? is null or level = ?) and (? is null or category = ?) and product_name like ?`;
    if (req.body.order === 'price') {
        sql += ' order by price asc';
    } else {
        sql += ' order by product_id desc';
    }
    db.query('select category from product group by category', function (err, categories) {
        if (err) throw err;
        db.query(sql, [level, level, category, category, `%${keyword}%`], function (err, products) {
            if (err) throw err;
            menu(null, function(menuHtml){
                res.send(template.html(menuHtml, template.search(categories) + template.searchResult(products)));
            });
        });
    });
});

/* ---------- [추가] 상품 레벨 투표 + 포인트 적립 ---------- */
app.post('/vote', (req, res) => {
    const productId = Number(req.body.product_id);
    const level = Number(req.body.level);
    const username = sanitizeHtml(req.body.username);
    const password = req.body.password;
    if (!Number.isInteger(level) || level < 1 || level > 3) {
        return showError(res, 400, '레벨은 1~3 중에서 선택하세요.');
    }
    // 1) 사용자 확인
    db.query('select * from user where username=? and password=?', [username, password], function (err, users) {
        if (err) throw err;
        if (users.length === 0) {
            return showError(res, 404, '아이디 또는 비밀번호가 올바르지 않습니다.');
        }
        const user = users[0];
        // 2) 이미 투표했는지 확인 (한 상품에 한 번만)
        db.query('select * from vote where user_id=? and product_id=?', [user.user_id, productId], function (err, votes) {
            if (err) throw err;
            if (votes.length > 0) {
                return showError(res, 400, '이미 투표한 상품입니다.');
            }
            // 3) 투표 저장
            db.query('insert into vote (user_id, product_id, level, voted_at) values (?, ?, ?, now())',
                [user.user_id, productId, level], function (err, results) {
                if (err) throw err;
                // 4) 포인트 적립 (10점)
                db.query('update user set point = point + 10 where user_id=?', [user.user_id], function (err, results) {
                    if (err) throw err;
                    // 5) [추가] COUNT + GROUP BY: 가장 많은 표를 받은 레벨 계산 (동점이면 낮은 레벨)
                    db.query(`select level, count(*) as cnt from vote where product_id=?
                        group by level order by cnt desc, level asc`, [productId], function (err, counts) {
                        if (err) throw err;
                        // 6) 상품의 현재 레벨 수정
                        db.query('update product set level=? where product_id=?',
                            [counts[0].level, productId], function (err, results) {
                            if (err) throw err;
                            res.redirect(`/${productId}`);
                        });
                    });
                });
            });
        });
    });
});

/* ---------- [추가] 마이페이지 ---------- */
app.get('/mypage', (req, res) => {
    menu(null, function(menuHtml){
        res.send(template.html(menuHtml, template.login()));
    });
});

app.post('/mypage', (req, res) => {
    const username = sanitizeHtml(req.body.username);
    const password = req.body.password;
    db.query('select * from user where username=? and password=?', [username, password], function (err, users) {
        if (err) throw err;
        if (users.length === 0) {
            return showError(res, 404, '아이디 또는 비밀번호가 올바르지 않습니다.');
        }
        const user = users[0];
        // [추가] user, vote, product 3개 테이블 JOIN
        db.query(`select p.product_id, p.product_name, p.category, p.price,
            p.level as current_level, v.level as my_level, v.voted_at
            from vote v join user u on v.user_id=u.user_id
            join product p on v.product_id=p.product_id
            where u.user_id = ? order by v.voted_at desc`, [user.user_id], function (err, votes) {
            if (err) throw err;
            menu(null, function(menuHtml){
                res.send(template.html(menuHtml, template.mypage(user, votes)));
            });
        });
    });
});

/* ---------- [추가] 상품 및 투표 통계 ---------- */
app.get('/stats', (req, res) => {
    // [추가] left join + COUNT + GROUP BY: 상품별/레벨별 투표 수
    db.query(`select p.product_id, p.product_name, p.level as current_level,
        v.level as vote_level, count(v.vote_id) as cnt
        from product p left join vote v on p.product_id=v.product_id
        group by p.product_id, p.product_name, p.level, v.level
        order by p.product_id, v.level`, function (err, results) {
        if (err) throw err;
        menu(null, function(menuHtml){
            res.send(template.html(menuHtml, template.stats(results)));
        });
    });
});

/* ---------- 상품 상세 ---------- */
// [변경] 수업 코드의 teacher 상세 -> product 상세 (투표 현황, 투표 내역 조회가 추가됨)
app.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) { return res.status(404).send('404 Not Found'); }
    db.query('select * from product where product_id = ?', [id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }
        const product = results[0];
        // [추가] COUNT + GROUP BY: 레벨별 투표 수
        db.query('select level, count(*) as cnt from vote where product_id=? group by level order by level',
            [id], function (err, rows) {
            if (err) throw err;
            const counts = [0, 0, 0];
            for (let i = 0; i < rows.length; i++){
                counts[rows[i].level - 1] = rows[i].cnt;
            }
            // [추가] user, vote, product 3개 테이블 JOIN: 이 상품에 투표한 사용자 목록
            db.query(`select u.username, v.level, v.voted_at
                from vote v join user u on v.user_id=u.user_id
                join product p on v.product_id=p.product_id
                where p.product_id = ? order by v.voted_at desc`, [id], function (err, voters) {
                if (err) throw err;
                menu(id, function(menuHtml){
                    res.send(
                        template.html(menuHtml, template.read(product, counts, voters))
                    );
                })
            });
        });
    });
});

app.listen(port, () => {
    console.log(`server running on PORT ${port}`);
});