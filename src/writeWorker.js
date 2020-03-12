"use strict"
const chalk = require("chalk");
const { parentPort, workerData } = require("worker_threads");

writeFile();

function writeFile() {
  if(!workerData) return;
  const { message, sym, interval } = workerData;
  let data = message.map(datum => {
    let json = JSON.parse(datum);
    let time = new Date(json.TS2/1000000);
    if (json.sym == sym) return { ...json, time}
  }).filter(Boolean);

  let lowest = Number.POSITIVE_INFINITY;
  let highest = Number.NEGATIVE_INFINITY;
  let tmp;
  for (var i = data.length-1; i>=0; i--) {
      tmp = data[i].TS2;
      if (tmp < lowest) lowest = tmp;
      if (tmp > highest) highest = tmp;
  }
  lowest = lowest/1000000;
  highest = highest/1000000;
  // let lowest = data[0].TS2/1000000;
  // let highest = data[0].TS2/1000000 + 1200000; // Considering 20 min data only

  let chunkedData = [];
  let t = lowest;
  let dataCopy = Object.assign([], data);
  let timeInterval = interval * 1000
  for (t; t <= highest; t = t + timeInterval) {
    try {
      let datum = dataCopy.filter(element => t >= element.TS2/1000000 && element.TS2/1000000 < (t + timeInterval));
      chunkedData.push(datum);
      const length = datum.length;
      dataCopy.splice(0, length);
    } catch (error) {
      console.log(chalk.red(error));
    }
  }

  let ohlc = [], volume = 0, bar_num = 0;

  chunkedData.forEach(datum => {
    let event = "ohlc_notify";
    if (datum.length === 0) {
      bar_num += 1;
      ohlc.push({ event, bar_num });
    } else {
      bar_num += 1;
      volume += datum.map(x => x.Q).reduce((a,b) => { return a+b }, 0);
      let o = datum[0].P;
      let symbol = datum[0].sym;
      let c = datum[datum.length - 1].P;
      let prices = datum.map(x => x.P);
      let h = Math.max.apply(Math, prices);
      let l = Math.min.apply(Math, prices);
      ohlc.push({ event, symbol, bar_num, o, h, l, c, volume });
    }
  })
  parentPort.postMessage(ohlc);
}