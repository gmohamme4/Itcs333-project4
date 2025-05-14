function myFunc() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.addEventListener('click', function (event) {
    const dropdown = document.getElementById("myDropdown");
    if (!event.target.closest('.dropbtn') && !event.target.closest('.dropdown-content')) {
        dropdown?.classList.remove('show');
    }
});
APIEVENT_URL = "https://681229293ac96f7119a7191d.mockapi.io/api/Event_Calendar/Events";
APIREGISTER_URL = "https://681229293ac96f7119a7191d.mockapi.io/api/Event_Calendar/registration";
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add');
    const searchInput = document.getElementById("main-search");
    const exactDateInput = document.getElementById("filter-date");
    const fromDateInput = document.getElementById("from-date");
    const toDateInput = document.getElementById("to-date");
    const applyFilterBtn = document.getElementById("apply-filter-btn");
    const clearFilterBtn = document.getElementById("clear-filter-btn");
    const quickButtons = document.querySelectorAll(".quick-btn");
    const upcomingGrid = document.getElementById('upcoming-events');
    const pastGrid = document.getElementById('past-events');
    const registerModal = document.getElementById("registerModal");
    const closeRegisterBtn = document.querySelector(".close-btn");
    const registerForm = document.getElementById("registerForm");
    const regEventTitle = document.getElementById("regEventTitle");
    const imageInput = document.getElementById('Event-image');
    const moreInfoModal = document.getElementById("moreInfoModal");
    const closeMoreBtn = document.querySelector(".close-more");
    let events = [];
    let imageBase64 = "";
    let currentPage = 1;
    const eventsPerPage = 8;
    let filteredEvents = [];

    function renderEvents(keyword = "", exactDate = "", fromDate = "", toDate = "") {
        if (!upcomingGrid || !pastGrid) return;
        upcomingGrid.innerHTML = "";
        pastGrid.innerHTML = "";
    
        const today = new Date().setHours(0, 0, 0, 0);
        
        filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date).setHours(0, 0, 0, 0);
            const title = event.title?.toString().toLowerCase() || "";
            const description = event.description?.toString().toLowerCase() || "";
            
            const matchesKeyword = keyword === "" || 
                                 title.includes(keyword) || 
                                 description.includes(keyword);
            
            const matchesExactDate = exactDate === "" || 
                                   event.date === exactDate;
            
            const matchesRange = (!fromDate || event.date >= fromDate) &&
                               (!toDate || event.date <= toDate);
            
            return matchesKeyword && matchesExactDate && matchesRange;
        });
    
        const startIndex = (currentPage - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
        paginatedEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const eventDateValue = eventDate.setHours(0, 0, 0, 0);
    
            const eventDiv = document.createElement("div");
            eventDiv.className = "events";
            eventDiv.innerHTML = `
                <div class="padding">
                    <h3>${event.title}</h3>
                    <p class="description">${event.description}</p>
                    <h4>${eventDate.toLocaleDateString('en-GB')}</h4>
                </div>
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                </div>
                ${event.moreinfo ? `<input type='hidden' value="${event.moreinfo}" />` : ""}
                <div class="footer">
                    ${eventDateValue >= today && event.registerable?.toString().trim().toLowerCase() === "yes"
                        ? `<a href="#Register" class="register-link">Register</a><span>|</span>`
                        : ""
                    }
                    <a href="#More" class="more-info-link">More info</a>
                </div>
            `;
    
            if (eventDateValue >= today) {
                upcomingGrid.appendChild(eventDiv);
            } else {
                pastGrid.appendChild(eventDiv);
            }
        });
    
        renderPaginationControls(filteredEvents.length);
    }
    
    async function loadEventsFromAPI() {
        try {
            const response = await fetch(APIEVENT_URL);
            if (!response.ok) throw new Error("Failed to fetch events");
            events = await response.json();
            filteredEvents = [...events]; 
            renderEvents();
        } catch (err) {
            console.error("Error loading events:", err);
        }
    }
    function renderPaginationControls(totalEvents) {
        const totalPages = Math.ceil(totalEvents / eventsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        
        if (!paginationContainer) return;
        
        paginationContainer.innerHTML = '';
        
        if (currentPage > 1) {
            const prevLink = document.createElement('a');
            prevLink.href = '#';
            prevLink.innerHTML = '&laquo;';
            prevLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage--;
                renderEvents();
            });
            paginationContainer.appendChild(prevLink);
        }
        
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            if (i === currentPage) {
                pageLink.className = 'active';
            }
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                renderEvents();
            });
            paginationContainer.appendChild(pageLink);
        }
        
        if (currentPage < totalPages) {
            const nextLink = document.createElement('a');
            nextLink.href = '#';
            nextLink.innerHTML = '&raquo;';
            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage++;
                renderEvents();
            });
            paginationContainer.appendChild(nextLink);
        }
    }

    async function loadEventsFromAPI() {
        try {
            const response = await fetch(APIEVENT_URL);
            if (!response.ok) throw new Error("Failed to fetch events");
            events = await response.json();
            renderEvents();
        } catch (err) {
            console.error("Error loading events:", err);
        }
    }

    loadEventsFromAPI();

    document.body.addEventListener("click", function (e) {
        if (e.target.matches("a.register-link")) {
            const eventTitle = e.target.closest(".events")?.querySelector("h3")?.innerText;
            if (regEventTitle && eventTitle) {
                regEventTitle.value = eventTitle;
                registerModal.style.display = "block";
            }
        }

        if (e.target.matches("a.more-info-link")) {
            const eventCard = e.target.closest(".events");
            const title = eventCard.querySelector("h3")?.innerText || "";
            const date = eventCard.querySelector("h4")?.innerText || "";
            const description = eventCard.querySelector(".description")?.innerText || "";
            const moreInfo = eventCard.querySelector("input[type='hidden']")?.value || "";
            const imageSrc = eventCard.querySelector("img")?.src || "";

            document.getElementById("moreTitle").innerText = title;
            document.getElementById("moreDate").innerText = date;
            document.getElementById("moreDescription").innerText = description;
            document.getElementById("moreInfoText").innerText = moreInfo;
            document.getElementById("moreImage").src = imageSrc;
            document.getElementById("moreImage").alt = title;

            moreInfoModal.style.display = "block";
        }
    });

    if (closeRegisterBtn) closeRegisterBtn.onclick = () => registerModal.style.display = "none";
    if (closeMoreBtn) closeMoreBtn.onclick = () => moreInfoModal.style.display = "none";

    window.onclick = function (e) {
        if (e.target === moreInfoModal) {
            moreInfoModal.style.display = "none";
        } else if (e.target === registerModal) {
            registerModal.style.display = "none";
        }
    };

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("regName").value.trim();
            const email = document.getElementById("regEmail").value.trim();
            const title = regEventTitle.value;

            if (!name || !email) return alert("Please fill out all fields.");

            const registration = { name, email, title };

            fetch(APIREGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registration),
            })
                .then(res => res.json())
                .then(() => {
                    alert(`You have registered for "${title}"!`);
                    registerModal.style.display = "none";
                    registerForm.reset();
                })
                .catch(err => {
                    console.error('Registration error:', err);
                    alert("Registration failed.");
                });
        });
    }

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener("click", () => {
            const keyword = searchInput.value.trim().toLowerCase();
            renderEvents(keyword, exactDateInput.value, fromDateInput.value, toDateInput.value);
            document.getElementById("myDropdown")?.classList.remove("show");
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener("click", () => {
            searchInput.value = "";
            exactDateInput.value = "";
            fromDateInput.value = "";
            toDateInput.value = "";
            renderEvents();
        });
    }

    quickButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const now = new Date();
            let from = "", to = "";
            const range = btn.dataset.range;

            if (range === "today") {
                from = to = now.toISOString().split("T")[0];
            } else if (range === "week") {
                const start = new Date(now.setDate(now.getDate() - now.getDay() + 1));
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                from = start.toISOString().split("T")[0];
                to = end.toISOString().split("T")[0];
            } else if (range === "month") {
                const first = new Date(now.getFullYear(), now.getMonth(), 1);
                const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                from = first.toISOString().split("T")[0];
                to = last.toISOString().split("T")[0];
            }

            searchInput.value = "";
            exactDateInput.value = "";
            fromDateInput.value = from;
            toDateInput.value = to;
            renderEvents("", "", from, to);
        });
    });

    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => imageBase64 = e.target.result;
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const keyword = searchInput.value.trim().toLowerCase();
            renderEvents(keyword, exactDateInput.value, fromDateInput.value, toDateInput.value);
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const title = document.getElementById('Event-title').value.trim();
            const date = document.getElementById('Event-date').value;
            const description = document.getElementById('Event-description').value.trim();
            const selectedRadio = document.querySelector('input[name="Register"]:checked');
            const registerable = selectedRadio?.value.toLowerCase() === "yes" ? "yes" : "no";
            const moreinfo = document.getElementById('More-info').value;

            if (!title || !date || !description || !registerable || moreinfo.trim() === "") {
                alert("Please fill in all fields.");
                return;
            }

            const newEvent = {
                title,
                date,
                description,
                image: imageBase64 || "../Event_Calendar/images/default.jpg",
                registerable,
                moreinfo
            };

            fetch(APIEVENT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            })
                .then(res => {
                    if (!res.ok) throw new Error(`Error: ${res.status}`);
                    return res.json();
                })
                .then(() => {
                    alert("Event submitted successfully!");
                    loadEventsFromAPI();
                })
                .catch(err => {
                    console.error('Event submission error:', err);
                    alert("There was an error submitting the event.");
                });
        });
    }


});
