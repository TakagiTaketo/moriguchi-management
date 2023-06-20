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