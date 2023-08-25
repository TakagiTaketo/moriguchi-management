// idのテキストを返す
function getElementText(id) {
    return document.getElementById(id).innerText;
}

function postFetch(url, jsonData, successMessage, errorMessage) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData,
        credentials: 'same-origin'
    })
    .then(res => {
        alert(successMessage);
        location.reload();
    })
    .catch((err) => {
        alert(errorMessage + err);
    })
}

// 休診ボタン押下時処理
function clickKyushin() {
    let selectedDate = localStorage.getItem("selectedDate");
    const username = 'medibrain';
    if(selectedDate) {
       // 10時～16時の時間帯で休診の処理を行う
        for(let hour = 10; hour <= 16; hour++) {
            if (hour == 12) continue;
            // 休診日を登録する
            postFetch(
                '/insertNoReserve', 
                JSON.stringify({
                    username: username,
                    no_reserve_date: selectedDate,
                    no_reserve_time: `${hour}:00`
                }), 
                '休診日を登録しました。', 
                '休診日の登録に失敗しました。'
            );
        }

        localStorage.removeItem("selectedDate");  // ローカルストレージから日付を削除
    } else {
        const no_reserve_date = document.getElementById('reserve_date').innerText;
        const no_reserve_time = document.getElementById('reserve_time').innerText;
        const status = document.getElementById('status').innerText;
        
        if (status != '空席') {
            alert('空席以外は休診日に指定できません。');
        } else {
            postFetch(
                '/insertNoReserve', 
                JSON.stringify({
                    username: username,
                    no_reserve_date: no_reserve_date,
                    no_reserve_time: no_reserve_time
                }), 
                '休診日を登録しました。', 
                '休診日の登録に失敗しました。'
            );
        }
    }
}

// 予約取消ボタン押下時処理
function clickTorikeshi() {
    const username = document.getElementById('username').innerText;
    const reserve_date = document.getElementById('reserve_date').innerText;
    const reserve_time = document.getElementById('reserve_time').innerText;
    const status = document.getElementById('status').innerText;
    // 氏名が登録されていない場合、取消はできない
    if (status != '満席') {
        alert('選択している日付は予約されていません。');
        return false;
    } else {
        postFetch(
            '/updateReserveTorikeshi', 
            JSON.stringify({
                username: username,
                reserve_date: reserve_date,
                reserve_time: reserve_time
            }), 
            '予約を取り消しました。', 
            '予約の取り消しに失敗しました。'
        );
    }
}

// 休診取消ボタン押下時処理
function clickKyushinTorikeshi() {
    const username = document.getElementById('username').innerText;
    const reserve_date = document.getElementById('reserve_date').innerText;
    const reserve_time = document.getElementById('reserve_time').innerText;
    const status = document.getElementById('status').innerText;
    // 氏名が登録されていない場合、取消はできない
    if (status != '休診') {
        alert('休診時間を選択してください。');
        return false;
    } else {
        postFetch(
            '/updateNoReserveTorikeshi', 
            JSON.stringify({
                username: username,
                reserve_date: reserve_date,
                reserve_time: reserve_time
            }), 
            '休診を取り消しました。', 
            '休診の取り消しに失敗しました。'
        );
    }
}



// 新規予約する
function clickAddReserve() {
    const username = 'medibrain';
    const birthday = '1900-01-01';
    const line_uid = 'medibrain';
    const reserve_date = getElementText('reserve_date');
    const reserve_time = getElementText('reserve_time');
    const status = getElementText('status');
    // ステータスが空席以外の場合、予約できない
    if (status != '空席') {
        alert('空席以外は予約できません。');
        return false;
    } else {
        postFetch(
            '/insertReserve', 
            JSON.stringify({
                username,
                birthday,
                line_uid,
                reserve_date,
                reserve_time
            }), 
            '予約完了しました。', 
            '予約登録に失敗しました。'
        );
    }

}
