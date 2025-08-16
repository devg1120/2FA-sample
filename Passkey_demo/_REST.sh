DB=db.sqlite
rm ${DB}

sqlite3 ${DB} < ./setup.sql



