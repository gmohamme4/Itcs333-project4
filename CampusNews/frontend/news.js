const API_URL = 'http://localhost/CampusNewsAPI/news';

let newsData = [];
let allNewsData = []; // Store original unfiltered data

// Elements
const newsContainer = document.querySelector('.news');
const recentContainer = document.querySelector('.recent');
const commentSection = document.querySelector('.comment');
const addCommentBtn = document.querySelector('.comment-btn');
const commentInput = document.getElementById('comment-text');
const postNewsForm = document.getElementById('post-news');
const searchInput = document.querySelector('input[name="search"]');
const dropbtn = document.querySelector('.dropbtn');
const dropdownContent = document.getElementById('myDropdown');

// Show Loading
function showLoading() {
    newsContainer.innerHTML = '<p>Loading news...</p>';
}

// Show Error
function showError(message) {
    newsContainer.innerHTML = `<p class="text-danger">${message}</p>`;
}

// Toggle dropdown filter
function toggleDropdown() {
    dropdownContent.classList.toggle('show');
}

// Close dropdown when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        dropdownContent.classList.remove('show');
    }
}

// Filter news by date
function filterNews(filterType) {
    const now = new Date();
    let filteredNews = [...allNewsData]; // Use original data
    
    switch(filterType) {
        case 'today':
            filteredNews = allNewsData.filter(item => {
                const newsDate = new Date(item.createdAt);
                return newsDate.toDateString() === now.toDateString();
            });
            break;
        case 'week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            filteredNews = allNewsData.filter(item => new Date(item.createdAt) > oneWeekAgo);
            break;
        case 'all':
        default:
            // Show all news (no filter)
            break;
    }
    
    newsData = filteredNews; // Update current newsData
    renderNews(newsData);
}

// Fetch News
export async function fetchNews() {
    try {
        showLoading();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch news.');
        newsData = await response.json();
        allNewsData = [...newsData]; // Store original data
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
        newsItem.classList.add('news-item');
        newsItem.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text">${item.content}</p>
                <small class="text-muted">${new Date(item.created_at).toLocaleDateString()}</small>
            </div>
            <div class="comments-section">
                <div class="comment" data-news-id="${item.id}">
                    <!-- Comments will appear here -->
                </div>
                <div class="add-comment">
                    <textarea class="comment-text" placeholder="write your own comment ..." data-news-id="${item.id}"></textarea>
                    <button type="submit" class="comment-btn" data-news-id="${item.id}">add Comment</button>
                </div>
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

    const recentItems = allNewsData.filter(item => new Date(item.createdAt) > threeDaysAgo);
    recentItems.forEach(item => {
        const recentItem = document.createElement('p');
        recentItem.innerText = item.title;
        recentContainer.appendChild(recentItem);
    });
}

// Search News
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        newsData = [...allNewsData]; // Reset to all news when search is empty
        renderNews(newsData);
        return;
    }

    const filteredNews = allNewsData.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
    );
    
    newsData = filteredNews; // Update current newsData
    renderNews(newsData);
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
        fetchNews(); 
    } catch (error) {
        alert(error.message);
    }
});

// Comments Logic
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('comment-btn')) {
        const newsId = e.target.getAttribute('data-news-id');
        const commentText = document.querySelector(`textarea[data-news-id="${newsId}"]`).value.trim();
        
        if (!commentText) {
            alert('Please write a comment.');
            return;
        }

        const commentSection = document.querySelector(`.comment[data-news-id="${newsId}"]`);
        
        const newComment = document.createElement('div');
        newComment.classList.add('card', 'mt-2');
        newComment.innerHTML = `
            <div class="card-body">
                <p class="card-text">${commentText}</p>
                <small class="text-muted">${new Date().toLocaleTimeString()}</small>
            </div>
        `;
        commentSection.appendChild(newComment);

        document.querySelector(`textarea[data-news-id="${newsId}"]`).value = '';
    }
});

// Initialize dropdown event listener
dropbtn.addEventListener('click', toggleDropdown);

// Initialize
fetchNews();