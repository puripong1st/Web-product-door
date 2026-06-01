@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "$zip = '%~2'; $dest = '%~4'; Expand-Archive -LiteralPath $zip -DestinationPath $dest -Force"
