// 休診ボタン押下時処理
function clickKyushin() {
    let username = 'medibrain';
    let no_reserve_date = document.getElementById('reserve_date').innerText;
    let no_reserve_time = document.getElementById('reserve_time').innerText;

    const jsonData = JSON.stringify({
        username: username,
        no_reserve_date: no_reserve_date,
        no_reserve_time: no_reserve_time
    });
    fetch('/insertNoReserve', {
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
                    let message = json.message;
                    console.log('clickKyushinの処理結果メッセージ:' + message);
                })
        })
        .catch((err) => {
            alert('予約不可日の登録に失敗しました。' + err);
        })

}