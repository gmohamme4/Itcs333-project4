function myFunc() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function (event) {
    const dropdown = document.getElementById("myDropdown");

    if (!event.target.closest('.dropbtn') && !event.target.closest('.dropdown-content')) {
        dropdown.classList.remove('show');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add');
    let imageBase64 = "";
    const searchInput = document.getElementById("main-search");
const exactDateInput = document.getElementById("filter-date");
const fromDateInput = document.getElementById("from-date");
const toDateInput = document.getElementById("to-date");
const applyFilterBtn = document.getElementById("apply-filter-btn");
const clearFilterBtn = document.getElementById("clear-filter-btn");
const quickButtons = document.querySelectorAll(".quick-btn");

if (applyFilterBtn) {
    applyFilterBtn.addEventListener("click", () => {
        const keyword = searchInput.value.trim().toLowerCase();
        const exactDate = exactDateInput.value;
        const from = fromDateInput.value;
        const to = toDateInput.value;
    
        renderEvents(keyword, exactDate, from, to);
    
        document.getElementById("myDropdown").classList.remove("show");
    });
}

if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (exactDateInput) exactDateInput.value = "";
        if (fromDateInput) fromDateInput.value = "";
        if (toDateInput) toDateInput.value = "";
        renderEvents();
    });
}



quickButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const range = btn.dataset.range;
        const now = new Date();
        let from = "", to = "";

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

        if (searchInput) searchInput.value = "";
        exactDateInput.value = "";
        fromDateInput.value = from;
        toDateInput.value = to;
        renderEvents("", "", from, to);
    });
});


    const imageInput = document.getElementById('Event-image');
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imageBase64 = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const title = document.getElementById('Event-title').value.trim();
            const date = document.getElementById('Event-date').value;
            const description = document.getElementById('Event-description').value.trim();
            const registerable=document.querySelector('input[name="Register"]:checked').value;  
            const moreinfo = document.getElementById('More-info').value;   
            if (!title || !date || !description || !registerable||!moreinfo) {
                alert("Please fill in all fields.");
                return;
            }

            const newEvent = {
                title,
                date,
                description,
                image: imageBase64 || "../Event_Calendar/lmages/default.jpg",
                registerable,
                moreinfo
                
            };
console.log(registerable);

            let events = JSON.parse(localStorage.getItem("events") || "[]");
            events.push(newEvent);
            localStorage.setItem("events", JSON.stringify(events));

            alert("Event submitted successfully!");
            form.reset();
        });
    }

    const upcomingGrid = document.getElementById('upcoming-events');
    const pastGrid = document.getElementById('past-events');

    if (upcomingGrid && pastGrid && !form) {
        const events = JSON.parse(localStorage.getItem("events") || "[]");
        const today = new Date();

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const eventDiv = document.createElement('div');
            eventDiv.className = 'events';
            eventDiv.innerHTML = `
            <div class="padding">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <h4>${eventDate.toLocaleDateString()}</h4>
            </div>
            <div class="event-image">
                <img src="${event.image}" alt="${event.title}">
            </div>
            ${event.moreinfo ? `
             <input type='hidden' value="${event.moreinfo}" /> ` : ""}
            <div class="footer">
                ${event.registerable ? `<a href="#Register">Register</a><span>|</span>` : ""}
                <a href="#More">More info</a>
            </div>
        `;
        

            if (eventDate >= today.setHours(0, 0, 0, 0)) {
                upcomingGrid.appendChild(eventDiv);
            } else {
                pastGrid.appendChild(eventDiv);
            }
        });
    }
function renderEvents(keyword = "", exactDate = "", fromDate = "", toDate = "") {
    if (!upcomingGrid || !pastGrid) return;

    upcomingGrid.innerHTML = "";
    pastGrid.innerHTML = "";

    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const today = new Date().setHours(0, 0, 0, 0);

    events.forEach(event => {
        const eventDate = new Date(event.date);
        const eventDateStr = eventDate.toISOString().split("T")[0];
        const eventDateValue = eventDate.setHours(0, 0, 0, 0);

        const matchesKeyword = keyword === "" ||
            event.title.toLowerCase().includes(keyword) ||
            event.description.toLowerCase().includes(keyword);

        const matchesExactDate = exactDate === "" || eventDateStr === exactDate;

        const matchesRange = (!fromDate || eventDateStr >= fromDate) &&
                             (!toDate || eventDateStr <= toDate);
        if (matchesKeyword && matchesExactDate && matchesRange) {
            const eventDiv = document.createElement("div");
            eventDiv.className = "events";
            eventDiv.innerHTML = `
                <div class="padding">
                    <h3>${event.title}</h3>
                    <p class="description">${event.description}</p>
                    <h4>${eventDate.toLocaleDateString()}</h4>
                </div>
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}">
                </div>
               ${event.moreinfo ? `
             <input type='hidden' value="${event.moreinfo}" /> ` : ""}
                <div class="footer">
                    <a href="#Register">Register</a>
                    <span>|</span>
                    <a href="#More">More info</a>
                </div>
            `;

            if (eventDateValue >= today) {
                upcomingGrid.appendChild(eventDiv);
            } else {
                pastGrid.appendChild(eventDiv);
            }
        }
    }); 
}
    document.body.addEventListener("click", function (e) {
        if (e.target.matches("a[href='#More']")) {
            const eventCard = e.target.closest(".events");
            if (!eventCard) return;
    
            const title = eventCard.querySelector("h3")?.innerText || "";
            const desc = eventCard.querySelector("p")?.innerText || "";
            const date = eventCard.querySelector("h4")?.innerText || "";
            const image = eventCard.querySelector("img")?.src || "";
            const moreinfo = eventCard.querySelector("input")?.value || "";

            infoTitle.textContent = title;
            infoDesc.textContent = desc;
            infoDate.textContent = `${date}`;
            infoImage.src = image;
            infoModal.style.display = "block";
            infotextmore.textContent = moreinfo;
        }
    });
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const keyword = searchInput.value.trim().toLowerCase();
            const exactDate = exactDateInput.value;
            const from = fromDateInput.value;
            const to = toDateInput.value;
    
            renderEvents(keyword, exactDate, from, to);
        });
    }
    const registerModal = document.getElementById("registerModal");
const closeBtn = document.querySelector(".close-btn");
const registerForm = document.getElementById("registerForm");
const regEventTitle = document.getElementById("regEventTitle");

document.body.addEventListener("click", function (e) {
    if (e.target.matches("a[href='#Register']")) {
        const eventTitle = e.target.closest(".events").querySelector("h3").innerText;
        regEventTitle.value = eventTitle;
        registerModal.style.display = "block";
    }
});

closeBtn.onclick = () => registerModal.style.display = "none";
window.onclick = (e) => {
    if (e.target == registerModal) registerModal.style.display = "none";
};

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const title = regEventTitle.value;

    if (!name || !email) return alert("Please fill out all fields.");

    let registrations = JSON.parse(localStorage.getItem("registrations") || "[]");
    registrations.push({ name, email, title });
    localStorage.setItem("registrations", JSON.stringify(registrations));

    alert(`You have registered for "${title}"!`);
    registerModal.style.display = "none";
    registerForm.reset();
});
const infoCloseBtn = document.querySelector(".info-close-btn"); 

if (infoCloseBtn) {
    infoCloseBtn.onclick = () => {
        infoModal.style.display = "none";
    };
}

window.addEventListener("click", (e) => {
    if (e.target === infoModal) {
        infoModal.style.display = "none";
    }
});
    
});
