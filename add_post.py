#!/usr/bin/env python3
"""
Simple script to add new posts to posts.json
"""

import json
from datetime import datetime
import shutil


def create_backup(filename):
    """Create a backup of the original file"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"{filename}.backup_{timestamp}"
    shutil.copy(filename, backup_name)
    print(f"✓ Created backup: {backup_name}")
    return backup_name


def get_next_id(posts):
    """Get the next available post ID"""
    if not posts:
        return 1
    return max(post['id'] for post in posts) + 1


def add_post():
    """Interactive function to add a new post"""

    # Load existing posts
    try:
        with open('posts.json', 'r', encoding='utf-8') as f:
            posts = json.load(f)
    except FileNotFoundError:
        print("Error: posts.json not found!")
        return False

    print("="*60)
    print("ADD NEW POST")
    print("="*60)
    print()

    # Get post details
    title = input("Enter post title: ").strip()
    if not title:
        print("Error: Title cannot be empty!")
        return False

    date_input = input("Enter date (YYYY-MM-DD) or press Enter for today: ").strip()
    if not date_input:
        date = datetime.now().strftime('%Y-%m-%d')
    else:
        date = date_input

    print("\nEnter content (HTML format). Type 'END' on a new line when done:")
    print("Tip: Use <p>...</p> for paragraphs, <br> for line breaks")
    print()

    content_lines = []
    while True:
        line = input()
        if line.strip() == 'END':
            break
        content_lines.append(line)

    content = '\n'.join(content_lines).strip()

    if not content:
        print("Error: Content cannot be empty!")
        return False

    # If content doesn't have HTML tags, wrap in <p> tags
    if not content.startswith('<'):
        paragraphs = content.split('\n\n')
        content = ''.join(f'<p>{p.replace(chr(10), "<br>")}</p>' for p in paragraphs if p.strip())

    # Create new post
    new_post = {
        "id": get_next_id(posts),
        "title": title,
        "date": date,
        "content": content,
        "hasTitle": True
    }

    print()
    print("="*60)
    print("PREVIEW")
    print("="*60)
    print(f"ID: {new_post['id']}")
    print(f"Title: {new_post['title']}")
    print(f"Date: {new_post['date']}")
    print(f"Content: {new_post['content'][:100]}...")
    print()

    confirm = input("Add this post? (y/n): ").strip().lower()
    if confirm != 'y':
        print("Cancelled.")
        return False

    # Create backup
    create_backup('posts.json')

    # Add new post at the beginning
    posts.insert(0, new_post)

    # Save updated posts
    with open('posts.json', 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

    print()
    print(f"✓ Post added successfully! (ID: {new_post['id']})")
    print(f"✓ Total posts: {len(posts)}")
    print()
    print("Refresh your browser to see the new post!")

    return True


def main():
    try:
        add_post()
    except KeyboardInterrupt:
        print("\n\nCancelled by user.")
    except Exception as e:
        print(f"\n✗ Error: {e}")


if __name__ == '__main__':
    main()
