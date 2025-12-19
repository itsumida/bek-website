#!/usr/bin/env python3
"""
Import images from Telegram export to website
Matches exported messages with existing posts and adds image paths
"""

import json
import shutil
import os
from datetime import datetime
from pathlib import Path

# Paths
EXPORT_PATH = "/Users/umidamurat/Downloads/ChatExport_2025-12-19"
WEBSITE_PATH = "/Users/umidamurat/Documents/other/bek-website"
RESULT_JSON = f"{EXPORT_PATH}/result.json"
POSTS_JSON = f"{WEBSITE_PATH}/posts.json"
PHOTOS_SOURCE = f"{EXPORT_PATH}/photos"
IMAGES_DEST = f"{WEBSITE_PATH}/images"


def create_backup(filename):
    """Create a backup of the original file"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"{filename}.backup_{timestamp}"
    shutil.copy(filename, backup_name)
    print(f"✓ Created backup: {backup_name}")
    return backup_name


def normalize_text(text):
    """Normalize text for comparison (remove extra spaces, newlines)"""
    if isinstance(text, list):
        # Join list items if text is a list
        text = ' '.join(str(item) for item in text)
    if not isinstance(text, str):
        return ''
    return ' '.join(text.split()).lower()[:200]  # First 200 chars


def find_matching_post(message_text, posts):
    """Find a post that matches the message text"""
    if not message_text:
        return None

    normalized_msg = normalize_text(message_text)

    for post in posts:
        # Extract text from HTML content
        post_text = post.get('content', '')
        # Remove HTML tags for comparison
        import re
        post_text_clean = re.sub(r'<[^>]+>', '', post_text)
        normalized_post = normalize_text(post_text_clean)

        # Check if texts match (at least 80% of first 200 chars)
        if normalized_msg and normalized_post:
            # Simple overlap check
            if normalized_msg in normalized_post or normalized_post in normalized_msg:
                return post

    return None


def main():
    print("="*70)
    print("IMPORTING IMAGES FROM TELEGRAM EXPORT")
    print("="*70)
    print()

    # Create images directory if it doesn't exist
    os.makedirs(IMAGES_DEST, exist_ok=True)
    print(f"✓ Images directory: {IMAGES_DEST}")

    # Load Telegram export
    print(f"\nLoading Telegram export: {RESULT_JSON}")
    with open(RESULT_JSON, 'r', encoding='utf-8') as f:
        export_data = json.load(f)

    messages = export_data.get('messages', [])
    print(f"✓ Found {len(messages)} messages in export")

    # Load existing posts
    print(f"\nLoading existing posts: {POSTS_JSON}")
    with open(POSTS_JSON, 'r', encoding='utf-8') as f:
        posts = json.load(f)
    print(f"✓ Found {len(posts)} posts")

    # Create backup
    create_backup(POSTS_JSON)

    # Process messages with photos
    matched = 0
    copied = 0

    print(f"\n{'='*70}")
    print("PROCESSING MESSAGES WITH PHOTOS")
    print(f"{'='*70}\n")

    for msg in messages:
        # Skip if no photo
        if 'photo' not in msg or msg['type'] != 'message':
            continue

        photo_path = msg['photo']
        message_text = msg.get('text', '')

        # Find matching post
        matching_post = find_matching_post(message_text, posts)

        if matching_post:
            matched += 1

            # Copy photo to images folder
            source_photo = f"{EXPORT_PATH}/{photo_path}"
            if os.path.exists(source_photo):
                # Generate new filename
                photo_filename = f"post_{matching_post['id']}{Path(photo_path).suffix}"
                dest_photo = f"{IMAGES_DEST}/{photo_filename}"

                # Copy file
                shutil.copy2(source_photo, dest_photo)
                copied += 1

                # Update post with image path
                matching_post['image'] = f"images/{photo_filename}"

                print(f"✓ Post #{matching_post['id']}: {matching_post['title'][:50]}...")
                print(f"  Image: {photo_filename}")
            else:
                print(f"✗ Photo not found: {source_photo}")
        else:
            # Show unmatched messages (optional, for debugging)
            if message_text:
                text_str = str(message_text) if not isinstance(message_text, str) else message_text
                text_preview = text_str[:60].replace('\n', ' ')
                print(f"? Unmatched: {text_preview}...")

    # Save updated posts
    print(f"\n{'='*70}")
    print("SAVING UPDATED POSTS")
    print(f"{'='*70}\n")

    with open(POSTS_JSON, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)

    print(f"✓ Updated posts.json")
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    print(f"Total posts: {len(posts)}")
    print(f"Matched posts with images: {matched}")
    print(f"Images copied: {copied}")
    print(f"Images directory: {IMAGES_DEST}")
    print(f"\n{'='*70}")
    print("NEXT STEPS:")
    print(f"{'='*70}")
    print("1. Review the images in the 'images' folder")
    print("2. Update your website code to display images")
    print("3. Test locally before deploying")
    print()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nCancelled by user.")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
