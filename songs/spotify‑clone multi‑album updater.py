#!/usr/bin/env python3
import os
import re
import json
from pathlib import Path
from wcwidth import wcswidth

def generate_description(title: str) -> str:
    if "bollywood" in title.lower():
        return "A handpicked journey through classic Bollywood gems."
    elif "rock" in title.lower():
        return "Turn up the volume with these timeless rock anthems!"
    elif "jazz" in title.lower():
        return "Smooth and soulful jazz tracks to set the mood."
    else:
        return f"A curated selection of tracks from “{title}”."

def load_or_init_info(json_path: Path, folder_name: str) -> dict:
    if json_path.exists():
        with json_path.open('r', encoding='utf-8') as f:
            info = json.load(f)
    else:
        info = {
            "title": folder_name,
            "description": generate_description(folder_name),
            "cover": "cover.jpeg",
            "songs": []
        }
    info["title"] = folder_name
    if info.get("description", "").startswith("Songs from"):
        info["description"] = generate_description(folder_name)
    info.setdefault("cover", "cover.jpeg")
    info.setdefault("songs", [])
    return info

def sort_key(fn: str):
    core = fn.split(' - ', 1)[0]
    core = re.sub(r'\s*\(.*?\)', '', core).strip().lower()
    m = re.search(r'\((.*?)\)', fn)
    version = m.group(1).lower() if m else ''
    return (core, version, fn.lower())

def process_album(album_dir: Path):
    json_path = album_dir / "info.json"
    folder_name = album_dir.name
    info = load_or_init_info(json_path, folder_name)

    mp3_files = [p.name for p in album_dir.iterdir() 
                 if p.is_file() and p.suffix.lower()==".mp3"]
    if not mp3_files:
        print(f"⚠️  [{folder_name}] no .mp3 files, skipping.")
        return

    mp3_files = sorted(mp3_files, key=sort_key)

    if info["songs"] != mp3_files:
        info["songs"] = mp3_files
        with json_path.open('w', encoding='utf-8') as f:
            json.dump(info, f, indent=4, ensure_ascii=False)
        print(f"✅  [{folder_name}] info.json synced ({len(mp3_files)} tracks).")
    else:
        print(f"✅  [{folder_name}] already in sync.")

def sync_albums_list(root: Path):
    albums_file = root.parent / "albums.json"
    subdirs = [d.name for d in sorted(root.iterdir()) if d.is_dir()]
    if albums_file.exists():
        with albums_file.open('r', encoding='utf-8') as f:
            existing = json.load(f)
    else:
        existing = []

    if existing != subdirs:
        with albums_file.open('w', encoding='utf-8') as f:
            json.dump(subdirs, f, indent=2, ensure_ascii=False)
        print(f"📚  albums.json updated ({len(subdirs)} albums).")
    else:
        print("📚  albums.json already up to date.")

def main():
    root = Path(__file__).parent.resolve()

    # 🎨 Draw the rounded-edge box with accurate display width
    title = "🎶 Spotify-Clone Multi-Album Updater 🎶"
    content_width = wcswidth(title)          # display width of the title
    dash_count = content_width + 2           # for the spaces on either side

    print(f"╭{'─'*dash_count}╮")
    print(f"│ {title} │")
    print(f"╰{'─'*dash_count}╯\n")

    print(f"↪️  Scanning albums in: {root}\n")

    while True:
        subdirs = [d for d in sorted(root.iterdir()) if d.is_dir()]
        if not subdirs:
            print(f"⚠️  No subfolders found in '{root}'.")
        else:
            print(f"ℹ️   Found {len(subdirs)} album(s). Updating...\n")
            for album in subdirs:
                process_album(album)
            sync_albums_list(root)
            print("\n✅ All albums & albums.json synced!")

        cmd = input("\n👉 Press Enter to re-scan or type 'exit' to quit: ").strip().lower()
        if cmd in ("exit", "quit"):
            print("👋 Goodbye!")
            break

if __name__ == "__main__":
    main()
