#echo ".tables" | sqlite3 ./sqlite.db 
DB="./db.sqlite"
TABLES=(` echo ".tables" | sqlite3 ${DB}`)

for table in "${TABLES[@]}" ; do
    echo "[ ${table} ]"
    echo ""
    echo "select * from ${table}" | sqlite3 ${DB}
    echo ""
done
