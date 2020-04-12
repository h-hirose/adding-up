'use strict';
//Node.js に用意されたモジュールを呼び出す
const fs = require('fs');
const readline = require('readline');
//popu-pref.csv ファイルから、ファイルを読み込みを行う Stream（ストリーム）を生成
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト
//rl オブジェクトで line というイベントが発生したら この無名関数を呼ぶ
rl.on('line', lineString => {
//   console.log(lineString);
    //lineString で与えられた文字列をカンマ , で分割
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    let value = prefectureDataMap.get(prefecture);
    //その県のデータを処理するのが初めてであれば、value の値は undefined になるので、value に値を代入
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
        value.popu10 = popu;
    }
    if (year === 2015) {
        value.popu15 = popu;
    }
      prefectureDataMap.set(prefecture, value);
    //'close' イベントは、全ての行を読み込み終わった際に呼び出される。
    rl.on('close', () => {
        // for-of 構文
        // Map や Array の中身を of の前で与えられた変数に代入して for ループ
        for (let [key, value] of prefectureDataMap) {
            value.change = value.popu15 / value.popu10;
          }
        // 、連想配列を普通の配列に変換
        // sort に対して渡すこの関数は比較関数(並び替えのルールを決める)
        /*
        前者の引数 pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
        pair2 を pair1 より前にしたいときは、正の整数、
        pair1 と pair2 の並びをそのままにしたいときは 0 を返す必要があります。
        */
        const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
            return pair2[1].change - pair1[1].change;
        });
        // map 関数(連想配列のMapとは別物)
        // Array の要素それぞれを、与えられた関数を適用した内容に変換するというもの
        const rankingStrings = rankingArray.map(([key, value]) => {
            return (
              key +
              ': ' +
              value.popu10 +
              '=>' +
              value.popu15 +
              ' 変化率:' +
              value.change
            );
          });
          console.log(rankingStrings);
    });
});