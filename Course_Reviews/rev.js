// API Configuration
const API_URL = 'https://601793fb-0682-4eeb-8a63-3f235fb2416c-00-2y83429wjynvg.sisko.replit.dev/api.php';
const REVIEWS_PER_PAGE = 4;

// State management
let allReviews = [];
let filteredReviews = [];
let currentPage = 1;

// DOM Elements
const reviewsList = document.querySelector('.reviews-list');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const searchBtn = document.querySelector('.search-btn');
const paginationContainer = document.querySelector('.pagination');
const reviewForm = document.getElementById('review-form');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app');
    fetchReviews();
    setupEventListeners();
});

function createReviewElement(review) {
    const reviewItem = document.createElement('article');
    reviewItem.className = 'review-item';
    reviewItem.setAttribute('data-id', review.id);

    reviewItem.innerHTML = `
        <h3>Course Name: ${review.courseName}</h3>
        <p>Professor: ${review.professor}</p>
        <p>Rating: ${'⭐'.repeat(review.rating)}</p>
        <details>
            <summary>See More</summary>
            <p class="full-review"><strong>Review:</strong> "${review.reviewText}"</p>
            <details>
                <summary>See Comments</summary>
                <div class="comments">
                    ${(review.comments || []).map(c => `<p><strong>${c.user}:</strong> ${c.text}</p>`).join('') || '<p>No comments yet.</p>'}
                </div>
                <details>
                    <summary>Add Comment</summary>
                    <form class="add-comment-form" onsubmit="event.preventDefault(); addComment('${review.id}', this.querySelector('textarea').value);">
                        <label for="new-comment">Add a Comment:</label>
                        <textarea rows="3" placeholder="Write your comment here..." required></textarea>
                        <button type="submit">Post Comment</button>
                    </form>
                </details>
            </details>
        </details>
    `;

    return reviewItem;
}

// Fetch reviews from the API
function fetchReviews() {
    console.log('Fetching reviews...');
    
    // Show loading state
    if (reviewsList) {
        reviewsList.innerHTML = '<div class="loading">Loading reviews...</div>';
    }
    
    // Fetch from API
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Reviews data received:', data);
            console.log('Fetched data:', data);
            console.log('All reviews:', allReviews);
            console.log('Filtered reviews:', filteredReviews);
            // Handle different API response formats
            if (data.reviews) {
                allReviews = data.reviews;
            } else if (Array.isArray(data)) {
                allReviews = data;
            } else {
                allReviews = [];
                console.error('Unexpected data format:', data);
            }
            
            // If no reviews, create sample data
            if (allReviews.length === 0) {
                allReviews = getSampleReviews();
            }
            
            filteredReviews = [...allReviews];
            renderReviews();
            setupPagination();
        })
        .catch(error => {
            console.error('Error fetching reviews:', error);
            
            // Use sample data if fetch fails
            allReviews = getSampleReviews();
            filteredReviews = [...allReviews];
            
            renderReviews();
            setupPagination();
            
            showMessage('Failed to load reviews from server. Showing sample data.', 'error');
        });
}

function setupEventListeners() {
    searchBtn.addEventListener('click', () => {
        const searchValue = searchInput.value.trim().toLowerCase();
        filteredReviews = allReviews.filter(r =>
            r.courseName.toLowerCase().includes(searchValue) ||
            r.professor.toLowerCase().includes(searchValue) ||
            r.reviewText.toLowerCase().includes(searchValue)
        );
        currentPage = 1;
        renderReviews();
        setupPagination();
    });

    sortSelect.addEventListener('change', () => {
        applySorting(sortSelect.value);
    });

    paginationContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-number')) {
            currentPage = parseInt(e.target.textContent);
        } else if (e.target.classList.contains('prev')) {
            currentPage = Math.max(1, currentPage - 1);
        } else if (e.target.classList.contains('next')) {
            const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
            currentPage = Math.min(totalPages, currentPage + 1);
        }
        renderReviews();
        setupPagination();
    });
}

function applySorting(criterion) {
    switch (criterion) {
        case 'asc':
            filteredReviews.sort((a, b) => a.courseName.localeCompare(b.courseName));
            break;
        case 'desc':
            filteredReviews.sort((a, b) => b.courseName.localeCompare(a.courseName));
            break;
        case 'rate':
            filteredReviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'date':
            filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'dep':
            filteredReviews.sort((a, b) => (a.department || '').localeCompare(b.department || ''));
            break;
        case 'name':
            filteredReviews.sort((a, b) => a.courseName.localeCompare(b.courseName));
            break;
    }
    currentPage = 1;
    renderReviews();
}

function setupPagination() {
    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    paginationContainer.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'prev';
    prevBtn.textContent = 'Previous';
    paginationContainer.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-number';
        pageBtn.textContent = i;
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        paginationContainer.appendChild(pageBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'next';
    nextBtn.textContent = 'Next';
    paginationContainer.appendChild(nextBtn);
}

// Render reviews to the page
function renderReviews() {
    console.log('Rendering reviews, page:', currentPage);
    
    if (!reviewsList) {
        console.error('Reviews list element not found');
        return;
    }
    
    reviewsList.innerHTML = '';
    
    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-results">No reviews found matching your criteria.</div>';
        return;
    }
    if (currentPage < 1) currentPage = 1;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const endIndex = startIndex + REVIEWS_PER_PAGE;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
    
    console.log(`Displaying reviews ${startIndex+1} to ${Math.min(endIndex, filteredReviews.length)} of ${filteredReviews.length}`);
    
    // Create and append review elements
    paginatedReviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewsList.appendChild(reviewElement);
    });
}
console.log('filtered:', filteredReviews.length, 'startIndex:', startIndex, 'endIndex:', endIndex);

