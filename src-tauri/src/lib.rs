use std::path::Path;

#[derive(serde::Deserialize, serde::Serialize)]
struct FileEntry {
    path: String,
    content: String,
}

#[tauri::command]
async fn open_directory_dialog(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let (tx, rx) = std::sync::mpsc::channel::<Option<String>>();

    app.dialog()
        .file()
        .pick_folder(move |folder_path| {
            let path_str = folder_path.map(|p| p.to_string());
            let _ = tx.send(path_str);
        });

    // Block on a separate thread to avoid holding the async executor
    let result = tauri::async_runtime::spawn_blocking(move || {
        rx.recv().unwrap_or(None)
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?;

    Ok(result)
}

#[tauri::command]
async fn scaffold_project(files: Vec<FileEntry>) -> Result<Vec<String>, String> {
    let mut created: Vec<String> = Vec::new();

    for file in &files {
        let path = Path::new(&file.path);

        // Create parent directories
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory {}: {}", parent.display(), e))?;
        }

        // Write the file
        std::fs::write(path, &file.content)
            .map_err(|e| format!("Failed to write file {}: {}", file.path, e))?;

        created.push(file.path.clone());
    }

    Ok(created)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![open_directory_dialog, scaffold_project])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
