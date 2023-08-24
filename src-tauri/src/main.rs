// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate directories;
mod db;
use db::MyConnection;
use db::Note;
use std::collections::HashSet;

#[tauri::command]
fn notes(state: tauri::State<MyConnection>) -> HashSet<Note> {
    state.notes()
}

#[tauri::command]
fn db_path() -> String {
    format!("{}", MyConnection::get_db_path().display())
}

#[tauri::command]
fn insert(state: tauri::State<MyConnection>, note: String, tags: String) -> Result<(), String> {
    if note.is_empty() {
        return Err("Note text cannot be empty".to_string());
    }
    match state.insert(note, tags) {
        Err(e) => Err(e.to_string()),
        Ok(num) => {
            if num > 0 {
                Ok(())
            } else {
                Err("Failed to insert data".to_string())
            }
        }
    }
}

#[tauri::command]
fn update(
    state: tauri::State<MyConnection>,
    id: i32,
    note: String,
    tags: String,
) -> Result<(), String> {
    if note.is_empty() {
        return Err("Note text cannot be empty".to_string());
    }
    match state.update(id, note, tags) {
        Err(e) => Err(e.to_string()),
        Ok(num) => {
            if num > 0 {
                Ok(())
            } else {
                Err("Failed to update data".to_string())
            }
        }
    }
}

#[tauri::command]
fn delete(state: tauri::State<MyConnection>, id: i32) -> Result<(), String> {
    match state.delete(id) {
        Err(e) => Err(e.to_string()),
        Ok(num) => {
            if num > 0 {
                Ok(())
            } else {
                Err("Failed to delete data".to_string())
            }
        }
    }
}

fn main() {
    let state = MyConnection::init();
    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            notes, db_path, insert, update, delete
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