function addComment(reviewId, commentText) {
    if (!commentText.trim()) {
        showMessage('Comment cannot be empty', 'error');
        return;
    }
    
    // Find the review
    const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) {
        showMessage('Review not found', 'error');
        return;
    }
    
    // Create comment object
    const newComment = {
        user: 'Current User',
        text: commentText.trim(),
        date: new Date().toISOString()
    };
    
    // Try to submit to API
    fetch(`${API_URL}?comments=true&reviewId=${reviewId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'Current User',
            commentText: commentText.trim(),
            reviewId: reviewId
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to submit comment');
        return response.json();
    })
    .then(data => {
        console.log('Comment submitted successfully:', data);
        
        // Ensure comments array exists
        if (!Array.isArray(allReviews[reviewIndex].comments)) {
            allReviews[reviewIndex].comments = [];
        }
        
        // Add comment to the review
        allReviews[reviewIndex].comments.unshift(newComment);
        
        // Update filtered reviews
        const filteredIndex = filteredReviews.findIndex(r => r.id === reviewId);
        if (filteredIndex !== -1) {
            if (!Array.isArray(filteredReviews[filteredIndex].comments)) {
                filteredReviews[filteredIndex].comments = [];
            }
            filteredReviews[filteredIndex].comments.unshift(newComment);
        }
        
        // Update the UI
        renderReviews();
        
        showMessage('Comment added successfully!', 'success');
    })
    .catch(error => {
        console.error('Error submitting comment:', error);
        
        // Add comment locally anyway
        if (!Array.isArray(allReviews[reviewIndex].comments)) {
            allReviews[reviewIndex].comments = [];
        }
        
        // Add comment to the review
        allReviews[reviewIndex].comments.unshift(newComment);
        
        // Update filtered reviews
        const filteredIndex = filteredReviews.findIndex(r => r.id === reviewId);
        if (filteredIndex !== -1) {
            if (!Array.isArray(filteredReviews[filteredIndex].comments)) {
                filteredReviews[filteredIndex].comments = [];
            }
            filteredReviews[filteredIndex].comments.unshift(newComment);
        }
        
        // Update the UI
        renderReviews();
        
        showMessage('Comment added locally (server error)', 'warning');
    });
    
    // Clear the comment form
    const reviewElement = document.querySelector(`.review-item[data-id="${reviewId}"]`);
    if (reviewElement) {
        const textarea = reviewElement.querySelector('.comment-form textarea');
        if (textarea) {
            textarea.value = '';
        }
    }
}

// Add a simple message display function if not already present
function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageElement.style.position = 'fixed';
    messageElement.style.top = '20px';
    messageElement.style.right = '20px';
    messageElement.style.padding = '10px 20px';
    messageElement.style.borderRadius = '4px';
    messageElement.style.zIndex = '1000';
    
    // Set background color based on message type
    switch(type) {
        case 'success':
            messageElement.style.backgroundColor = '#4CAF50';
            messageElement.style.color = 'white';
            break;
        case 'error':
            messageElement.style.backgroundColor = '#F44336';
            messageElement.style.color = 'white';
            break;
        case 'warning':
            messageElement.style.backgroundColor = '#FF9800';
            messageElement.style.color = 'white';
            break;
        default:
            messageElement.style.backgroundColor = '#2196F3';
            messageElement.style.color = 'white';
    }
    
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, 3000);
}

// Sample reviews for fallback
function getSampleReviews() {
    return [
        {
            id: '1',
            courseName: "Introduction to Computer Science",
            professor: "Dr. Smith",
            rating: 5,
            reviewText: "Excellent introduction to programming concepts. The professor explains everything clearly and the assignments are helpful for understanding the material.",
            createdAt: "2023-05-15T00:00:00.000Z",
            comments: [
                { user: "Student1", text: "I agree! This course was amazing." },
                { user: "Student2", text: "The final project was challenging but fun." }
            ]
        },
        {
            id: '2',
            courseName: "Calculus I",
            professor: "Dr. Johnson",
            rating: 4,
            reviewText: "Good course overall. The professor is knowledgeable but sometimes goes too fast through difficult concepts.",
            createdAt: "2023-04-20T00:00:00.000Z",
            comments: []
        },
        {
            id: '3',
            courseName: "Introduction to Psychology",
            professor: "Dr. Williams",
            rating: 5,
            reviewText: "Fascinating course! The professor makes psychology concepts easy to understand with real-world examples.",
            createdAt: "2023-03-10T00:00:00.000Z",
            comments: [
                { user: "PsychMajor", text: "This course convinced me to major in psychology!" }
            ]
        },
        {
            id: '4',
            courseName: "World History",
            professor: "Dr. Brown",
            rating: 3,
            reviewText: "Interesting content but the workload is heavy. Be prepared for lots of reading and weekly essays.",
            createdAt: "2023-02-05T00:00:00.000Z",
            comments: []
        },
        {
            id: '5',
            courseName: "Organic Chemistry",
            professor: "Dr. Miller",
            rating: 4,
            reviewText: "Challenging but rewarding. The lab sessions are particularly helpful for understanding the concepts.",
            createdAt: "2023-01-15T00:00:00.000Z",
            comments: []
        },
        {
            id: '6',
            courseName: "Introduction to Philosophy",
            professor: "Dr. Davis",
            rating: 5,
            reviewText: "Mind-opening course that challenges your thinking. The discussions in class are always engaging.",
            createdAt: "2022-12-10T00:00:00.000Z",
            comments: []
        }
    ];
}