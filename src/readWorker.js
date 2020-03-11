"use strict"

const { parentPort } = require("worker_threads");
const fs = require("fs");
const readline = require("readline");

readFile();

function readFile() {
  const rl = readline.createInterface({
    input: fs.createReadStream("./src/public/trades.json")
  });

  const tradeObj = [];
  rl.on("line", line => {
    tradeObj.push(line);
  });

  rl.on("close", () => {
    parentPort.postMessage(tradeObj);
  });
}