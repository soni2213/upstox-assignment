require("babel-core/register")
const { Worker } = require('worker_threads')

function runService(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./src/readWorker.js', { workerData });
    worker.on('error', reject)
          .on('exit', (code) => {
            if (code !== 0)
              reject(new Error(`Worker stopped with exit code ${code}`));
            })
          .on('message', message => {
            console.log('message from parent:', message);
          });
  })
}

async function run() {
  const result = await runService('world')
  console.log(result);
}

run().catch(err => console.error(err))

// Import our server code
exports = module.exports = require("./app")