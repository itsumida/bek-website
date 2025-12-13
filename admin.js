// Admin review interface
let allPosts = [];
let currentPostIndex = 0;
let currentFilter = 'all';
let reviews = {};
let editedPosts = {}; // Store edited titles/content
let isEditingTitle = false;
let isEditingContent = false;
let originalTitle = '';
let originalContent = '';

// Load posts and reviews
async function loadData() {
    try {
        // Load posts
        const response = await fetch('posts.json');
        allPosts = await response.json();

        // Load existing reviews from localStorage
        const savedReviews = localStorage.getItem('post_reviews');
        if (savedReviews) {
            reviews = JSON.parse(savedReviews);
        }

        updateStats();
        renderPostsList();

        // Select first post if available
        if (allPosts.length > 0) {
            showPost(0);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading posts. Make sure posts.json exists.');
    }
}

// Update statistics
function updateStats() {
    const total = allPosts.length;
    const reviewed = Object.keys(reviews).length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('reviewedCount').textContent = reviewed;

    // Count by category
    let counts = {
        all: total,
        pending: total - reviewed,
        flagged: 0,
        remove: 0,
        'change-title': 0,
        'change-content': 0
    };

    Object.values(reviews).forEach(review => {
        if (review.flag && review.flag !== 'ok') {
            counts.flagged++;
            counts[review.flag]++;
        }
    });

    document.getElementById('countAll').textContent = counts.all;
    document.getElementById('countPending').textContent = counts.pending;
    document.getElementById('countFlagged').textContent = counts.flagged;
    document.getElementById('countRemove').textContent = counts.remove;
    document.getElementById('countTitle').textContent = counts['change-title'];
    document.getElementById('countContent').textContent = counts['change-content'];
}

// Render posts list based on filter
function renderPostsList() {
    const container = document.getElementById('adminPostsList');

    let filteredPosts = allPosts.map((post, index) => ({...post, index}));

    // Apply filter
    if (currentFilter === 'pending') {
        filteredPosts = filteredPosts.filter(p => !reviews[p.id]);
    } else if (currentFilter === 'flagged') {
        filteredPosts = filteredPosts.filter(p => {
            const review = reviews[p.id];
            return review && review.flag && review.flag !== 'ok';
        });
    } else if (currentFilter !== 'all') {
        filteredPosts = filteredPosts.filter(p => {
            const review = reviews[p.id];
            return review && review.flag === currentFilter;
        });
    }

    if (filteredPosts.length === 0) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #999;">No posts match this filter</div>';
        return;
    }

    container.innerHTML = filteredPosts.map(post => {
        const review = reviews[post.id];
        let flagClass = '';

        if (review && review.flag) {
            if (review.flag === 'remove') flagClass = 'flagged-remove';
            else if (review.flag === 'change-title') flagClass = 'flagged-title';
            else if (review.flag === 'change-content') flagClass = 'flagged-content';
        }

        const activeClass = post.index === currentPostIndex ? 'active' : '';

        return `
            <div class="admin-post-item ${flagClass} ${activeClass}" onclick="showPost(${post.index})">
                <div class="admin-post-title">${post.title}</div>
                <div class="admin-post-date">${post.date}</div>
            </div>
        `;
    }).join('');
}

// Show a specific post
function showPost(index) {
    if (index < 0 || index >= allPosts.length) return;

    currentPostIndex = index;
    const post = allPosts[index];

    // Update UI
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('postReview').style.display = 'flex';

    document.getElementById('reviewTitle').textContent = post.title;
    document.getElementById('reviewDate').textContent = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('reviewContent').innerHTML = post.content;

    // Update navigation buttons
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').disabled = index === allPosts.length - 1;

    // Update action buttons based on current review
    const review = reviews[post.id];
    updateActionButtons(review ? review.flag : null);

    // Highlight current post in list
    renderPostsList();
}

// Update action button states
function updateActionButtons(currentFlag) {
    const buttons = {
        'ok': document.getElementById('btnOk'),
        'change-title': document.getElementById('btnTitle'),
        'change-content': document.getElementById('btnContent'),
        'remove': document.getElementById('btnRemove')
    };

    // Remove active class from all
    Object.values(buttons).forEach(btn => btn.classList.remove('active'));

    // Add active class to current
    if (currentFlag && buttons[currentFlag]) {
        buttons[currentFlag].classList.add('active');
    }
}

// Navigate to previous/next post
function navigatePost(direction) {
    const newIndex = currentPostIndex + direction;
    if (newIndex >= 0 && newIndex < allPosts.length) {
        showPost(newIndex);
    }
}

