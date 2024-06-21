import sqlite3 from 'sqlite3';
import fs from 'fs';

const DB_PATH = 'db/database.sqlite'
const SCHEMA_PATH = 'db/schema.sql'

let buildSchema = !fs.existsSync(DB_PATH)

export const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the SQLite database...');
    }
});

if(buildSchema){
    fs.readFile(SCHEMA_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading schema file:', err);
            return;
        }

        db.exec(data, (err) => {
            if (err) {
                console.error('Error executing schema:', err);
            } else {
                console.log('Schema built successfully...');
            }
        });
    })
}
