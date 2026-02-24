#!/bin/bash

echo "Running A2A End-to-End Demo..."
echo "=============================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Python3 is required but not installed."
    exit 1
fi

# Check if required modules are available
echo "Checking Python dependencies..."
if ! python3 -c "import asyncio; import aiohttp; print('Dependencies available')" &> /dev/null; then
    echo "Installing required Python packages..."
    pip3 install aiohttp
fi

echo "Running demonstration..."
python3 demo_a2a_e2e.py

echo "Demo completed!"