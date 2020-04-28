#!/bin/sh
while true; do
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&
curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/healthcheck &&

curl -s -o /dev/null -w '%{time_starttransfer}\n' -m5 http://localhost:3003/compute_createHash &&

sleep 0.2 && echo; 
done