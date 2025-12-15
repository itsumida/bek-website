#!/usr/bin/env python3
"""
Apply review changes to posts.json

This script takes the exported review JSON file and applies all changes:
- Removes posts marked for deletion
- Updates titles that were edited
- Updates content that was edited
- Creates a backup of the original posts.json
"""

import json
import sys
import shutil
from datetime import datetime


def create_backup(filename):
    """Create a backup of the original file"""q
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"{filename}.backup_{timestamp}"
    shutil.copy(filename, backup_name)
    print(f"✓ Created backup: {backup_name}")
    return backup_name


def apply_review(review_file, posts_file='posts.json'):
    """Apply review changes to posts"""

    # Load review data
    try:
        with open(review_file, 'r', encoding='utf-8') as f:
            review_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Review file '{review_file}' not found!")
        return False
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in '{review_file}'")
        return False

    # Load posts
    try:
        with open(posts_file, 'r', encoding='utf-8') as f:
            posts = json.load(f)
    except FileNotFoundError:
        print(f"Error: Posts file '{posts_file}' not found!")
        return False

    # Create backup
    backup_file = create_backup(posts_file)

    # Get posts to remove
    posts_to_remove = set()
    for review in review_data.get('reviews', []):
        if review.get('flag') == 'remove':
            posts_to_remove.add(review['postId'])

    # Create edit lookup
    edits = {}
    for edit in review_data.get('edits', []):
        edits[edit['postId']] = edit

    # Apply changes
    updated_posts = []
    removed_count = 0
    title_updates = 0
    content_updates = 0

    for post in posts:
        post_id = post['id']

        # Check if post should be removed
        if post_id in posts_to_remove:
            removed_count += 1
            print(f"  Removing: {post['title'][:60]}...")
            continue

        # Apply edits if any
        if post_id in edits:
            edit = edits[post_id]

            if edit.get('titleEdited') and edit.get('newTitle'):
                old_title = post['title']
                post['title'] = edit['newTitle']
                title_updates += 1
                print(f"  Title updated: {old_title[:40]}... → {post['title'][:40]}...")

            if edit.get('contentEdited') and edit.get('newContent'):
                post['content'] = edit['newContent']
                content_updates += 1
                print(f"  Content updated: {post['title'][:60]}...")

        updated_posts.append(post)

    # Save updated posts
    with open(posts_file, 'w', encoding='utf-8') as f:
        json.dump(updated_posts, f, indent=2, ensure_ascii=False)

    # Print summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Original posts:     {len(posts)}")
    print(f"Removed:           -{removed_count}")
    print(f"Title updates:      {title_updates}")
    print(f"Content updates:    {content_updates}")
    print(f"Final posts:        {len(updated_posts)}")
    print(f"\n✓ Changes saved to {posts_file}")
    print(f"✓ Backup saved as {backup_file}")

    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 apply_review.py <review-file.json> [-y]")
        print("\nExample:")
        print("  python3 apply_review.py blog-review-2025-11-03.json")
        print("  python3 apply_review.py blog-review-2025-11-03.json -y  (auto-confirm)")
        print("\nThis will:")
        print("  1. Create a backup of posts.json")
        print("  2. Remove posts flagged for deletion")
        print("  3. Apply title edits")
        print("  4. Apply content edits")
        print("  5. Save the updated posts.json")
        sys.exit(1)

    review_file = sys.argv[1]
    auto_confirm = '-y' in sys.argv or '--yes' in sys.argv

    print("="*60)
    print("APPLYING REVIEW CHANGES")
    print("="*60)
    print(f"Review file: {review_file}")
    print(f"Target:      posts.json")
    print()

    # Ask for confirmation unless auto-confirmed
    if not auto_confirm:
        response = input("Proceed with applying changes? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return
    else:
        print("Auto-confirming changes...")

    print()
    if apply_review(review_file):
        print("\n✓ All changes applied successfully!")
        print("\nNext steps:")
        print("  1. Refresh your website to see the changes")
        print("  2. If something went wrong, restore from the backup file")
    else:
        print("\n✗ Failed to apply changes")
        sys.exit(1)


if __name__ == '__main__':
    main()
