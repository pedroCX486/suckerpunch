$date = (Get-Date).ToString("yyyyMMdd")
$time = [int](Get-Date -UFormat %s -Millisecond 0).ToString()

echo off
cls
npm start | tee $env:USERPROFILE\suckerpunch\logs\registro_ponto_"$date"-"$time".txt
