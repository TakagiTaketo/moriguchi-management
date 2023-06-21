import ClientPg from 'pg';
const { Client } = ClientPg;
import dotenv from "dotenv";
const env = dotenv.config();

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

// 休日を休診で埋める
function setSyukujitsu() {
    const username = 'medibrain';
    // タイムスタンプ整形
    let created_at = '';
    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    created_at = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/'
        + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':'
        + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
    let no_reserve_date = [];
    '2023-11-23';
    let no_reserve_time = '';
    for (let j = 0; j < 6; j++) {
        switch (j) {
            case 0:
                no_reserve_time = '10:00';
                break;
            case 1:
                no_reserve_time = '11:00';
                break;
            case 2:
                no_reserve_time = '13:00';
                break;
            case 3:
                no_reserve_time = '14:00';
                break;
            case 4:
                no_reserve_time = '15:00';
                break;
            case 5:
                no_reserve_time = '16:00';
                break;
        }
        const insert_query = {
            text: `INSERT INTO no_reserves(name, no_reserve_date, no_reserve_time, created_at, delete_flg) VALUES ($1, $2, $3, $4, $5);`,
            values: [username, no_reserve_date, no_reserve_time, created_at, 0]
        };
        connection.query(insert_query)
            .then(() => {
                console.log('登録完了：' + no_reserve_date + ' ' + no_reserve_time);
            })
    }


    /*
    const d = new Date('2023/12/1');
    const username = 'medibrain';
    // タイムスタンプ整形
    let created_at = '';
    let date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    created_at = date.getFullYear() + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/'
        + ('0' + date.getDate()).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':'
        + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);

    d.setDate(1);
    d.setMonth(d.getMonth());
    const youbi = d.getDay();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    const lastday = d.getDate();
    const yasumi = Array(lastday).fill(null).map((x, y) => [`${d.getMonth() + 1}/${(y + 1)}(${{ 0: "日", 1: "月", 2: "火", 3: "水", 4: "木", 5: "金", 6: "土" }[(y + youbi) % 7]})`, (y + youbi) % 7]).filter(x => x[1] % 6 == 0).map(x => x[0]);
    for (let i = 0; i < yasumi.length; i++) {
        let item = yasumi[i]
        let month = item.substring(0, item.indexOf('/')).toString().padStart(2, "0");
        let day = item.substring(item.indexOf('/') + 1, item.indexOf('(')).toString().padStart(2, "0");
        let no_reserve_date = '2023' + '-' + month + '-' + day;
        let no_reserve_time = '';
        for (let j = 0; j < 6; j++) {
            switch (j) {
                case 0:
                    no_reserve_time = '10:00';
                    break;
                case 1:
                    no_reserve_time = '11:00';
                    break;
                case 2:
                    no_reserve_time = '13:00';
                    break;
                case 3:
                    no_reserve_time = '14:00';
                    break;
                case 4:
                    no_reserve_time = '15:00';
                    break;
                case 5:
                    no_reserve_time = '16:00';
                    break;
            }
            const insert_query = {
                text: `INSERT INTO no_reserves(name, no_reserve_date, no_reserve_time, created_at, delete_flg) VALUES ($1, $2, $3, $4, $5);`,
                values: [username, no_reserve_date, no_reserve_time, created_at, 0]
            };
            connection.query(insert_query)
                .then(() => {
                    console.log('登録完了：' + no_reserve_date + ' ' + no_reserve_time);
                })
        }
    }*/
}