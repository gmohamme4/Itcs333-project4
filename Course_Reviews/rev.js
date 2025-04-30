const API_URL = 'https://680d3d23c47cb8074d8ffa84.mockapi.io/api/campuse-reviews/:endpoint';
let reviews = [];
async function fetchReviews() {
    try {
      showLoading();
      const response = await fetch(API_URL.replace(':endpoint', 'reviews')); 
      if (!response.ok) throw new Error('Failed to fetch reviews');
       reviews = await response.json();
      hideLoading();
      renderReviews(reviews.slice(0, 10)); 
      renderPagination(reviews);
    } catch (error) {
      hideLoading();
      console.error('Error fetching reviews:', error);
      showError('Failed to load reviews. Please try again later.');
 } 
}
  
function renderReviews(items = reviews) {
  const app = document.getElementById('app');
  app.innerHTML = ''; 
  items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `
          <h3>${item.course}</h3>
          <p>Professor: ${item.professor}</p>
          <p>Rating: ${item.rating}</p>
          <p>${item.text}</p>
          <div class="comments">
              <h4>Comments:</h4>
              <ul>${(item.comments || []).map(comment => `<li>${comment}</li>`).join('')}</ul>
              <form class="add-comment-form">
                  <textarea placeholder="Add a comment"></textarea>
                  <button type="submit">Add Comment</button>
              </form>
          </div>
      `;
      div.querySelector('.add-comment-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const textarea = e.target.querySelector('textarea');
          if (!textarea.value.trim()) {
              alert('Comment cannot be empty!');
              return;
          }
          item.comments = item.comments || [];
          item.comments.push(textarea.value.trim());
          textarea.value = '';
          renderReviews(items); 
      });
      app.appendChild(div);
  });
}
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}
function validateForm() {
  let x= document.forms["review-form"]["course-name"].value;  
  if (x == "") {
    alert("Course name must be filled out");
    return false;
  }
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
 

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector("review-form"); 
  form.addEventListener("submit", function (e) {
      e.preventDefault();
      const course = document.getElementById("course-name").value.trim();
      const professor = document.getElementById("professor-name").value.trim();
      const rating = document.getElementById("rating").value;
      const text = document.getElementById("review-text").value.trim();

      if (!course || !professor || !rating || !text) {
          alert("Please fill in all fields.");
          return;
      }

      const newReview = { course, professor, rating, text };
      let reviews = JSON.parse(localStorage.getItem("reviews") || "[]");
      reviews.push(newReview);
      localStorage.setItem("reviews", JSON.stringify(reviews));

      alert("Review submitted!");
      form.reset();
      renderReviews();
  });
 renderReviews(); 
});



document.querySelector('.search-bar input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredReviews = reviews.filter(review => review.course.toLowerCase().includes(query)|| 
    review.professor.toLowerCase().includes(query));
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
        sortedReviews.sort((a, b) => a.course.localeCompare(b.title));
      } else  if (sortType === "asc") {
        sortedReviews.sort((a, b) => a.courseName.localeCompare(b.courseName));
      } else if (sortType === "desc") {
        sortedReviews.sort((a, b) => b.courseName.localeCompare(a.courseName));
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
  document.addEventListener('DOMContentLoaded', () => {
    fetchReviews();
});
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
      <button onclick="fetchData(https://680d3d23c47cb8074d8ffa84.mockapi.io/api/campuse-reviews/:endpoint).then(data => renderList(data))">Back</button>
    `;
}


