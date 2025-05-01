
const API_URL = 'https://680d3d23c47cb8074d8ffa84.mockapi.io/api/campuse-reviews/reviews'; 
const REVIEWS_PER_PAGE = 4;

let allReviews = [];
let filteredReviews = [];
let currentPage = 1;
let isLoading = false;

const reviewsList = document.querySelector('.reviews-list');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const searchBtn = document.querySelector('.search-btn');
const paginationContainer = document.querySelector('.pagination');
const reviewForm = document.getElementById('review-form');

document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    fetchReviews();
    setupEventListeners();
}

async function fetchReviews() {
    try {
        showLoading(true);
        
        
        allReviews = getMockReviews();
        
        renderReviews(allReviews);
        setupPagination(allReviews.length);
    } catch (error) {
        showError('Failed to load reviews. Please try again later.');
        console.error('Fetch error:', error);
    } finally {
        showLoading(false);
    }
}


function getMockReviews() {
    return [
        {
            id: 1,
            courseName: "Intro to Psychology",
            professor: "Dr. Smith",
            rating: 5,
            review: "This course provided a great introduction to psychology. The lectures were engaging, and Dr. Smith made complex topics easy to understand.",
            department: "Psychology",
            difficulty: "Medium",
            date: "2023-05-15",
            comments: [
                { user: "User1", text: "I agree with this review. Dr. Smith is amazing!" },
                { user: "User2", text: "I found the assignments to be a bit challenging, but the lectures were great." }
            ]
        },
        {
            id: 2,
            courseName: "Advanced Mathematics",
            professor: "Dr. Johnson",
            rating: 4,
            review: "This course was challenging but rewarding. Dr. Johnson explained the concepts clearly.",
            department: "Mathematics",
            difficulty: "Hard",
            date: "2023-04-20",
            comments: [
                { user: "User1", text: "The course was tough, but I learned a lot." }
            ]
        },
        {
            id: 3,
            courseName: "Chemistry 101",
            professor: "Dr. Brown",
            rating: 3,
            review: "The course was interesting, but the lab sessions were a bit disorganized.",
            department: "Chemistry",
            difficulty: "Medium",
            date: "2023-03-10",
            comments: [
                { user: "User1", text: "I had a similar experience with the labs." },
                { user: "User2", text: "The lectures were informative, though." }
            ]
        },
        {
            id: 4,
            courseName: "History of Art",
            professor: "Dr. Green",
            rating: 5,
            review: "An excellent course! Dr. Green is very knowledgeable and passionate about the subject.",
            department: "Art History",
            difficulty: "Easy",
            date: "2023-06-05",
            comments: [
                { user: "User1", text: "I loved this course! The field trips were amazing." }
            ]
        },
        {
            id: 5,
            courseName: "Computer Science Basics",
            professor: "Dr. White",
            rating: 4,
            review: "A great introduction to programming. Dr. White is very helpful.",
            department: "Computer Science",
            difficulty: "Medium",
            date: "2023-02-15",
            comments: [
                { user: "User1", text: "I found the course very useful for beginners." }
            ]
        }
    ];
}




function renderReviews(reviews) {
    if (!reviewsList) return;
    
    
    reviewsList.innerHTML = '';
    
    
    const startIdx = (currentPage - 1) * REVIEWS_PER_PAGE;
    const paginatedReviews = reviews.slice(startIdx, startIdx + REVIEWS_PER_PAGE);
    
    if (paginatedReviews.length === 0) {
        reviewsList.innerHTML = '<p class="no-results">No reviews found matching your criteria.</p>';
        return;
    }
    
    
    paginatedReviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewsList.appendChild(reviewElement);
    });
}


function createReviewElement(review) {
    const reviewItem = document.createElement('article');
    reviewItem.className = 'review-item';
    reviewItem.dataset.id = review.id;
    
    
    const stars = '⭐'.repeat(review.rating);
    
    
    let commentsHTML = '';
    if (review.comments && review.comments.length > 0) {
        commentsHTML = review.comments.map(comment => 
            `<p><strong>${comment.user}:</strong> ${comment.text}</p>`
        ).join('');
    }
    
    reviewItem.innerHTML = `
        <h3>Course Name: ${review.courseName}</h3>
        <p>Professor: ${review.professor}</p>
        <p>Rating: ${stars}</p>
        <details>
            <summary>See More</summary>
            <p class="full-review">
                <strong>Review:</strong> "${review.review}"
            </p>
            <details>
                <summary>See Comments</summary>
                <div class="comments">
                    ${commentsHTML || '<p>No comments yet.</p>'}
                </div>
                <details>
                    <summary>Add Comment</summary>
                    <form class="add-comment-form">
                        <label for="new-comment-${review.id}">Add a Comment:</label>
                        <textarea id="new-comment-${review.id}" rows="3" placeholder="Write your comment here..." required></textarea>
                        <button type="submit">Post Comment</button>
                    </form>
                </details>
            </details>
        </details>
        <div class="review-actions">
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        </div>
    `;
    
    return reviewItem;
}


function setupPagination(totalItems) {
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(totalItems / REVIEWS_PER_PAGE);
    paginationContainer.innerHTML = '';
    
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'prev';
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    paginationContainer.appendChild(prevBtn);
    
    
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        paginationContainer.appendChild(pageBtn);
    }
    
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'next';
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    paginationContainer.appendChild(nextBtn);
}


