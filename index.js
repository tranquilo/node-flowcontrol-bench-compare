const express = require('express');
const crypto = require('crypto');
const bluebird = require('bluebird');
const Sync = require('sync');

const app = express();
const port = process.env.PORT || 3003;
const PID = process.pid;

function log(msg) {
    console.log(`[${PID}]`, new Date(), msg);
}

// Expensive synchronous function
function randomString() {
    return crypto.randomBytes(100).toString('hex');
}

// express monitoring on http://localhost:3003/status
app.use(require('express-status-monitor')());

// Normal fast request to check health
app.get('/healthcheck', function healthcheck(req, res) {
    log('health check!');
    res.send('all good!\n')
});

// Normal request that triggers a synchronous function that is not so expensive
app.get('/compute_createHash', function healthcheck(req, res) {
    log('new sha256 hash!');
    res.send(crypto.createHash('sha256'))
});


// This is why you don't do natively synchronous code - All requests rejected during computation
app.get('/compute-native-sync', function computeNativeSync(req, res) {
    log('computing native sync!');
    const hash = crypto.createHash('sha256');
    for (let i = 0; i < 10e6; i++) {
        hash.update(randomString())
    }
    res.send(hash.digest('hex') + '\n');
});

// Even async/await blocks the event loop if in a for loop
app.get('/compute-async-await', async function computeAsync(req, res) {
    log('computing async/await in a for cycle!');

    const hash = crypto.createHash('sha256');

    const asyncUpdate = async () => hash.update(randomString());

    for (let i = 0; i < 10e6; i++) {
        await asyncUpdate();
    }
    res.send("Mem. Usage: " + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " Mb\n" + hash.digest('hex') + '\n');
});

// Promise arrays use too much memory for very big arrays of functions - in turn, with Promise.all, it runs pratically instantly (300 Mb memory used)- No request are rejected
app.get('/compute-bluebird-all', function computeBluebirdAll(req, res) {
    log('computing bluebird with concurrent promises');

    const hash = crypto.createHash('sha256');

    const promiseUpdate = new bluebird((resolve, reject) => { hash.update(randomString()); resolve(); });

    const promises = [];

    for (let i = 0; i < 10e6; i++) {
        promises.push(promiseUpdate);
    }

    console.log(process.memoryUsage())
    return bluebird.all(promises)
        .then(() => res.send("Mem. Usage: " + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " Mb\n" + hash.digest('hex') + '\n'))
});


// Promise arrays use too much memory for very big arrays of functions - Promise.mapSeries will run serially but will consume too much memory (1Gb) - No request are rejected
app.get('/compute-bluebird-mapSeries', async function computeBluebirdMapSeries(req, res) {
    log('computing bluebird with serial promises');

    const hash = crypto.createHash('sha256');

    const promiseUpdate = new bluebird((resolve, reject) => { hash.update(randomString()); resolve(); });

    const promises = [];

    for (let i = 0; i < 10e6; i++) {
        promises.push(promiseUpdate);
    }

    return bluebird.mapSeries(promises, async () => bluebird.resolve())
        .then(() => res.send("Mem. Usage: " + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " Mb\n" + hash.digest('hex') + '\n'))
});

// Seconds fastest FOR method with bluebird Promises
app.get('/compute-bluebird-for', async function computeBluebirdFor(req, res) {
    log('computing bluebird for cycle');

    const hash = crypto.createHash('sha256');

    const promiseUpdate = () => bluebird.try(() => hash.update(randomString()));

    for (let i = 0; i < 10e6; i++) {
        await promiseUpdate()
    }

    res.send("Mem. Usage: " + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " Mb\n" + hash.digest('hex') + '\n');
});

// Fastest FOR method (Native Promises)
app.get('/compute-with-set-immediate', async function computeWSetImmediate(req, res) {
    log('computing async with setImmediate!');

    function setImmediatePromise() {
        return new Promise((resolve) => {
            setImmediate(() => resolve());
        });
    }

    const hash = crypto.createHash('sha256');
    for (let i = 0; i < 10e6; i++) {
        hash.update(randomString());
        await setImmediatePromise()
    }
    res.send("Mem. Usage: " + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " Mb\n" + hash.digest('hex') + '\n');
});

// Note on node-sync: each concurrent fiber takes aproximately 10 Mb
// node-sync synchronous code - Blocking
app.get('/compute-node-sync', function computeSync(req, res) {

    Sync(function () {
        const hash = crypto.createHash('sha256');

        for (let i = 0; i < 10e6; i++) {
            hash.update(randomString())
        }
        return hash;

    }, (err, hash) => res.send("Mem. Usage: " + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " Mb\n" + hash.digest('hex') + '\n'));
});

// node-sync synchronous code - Blocking
app.get('/compute-node-sync2', function computeSync2(req, res) {

    const updateHash = function (hash) {
        hash.update(randomString())

        return hash;
    }

    Sync(function () {
        let hash = crypto.createHash('sha256');

        for (let i = 0; i < 10e6; i++) {
            hash = updateHash.sync(null, hash);
        }
        return hash;

    }, (err, hash) => res.send("Mem. Usage: " + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " Mb\n" + hash.digest('hex') + '\n'));
});

// node-sync solution, 3rd fastest for cycle - Not blocking
app.get('/compute-node-sync3', function (req, res) {
    const hash = crypto.createHash('sha256');

    const updateHash = function (cb) {
        setImmediate(function() {
            hash.update(randomString());

            cb(null);
        })
        
    }

    Sync(function () {
        for (let i = 0; i < 10e6; i++) {
            updateHash.sync(null);
        }

    }, (err) => res.send("Mem. Usage: " + (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2) + " Mb\n" + hash.digest('hex') + '\n'));

});

/**
 ** Flow Control Conclusions:
 * - Fastest: Native Promises (interestingly)
 * - More Clean and Intuitive Code: bluebird Promises
 * - node-sync is not sync! don't be fooled by the name, fibers are async in their nature
 * - dont use synchronous code overall, don't block the Event Loop nor the Worker Loop.
 * - the only exception is to use synchronous code on Loading/Unloading of your App so it does the job faster
 * 
 ** Other observations:
 * - use setImmediate() instead of setTimeout(fn, 0) and process.nextTick() to control the Event Loop
 * - use offloading for intensive cpu consuming tasks
 *
 ** References:
 *
 * - Node.js: How even quick async functions can block the Event-Loop, starve I/O
 * https://snyk.io/blog/nodejs-how-even-quick-async-functions-can-block-the-event-loop-starve-io/
 *
 * - Don't Block the Event Loop (or the Worker Pool)
 * https://nodejs.org/de/docs/guides/dont-block-the-event-loop/
 * 
 * - Scheduling Execution in Node.js: Differences between setTimeout, setImmediate, and process.nextTick.
 * https://rclayton.silvrback.com/scheduling-execution-in-node-js
 */

server = app.listen(port, () => {
    log(`Listening on http://0.0.0.0:${port}`);
});

server.timeout = 300000;