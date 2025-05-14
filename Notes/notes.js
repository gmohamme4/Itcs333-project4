// Global variables
let notesData = [];
let filteredData = [];
let currentPage = 1;
const notesPerPage = 5;
const apiURL = "http://localhost:8080/notes/backend/api/notes.php";


// Elements
const notesList = document.getElementById('notesList');
const searchInput = document.querySelector('.search input');
const courseFilter = document.querySelectorAll('.filter-dropdown')[0];
const sortFilter = document.querySelectorAll('.filter-dropdown')[1];
const saveBtn = document.querySelector('.save-btn');

// Show loading
function showLoading() {
    notesList.innerHTML = `<div class="text-center my-5"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
}

// Fetch notes
async function fetchNotes() {
    showLoading();
    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        notesData = data.reverse(); // latest first
        filteredData = notesData;
        renderNotes();
    } catch (error) {
        notesList.innerHTML = `<p class="text-danger text-center my-5">Failed to load notes. Please try again later.</p>`;
        console.error(error);
    }
}

// Render notes
function renderNotes() {
    const start = (currentPage - 1) * notesPerPage;
    const end = start + notesPerPage;
    const paginatedNotes = filteredData.slice(start, end);

    if (paginatedNotes.length === 0) {
        notesList.innerHTML = `<p class="text-center my-5">No notes found.</p>`;
        return;
    }

    notesList.innerHTML = paginatedNotes.map(note => `
        <div class="card mb-3 note-card" data-id="${note.id}">
          <div class="card-body position-relative">
        <h5 class="card-title">${note.courseName} (${note.courseCode})</h5>
        <h6 class="card-subtitle mb-2 text-muted">${note.topic}</h6>
        <p class="card-text text-truncate" style="max-height: 4.5em; overflow: hidden;">${note.content}</p>
        ${note.attachments ? generateAttachmentLinks(note.attachments) : ''}
        <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 delete-btn" data-id="${note.id}">🗑</button>
          </div>
        </div>
    `).join('');

    renderPagination();

    // Add click event to each note
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', () => {
            const noteId = card.getAttribute('data-id');
            const note = notesData.find(n => n.id === noteId);
            showNoteDetails(note);
        });
    });

    // Add click event to each delete button
document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.stopPropagation(); // prevent opening the note modal
        const noteId = button.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this note?')) {
            await deleteNote(noteId);
        }
    });
});

}

async function deleteNote(noteId) {
    try {
        const response = await fetch(`${apiURL}/${noteId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete note.');
        }
        notesData = notesData.filter(note => note.id !== noteId);
        filteredData = notesData;
        renderNotes();
        alert('Note deleted successfully!');
    } catch (error) {
        console.error(error);
        alert('Failed to delete note. Please try again.');
    }
}


// Generate attachment links
function generateAttachmentLinks(attachments) {
    if (!attachments.length) return '';
    return `
      <div class="mt-2">
          <strong>Attachments:</strong><br>
          ${attachments.map(file => `<a href="${file.url}" download="${file.name}" target="_blank" class="d-block">${file.name}</a>`).join('')}
      </div>
    `;
}

// Show full note in modal
function showNoteDetails(note) {
    const modalTitle = document.getElementById('viewNoteModalLabel');
    const modalBody = document.getElementById('viewNoteModalBody');

    modalTitle.innerText = `${note.courseName} (${note.courseCode}) - ${note.topic}`;
    modalBody.innerHTML = `
      <p>${note.content}</p>
      ${note.attachments ? generateAttachmentLinks(note.attachments) : ''}
    `;

    const viewModal = new bootstrap.Modal(document.getElementById('viewNoteModal'));
    viewModal.show();
}

// Search notes
searchInput.addEventListener('input', () => {
    const searchValue = searchInput.value.toLowerCase();
    filteredData = notesData.filter(note => 
        note.courseName.toLowerCase().includes(searchValue) ||
        note.topic.toLowerCase().includes(searchValue)
    );
    currentPage = 1;
    renderNotes();
});

// Filter notes
courseFilter.addEventListener('change', () => {
    const selectedCourse = courseFilter.value;
    if (selectedCourse === "Filter by Course") {
        filteredData = notesData;
    } else {
        filteredData = notesData.filter(note => note.courseCode.startsWith(selectedCourse));
    }
    currentPage = 1;
    renderNotes();
});

// Sort notes
sortFilter.addEventListener('change', () => {
    const sortBy = sortFilter.value;
    if (sortBy === "newest") {
        filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
        filteredData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "az") {
        filteredData.sort((a, b) => a.courseName.localeCompare(b.courseName));
    } else if (sortBy === "za") {
        filteredData.sort((a, b) => b.courseName.localeCompare(a.courseName));
    }
    renderNotes();
});

// Render Pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / notesPerPage);
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = '';  // Clear previous pagination
    }

    let paginationHTML = `<nav><ul class="pagination justify-content-center">`;

    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button style="color:#967bb6; background-color: white; class="page-link" onclick="changePage(${currentPage - 1})">Previous</button>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <button style="color:#967bb6; background-color: white; class="page-link" onclick="changePage(${i})">${i}</button>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button style="color:#967bb6; background-color: white; class="page-link" onclick="changePage(${currentPage + 1})">Next</button>
        </li>
    `;

    paginationHTML += `</ul></nav>`;
    notesList.insertAdjacentHTML('beforeend', paginationHTML);
}
//border:solid 1px #967bb6
//style="color:#967bb6; background-color: white;

function changePage(pageNumber) {
    currentPage = pageNumber;
    renderNotes();
}

// Helper to convert file to base64 URL
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(file);
    });
}

// Save new note to API
saveBtn.addEventListener('click', async () => {
    const courseCode = document.getElementById('Course-Code');
    const courseName = document.getElementById('Course-Name');
    const topicInput = document.getElementById('topicInput');
    const noteContent = document.getElementById('noteContent');
    const fileInput = document.getElementById('fileAttachment');

    if (!courseCode.value.trim() || !courseName.value.trim() || !topicInput.value.trim() || !noteContent.value.trim()) {
        alert('Please fill in all required fields.');
        return;
    }

    // Handle attachments
    let attachments = [];
    if (fileInput.files.length > 0) {
        attachments = await Promise.all(Array.from(fileInput.files).map(async (file) => {
            const url = await fileToBase64(file);
            return {
                name: file.name,
                url: url
            };
        }));
    }

    const newNote = {
        courseCode: courseCode.value.trim(),
        courseName: courseName.value.trim(),
        topic: topicInput.value.trim(),
        content: noteContent.value.trim(),
        attachments: attachments,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newNote)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const savedNote = await response.json();
        notesData.unshift(savedNote);
        filteredData = notesData;
        currentPage = 1;
        renderNotes();

        // Clear the form
        courseCode.value = '';
        courseName.value = '';
        topicInput.value = '';
        noteContent.value = '';
        fileInput.value = '';

        const modal = bootstrap.Modal.getInstance(document.getElementById('addNoteModal'));
        if (modal) {
            modal.hide();
        }

        alert('Note saved successfully!');
    } catch (error) {
        console.error('Failed to save note:', error);
        alert('Failed to save note. Please try again.');
    }
});

// Start fetching when page loads
fetchNotes();
