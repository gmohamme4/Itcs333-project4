
async function fetchReviews() {
    try {
      showLoading();
      const response = await fetch('https://jsonplaceholder.typicode.com/posts'); 
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const reviews = await response.json();
      hideLoading();
      renderReviews(reviews.slice(0, 10)); 
    } catch (error) {
      hideLoading();
      console.error('Error fetching reviews:', error);
      showError('Failed to load reviews. Please try again later.');
 } 
}
    
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}
  
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}
function renderList(items) {
    const app = document.getElementById('app');
    app.innerHTML = ''; 
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      div.textContent = item.title; 
      div.addEventListener('click', () => showDetails(item));
      app.appendChild(div);
    });
}
const API_URL = 'https://jsonplaceholder.typicode.com/posts'; 


document.querySelector('.search-bar input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredReviews = reviews.filter(review => review.title.toLowerCase().includes(query));
    renderReviews(filteredReviews);
  });
document.querySelectorAll('.dropdown-content a').forEach((sortOption) => {
    sortOption.addEventListener('click', (e) => {
      const sortType = e.target.textContent;
      let sortedReviews = [...reviews];
  
      if (sortType === 'Sort by Date') {
        sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sortType === 'Sort by Rating') {
        sortedReviews.sort((a, b) => b.rating - a.rating);
      } else if (sortType === 'Sort by Course Name') {
        sortedReviews.sort((a, b) => a.title.localeCompare(b.title));
      }
  
      renderReviews(sortedReviews);
    });
  });
  function renderPagination(reviews, itemsPerPage = 5) {
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = ''; 
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
  
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.className = 'page-number';
      button.textContent = i;
      button.addEventListener('click', () => {
        const start = (i - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        renderReviews(reviews.slice(start, end));
      });
      pagination.appendChild(button);
    }
  }
  document.querySelectorAll('.add-comment-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const textarea = form.querySelector('textarea');
      if (!textarea.value.trim()) {
        alert('Comment cannot be empty!');
        return;
      }
      alert('Comment added successfully!');
      textarea.value = ''; 
    });
  });
function showDetails(review) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <h2>${item.title}</h2>
      <p>${item.body}</p>
      <button onclick="fetchData(API_URL).then(data => renderList(data))">Back</button>
    `;
}


