#!/bin/bash
# Robust dev server startup script
# This script starts the Next.js dev server in a way that it survives
# parent process termination by becoming an orphan adopted by PID 1

cd /home/z/my-project
export PORT=3000
export HOSTNAME=0.0.0.0

# Double-fork to fully detach from parent session
# This ensures the process survives even if the parent shell exits
(
    # Start the dev server in the background
    bun run dev &
    INNER_PID=$!

    # Write PID for tracking
    echo $INNER_PID > /home/z/my-project/.zscripts/dev.pid

    # Wait for the inner process (keep this subshell alive)
    wait $INNER_PID
) &

# Immediately exit the outer shell, leaving the subshell as orphan
exit 0