function updatePaginationUI() {
    const pageButtons = paginationContainer.querySelectorAll('.page-number');
    pageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.textContent) === currentPage) {
            btn.classList.add('active');
        }
    });
    
    const prevBtn = paginationContainer.querySelector('.prev');
    const nextBtn = paginationContainer.querySelector('.next');
    const totalPages = Math.ceil((filteredReviews.length || allReviews.length) / REVIEWS_PER_PAGE);
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
}




function setupEventListeners() {
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    
    if (paginationContainer) {
        paginationContainer.addEventListener('click', handlePagination);
    }
    
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleFormSubmit);
    }
    
    
    if (reviewsList) {
        reviewsList.addEventListener('click', function(e) {
            
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


function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm.length === 0) {
        filteredReviews = [...allReviews];
    } else {
        filteredReviews = allReviews.filter(review => 
            review.courseName.toLowerCase().includes(searchTerm) ||
            review.professor.toLowerCase().includes(searchTerm) ||
            review.review.toLowerCase().includes(searchTerm) ||
            (review.department && review.department.toLowerCase().includes(searchTerm))
        );
    }
    
    currentPage = 1;
    renderReviews(filteredReviews);
    setupPagination(filteredReviews.length);
}


function handleSortChange() {
    const sortValue = sortSelect.value;
    let sortedReviews = [...filteredReviews.length ? filteredReviews : allReviews];
    
    switch (sortValue) {
        case 'asc':
            sortedReviews.sort((a, b) => a.courseName.localeCompare(b.courseName));
            break;
        case 'desc':
            sortedReviews.sort((a, b) => b.courseName.localeCompare(a.courseName));
            break;
        case 'dep':
            sortedReviews.sort((a, b) => a.department.localeCompare(b.department));
            break;
        case 'date':
            sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'rate':
            sortedReviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            sortedReviews.sort((a, b) => a.courseName.localeCompare(b.courseName));
            break;
        default:
            break;
    }
    
    renderReviews(sortedReviews);
}


function handlePagination(e) {
    if (e.target.classList.contains('page-number')) {
        currentPage = parseInt(e.target.textContent);
        renderReviews(filteredReviews.length ? filteredReviews : allReviews);
        updatePaginationUI();
    } else if (e.target.classList.contains('prev') && currentPage > 1) {
        currentPage--;
        renderReviews(filteredReviews.length ? filteredReviews : allReviews);
        updatePaginationUI();
    } else if (e.target.classList.contains('next') && 
              currentPage < Math.ceil((filteredReviews.length || allReviews.length) / REVIEWS_PER_PAGE)) {
        currentPage++;
        renderReviews(filteredReviews.length ? filteredReviews : allReviews);
        updatePaginationUI();
    }
}


function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateReviewForm()) return;
    
    const newReview = {
        id: Date.now(), 
        courseName: document.getElementById('course-name').value,
        professor: document.getElementById('professor-name').value,
        rating: document.getElementById('rating').value.length,
        review: document.getElementById('review-text').value,
        department: "General", 
        difficulty: "Medium", 
        date: new Date().toISOString().split('T')[0],
        comments: []
    };
    
    
    allReviews.unshift(newReview);
    
    
    e.target.reset();
    showSuccess('Review added successfully!');
    
    
    renderReviews(allReviews);
    setupPagination(allReviews.length);
}


function validateReviewForm() {
    const courseName = document.getElementById('course-name').value.trim();
    const professor = document.getElementById('professor-name').value.trim();
    const rating = document.getElementById('rating').value;
    const reviewText = document.getElementById('review-text').value.trim();
    
    if (!courseName) {
        showError('Please enter a course name');
        return false;
    }
    
    if (!professor) {
        showError('Please enter a professor name');
        return false;
    }
    
    if (!rating) {
        showError('Please select a rating');
        return false;
    }
    
    if (!reviewText) {
        showError('Please enter your review');
        return false;
    }
    
    return true;
}


function handleCommentSubmit(form) {
    const commentText = form.querySelector('textarea').value.trim();
    const reviewId = parseInt(form.closest('.review-item').dataset.id);
    
    if (!commentText) {
        showError('Please enter a comment');
        return;
    }
    
    
    const review = allReviews.find(r => r.id === reviewId);
    if (review) {
        review.comments.push({
            user: "Current User", 
            text: commentText
        });
        
        
        renderReviews(filteredReviews.length ? filteredReviews : allReviews);
        form.querySelector('textarea').value = '';
        showSuccess('Comment added!');
    }
}


function handleEditReview(reviewItem) {
    const reviewId = parseInt(reviewItem.dataset.id);
    const review = allReviews.find(r => r.id === reviewId);
    
    if (!review) return;
    
    
    alert(`Editing review for ${review.courseName}. In a full implementation, this would open an edit form.`);
}


function handleDeleteReview(reviewItem) {
    const reviewId = parseInt(reviewItem.dataset.id);
    
    if (confirm('Are you sure you want to delete this review?')) {
        
        allReviews = allReviews.filter(review => review.id !== reviewId);
        filteredReviews = filteredReviews.filter(review => review.id !== reviewId);
        
        
        renderReviews(filteredReviews.length ? filteredReviews : allReviews);
        setupPagination(filteredReviews.length || allReviews.length);
        showSuccess('Review deleted successfully!');
    }
}


function showLoading(isLoading) {
    
    if (isLoading) {
        document.body.style.cursor = 'wait';
    } else {
        document.body.style.cursor = 'default';
    }
}


function showError(message) {
    alert(`Error: ${message}`); 
}


function showSuccess(message) {
    alert(`Success: ${message}`); 
}

