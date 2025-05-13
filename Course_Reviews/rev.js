// API Configuration
const API_URL = 'https://601793fb-0682-4eeb-8a63-3f235fb2416c-00-2y83429wjynvg.sisko.replit.dev/index.php';
const REVIEWS_PER_PAGE = 4;

// State management
let allReviews = [];
let filteredReviews = [];
let currentPage = 1;
let isLoading = false;

// DOM Elements
const reviewsList = document.querySelector('.reviews-list');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const searchBtn = document.querySelector('.search-btn');
const paginationContainer = document.querySelector('.pagination');
const reviewForm = document.getElementById('review-form');
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.textContent = 'Loading...';

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    try {
        await fetchReviews();
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize application');
    }
}

/**
 * Fetches reviews from the API
 */
export async function fetchReviews() {
    try {
        showLoading(true);
        
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        allReviews = await response.json();
        filteredReviews = [...allReviews];
        
        renderReviews();
        setupPagination();
    } catch (error) {
        console.error('Fetch error:', error);
        showError('Failed to load reviews. Please try again later.');
        // Fallback to mock data if API fails
        allReviews = getMockReviews();
        filteredReviews = [...allReviews];
        renderReviews();
        setupPagination();
    } finally {
        showLoading(false);
    }
}

/**
 * Renders reviews based on current filters and pagination
 */
function renderReviews() {
    if (!reviewsList) return;
    
    reviewsList.innerHTML = '';
    
    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-results">No reviews found matching your criteria.</div>';
        return;
    }
    
    const startIdx = (currentPage - 1) * REVIEWS_PER_PAGE;
    const paginatedReviews = filteredReviews.slice(startIdx, startIdx + REVIEWS_PER_PAGE);
    
    paginatedReviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewsList.appendChild(reviewElement);
    });
}

/**
 * Creates a review DOM element
 */
