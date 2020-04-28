#!/bin/sh
echo "----Unblocking----"
echo "Testing Native Promises FOR with setImmediate()"
date && time curl localhost:3003/compute-with-set-immediate & time curl localhost:3003/compute-with-set-immediate && sleep 0.2
echo "Testing Bluebird FOR"
date && time curl localhost:3003/compute-bluebird-for & time curl localhost:3003/compute-bluebird-for && sleep 0.2
echo "Testing NodeSync FOR with setImmediate()"
date && time curl localhost:3003/compute-node-sync3 & time curl localhost:3003/compute-node-sync3

echo "----Blocking----"
echo "Testing synchronous code"
date && time curl localhost:3003/compute-async-await && sleep 0.2
echo "Testing Async/Await FOR"
date && time curl localhost:3003/compute-async-await && sleep 0.2