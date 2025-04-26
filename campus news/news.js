const API_URL = 'https://680d3b94c47cb8074d8ff62d.mockapi.io/api/campus-news/news';

let newsData = [];

// Elements
const newsContainer = document.querySelector('.news');
const recentContainer = document.querySelector('.recent');
const commentSection = document.querySelector('.comment');
const addCommentBtn = document.querySelector('.comment-btn');
const commentInput = document.getElementById('comment-text');
const postNewsForm = document.getElementById('post-news');
const searchInput = document.querySelector('input[name="search"]');

// Show Loading
function showLoading() {
    newsContainer.innerHTML = '<p>Loading news...</p>';
}

// Show Error
function showError(message) {
    newsContainer.innerHTML = `<p class="text-danger">${message}</p>`;
}

// Fetch News
export async function fetchNews() {
    try {
        showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch news.');
        newsData = await response.json();
        renderNews(newsData);
        renderRecentNews();
    } catch (error) {
        showError(error.message);
    }
}

// Render News
function renderNews(newsList) {
    newsContainer.innerHTML = '';
    newsList.forEach(item => {
        const newsItem = document.createElement('div');
        newsItem.classList.add('news');
        newsItem.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text">${item.content}</p>
                <small class="text-muted">${new Date(item.createdAt).toLocaleDateString()}</small>
            </div>
        `;
        newsContainer.appendChild(newsItem);
    });
}

// Render Recent News
function renderRecentNews() {
    recentContainer.innerHTML = '';
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentItems = newsData.filter(item => new Date(item.createdAt) > threeDaysAgo);
    recentItems.forEach(item => {
        const recentItem = document.createElement('p');
        recentItem.innerText = item.title;
        recentContainer.appendChild(recentItem);
    });
}

// Search News
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredNews = newsData.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
    );
    renderNews(filteredNews);
});

// Form Validation and Post News
postNewsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('nTitle').value.trim();
    const content = document.getElementById('content').value.trim();

    if (!title || !content) {
        alert('Please fill in all fields.');
        return;
    }

    const newNews = {
        title: title,
        content: content,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNews)
        });

        if (!response.ok) throw new Error('Failed to post news.');

        alert('News posted successfully!');
        postNewsForm.reset();
        document.getElementById('nTitle').value = '';
        document.getElementById('content').value = '';
        fetchNews(); 
    } catch (error) {
        alert(error.message);
    }
});

// Comments Logic
addCommentBtn.addEventListener('click', () => {
    const commentText = commentInput.value.trim();
    if (!commentText) {
        alert('Please write a comment.');
        return;
    }

    const newComment = document.createElement('div');
    newComment.classList.add('card', 'mt-2');
    newComment.innerHTML = `
        <div class="card-body">
            <p class="card-text">${commentText}</p>
            <small class="text-muted">${new Date().toLocaleTimeString()}</small>
        </div>
    `;
    commentSection.appendChild(newComment);

    commentInput.value = '';
});

// Initialize
fetchNews();
