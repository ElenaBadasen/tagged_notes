use directories::BaseDirs;
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashSet,
    path::{Path, PathBuf},
    sync::Mutex,
};

#[derive(Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Note {
    pub id: i32,
    pub value: String,
    pub tags: Vec<String>,
}

const DB_FILENAME: &str = "tagged_notes.sqlite";

pub struct MyConnection(pub Mutex<Connection>);

impl MyConnection {
    pub fn new_connection() -> Result<Connection> {
        Connection::open(MyConnection::get_db_path())
    }

    pub fn init() -> MyConnection {
        MyConnection::create_db_dir_if_required();
        let conn = MyConnection::new_connection().expect("Failed to obtain connection to db");
        MyConnection::create_tables_if_required(&conn);
        MyConnection::new(conn)
    }

    fn new(conn: Connection) -> MyConnection {
        MyConnection(Mutex::new(conn))
    }

    pub fn insert(&self, note: String, tags: String) -> Result<usize, rusqlite::Error> {
        self.0
            .lock()
            .expect("Failed to obtain mutex guard")
            .execute(
                "INSERT INTO notes (note, tags) VALUES (?1, ?2)",
                params![note, tags],
            )
    }

    pub fn update(&self, id: i32, note: String, tags: String) -> Result<usize, rusqlite::Error> {
        self.0
            .lock()
            .expect("Failed to obtain mutex guard")
            .execute(
                "UPDATE notes SET note=?1, tags=?2 WHERE id=?3",
                params![note, tags, id],
            )
    }

    pub fn delete(&self, id: i32) -> Result<usize, rusqlite::Error> {
        self.0
            .lock()
            .expect("Failed to obtain mutex guard")
            .execute("DELETE FROM notes WHERE id=?1", params![id])
    }

    pub fn notes(&self) -> HashSet<Note> {
        let conn = self.0.lock().expect("Failed to obtain mutex guard");
        let mut prepared = conn
            .prepare("SELECT id, note, tags FROM notes")
            .expect("Failed to prepare data from the database");
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
            .expect("Failed to prepare data iterator");
        note_iter
            .map(|n| n.expect("Failed to upwrap the note from the iterator"))
            .collect::<HashSet<Note>>()
    }

    pub fn get_db_path() -> PathBuf {
        if let Some(base_dirs) = BaseDirs::new() {
            let result = base_dirs.data_local_dir().join(DB_FILENAME);
            result
        } else {
            panic!("error getting db path");
        }
    }

    fn create_db_dir_if_required() {
        let db_path = MyConnection::get_db_path();
        let db_dir = Path::new(&db_path)
            .parent()
            .expect("Failed to obtain path to dir");
        if !db_dir.exists() {
            fs_err::create_dir_all(db_dir).expect("Failed to create dir");
        }
    }

    fn create_tables_if_required(conn: &Connection) {
        conn.execute(
            "CREATE TABLE IF NOT EXISTS notes (
                id integer primary key,
                note text not null,
                tags text
            )",
            params![],
        )
        .expect("Failed to create tables in db if not exist");
    }
}
