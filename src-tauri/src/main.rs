// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Serialize, Deserialize};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust from Elena!", name)
}

#[tauri::command]
fn notes() -> Vec<Note> {
    vec![
        Note{key: "1", value: "note1"}, 
        Note{key: "2", value: "note2"}, 
        Note{key: "3", value: "loooooooooooooooong loooooooooooooooong note3"}
    ]
}

#[derive(Serialize, Deserialize)]
struct Note {
    key: &'static str,
    value: &'static str,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, notes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
