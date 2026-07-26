#!/bin/bash
# Jolie Fragrances - Dev Server Auto-Restart Daemon
# Uses double-fork to keep the server alive even if parent shell exits

cd /home/z/my-project
export PORT=3000
export HOSTNAME=0.0.0.0

while true; do
  echo "[$(date)] Starting dev server..." >> /tmp/jolie-daemon.log

  # Start server in a subshell that becomes orphaned
  (
    bun run dev &
    SERVER_PID=$!
    echo $SERVER_PID > /home/z/my-project/.zscripts/dev.pid
    wait $SERVER_PID
  ) &

  # Wait and check if server is running
  sleep 5

  # Check if the server process is still alive
  if [ -f /home/z/my-project/.zscripts/dev.pid ]; then
    PID=$(cat /home/z/my-project/.zscripts/dev.pid)
    if kill -0 "$PID" 2>/dev/null; then
      echo "[$(date)] Server running with PID $PID" >> /tmp/jolie-daemon.log
      # Wait for the server to die
      while kill -0 "$PID" 2>/dev/null; do
        sleep 10
      done
      echo "[$(date)] Server process $PID died" >> /tmp/jolie-daemon.log
    else
      echo "[$(date)] Server process $PID not found" >> /tmp/jolie-daemon.log
    fi
  fi

  echo "[$(date)] Restarting in 3s..." >> /tmp/jolie-daemon.log
  sleep 3
done
