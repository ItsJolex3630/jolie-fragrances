#!/usr/bin/env bash
cd /home/z/my-project
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 2
: > /home/z/my-project/dev.log
nohup setsid bash -c '
  cd /home/z/my-project
  exec ./node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
' >/dev/null 2>&1 &
disown $! 2>/dev/null
echo "Dev server launched (PID parent: $!)"
