use std::env;

use anyhow::{Context};
mod images;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn compress_image_command(app: tauri::AppHandle){
    images::compress_image(&app)
    .context("Failed to compress image").context("Failed to compress image").unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, compress_image_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