// Flag a post
function flagPost(flag) {
    const post = allPosts[currentPostIndex];

    reviews[post.id] = {
        postId: post.id,
        title: post.title,
        date: post.date,
        flag: flag,
        reviewedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('post_reviews', JSON.stringify(reviews));

    // Update UI
    updateStats();
    updateActionButtons(flag);
    renderPostsList();

    // Auto-advance to next unreviewed post if not on last post
    if (flag !== 'ok' || currentPostIndex < allPosts.length - 1) {
        setTimeout(() => {
            navigatePost(1);
        }, 300);
    }
}

// Filter posts
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        currentFilter = this.dataset.filter;
        renderPostsList();

        // Show first post of filtered list
        const firstVisible = document.querySelector('.admin-post-item');
        if (firstVisible) {
            const index = parseInt(firstVisible.getAttribute('onclick').match(/\d+/)[0]);
            showPost(index);
        }
    });
});

// Export review results
function exportReview() {
    const results = {
        exportDate: new Date().toISOString(),
        totalPosts: allPosts.length,
        reviewedPosts: Object.keys(reviews).length,
        summary: {
            toRemove: 0,
            changeTitle: 0,
            changeContent: 0,
            keepAsIs: 0
        },
        reviews: []
    };

    // Process reviews
    Object.values(reviews).forEach(review => {
        results.reviews.push(review);

        if (review.flag === 'remove') results.summary.toRemove++;
        else if (review.flag === 'change-title') results.summary.changeTitle++;
        else if (review.flag === 'change-content') results.summary.changeContent++;
        else if (review.flag === 'ok') results.summary.keepAsIs++;
    });

    // Sort by flag
    results.reviews.sort((a, b) => {
        const order = { 'remove': 1, 'change-title': 2, 'change-content': 3, 'ok': 4 };
        return order[a.flag] - order[b.flag];
    });

    // Download as JSON
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-review-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert(`✓ Exported ${results.reviewedPosts} reviews!\n\n` +
          `Remove: ${results.summary.toRemove}\n` +
          `Change Title: ${results.summary.changeTitle}\n` +
          `Change Content: ${results.summary.changeContent}\n` +
          `Keep As Is: ${results.summary.keepAsIs}`);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key) {
        case 'ArrowLeft':
            navigatePost(-1);
            break;
        case 'ArrowRight':
            navigatePost(1);
            break;
        case '1':
            flagPost('ok');
            break;
        case '2':
            flagPost('change-title');
            break;
        case '3':
            flagPost('change-content');
            break;
        case '4':
            flagPost('remove');
            break;
    }
});

// Edit title functionality
function editTitle() {
    if (isEditingContent) {
        alert('Please save or cancel content editing first');
        return;
    }

    const post = allPosts[currentPostIndex];
    const titleElement = document.getElementById('reviewTitle');
    originalTitle = titleElement.textContent;

    isEditingTitle = true;
    document.getElementById('editingIndicator').style.display = 'block';

    // Replace title with input
    titleElement.innerHTML = `
        <input type="text" class="title-input" id="titleInput" value="${originalTitle.replace(/"/g, '&quot;')}">
        <div class="edit-actions">
            <button class="save-btn" onclick="saveTitleEdit()">💾 Save Title</button>
            <button class="cancel-btn" onclick="cancelTitleEdit()">✖ Cancel</button>
        </div>
    `;

    document.getElementById('titleInput').focus();
    document.getElementById('titleInput').select();
}

function saveTitleEdit() {
    const newTitle = document.getElementById('titleInput').value.trim();

    if (!newTitle) {
        alert('Title cannot be empty');
        return;
    }

    const post = allPosts[currentPostIndex];

    // Store edited title
    if (!editedPosts[post.id]) {
        editedPosts[post.id] = { ...post };
    }
    editedPosts[post.id].title = newTitle;
    editedPosts[post.id].titleEdited = true;

    // Update the post in memory
    post.title = newTitle;

    // Save to localStorage
    localStorage.setItem('edited_posts', JSON.stringify(editedPosts));

    // Reset UI
    isEditingTitle = false;
    document.getElementById('editingIndicator').style.display = 'none';
    showPost(currentPostIndex);

    alert('✓ Title saved! Remember to export your changes.');
}

function cancelTitleEdit() {
    isEditingTitle = false;
    document.getElementById('editingIndicator').style.display = 'none';
    showPost(currentPostIndex);
}

