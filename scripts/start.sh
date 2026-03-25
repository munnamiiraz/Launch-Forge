#!/bin/sh

# Start the server in the background
cd /app/server && npm start &

# Start the client in the foreground
cd /app/client && npm start
