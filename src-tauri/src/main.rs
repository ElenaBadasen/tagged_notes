// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::Connection;
use std::sync::Mutex;
extern crate directories;
mod db;

use db::Note;

#[tauri::command]
fn notes(state: tauri::State<MyConnection>) -> Vec<Note> {
    let conn = state.0.lock().unwrap();
    db::notes(conn)
}

#[tauri::command]
fn dir_path() -> String {
    db::get_db_path()
}

#[tauri::command]
fn insert(state: tauri::State<MyConnection>, note: String, tags: String) -> String {
    if note.is_empty() {
        return "Note text cannot be empty".to_string();
    }
    let conn = state.0.lock().unwrap();
    match db::insert(conn, note, tags) {
        Err(e) => e.to_string(),
        Ok(_) => "".to_string(),
    }
}

#[tauri::command]
fn update(state: tauri::State<MyConnection>, id: i32, note: String, tags: String) -> String {
    if note.is_empty() {
        return "Note text cannot be empty".to_string();
    }
    let conn = state.0.lock().unwrap();
    match db::update(conn, id, note, tags) {
        Err(e) => e.to_string(),
        Ok(_) => "".to_string(),
    }
}

#[tauri::command]
fn delete(state: tauri::State<MyConnection>, id: i32) -> String {
    let conn = state.0.lock().unwrap();
    match db::delete(conn, id) {
        Err(e) => e.to_string(),
        Ok(_) => "".to_string(),
    }
}

struct MyConnection(Mutex<Connection>);

fn main() {
    db::init();
    let conn = db::connection().unwrap();
    tauri::Builder::default()
        .manage(MyConnection(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![
            notes, dir_path, insert, update, delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
