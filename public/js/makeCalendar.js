let displayStartDate = [];
let noReserveList = [];

window.addEventListener("DOMContentLoaded", () => {
    //今日の日時を表示
    const date = new Date()
    const formattedDate = formatDate(date);
    document.getElementById("displayDate").value = formattedDate;
    // 予約管理DBからカレンダーを生成
    reserveDB_access();
});

// 日付を編集
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 予約日リストを取得
async function getWeekReserve(displayStartDate, startTime, endTime, startDate, endDate) {
    // jsonDataを作成
    const jsonData = JSON.stringify({
        startDate: startDate,
        endDate: endDate
    });
    const res = await fetch('/selectWeekReserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData,
        credentials: 'same-origin'

    });
    
    const json = await res.json();

    for (var item in json) {
        // 選択した週の予定の場合、配列に格納する。
        let excelDate = new Date(json[item].reserve_date);
        if (startTime <= excelDate && excelDate <= endTime) {
            displayStartDate.push((json[item].reserve_date).toString().slice(0, 10) + 'T' + json[item].reserve_time);
        }
    }
    return displayStartDate;
}

// 予約不可日リストを取得
async function getNoReserve(noReserveList, startDate, endDate) {
    // jsonDataを作成
    const jsonData = JSON.stringify({
        startDate: startDate,
        endDate: endDate
    });
    const res = await fetch('/selectNoReserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData,
        credentials: 'same-origin'
    });
    const json = await res.json();
    console.log("json" + json);
    for (var item in json) {
        console.log("item" + item);
        noReserveList.push((json[item].no_reserve_date).toString().slice(0, 10) + 'T' + json[item].no_reserve_time);
    }
    return true;
}

