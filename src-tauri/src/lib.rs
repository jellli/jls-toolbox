use std::env;

use anyhow::Context;
mod images;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn compress_image_command() -> (Vec<(String, String, u64, u64, f64)>, f64, u64, f64) {
    // 统计运行时间
    let start = std::time::Instant::now();
    println!(
        "compressing image... elapsed:{:2}",
        start.elapsed().as_millis()
    );
    let result = match images::compress_image()
    .context("Failed to compress image") {
        Ok(result) => result,
        Err(err) => {
            println!("Error: {}", err);
            return (Vec::new(), 0.0, 0, 0.0);
        }
    };
    let duration = start.elapsed().as_millis() as f64;
    
    let total_save_size_kb = result.iter().fold(0, |acc, (_, _, original_size, compressed_size, _)| {
        acc + (original_size - compressed_size)
    });
    
    let average_save_size_ratio = result.iter().fold(0.0, |acc, (_, _, _, _, ratio)| {
        acc + ratio
    }) / result.len() as f64;
    (
        result,
        duration,
        total_save_size_kb,
        average_save_size_ratio,
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, compress_image_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
