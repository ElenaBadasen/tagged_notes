// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Serialize, Deserialize};
use chrono::prelude::*;

#[tauri::command]
fn notes() -> Vec<Note> {
    vec![
        Note{key: "1".to_string(), value: "note1".to_string()}, 
        Note{key: "2".to_string(), value: "note2".to_string()}, 
        Note{key: "3".to_string(), value: "loooooooooooooooong loooooooooooooooong note3".to_string()},
        Note{key: "4".to_string(), value: format!("{:?}", Utc::now())},
    ]
}

#[derive(Serialize, Deserialize)]
struct Note {
    key: String,
    value: String,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![notes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
