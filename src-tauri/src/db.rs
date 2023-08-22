use directories::BaseDirs;
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::{path::Path, sync::MutexGuard};

pub fn connection() -> Result<Connection> {
    Connection::open(get_db_path())
}

pub fn init() {
    if !db_file_exists() {
        create_db_file();
        let conn = connection().unwrap();
        create_tables(conn);
    }
}

pub fn insert(
    conn: MutexGuard<'_, Connection>,
    note: String,
    tags: String,
) -> Result<usize, rusqlite::Error> {
    conn.execute(
        "INSERT INTO notes (note, tags) VALUES (?1, ?2)",
        params![note, tags],
    )
}

pub fn update(
    conn: MutexGuard<'_, Connection>,
    id: i32,
    note: String,
    tags: String,
) -> Result<usize, rusqlite::Error> {
    // TODO: check number of changed rows
    conn.execute(
        "UPDATE notes SET note=?1, tags=?2 WHERE id=?3",
        params![note, tags, id],
    )
}

pub fn delete(conn: MutexGuard<'_, Connection>, id: i32) -> Result<usize, rusqlite::Error> {
    // TODO: check number of changed rows
    conn.execute("DELETE FROM notes WHERE id=?1", params![id])
}

#[derive(Serialize, Deserialize)]
pub struct Note {
    pub id: i32,
    pub value: String,
    pub tags: Vec<String>,
}

// TODO: pass &Connection instead
pub fn notes(conn: MutexGuard<'_, Connection>) -> Vec<Note> {
    // TODO: unwrap -> expect
    let mut prepared = conn.prepare("SELECT id, note, tags FROM notes").unwrap();
    let note_iter = prepared
        .query_map([], |row| {
            Ok(Note {
                id: row.get(0)?,
                value: row.get(1)?,
                tags: row
                    .get::<_, String>(2)?
                    .split(',')
                    .map(|t| t.trim().to_string())
                    .filter(|t| !t.is_empty())
                    .collect::<Vec<String>>(),
            })
        })
        .unwrap();
    note_iter.map(|n| n.unwrap()).collect::<Vec<Note>>()
}

fn db_file_exists() -> bool {
    let db_path = get_db_path();
    Path::new(&db_path).exists()
}

pub fn get_db_path() -> String {
    if let Some(base_dirs) = BaseDirs::new() {
        // TODO: use join()
        let result =
            base_dirs.data_local_dir().to_str().unwrap().to_string() + "/" + get_db_filename();
        result
    } else {
        panic!("error getting db path");
    }
}

// TODO: const
fn get_db_filename() -> &'static str {
    "tagged_notes.sqlite"
}

fn create_db_file() {
    let db_path = get_db_path();
    let db_dir = Path::new(&db_path).parent().unwrap();

    if !db_dir.exists() {
        // TODO: use fs_err for better errors
        fs::create_dir_all(db_dir).unwrap();
    }

    // TODO: don't need this
    fs::File::create(db_path).unwrap();
}

fn create_tables(conn: Connection) {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes (
             id integer primary key,
             note text not null,
             tags text
         )",
        params![],
    )
    .unwrap();
}
