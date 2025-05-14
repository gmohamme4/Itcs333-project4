APIEVENT_URL = "/api/events";
APIREGISTER_URL = "/api/registrations";

async function loadEventsFromAPI() {
    try {
        const response = await fetch(APIEVENT_URL);
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        events = data.data; 
        filteredEvents = [...events];
        renderEvents();
    } catch (err) {
        console.error("Error loading events:", err);
    }
}

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const title = regEventTitle.value;

        if (!name || !email) return alert("Please fill out all fields.");

        try {
            const eventsResponse = await fetch(`${APIEVENT_URL}?search=${encodeURIComponent(title)}`);
            if (!eventsResponse.ok) throw new Error("Failed to find event");
            const eventsData = await eventsResponse.json();
            
            if (eventsData.data.length === 0) {
                throw new Error("Event not found");
            }
            
            const eventId = eventsData.data[0].id;
            
            const registration = { 
                event_id: eventId, 
                name, 
                email 
            };

            const response = await fetch(APIREGISTER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registration),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Registration failed");
            }
            
            alert(`You have registered for "${title}"!`);
            registerModal.style.display = "none";
            registerForm.reset();
        } catch (err) {
            console.error('Registration error:', err);
            alert(err.message || "Registration failed");
        }
    });
}

if (form) {
    form.addEventListener('submit', async function (e) {
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
            image: imageBase64 || "",
            registerable,
            moreinfo
        };

        try {
            const response = await fetch(APIEVENT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error: ${response.status}`);
            }
            
            alert("Event submitted successfully!");
            loadEventsFromAPI();
        } catch (err) {
            console.error('Event submission error:', err);
            alert(err.message || "There was an error submitting the event.");
        }
    });
}