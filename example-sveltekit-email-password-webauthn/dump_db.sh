#echo ".tables" | sqlite3 ./sqlite.db 
TABLES=(` echo ".tables" | sqlite3 ./sqlite.db`)

for table in "${TABLES[@]}" ; do
    echo "[ ${table} ]"
    echo ""
    echo "select * from ${table}" | sqlite3 ./sqlite.db
    echo ""
done