function createReviewElement(review) {
    const reviewItem = document.createElement('article');
    reviewItem.className = 'review-item';
    reviewItem.dataset.id = review.id;
    
    const stars = '⭐'.repeat(review.rating);
    const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date';
    
    const commentsHTML = review.comments?.length > 0 
        ? review.comments.map(c => `<p><strong>${c.user || 'Anonymous'}:</strong> ${c.text}</p>`).join('')
        : '<p>No comments yet.</p>';
    
    reviewItem.innerHTML = `
        <h3>${review.courseName || 'No course name'}</h3>
        <p>Professor: ${review.professor || 'No professor'}</p>
        <p>Rating: ${stars}</p>
        <p class="review-date">Posted: ${date}</p>
        <details>
            <summary>See More</summary>
            <div class="review-details">
                <p><strong>Review:</strong> ${review.reviewText || 'No review text'}</p>
                <details>
                    <summary>Comments (${review.comments?.length || 0})</summary>
                    <div class="comments">${commentsHTML}</div>
                    <details>
                        <summary>Add Comment</summary>
                        <form class="add-comment-form">
                            <textarea placeholder="Your comment..." required></textarea>
                            <button type="submit">Post</button>
                        </form>
                    </details>
                </details>
            </div>
        </details>
        <div class="review-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    
    return reviewItem;
}

/**
 * Sets up pagination controls
 */
function setupPagination() {
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    
    // Previous button
    const prevBtn = createPaginationButton('Previous', 'prev', currentPage === 1);
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        paginationContainer.appendChild(createPaginationButton('1', 'page-number'));
        if (startPage > 2) {
            paginationContainer.appendChild(createEllipsis());
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const btn = createPaginationButton(i.toString(), 'page-number', false, i === currentPage);
        paginationContainer.appendChild(btn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationContainer.appendChild(createEllipsis());
        }
        paginationContainer.appendChild(createPaginationButton(totalPages.toString(), 'page-number'));
    }
    
    // Next button
    const nextBtn = createPaginationButton('Next', 'next', currentPage === totalPages);
    paginationContainer.appendChild(nextBtn);
}

function createPaginationButton(text, className, disabled = false, active = false) {
    const btn = document.createElement('button');
    btn.className = className + (active ? ' active' : '');
    btn.textContent = text;
    btn.disabled = disabled;
    return btn;
}

function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    return ellipsis;
}

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchBtn?.addEventListener('click', handleSearch);
    }
    
    // Sorting
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Pagination
    if (paginationContainer) {
        paginationContainer.addEventListener('click', handlePaginationClick);
    }
    
    // Review form
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Event delegation for dynamic elements
    if (reviewsList) {
        reviewsList.addEventListener('click', (e) => {
            if (e.target.closest('.add-comment-form')) {
                e.preventDefault();
                handleCommentSubmit(e.target.closest('.add-comment-form'));
            }
            
            if (e.target.classList.contains('edit-btn')) {
                handleEditReview(e.target.closest('.review-item'));
            }
            
            if (e.target.classList.contains('delete-btn')) {
                handleDeleteReview(e.target.closest('.review-item'));
            }
        });
    }
}

/**
 * Handles search functionality
 */
function handleSearch() {
    const term = searchInput.value.trim().toLowerCase();
    
    if (!term) {
        filteredReviews = [...allReviews];
    } else {
        filteredReviews = allReviews.filter(review => 
            (review.courseName?.toLowerCase().includes(term)) ||
            (review.professor?.toLowerCase().includes(term)) ||
            (review.reviewText?.toLowerCase().includes(term)) ||
            (review.department?.toLowerCase().includes(term))
        );
    }
    
    currentPage = 1;
    renderReviews();
    setupPagination();
}

/**
 * Handles sorting of reviews
 */
function handleSortChange() {
    const value = sortSelect.value;
    
    filteredReviews.sort((a, b) => {
        switch (value) {
            case 'asc': return a.courseName?.localeCompare(b.courseName);
            case 'desc': return b.courseName?.localeCompare(a.courseName);
            case 'date': return new Date(b.createdAt) - new Date(a.createdAt);
            case 'rate': return b.rating - a.rating;
            default: return 0;
        }
    });
    
    renderReviews();
}

/**
 * Handles pagination clicks
 */
function handlePaginationClick(e) {
    if (e.target.classList.contains('page-number')) {
        currentPage = parseInt(e.target.textContent);
    } else if (e.target.classList.contains('prev')) {
        currentPage--;
    } else if (e.target.classList.contains('next')) {
        currentPage++;
    } else {
        return;
    }
    
    renderReviews();
    updatePaginationUI();
}

function updatePaginationUI() {
    const pages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    const pageBtns = paginationContainer.querySelectorAll('.page-number');
    
    pageBtns.forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.textContent) === currentPage);
    });
    
    paginationContainer.querySelector('.prev').disabled = currentPage === 1;
    paginationContainer.querySelector('.next').disabled = currentPage === pages;
}

/**
 * Handles form submission for new reviews
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateReviewForm()) return;
    
    const newReview = {
        courseName: document.getElementById('course-name').value.trim(),
        professor: document.getElementById('professor-name').value.trim(),
        rating: document.getElementById('rating').value.length,
        reviewText: document.getElementById('review-text').value.trim(),
        createdAt: new Date().toISOString(),
        comments: []
    };
    
    try {
        showLoading(true);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReview)
        });
        
        if (!response.ok) throw new Error('Failed to submit review');
        
        const createdReview = await response.json();
        allReviews.unshift(createdReview);
        filteredReviews = [...allReviews];
        
        e.target.reset();
        showSuccess('Review submitted successfully!');
        currentPage = 1;
        renderReviews();
        setupPagination();
    } catch (error) {
        console.error('Submission error:', error);
        showError('Failed to submit review. Please try again.');
    } finally {
        showLoading(false);
    }
}

function validateReviewForm() {
    const fields = [
        { id: 'course-name', message: 'Course name is required' },
        { id: 'professor-name', message: 'Professor name is required' },
        { id: 'rating', message: 'Please select a rating' },
        { id: 'review-text', message: 'Review text is required', minLength: 20 }
    ];
    
    let isValid = true;
    
    fields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element.value.trim();
        let error = '';
        
        if (!value) {
            error = field.message;
        } else if (field.minLength && value.length < field.minLength) {
            error = `${field.message} (min ${field.minLength} chars)`;
        }
        
        if (error) {
            showFieldError(element, error);
            isValid = false;
        } else {
            clearFieldError(element);
        }
    });
    
    return isValid;
}

function showFieldError(element, message) {
    clearFieldError(element);
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    element.insertAdjacentElement('afterend', error);
    element.classList.add('error');
}

function clearFieldError(element) {
    const existingError = element.nextElementSibling;
    if (existingError?.classList.contains('error-message')) {
        existingError.remove();
    }
    element.classList.remove('error');
}

/**
 * Handles comment submission
 */
async function handleCommentSubmit(form) {
    const text = form.querySelector('textarea').value.trim();
    if (!text) {
        showError('Please enter a comment');
        return;
    }
    
    const reviewId = form.closest('.review-item').dataset.id;
    const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex === -1) {
        showError('Review not found');
        return;
    }
    
    const newComment = {
        user: 'Current User',
        text,
        date: new Date().toISOString()
    };
    
    try {
        const updatedReview = {
            ...allReviews[reviewIndex],
            comments: [...(allReviews[reviewIndex].comments || []), newComment]
        };
        
        const response = await fetch(`${API_URL}/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedReview)
        });
        
        if (!response.ok) throw new Error('Failed to add comment');
        
        allReviews[reviewIndex] = await response.json();
        filteredReviews = [...allReviews];
        
        form.querySelector('textarea').value = '';
        showSuccess('Comment added!');
        renderReviews();
    } catch (error) {
        console.error('Comment error:', error);
        showError('Failed to add comment');
    }
}

/**
 * Handles review editing
 */
function handleEditReview(reviewItem) {
    const reviewId = reviewItem.dataset.id;
    const review = allReviews.find(r => r.id === reviewId);
    
    if (!review) return;
    
    // In a real app, implement proper edit functionality
    alert(`Editing review for ${review.courseName}`);
}

/**
 * Handles review deletion
 */
async function handleDeleteReview(reviewItem) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    const reviewId = reviewItem.dataset.id;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/${reviewId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete');
        
        allReviews = allReviews.filter(r => r.id !== reviewId);
        filteredReviews = filteredReviews.filter(r => r.id !== reviewId);
        
        const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        showSuccess('Review deleted');
        renderReviews();
        setupPagination();
    } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete review');
    } finally {
        showLoading(false);
    }
}

// UI Helpers
function showLoading(show) {
    if (show) {
        document.body.appendChild(loadingIndicator);
    } else {
        loadingIndicator.remove();
    }
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert error';
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert success';
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Utility functions
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Mock data for fallback
function getMockReviews() {
    return [
        {
            id: '1',
            courseName: "Intro to Psychology",
            professor: "Dr. Smith",
            rating: 5,
            reviewText: "Great introduction to psychology concepts.",
            createdAt: "2023-05-15T00:00:00.000Z",
            comments: [
                { user: "User1", text: "Excellent course!" }
            ]
        },
        {
            id: '2',
            courseName: "Advanced Mathematics",
            professor: "Dr. Johnson",
            rating: 4,
            reviewText: "Challenging but rewarding.",
            createdAt: "2023-04-20T00:00:00.000Z",
            comments: []
        }
    ];
}