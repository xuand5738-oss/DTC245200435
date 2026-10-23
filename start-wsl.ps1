# Run from PowerShell. Keep this Ubuntu session open while using the website.
wsl.exe -d Ubuntu-24.04 -- bash -lc 'cd /mnt/d/DTC245200435 && docker compose up -d && printf "\nWebsite: http://localhost:8280\nphpMyAdmin: http://localhost:8281\nKeep this Ubuntu session open while using the website.\n" && exec bash -i'
