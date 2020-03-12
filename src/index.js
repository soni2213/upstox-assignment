require("babel-core/register")
const { Worker } = require("worker_threads")

function runService() {
  return new Promise((resolve, reject) => {
    const readWorker = new Worker("./src/readWorker.js");
    readWorker.on("error", reject)
              .on("exit", (code) => {
                if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
              })
              .on("message", message => {
                writeMethod(message)
              });
  })
}

async function writeMethod(message) {
  const inputData = process.argv.slice(2);
  const data = { message, sym: inputData[0], interval: inputData[1] }
  const writeWorker = new Worker("./src/writeWorker.js", { workerData: data });
  return new Promise((resolve, reject) => {
    writeWorker.on("error", reject)
               .on("exit", (code) => {
                 if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
               })
               .on("message", message => {
                console.log("result:", message);
               });
  })
}

async function run() {
  await runService();
}

run().catch(err => console.error(err))

// Import our server code
exports = module.exports = require("./app")