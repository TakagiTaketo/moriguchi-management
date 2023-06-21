import fetch from 'node-fetch';
import express from 'express';
import ClientPg from 'pg';
const { Client } = ClientPg;
const PORT = process.env.PORT || 5001


// Postgresへの接続
const connection = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});
connection.connect();


express()
  .use(express.static('public'))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  //  .use(express.static(path.join(__dirname, 'public')))
  //.set('views', path.join(__dirname, 'views'))
  //.set('view engine', 'ejs')
  //.get('/', (req, res) => res.render('pages/index'))
  .get('/', (req, res) => { res.sendStatus(200); })
  .post('/selectWeekReserve', (req, res) => selectWeekReserve(req, res)) // 予約データ取得
  .post('/selectNoReserve', (req, res) => selectNoReserve(req, res)) // 予約不可データ取得
  .post('/selectClickReserve', (req, res) => selectClickReserve(req, res)) // クリックした予約情報の取得
  .post('/insertNoReserve', (req, res) => insertNoReserve(req, res)) // 休診の登録
  .post('/updateReserveTorikeshi', (req, res) => updateReserveTorikeshi(req, res)) // 予約の取り消し
  .post('/updateNoReserveTorikeshi', (req, res) => updateNoReserveTorikeshi(req, res)) // 休診の取り消し
  .post('/insertReserve', (req, res) => insertReserve(req, res)) // 新規予約の追加
  .listen(PORT, () => console.log(`Listening on ${PORT}`))


// 予約カレンダー取得
const selectWeekReserve = (req, res) => {
  const data = req.body;
  console.log('data:' + data);
  const startDate = data.startDate;
  const endDate = data.endDate;
  console.log('selectWeekREserve()のstartDate:' + startDate);
  console.log('selectWeekREserve()のendDate:' + endDate);
  // SELECT文
  const select_query = {
    text: `SELECT name, reserve_date, reserve_time FROM reserves WHERE delete_flg=0 AND reserve_date BETWEEN '${startDate}' AND '${endDate}' ORDER BY reserve_date ASC, reserve_time ASC;`
  };
  let dataList = [];

  // SQL実行
  connection.query(select_query)
    .then(data => {
      for (let i = 0; i < data.rows.length; i++) {
        let tmp_data = {};
        tmp_data.name = data.rows[i].name;
        tmp_data.reserve_date = data.rows[i].reserve_date;
        tmp_data.reserve_time = data.rows[i].reserve_time;
        dataList.push(tmp_data);
      }

      console.log('selectWeekReserve()のdataList' + JSON.stringify(dataList));
      res.status(200).send((JSON.stringify(dataList)));
    })
    .catch(e => console.log(e))
    .finally(() => {
      req.connection.end;
    });
};

// 予約不可日の取得
const selectNoReserve = (req, res) => {
  const data = req.body;
  const startDate = data.startDate;
  const endDate = data.endDate;
  console.log('selectNoReserve()のstartDate:' + startDate);
  console.log('selectNoReserve()のendDate:' + endDate);

  const select_query = {
    text: `SELECT name, no_reserve_date, no_reserve_time FROM no_reserves WHERE delete_flg=0 AND no_reserve_date BETWEEN '${startDate}' AND '${endDate}' ORDER BY no_reserve_date ASC, no_reserve_time ASC;`
  };
  let dataList = [];
  connection.query(select_query)
    .then(data => {
      for (let i = 0; i < data.rows.length; i++) {
        let tmp_data = {};
        tmp_data.name = data.rows[i].name;
        tmp_data.no_reserve_date = data.rows[i].no_reserve_date;
        tmp_data.no_reserve_time = data.rows[i].no_reserve_time;
        dataList.push(tmp_data);
      }
      console.log('selectNoReserve()のdataList:' + JSON.stringify(dataList));
      res.status(200).send((JSON.stringify(dataList)));
    })
    .catch(e => console.log(e))
    .finally(() => {
      req.connection.end;
    });
}

// クリックした予約情報の取得
const selectClickReserve = (req, res) => {
  const data = req.body;
  const reserve_date = data.date;
  const reserve_time = data.time;
  console.log('selectClickReserve()のreserve_date:' + reserve_date);
  console.log('selectClickReserve()のreserve_time:' + reserve_time);
  const select_query = {
    text: `SELECT name FROM reserves WHERE delete_flg=0 AND reserve_date='${reserve_date}' AND reserve_time='${reserve_time}';`
  };

  connection.query(select_query)
    .then(data => {
      let username = '';
      if (data.rows.length > 0) {
        username = data.rows[0].name;
      }
      console.log('selectClickReserve()のusername:' + username);
      res.status(200).send({ username });
    })
    .catch(e => console.log(e))
    .finally(() => {
      req.connection.end;
    });

}