// Edit content functionality
function editContent() {
    if (isEditingTitle) {
        alert('Please save or cancel title editing first');
        return;
    }

    const post = allPosts[currentPostIndex];
    const contentElement = document.getElementById('reviewContent');
    originalContent = contentElement.innerHTML;

    isEditingContent = true;
    document.getElementById('editingIndicator').style.display = 'block';
    document.getElementById('editContentBtn').style.display = 'none';

    // Make content editable
    contentElement.setAttribute('contenteditable', 'true');
    contentElement.classList.add('content-editable');
    contentElement.focus();

    // Add save/cancel buttons
    contentElement.insertAdjacentHTML('afterend', `
        <div class="edit-actions" id="contentEditActions" style="padding: 1rem 2rem;">
            <button class="save-btn" onclick="saveContentEdit()">💾 Save Content</button>
            <button class="cancel-btn" onclick="cancelContentEdit()">✖ Cancel</button>
        </div>
    `);
}

function saveContentEdit() {
    const post = allPosts[currentPostIndex];
    const contentElement = document.getElementById('reviewContent');
    const newContent = contentElement.innerHTML;

    // Store edited content
    if (!editedPosts[post.id]) {
        editedPosts[post.id] = { ...post };
    }
    editedPosts[post.id].content = newContent;
    editedPosts[post.id].contentEdited = true;

    // Update the post in memory
    post.content = newContent;

    // Save to localStorage
    localStorage.setItem('edited_posts', JSON.stringify(editedPosts));

    // Reset UI
    isEditingContent = false;
    document.getElementById('editingIndicator').style.display = 'none';
    document.getElementById('editContentBtn').style.display = 'block';
    contentElement.removeAttribute('contenteditable');
    contentElement.classList.remove('content-editable');

    const actions = document.getElementById('contentEditActions');
    if (actions) actions.remove();

    alert('✓ Content saved! Remember to export your changes.');
}

function cancelContentEdit() {
    const contentElement = document.getElementById('reviewContent');

    isEditingContent = false;
    document.getElementById('editingIndicator').style.display = 'none';
    document.getElementById('editContentBtn').style.display = 'block';
    contentElement.removeAttribute('contenteditable');
    contentElement.classList.remove('content-editable');
    contentElement.innerHTML = originalContent;

    const actions = document.getElementById('contentEditActions');
    if (actions) actions.remove();
}

// Load edited posts
function loadEditedPosts() {
    const saved = localStorage.getItem('edited_posts');
    if (saved) {
        editedPosts = JSON.parse(saved);

        // Apply edits to posts
        allPosts.forEach(post => {
            if (editedPosts[post.id]) {
                if (editedPosts[post.id].titleEdited) {
                    post.title = editedPosts[post.id].title;
                }
                if (editedPosts[post.id].contentEdited) {
                    post.content = editedPosts[post.id].content;
                }
            }
        });
    }
}

// Update loadData to include edited posts
const originalLoadData = loadData;
loadData = async function() {
    await originalLoadData();
    loadEditedPosts();
    renderPostsList();
};

// Update export to include edits
const originalExportReview = exportReview;
exportReview = function() {
    const results = {
        exportDate: new Date().toISOString(),
        totalPosts: allPosts.length,
        reviewedPosts: Object.keys(reviews).length,
        editedPosts: Object.keys(editedPosts).length,
        summary: {
            toRemove: 0,
            changeTitle: 0,
            changeContent: 0,
            keepAsIs: 0
        },
        reviews: [],
        edits: []
    };

    // Process reviews
    Object.values(reviews).forEach(review => {
        results.reviews.push(review);

        if (review.flag === 'remove') results.summary.toRemove++;
        else if (review.flag === 'change-title') results.summary.changeTitle++;
        else if (review.flag === 'change-content') results.summary.changeContent++;
        else if (review.flag === 'ok') results.summary.keepAsIs++;
    });

    // Process edits
    Object.values(editedPosts).forEach(edit => {
        results.edits.push({
            postId: edit.id,
            originalTitle: allPosts.find(p => p.id === edit.id)?.title,
            newTitle: edit.titleEdited ? edit.title : undefined,
            newContent: edit.contentEdited ? edit.content : undefined,
            titleEdited: edit.titleEdited || false,
            contentEdited: edit.contentEdited || false
        });
    });

    // Sort reviews by flag
    results.reviews.sort((a, b) => {
        const order = { 'remove': 1, 'change-title': 2, 'change-content': 3, 'ok': 4 };
        return order[a.flag] - order[b.flag];
    });

    // Download as JSON
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-review-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert(`✓ Exported ${results.reviewedPosts} reviews and ${results.editedPosts} edits!\n\n` +
          `Remove: ${results.summary.toRemove}\n` +
          `Change Title: ${results.summary.changeTitle}\n` +
          `Change Content: ${results.summary.changeContent}\n` +
          `Keep As Is: ${results.summary.keepAsIs}\n` +
          `Edited: ${results.editedPosts} posts`);
};

// Initialize
document.addEventListener('DOMContentLoaded', loadData);
