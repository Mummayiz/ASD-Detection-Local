#!/bin/bash
echo "Starting ASD Detection App..."
echo "Port: $PORT"
echo "Working directory: $(pwd)"
echo "Files in directory:"
ls -la
echo "Starting Python server..."
python server.py
