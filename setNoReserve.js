import ClientPg from 'pg';
const { Client } = ClientPg;

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
connection.connect(function (err) {
    if (err) {
        console.error('error connecting:' + err.stack);
        return;
    }
    console.log('connected as id' + connection.threadId);
});

setSyukujitsu();

//メッセージを送る処理
function sendMessage(message, line_uid) {
    console.log("message:" + message);
    bot.pushMessage(line_uid, {  //送りたい相手のUserID
        type: "text",
        text: message
    })

}

// 休日を休診で埋める
function setSyukujitsu() {
    //月を設定

    const d = new Date('2023/1/1');
    d.setDate(1);
    d.setMonth(d.getMonth());
    const youbi = d.getDay();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    const lastday = d.getDate();
    const yasumi = Array(lastday).fill(null).map((x, y) => [`${d.getMonth() + 1}/${(y + 1)}(${{ 0: "日", 1: "月", 2: "火", 3: "水", 4: "木", 5: "金", 6: "土" }[(y + youbi) % 7]})`, (y + youbi) % 7]).filter(x => x[1] % 6 == 0).map(x => x[0]);
    console.log(yasumi);

    /*
    // CSVファイルを取得
    let req = new XMLHttpRequest();

    // CSVファイルへのパス
    req.open("GET", "C:\Users\takagi_taketo\herokuApp\moriguchi-management\syukujitsu.csv", false);

    // csvファイル読み込み失敗時のエラー対応
    try {
        req.send(null);
    } catch (err) {
        console.log(err);
    }

    // 配列を定義
    let csvArray = [];

    // 改行ごとに配列化
    let lines = req.responseText.split(/\r\n|\n/);

    // 1行ごとに処理
    for (let i = 0; i < lines.length; ++i) {
        let cells = lines[i].split(",");
        if (cells.length != 1) {
            csvArray.push(cells);
        }
    }

    // コンソールに配列を出力
    console.log(csvArray);

    /*
    for (let i = 0; i < lastday.length; i++) {
        let item = yasumi[i]

    }
*/
    /*
        let today = new Date('2023/06/21');
        console.log('今日の日付:' + today);
    
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        today.setDate(today.getDate() + 3); // +3日する
        let date_after3days = today.getDate();
        console.log('3日後の日付:' + today);
    
        let reserve_date_after3days = year + '-' + month.toString().padStart(2, "0") + '-' + date_after3days.toString().padStart(2, "0");
        console.log('3日後の日付（整形後）:' + reserve_date_after3days);
    
        let message = "";
    
        // 検索クエリ
        const select_query = {
            text: `SELECT line_uid, reserve_time FROM reserves WHERE reserve_date='${reserve_date_after3days}' and delete_flg=0;`
        };
        connection.query(select_query)
            .then(data => {
                for (let i = 0; i < data.rows.length; i++) {
                    message = `予約3日前になりました。\n予約日時は\n${year}年${month}月${date_after3days}日 ${data.rows[i].reserve_time}\nです。\nよろしくお願いいたします。`;
                    sendMessage(message, data.rows[i].line_uid);
                }
            })
            .catch(e => console.log('error:' + e))
            .finally(() => {
                connection.end;
            })
            */
}