// 日付の整形
function getFormattedDateTime(date, includeTime = false) {
    const formattedDate = formatDate(date);
    return includeTime ? `${formattedDate}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : formattedDate;
}
// カレンダー
async function reserveDB_access() {
    // 選択した日付を取得
    let selectDate = new Date(document.getElementById("displayDate").value); // ex)2023-05-01
    // 年を取得
    let thisYear = selectDate.getFullYear();
    // 月を取得
    let thisMonth = selectDate.getMonth();
    // 日にちを取得
    let thisDate = selectDate.getDate();
    // 選択した日付の曜日を取得
    let thisDayNum = selectDate.getDay();   // ex)日曜日なら0
    // 今週の日曜日
    let thisSunday = thisDate - thisDayNum;
    // 今週の土曜日
    let thisSaturday = thisSunday + 6;
    // 今週日曜日の0:00
    let startTime = new Date(thisYear, thisMonth, thisSunday);
    // 今週土曜日の23:59
    let endTime = new Date(thisYear, thisMonth, thisSaturday, 23, 59, 59, 999);

    // 整形
    let startDate = getFormattedDateTime(startTime);
    let endDate = getFormattedDateTime(endTime);
    console.log('startTime:' + startTime);
    console.log('endTime:' + endTime);
    console.log('startDate:' + startDate);
    console.log('endDate:' + endDate);

    displayStartDate = [];
    noReserveList = [];
    displayStartDate.push(getFormattedDateTime(startTime, true));

    await getWeekReserve(displayStartDate, startTime, endTime, startDate, endDate);
    await getNoReserve(noReserveList, startDate, endDate);
    setCalendar(displayStartDate, noReserveList);
}
// 予約日・予約不可日リストからカレンダーを生成する。
function setCalendar(displayStartDate, noReserveList) {
    // カレンダーを取得し、内容をクリア
    let calendar = document.getElementById("calendar");
    while (calendar.lastChild) {
        calendar.removeChild(calendar.lastChild);
    }
    console.log(displayStartDate);
    // 予約日と予約不可日のリストをクローンする。
    let busyDates = displayStartDate;
    let noReserveDates = noReserveList;
    
    console.log('busyDates' + busyDates);
    // 定数設定
    const
        table = document.getElementById('calendar'),
        date_span = 7,
        time_begin = 10,
        time_end = 16,
        week_name = ['日', '月', '火', '水', '木', '金', '土'],
        // 日付操作用の関数
        date_th = d => [d.getMonth() + 1, d.getDate()].join('/'),
        date_th2 = d => [date_th(d), '\n(', week_name[d.getDay()], ')'].join(''),
        date_add = (d, o = 1) => { let r = new Date(d); r.setDate(r.getDate() + o); return r },
        date_same = (a, b) => ['getFullYear', 'getMonth', 'getDate'].every((c, d) => a[c]() === b[c]()),
        date_sun = d => (date_add(d, - ((7 - d.getDay()) % 7))),
        date_num = d => {
            let m = d.getMonth();
            return [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][m] + d.getDate() - 1 +
                (new Date(d.getFullYear(), m + 1, 0) === 29 && 0 < m);
        };
    // カレンダー表示の範囲を決定するための日付を処理 
    let
        a = busyDates.map(d => new Date(d + ':00.000+09:00')).sort((a, b) => +a > +b),
        b = date_sun(new Date(a[0])),
        c = [[date_th(b), date_th(date_add(b, date_span - 1))].join('-')],
        d = date_num(b),
        e = [], // 予約の有無を判断するための配列
        f = table.insertRow(-1),
        g = noReserveDates.map(d => new Date(d + ':00.000+09:00')),
        n = []; // 予約不可日を判断するための配列

    // カレンダーのヘッダーを埋める
    for (let i = 0; i < date_span; i++) {
        c.push(date_th2(date_add(b, i)));
    }
    c.forEach(s => {
        f.insertCell(-1).textContent = s
    });
    // 予約リストから'〇','×'を判断する配列を作成
    for (let f of a) {
        let h = f.getHours();
        if (e[h] == undefined) {
            e[h] = [];
        }
        e[h][date_num(f) - d] = true;
    }
    // 予約不可日リストから'-'を判断する配列を作成
    for (let f of g) {
        let h = f.getHours();
        if (n[h] == undefined) {
            n[h] = [];
        }
        n[h][date_num(f) - d] = true;

    }
    // 時間部
    for (let i = time_begin; i <= time_end; i++) {
        if (i == 12) continue;
        let row = table.insertRow(-1);
        row.appendChild(document.createElement('th')).textContent = i + ':00';
        for (j = 0; j < date_span; j++) {
            let cell = row.insertCell(-1);
            cell.setAttribute('name', 'calendar_cell');
            // 日付の最適化
            let day = new Date(b);
            day.setDate(b.getDate() + j);
            let formattedDate = `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${day.getDate().toString().padStart(2, '0')}`;

            // 予約情報に基づくテキストと色の設定
            if (n[i] && n[i][j]) { // 予約不可日の場合
                cell.textContent = '-';
                cell.style.color = "black";
            } else if (e[i] && e[i][j]) { // 予約済みの場合
                cell.textContent = '×';
                cell.style.color = "blue";
            } else { // 予約可能な場合
                cell.textContent = '◎';
                cell.style.color = "red";
            }

            cell.setAttribute('onclick', `changeClickColor(this);clickReserve('${i}:00', '${formattedDate}', '${cell.textContent}')`);
        }
    }
}

function changeClickColor(table_cell) {

    let calendar_cell = document.getElementsByName('calendar_cell');

    for (let i = 0; i < calendar_cell.length; i++) {
        calendar_cell[i].style.background = 'none';
    }

    table_cell.style.background = 'orange';

};

// 予定がクリックされた時の処理
function clickReserve(time, date, status) {
    const jsonData = JSON.stringify({
        date: date,
        time: time
    });
    fetch('/selectClickReserve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData,
        credentials: 'same-origin'
    })
        .then(res => {
            res.json()
                .then(json => {
                    let name = json.username;
                    document.getElementById('username').innerText = name;
                    document.getElementById('reserve_date').innerText = date;
                    document.getElementById('reserve_time').innerText = time;
                    if (status == '◎') {
                        status = '空席';
                    } else if (status == '×') {
                        status = '満席'
                    } else if (status == '-') {
                        status = '休診'
                    }
                    document.getElementById('status').innerText = status;
                })
        })
        .catch((err) => {
            alert('クリックした予約情報の取得に失敗しました。');
        })
}