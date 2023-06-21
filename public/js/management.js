// 休診ボタン押下時処理
function clickKyushin() {
    let username = 'medibrain';
    let no_reserve_date = document.getElementById('reserve_date').innerText;
    let no_reserve_time = document.getElementById('reserve_time').innerText;
    let status = document.getElementById('status').innerText;
    const jsonData = JSON.stringify({
        username: username,
        no_reserve_date: no_reserve_date,
        no_reserve_time: no_reserve_time
    });
    if (status != '空席') {
        alert('空席以外は休診日に指定できません。');
    } else {
        fetch('/insertNoReserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData,
            credentials: 'same-origin'
        })
            .then(res => {
                alert('休診日を登録しました。');
                location.reload();
            })
            .catch((err) => {
                alert('休診日の登録に失敗しました。' + err);
            })
    }
}

// 予約取消ボタン押下時処理
function clickTorikeshi() {
    let username = document.getElementById('username').innerText;
    let reserve_date = document.getElementById('reserve_date').innerText;
    let reserve_time = document.getElementById('reserve_time').innerText;

    // 氏名が登録されていない場合、取消はできない
    if (username == '' || username == undefined) {
        alert('選択している日付は予約されていません。');
        return false;
    } else {
        const jsonData = JSON.stringify({
            username: username,
            reserve_date: reserve_date,
            reserve_time: reserve_time
        });
        fetch('/updateReserveTorikeshi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData,
            credentials: 'same-origin'
        })
            .then(res => {
                alert('予約を取り消しました。');
                location.reload();
            })
            .catch((err) => {
                alert('予約の取り消しに失敗しました。' + err);
            })
    }
}

// 新規予約する
function clickAddReserve() {
    let username = 'medibrain';
    let birthday = '1900-01-01';
    let line_uid = 'medibrain';
    let reserve_date = document.getElementById('reserve_date').innerText;
    let reserve_time = document.getElementById('reserve_time').innerText;
    let status = document.getElementById('status').innerText;
    // ステータスが空席以外の場合、予約できない
    if (status == '満席' || status == '休診') {
        alert('空席以外は予約できません。');
        return false;
    } else if (status == '空席') {
        const jsonData = JSON.stringify({
            username: username,
            birthday: birthday,
            line_uid: line_uid,
            reserve_date: reserve_date,
            reserve_time: reserve_time
        });
        fetch('/insertReserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData,
            credentials: 'same-origin'
        })
            .then(res => {
                alert('予約完了しました。');
                location.reload();
            })
            .catch((err) => {
                alert('予約登録に失敗しました。' + err);
            })
    }

}
