#!/bin/bash

sudo apt-get update

sudo apt-get install -y mysql-server

sudo systemctl start mysql
sudo systemctl enable mysql

DB_USER="shuneo"
DB_PASS="password"
DB_DATABASE="mywebsite"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON *.* TO '${DB_USER}'@'localhost' WITH GRANT OPTION;"
sudo mysql -e "FLUSH PRIVILEGES;"
sudo mysql -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_DATABASE;"
echo "MySQL installation and user setup for '${DB_USER}' completed."
echo "You can now log in using: mysql -u ${DB_USER} -p"
