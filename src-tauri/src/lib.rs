use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub vault_path: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self { vault_path: None }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<FileEntry>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WikiLinkCandidate {
    pub name: String,
    pub path: String,
}

fn get_config_path(app: &tauri::AppHandle) -> PathBuf {
    let config_dir = app
        .path()
        .app_config_dir()
        .expect("failed to get app config dir");
    fs::create_dir_all(&config_dir).ok();
    config_dir.join("config.json")
}

fn load_config(app: &tauri::AppHandle) -> AppConfig {
    let path = get_config_path(app);
    if path.exists() {
        let data = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        AppConfig::default()
    }
}

fn save_config(app: &tauri::AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = get_config_path(app);
    let data = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())?;
    Ok(())
}

fn build_file_tree(dir: &PathBuf, base: &PathBuf) -> Vec<FileEntry> {
    let mut entries = Vec::new();
    if let Ok(items) = fs::read_dir(dir) {
        let mut sorted: Vec<_> = items.filter_map(|e| e.ok()).collect();
        sorted.sort_by(|a, b| {
            let a_dir = a.path().is_dir();
            let b_dir = b.path().is_dir();
            b_dir.cmp(&a_dir).then_with(|| a.file_name().cmp(&b.file_name()))
        });
        for item in sorted {
            let path = item.path();
            let name = item.file_name().to_string_lossy().to_string();
            if name.starts_with('.') {
                continue;
            }
            let is_dir = path.is_dir();
            let relative = path
                .strip_prefix(base)
                .unwrap_or(&path)
                .to_string_lossy()
                .to_string();
            let children = if is_dir {
                Some(build_file_tree(&path, base))
            } else {
                None
            };
            entries.push(FileEntry {
                name,
                path: relative,
                is_dir,
                children,
            });
        }
    }
    entries
}

fn collect_wiki_candidates(dir: &PathBuf, base: &PathBuf, candidates: &mut Vec<WikiLinkCandidate>) {
    if let Ok(items) = fs::read_dir(dir) {
        for item in items.flatten() {
            let path = item.path();
            let name = item.file_name().to_string_lossy().to_string();
            if name.starts_with('.') {
                continue;
            }
            if path.is_dir() {
                collect_wiki_candidates(&path, base, candidates);
            } else if name.ends_with(".md") || name.ends_with(".markdown") {
                let stem = name.rsplit_once('.').map(|(s, _)| s).unwrap_or(&name);
                let relative = path
                    .strip_prefix(base)
                    .unwrap_or(&path)
                    .to_string_lossy()
                    .to_string();
                candidates.push(WikiLinkCandidate {
                    name: stem.to_string(),
                    path: relative,
                });
            }
        }
    }
}

#[tauri::command]
fn get_vault_path(app: tauri::AppHandle) -> Result<Option<String>, String> {
    let config = load_config(&app);
    Ok(config.vault_path)
}

#[tauri::command]
fn set_vault_path(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let mut config = load_config(&app);
    config.vault_path = Some(path);
    save_config(&app, &config)
}

#[tauri::command]
fn get_file_tree(app: tauri::AppHandle) -> Result<Vec<FileEntry>, String> {
    let config = load_config(&app);
    let vault = config.vault_path.ok_or("Vault path not set")?;
    let base = PathBuf::from(&vault);
    if !base.exists() {
        return Err("Vault directory does not exist".into());
    }
    Ok(build_file_tree(&base, &base))
}

#[tauri::command]
fn get_wiki_link_candidates(app: tauri::AppHandle) -> Result<Vec<WikiLinkCandidate>, String> {
    let config = load_config(&app);
    let vault = config.vault_path.ok_or("Vault path not set")?;
    let base = PathBuf::from(&vault);
    if !base.exists() {
        return Err("Vault directory does not exist".into());
    }
    let mut candidates = Vec::new();
    collect_wiki_candidates(&base, &base, &mut candidates);
    candidates.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(candidates)
}

#[tauri::command]
fn resolve_wiki_link(app: tauri::AppHandle, link_name: String) -> Result<Option<String>, String> {
    let config = load_config(&app);
    let vault = config.vault_path.ok_or("Vault path not set")?;
    let base = PathBuf::from(&vault);
    if !base.exists() {
        return Ok(None);
    }
    let mut candidates = Vec::new();
    collect_wiki_candidates(&base, &base, &mut candidates);

    let exact = candidates.iter().find(|c| c.name == link_name);
    if let Some(c) = exact {
        return Ok(Some(c.path.clone()));
    }

    let lower = link_name.to_lowercase();
    let partial = candidates.iter().find(|c| c.name.to_lowercase() == lower);
    if let Some(c) = partial {
        return Ok(Some(c.path.clone()));
    }

    Ok(None)
}

#[tauri::command]
fn read_file(app: tauri::AppHandle, relative_path: String) -> Result<String, String> {
    let config = load_config(&app);
    let vault = config.vault_path.ok_or("Vault path not set")?;
    let path = PathBuf::from(&vault).join(&relative_path);
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(app: tauri::AppHandle, relative_path: String, content: String) -> Result<(), String> {
    let config = load_config(&app);
    let vault = config.vault_path.ok_or("Vault path not set")?;
    let path = PathBuf::from(&vault).join(&relative_path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_file(app: tauri::AppHandle, relative_path: String) -> Result<(), String> {
    let config = load_config(&app);
    let vault = config.vault_path.ok_or("Vault path not set")?;
    let path = PathBuf::from(&vault).join(&relative_path);
    if path.exists() {
        return Err("File already exists".into());
    }
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, "").map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_file(app: tauri::AppHandle, relative_path: String) -> Result<(), String> {
    let config = load_config(&app);
    let vault = config.vault_path.ok_or("Vault path not set")?;
    let path = PathBuf::from(&vault).join(&relative_path);
    if path.is_dir() {
        fs::remove_dir_all(&path).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&path).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn rename_file(
    app: tauri::AppHandle,
    old_path: String,
    new_path: String,
) -> Result<(), String> {
    let config = load_config(&app);
    let vault = config.vault_path.ok_or("Vault path not set")?;
    let old = PathBuf::from(&vault).join(&old_path);
    let new = PathBuf::from(&vault).join(&new_path);
    if new.exists() {
        return Err("Target already exists".into());
    }
    fs::rename(&old, &new).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|_app| {
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_vault_path,
            set_vault_path,
            get_file_tree,
            get_wiki_link_candidates,
            resolve_wiki_link,
            read_file,
            write_file,
            create_file,
            delete_file,
            rename_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
