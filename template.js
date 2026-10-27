// ※ 주석 표기 규칙
//   [변경] 수업 시간 코드를 이 프로젝트(vin)에 맞게 바꾼 부분
//   [추가] 수업 시간 코드에 없던 새 코드
//   표기가 없는 코드는 수업 시간 코드와 같은 방식입니다.
module.exports = {
  // [변경] 제목 문구만 바뀜 (스타일/구조는 수업 코드와 동일)
  html(menu, body) {
      return `
          <!DOCTYPE html>
          <html lang="ko">
          <head>
              <meta charset="UTF-8">
              <title>취향 단계로 찾는 빈티지 쇼핑몰</title>
              <style>
                  * {
                      box-sizing: border-box;
                  }
                  body {
                      margin: 0;
                      font-family: Arial, sans-serif;
                      background: #f4f6f8;
                      color: #222;
                  }
                  .wrap {
                      width: 900px;
                      margin: 40px auto;
                  }
                  .header {
                      background: white;
                      padding: 20px 28px;
                      border-radius: 12px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                      margin-bottom: 20px;
                  }
                  .header h1 {
                      margin: 0;
                      font-size: 26px;
                  }
                  .header a {
                      color: #222;
                      text-decoration: none;
                  }
                  .content {
                      display: grid;
                      grid-template-columns: 220px 1fr;
                      gap: 20px;
                  }
                  .menu {
                      background: white;
                      padding: 20px;
                      border-radius: 12px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                  }
                  .body {
                      background: white;
                      padding: 28px;
                      border-radius: 12px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                  }
                  a {
                      color: #2563eb;
                      text-decoration: none;
                  }
                  a:hover {
                      text-decoration: underline;
                  }
              </style>
          </head>
          <body>
              <div class="wrap">
                  <div class="header">
                      <h1><a href="/">취향 단계로 찾는 빈티지 쇼핑몰</a></h1>
                  </div>
                  <div class="content">
                      <div class="menu">
                          ${menu}
                      </div>
                      <div class="body">
                          ${body}
                      </div>
                  </div>
              </div>
          </body>
          </html>
      `;
  },
  // [변경] 상품 목록은 메인 페이지로 옮겼고, Search/Stats/Join/MyPage 링크가 추가됨
  menu(id) {
      let result = '';
      result += '<a href="/create">Create</a>';
      if (id) {
          result += `<br><a href="/update/${id}">Update</a>`;
          result += `<br><a href="/delete/${id}">Delete</a>`;
      }
      result += '<hr>';
      result += '<a href="/search">Search</a>'; // [추가]
      result += '<br><a href="/stats">Stats</a>'; // [추가]
      result += '<hr>';
      result += '<a href="/join">Join</a>'; // [추가]
      result += '<br><a href="/mypage">MyPage</a>'; // [추가]
      return result;
  },
  // [추가] 메인 페이지: 소개 문구 + 상품 목록
  home(products) {
      let list = '<h3>상품 목록</h3><ol>';
      if (products.length === 0) {
          list += '<li>등록된 상품이 없습니다.</li>';
      }
      for (let i = 0; i < products.length; i++){
          list += `<li><a href='/${products[i].product_id}'>${products[i].product_name}</a>
              - ${products[i].category} / ${products[i].price ?? '미정'} / ${products[i].level}레벨</li>
          `;
      }
      list += '</ol>';
      return `
          <h2>메인페이지</h2>
          <p>취향 단계로 찾는 빈티지 쇼핑몰 입니다.</p>
          <p>옷 종류와 '튀는 정도(1~3레벨)'로 원하는 빈티지 옷을 찾아보세요.</p>
          ${list}
      `;
  },
  // [변경] teacher -> product (교무실 select 대신 상품 입력 항목)
  create() {
      return `
          <h2>Create</h2>
          <form action="/create" method="post">
              <p><input type="text" name="name" placeholder="상품명"></p>
              <p><input type="text" name="category" placeholder="의류 종류 (예: 후드집업)"></p>
              <p><input type="text" name="price" placeholder="가격 (비우면 미정)"></p>
              <p><input type="text" name="description" placeholder="상품 설명"></p>
              <p><button type="submit">send</button></p>
          </form>
      `;
  },
  // [변경] teacher -> product
  update(product) {
      return `
          <h2>Update</h2>
          <form action="/update" method="post">
              <input type="hidden" name="id" value="${product.product_id}">
              <p><input type="text" name="name" value="${product.product_name}"></p>
              <p><input type="text" name="category" value="${product.category}"></p>
              <p><input type="text" name="price" value="${product.price ?? ''}"></p>
              <p><input type="text" name="description" value="${product.description ?? ''}"></p>
              <p><button type="submit">수정</button></p>
          </form>
      `;
  },
  // [변경] teacher -> product
  delete(product){ //삭제 화면 생성
      return  `
          <h2>Delete</h2>
          <p>${product.product_name} 상품을 삭제하시겠습니까?</p>
          <form action="/delete" method="post">
              <input type="hidden" name="id" value="${product.product_id}">
              <button type="submit">삭제</button>
          </form>
      `;
  },
  // [변경] teacher -> product 상세. 투표 현황(counts), 투표 폼, 투표 내역(voters)이 추가됨
  read(product, counts, voters){
      // [추가] 투표 내역 목록
      let voterList = '';
      for (let i = 0; i < voters.length; i++){
          voterList += `<li>${voters[i].username} - ${voters[i].level}레벨 (${voters[i].voted_at})</li>`;
      }
      return `
          <h2>${product.product_name}</h2>
          <p>카테고리 : ${product.category}</p>
          <p>가격 : ${product.price ?? '미정'}</p>
          <p>설명 : ${product.description ?? ''}</p>
          <p>현재 레벨 : ${product.level}레벨</p>
          <h3>투표 현황</h3>
          <p>1레벨 : ${counts[0]}표 / 2레벨 : ${counts[1]}표 / 3레벨 : ${counts[2]}표</p>
          <h3>레벨 투표</h3>
          <form action="/vote" method="post">
              <input type="hidden" name="product_id" value="${product.product_id}">
              <p><input type="text" name="username" placeholder="아이디"></p>
              <p><input type="password" name="password" placeholder="비밀번호"></p>
              <p><select name="level">
                  <option value="1">1레벨 (무난)</option>
                  <option value="2">2레벨 (적당히 개성)</option>
                  <option value="3">3레벨 (매우 독특)</option>
              </select></p>
              <p><button type="submit">투표</button></p>
          </form>
          <h3>투표 내역</h3>
          <ul>${voterList}</ul>
      `;
  },
  // [추가] 오류 메시지 화면
  error(message){
      return `
          <h2>알림</h2>
          <p>${message}</p>
          <p><a href="/">메인으로</a></p>
      `;
  },
  // [추가] 회원가입 화면
  join(){
      return `
          <h2>Join</h2>
          <form action="/join" method="post">
              <p><input type="text" name="username" placeholder="아이디"></p>
              <p><input type="password" name="password" placeholder="비밀번호"></p>
              <p><button type="submit">가입</button></p>
          </form>
      `;
  },
  // [추가] 마이페이지 로그인 화면
  login(){
      return `
          <h2>MyPage</h2>
          <form action="/mypage" method="post">
              <p><input type="text" name="username" placeholder="아이디"></p>
              <p><input type="password" name="password" placeholder="비밀번호"></p>
              <p><button type="submit">조회</button></p>
          </form>
      `;
  },
  // [추가] 마이페이지: 포인트 + 내가 투표한 상품 목록
  mypage(user, votes){
      let list = '';
      if (votes.length === 0){
          list += '<li>투표한 상품이 없습니다.</li>';
      }
      for (let i = 0; i < votes.length; i++){
          list += `<li><a href="/${votes[i].product_id}">${votes[i].product_name}</a>
              - ${votes[i].category} / ${votes[i].price ?? '미정'}
              / 내 투표 ${votes[i].my_level}레벨 / 현재 ${votes[i].current_level}레벨
              (${votes[i].voted_at})</li>`;
      }
      return `
          <h2>${user.username} 님의 마이페이지</h2>
          <p>보유 포인트 : ${user.point}점</p>
          <h3>내가 투표한 상품</h3>
          <ul>${list}</ul>
      `;
  },
  // [추가] 검색 폼
  search(categories){
      let categoryList = '<option value="">모든 의류</option>';
      for (let i = 0; i < categories.length; i++){
          categoryList += `<option value="${categories[i].category}">${categories[i].category}</option>`;
      }
      return `
          <h2>Search</h2>
          <form action="/search" method="post">
              <p><input type="text" name="keyword" placeholder="상품명 검색"></p>
              <p><select name="level">
                  <option value="">모든 레벨</option>
                  <option value="1">1레벨</option>
                  <option value="2">2레벨</option>
                  <option value="3">3레벨</option>
              </select></p>
              <p><select name="category">${categoryList}</select></p>
              <p><select name="order">
                  <option value="new">최신순</option>
                  <option value="price">가격 낮은순</option>
              </select></p>
              <p><button type="submit">검색</button></p>
          </form>
      `;
  },
  // [추가] 검색 결과 목록
  searchResult(products){
      let list = '<h3>검색 결과</h3><ul>';
      if (products.length === 0) {
          list += '<li>조건에 맞는 상품이 없습니다.</li>';
      }
      for (let i = 0; i < products.length; i++){
          list += `<li><a href='/${products[i].product_id}'>${products[i].product_name}</a>
              - ${products[i].category} / ${products[i].price ?? '미정'} / ${products[i].level}레벨</li>
          `;
      }
      list += '</ul>';
      return list;
  },
  // [추가] 통계 화면: 상품별 전체 투표 수와 레벨별 투표 수
  stats(results){
      let list = `<h2>상품 및 투표 통계</h2><ul>`;
      let counts = [0, 0, 0];
      for (let i = 0; i < results.length; i++){
          if (results[i].vote_level !== null){
              counts[results[i].vote_level - 1] = results[i].cnt;
          }
          // 같은 상품의 마지막 행에서 한 줄을 출력한다
          if (i === results.length - 1 || results[i + 1].product_id !== results[i].product_id){
              list += `<li><a href='/${results[i].product_id}'>${results[i].product_name}</a>
                  - 현재 ${results[i].current_level}레벨
                  (전체 ${counts[0] + counts[1] + counts[2]}표 /
                  1레벨 ${counts[0]}표 / 2레벨 ${counts[1]}표 / 3레벨 ${counts[2]}표)
              </li>
              `;
              counts = [0, 0, 0];
          }
      }
      list += '</ul>';
      return list;
  }
};