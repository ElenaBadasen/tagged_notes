// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Serialize, Deserialize};
use chrono::prelude::*;

#[tauri::command]
fn all_tags() -> Vec<String> {
    vec![
        "tag1".to_string(),
        "tag2".to_string(),
        "tag3".to_string(),
        "tag4".to_string(),
        "tag5".to_string(),
        "tag7".to_string(),
        "tag77".to_string(),
        "tag5353".to_string(),
        "tag0000".to_string(),
        "tag88888888888888".to_string(),
        "tag1111111111".to_string(),
        "tag11111".to_string(),
        "tag156".to_string(),
        "tag1333".to_string(),
    ]
}

#[tauri::command]
fn notes() -> Vec<Note> {
    vec![
        Note{key: "1".to_string(), value: "note1".to_string(), 
            tags: vec!["tag1".to_string(), "tag2".to_string(), "tag3".to_string()]}, 
        Note{key: "2".to_string(), value: "note2".to_string(), 
            tags: vec!["tag3".to_string(), "tag2".to_string()]}, 
        Note{key: "3".to_string(), value: "loooooooooooooooong loooooooooooooooong note3".to_string(), 
            tags: vec!["tag7".to_string(), "tag2".to_string(), "tag3".to_string()]},
        Note{key: "4".to_string(), value: format!("{:?}", Utc::now()), 
            tags: vec!["tag1".to_string(), "tag2".to_string(), "tag3".to_string(), "tag398".to_string()] },
    ]
}

#[derive(Serialize, Deserialize)]
struct Note {
    key: String,
    value: String,
    tags: Vec<String>,
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![notes, all_tags])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