// 休診日の登録
const insertNoReserve = (req, res) => {
  const data = req.body;
  const username = data.username;
  const no_reserve_date = data.no_reserve_date;
  const no_reserve_time = data.no_reserve_time;
  // タイムスタンプ整形
  let created_at = '';
  let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  console.log('date:' + date);
  created_at = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/'
    + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':'
    + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

  console.log('insertNoReserve()のusername:' + username);
  console.log('insertNoReserve()のreserve_date:' + no_reserve_date);
  console.log('insertNoReserve()のreserve_time:' + no_reserve_time);
  const insert_query = {
    text: `INSERT INTO no_reserves(name, no_reserve_date, no_reserve_time, created_at, delete_flg) VALUES ($1, $2, $3, $4, $5);`,
    values: [username, no_reserve_date, no_reserve_time, created_at, 0]
  };

  connection.query(insert_query)
    .then(() => {
      let message = '予約不可日の登録完了';
      res.status(200).send({ message });
    })
    .catch(e => console.log(e))
    .finally(() => {
      req.connection.end;
    });
}

// 予約取消
const updateReserveTorikeshi = (req, res) => {
  const data = req.body;
  const username = data.username;
  const reserve_date = data.reserve_date;
  const reserve_time = data.reserve_time;
  // タイムスタンプ整形
  let updated_at = '';
  let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  updated_at = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/'
    + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':'
    + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

  console.log('updateReserveTorikeshi()のusername:' + username);
  console.log('updateReserveTorikeshi()のreserve_date:' + reserve_date);
  console.log('updateReserveTorikeshi()のreserve_time:' + reserve_time);
  console.log('updateReserveTorikeshi()のupdated_at:' + updated_at);
  const update_query = {
    text: `UPDATE reserves SET updated_at='${updated_at}', delete_flg=1 WHERE name='${username}' AND reserve_date='${reserve_date}' AND reserve_time='${reserve_time}';`,
  };

  connection.query(update_query)
    .then(() => {
      let message = '予約取消完了';
      console.log(message);
      res.status(200).send({ message });
    })
    .catch(e => console.log(e))
    .finally(() => {
      req.connection.end;
    });
}

// 休診の取消
const updateNoReserveTorikeshi = (req, res) => {
  const data = req.body;
  const username = data.username;
  const reserve_date = data.reserve_date;
  const reserve_time = data.reserve_time;
  // タイムスタンプ整形
  let updated_at = '';
  let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  updated_at = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/'
    + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':'
    + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

  console.log('updateNoReserveTorikeshi()のusername:' + username);
  console.log('updateNoReserveTorikeshi()のreserve_date:' + reserve_date);
  console.log('updateNoReserveTorikeshi()のreserve_time:' + reserve_time);
  console.log('updateNoReserveTorikeshi()のupdated_at:' + updated_at);
  const update_query = {
    text: `UPDATE no_reserves SET updated_at='${updated_at}', delete_flg=1 WHERE no_reserve_date='${reserve_date}' AND no_reserve_time='${reserve_time}';`,
  };

  connection.query(update_query)
    .then(() => {
      let message = '休診取消完了';
      console.log(message);
      res.status(200).send({ message });
    })
    .catch(e => console.log(e))
    .finally(() => {
      req.connection.end;
    });
}

// 予約ボタン
// 予約不可日の登録
const insertReserve = (req, res) => {
  const data = req.body;
  const username = data.username;
  const birthday = data.birthday;
  const line_uid = data.line_uid;
  const reserve_date = data.reserve_date;
  const reserve_time = data.reserve_time;
  // タイムスタンプ整形
  let created_at = '';
  let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  console.log('date:' + date);
  created_at = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/'
    + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':'
    + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

  console.log('insertReserve()のusername:' + username);
  console.log('insertReserve()のreserve_date:' + reserve_date);
  console.log('insertReserve()のreserve_time:' + reserve_time);
  const insert_query = {
    text: `INSERT INTO reserves(line_uid, name, reserve_date, reserve_time, created_at, delete_flg, birthday) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
    values: [line_uid, username, reserve_date, reserve_time, created_at, 0, birthday]
  };

  connection.query(insert_query)
    .then(() => {
      let message = '予約登録完了';
      console.log(message);
      res.status(200).send({ message });
    })
    .catch(e => console.log(e))
    .finally(() => {
      req.connection.end;
    });
}
