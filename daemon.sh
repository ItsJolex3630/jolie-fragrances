#!/bin/bash
cd /home/z/my-project
export PORT=3000
export HOSTNAME=0.0.0.0
export NODE_ENV=production
while true; do
  node .next/standalone/server.js
  echo "Server crashed at $(date), restarting in 3s..." >> /tmp/jolie-crash.log
  sleep 3
done
