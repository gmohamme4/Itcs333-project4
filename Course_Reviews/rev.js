// API Configuration
const API_URL = 'https://601793fb-0682-4eeb-8a63-3f235fb2416c-00-2y83429wjynvg.sisko.replit.dev/api.php'; 
const REVIEWS_PER_PAGE = 4;

// State management
let allReviews = [];
let filteredReviews = [];
let currentPage = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    fetchReviews();
    setupEventListeners();
});

// Create review element with edit/delete buttons
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
            
            <!-- UPDATED COMMENTS SECTION STARTS HERE -->
            <details class="comments-section">
                <summary>Comments (${review.comments?.length || 0})</summary>
                <div class="comments-list">
                    ${(review.comments || []).map(c => `
                        <div class="comment">
                            <strong>${c.user}:</strong> 
                            <p>${c.text}</p>
                            <small>${new Date(c.createdAt).toLocaleDateString()}</small>
                        </div>
                    `).join('')}
                </div>
                
                <form class="add-comment-form" data-reviewid="${review.id}">
                    <textarea placeholder="Write your comment..." required></textarea>
                    <button type="submit">Post Comment</button>
                </form>
            </details>
            <!-- UPDATED COMMENTS SECTION ENDS HERE -->
            
        </details>
    `;

    return reviewItem;
}
// Fetch reviews from API
function fetchReviews() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.status === 'error') throw new Error(data.message);
            allReviews = data.reviews || [];
            filteredReviews = [...allReviews];
            renderReviews();
        })
        .catch(error => {
            console.error('Fetch error:', error);
            showMessage(`API Error: ${error.message}`, 'error');
            // Fallback to sample data if needed
            allReviews = getSampleReviews();
            filteredReviews = [...allReviews];
            renderReviews();
        });
}

// Submit new review
function submitReview(event) {
    event.preventDefault();
    
    // Get form values
    const courseName = document.getElementById('course-name').value;
    const professor = document.getElementById('professor-name').value;
    const rating = document.getElementById('rating').value.length; // Count stars
    const reviewText = document.getElementById('review-text').value;

    // Create review object
    const newReview = {
        courseName: courseName,
        professor: professor,
        rating: rating,
        reviewText: reviewText
    };

    console.log('Submitting:', newReview); // Debug log

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview)
    })
    .then(response => {
        console.log('Response status:', response.status); // Debug log
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Failed to submit') });
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data); // Debug log
        alert('Review submitted successfully!');
        window.location.href = 'zpart.html'; // Redirect after success
    })
    .catch(error => {
        console.error('Error:', error); // Debug log
        alert('Error submitting review: ' + error.message);
    });
}

// Edit review
function editReview(reviewId) {
    const review = allReviews.find(r => r.id == reviewId);
    if (!review) return;

    const newCourseName = prompt('Course Name:', review.courseName);
    const newProfessor = prompt('Professor:', review.professor);
    const newRating = prompt('Rating (1-5):', review.rating);
    const newReviewText = prompt('Review Text:', review.reviewText);

    if (newCourseName && newProfessor && newRating && newReviewText) {
        fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: reviewId,
                courseName: newCourseName,
                professor: newProfessor,
                rating: newRating,
                reviewText: newReviewText
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                fetchReviews(); // Refresh the list
            } else {
                throw new Error(data.message || 'Update failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating review: ' + error.message);
        });
    }
}

// Delete review
function deleteReview(reviewId) {
    if (confirm('Are you sure you want to delete this review?')) {
        fetch(`${API_URL}?id=${reviewId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                fetchReviews(); // Refresh the list
            } else {
                throw new Error(data.message || 'Deletion failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting review: ' + error.message);
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Edit/Delete buttons (delegated)
    // Handle comment submission
document.addEventListener('submit', async function(e) {
    if (e.target.classList.contains('add-comment-form')) {
        e.preventDefault();
        
        const form = e.target;
        const reviewId = form.dataset.reviewid;
        const textarea = form.querySelector('textarea');
        const commentText = textarea.value.trim();

        if (!commentText) {
            alert('Please write a comment');
            return;
        }

        try {
            const response = await fetch(`${API_URL}?comments=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reviewId: reviewId,
                    username: 'Current User', // Replace with actual username if available
                    commentText: commentText
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add comment');
            }

            // Refresh the review to show the new comment
            fetchReviews();
            
        } catch (error) {
            console.error('Comment submission error:', error);
            alert('Error: ' + error.message);
        }
    }
});
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            editReview(e.target.dataset.id);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteReview(e.target.dataset.id);
        }
    });

    // Comment submission
    
    // Handle comment submission
document.addEventListener('submit', async (e) => {
    if (e.target.classList.contains('add-comment-form')) {
        e.preventDefault();
        
        const form = e.target;
        const reviewId = form.dataset.reviewid;
        const textarea = form.querySelector('textarea');
        const commentText = textarea.value.trim();
        
        if (!commentText) {
            alert('Please enter a comment');
            return;
        }

        try {
            const response = await fetch(`${API_URL}?comments=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reviewId: reviewId,
                    username: 'Current User', // You can replace with actual username
                    commentText: commentText
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add comment');
            }

            // Refresh the reviews to show the new comment
            fetchReviews();
            textarea.value = ''; // Clear the textarea
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Error adding comment: ' + error.message);
        }
    }
});

    // Search and sort functionality
    document.querySelector('.search-btn').addEventListener('click', () => {
        const searchValue = document.getElementById('search').value.trim().toLowerCase();
        filteredReviews = allReviews.filter(r =>
            r.courseName.toLowerCase().includes(searchValue) ||
            r.professor.toLowerCase().includes(searchValue) ||
            r.reviewText.toLowerCase().includes(searchValue)
        );
        currentPage = 1;
        renderReviews();
        setupPagination();
    });

    document.getElementById('sort').addEventListener('change', (e) => {
        applySorting(e.target.value);
    });
}

// Render reviews to the page
function renderReviews() {
    const reviewsList = document.querySelector('.reviews-list');
    reviewsList.innerHTML = '';

    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-results">No reviews found</div>';
        return;
    }

    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    const end = start + REVIEWS_PER_PAGE;
    const paginated = filteredReviews.slice(start, end);

    paginated.forEach(review => {
        reviewsList.appendChild(createReviewElement(review));
    });
}

// Setup pagination
function setupPagination() {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);

    const prevBtn = document.createElement('button');
    prevBtn.className = 'prev';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderReviews();
            setupPagination();
        }
    });
    pagination.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-number';
        btn.textContent = i;
        btn.disabled = i === currentPage;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderReviews();
            setupPagination();
        });
        pagination.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'next';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderReviews();
            setupPagination();
        }
    });
    pagination.appendChild(nextBtn);
}

// Apply sorting
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
        default:
            filteredReviews.sort((a, b) => a.courseName.localeCompare(b.courseName));
    }
    currentPage = 1;
    renderReviews();
}

// Initialize review form if on create.html
if (document.getElementById('review-form')) {
    document.getElementById('review-form').addEventListener('submit', submitReview);
}