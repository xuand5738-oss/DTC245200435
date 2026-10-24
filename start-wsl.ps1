# Run from PowerShell. Keep this Ubuntu session open while using the website.
wsl.exe -d Ubuntu-24.04 -- bash -lc 'cd /mnt/d/DTC245200435 && bash scripts/start-stack.sh; exec bash -i'
