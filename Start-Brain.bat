@echo off
title MedAssist AI Brain Starter
color 0B

echo ==========================================
echo        WAKING UP THE MEDASSIST BRAIN      
echo ==========================================
echo.
echo 1) Starting Local AI Engine on Port 11435...
start "Ollama Background Brain" cmd /k "set OLLAMA_ORIGINS=* && set OLLAMA_HOST=127.0.0.1:11435 && ollama serve"

timeout /t 3 /nobreak >nul

echo 2) Opening Ngrok Internet Tunnel...
start "Ngrok Cloud Link" cmd /k "ngrok http 11435 --host-header=localhost:11435"

echo.
echo ==========================================
echo ALL SYSTEMS GO!
echo Please copy the new Ngrok URL from the black window 
echo and update it in your Render.com Dashboard!
echo ==========================================
pause
