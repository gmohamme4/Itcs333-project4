  document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://c605d8fb-2d04-4224-9675-8d3eea663be3-00-38mfyhzkuk867.pike.replit.dev/api.php";
  const groupList = document.getElementById("group-list");
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const searchBar = document.getElementById("search-bar");
  const subjectFilter = document.getElementById("subject-filter");
  const otherSubjectInput = document.getElementById("other-subject");
  const timeFilter = document.getElementById("time-filter");
  const sortBy = document.getElementById("sort-by");
  const sortIcon = document.getElementById("sort-icon");
  const filterIcon = document.getElementById("filter-icon");
  const sortContainer = document.getElementById("sort-options");
  const filterContainer = document.getElementById("filter-options");
  const createGroupFormDiv = document.getElementById("create-group-form");
  const createGroupForm = document.getElementById("group-form");
  const cancelBtn = document.getElementById("cancel-btn");
  const addGroupBtn = document.getElementById("add-group-btn");
  const imageUrlInput = document.getElementById("image-url");
  const imageFileInput = document.getElementById("image-file");
  const imagePreview = document.getElementById("image-preview");
  const pagination = document.getElementById("pagination");
  const moreInfo = document.getElementById("moreInfo");
  const groupsPerPage = 10;
  let currentPage = 1;
  let groupsData = [];
  let filteredGroups = [];
  let selectedImageData = "";

  loading.style.display = "block";
  sortContainer.style.display = "none";
  filterContainer.style.display = "none";
  createGroupFormDiv.style.display = "none";
  otherSubjectInput.style.display = "none";
  imagePreview.style.display = "none";
  loading.style.display = "block";
  error.style.display = "none";

  // Fetch groups from API
  async function fetchGroups() {
    loading.style.display = "block";
    error.style.display = "none";
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      groupsData = Array.isArray(data) ? data : [];
      filteredGroups = [...groupsData];
      loading.style.display = "none";
      displayGroupsPage(1);
    } catch (err) {
      console.error("Error fetching groups:", err);
      loading.style.display = "none";
      error.style.display = "block";
      error.textContent = "Failed to load groups: " + err.message;
    }
  }

  fetchGroups();

  // Show/hide filter and sort options
  filterIcon.addEventListener("click", () => {
    filterContainer.style.display = filterContainer.style.display === "none" ? "block" : "none";
  });

  sortIcon.addEventListener("click", () => {
    sortContainer.style.display = sortContainer.style.display === "none" ? "block" : "none";
  });

  // Handling uploading an image from the device and converting it to base64
  imageFileInput.addEventListener("change", () => {
    const file = imageFileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedImageData = e.target.result;
        imagePreview.src = selectedImageData;
        imagePreview.style.display = "block";
        // Clear image link to avoid conflicts
        imageUrlInput.value = "";
      };
      reader.readAsDataURL(file);
    }
  });

  // If the user enters an image link, we use it and disable file uploading
  imageUrlInput.addEventListener("input", () => {
    selectedImageData = "";
    imagePreview.src = imageUrlInput.value;
    imagePreview.style.display = imageUrlInput.value ? "block" : "none";
    // Delete the image file if it is specified
    imageFileInput.value = "";
  });

  function displayGroupsPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * groupsPerPage;
    const endIndex = startIndex + groupsPerPage;
    const groupsToDisplay = filteredGroups.slice(startIndex, endIndex);
    renderGroups(groupsToDisplay);
    renderPagination();
  }

  function renderGroups(groups) {
    groupList.innerHTML = "";
    if (groups.length === 0) {
      groupList.innerHTML = '<div class="text-center p-4">No study groups found.</div>';
      return;
    }

    groups.forEach((group) => {
      const card = document.createElement("div");
      card.className = "group-card";
      const groupImage = group.image || 'https://via.placeholder.com/150';
      card.innerHTML = `
        <img src="${groupImage}" alt="${group.subject} Image" class="group-image">
        <div class="group-details">
          <h3>${group.title}</h3>
          <span class="group-time">Time: ${group.time}</span>
          <p class="group-subject">Subject: ${group.subject}</p>
        </div>
        <div class="group-actions" style="position: absolute; top: 8px; right: 8px; z-index: 10;">
          <button class="btn btn-sm btn-outline-secondary more-btn" data-id="${group.id}">⋮</button>
          <div class="more-menu" style="display:none; position: absolute; top: 25px; right: 0; background: white; border: 1px solid #ccc; border-radius: 4px; z-index: 20;">
            <button class="btn btn-sm btn-link view-btn" data-id="${group.id}" style="display:block; width: 100%; text-align: left;">view</button>
            <button class="btn btn-sm btn-link edit-btn" data-id="${group.id}" style="display:block; width: 100%; text-align: left;">edit</button>
            <button class="btn btn-sm btn-link delete-btn" data-id="${group.id}" style="display:block; width: 100%; text-align: left; color: red;">delete</button>
          </div>
        </div>
      `;
      groupList.appendChild(card);
    });
    attachCardEventListeners();
  }

  function renderPagination() {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);

    if (totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "←";
    prevBtn.classList.add("page-btn");
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) displayGroupsPage(currentPage - 1);
    });
    pagination.appendChild(prevBtn);

    // Number buttons
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.classList.add("page-btn");
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => displayGroupsPage(i));
      pagination.appendChild(btn);
    }

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "→";
    nextBtn.classList.add("page-btn");
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) displayGroupsPage(currentPage + 1);
    });
    pagination.appendChild(nextBtn);
  }

  function attachCardEventListeners() {
    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('more-btn')) {
        document.querySelectorAll('.more-menu').forEach(menu => {
          menu.style.display = 'none';
        });
      }
    });

    // Open/close the three dots menu when pressing the ⋮ button
    document.querySelectorAll('.more-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = e.target.nextElementSibling;
        const isVisible = menu.style.display === 'block';
        document.querySelectorAll('.more-menu').forEach(m => m.style.display = 'none');
        menu.style.display = isVisible ? 'none' : 'block';
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => openEditForm(e.target.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', e => deleteGroup(e.target.dataset.id));
    });

    document.querySelectorAll('.view-btn').forEach(button => {
      button.addEventListener('click', async e => {
        const id = e.target.dataset.id;
        const group = groupsData.find(g => g.id == id);
        if (!group) return;
        const modal = document.getElementById('moreInfoModal');
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
          <h3>${group.title}</h3>
          <p><strong>Subject:</strong> ${group.subject}</p>
          <p><strong>Time:</strong> ${group.time}</p>
          <p><strong>More Info:</strong> ${group.moreInfo || "No additional info"}</p>
        `;
        modal.style.display = 'flex';
      });
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      document.getElementById('moreInfoModal').style.display = 'none';
    });
  }

  // Function to convert time from 24 hours to 12 hours
  function convertTo12Hour(timeStr) {
    if (!timeStr) return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr);
    const minute = minuteStr;
    let period = "AM";
    if (hour === 0) hour = 12;
    else if (hour === 12) period = "PM";
    else if (hour > 12) {
      hour -= 12;
      period = "PM";
    }
    return `${hour}:${minute} ${period}`;
  }

  function convertTo24Hour(timeStr) {
    if (!timeStr) return "";
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifier.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    else if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  function filterGroups() {
    let filtered = [...groupsData];
    const searchQuery = searchBar.value.toLowerCase();
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.title.toLowerCase().includes(searchQuery)
      );
    }
    const subject = subjectFilter.value;
    if (subject && subject !== "all") {
      if (subject === "other" && otherSubjectInput.value.trim() !== "") {
        filtered = filtered.filter(group =>
          group.subject.toLowerCase() === otherSubjectInput.value.trim().toLowerCase()
        );
      } else if (subject !== "other") {
        filtered = filtered.filter(group => group.subject === subject);
      }
    }
    const timeQuery = timeFilter?.value.trim() || "";
    if (timeQuery) {
      const convertedTime = convertTo12Hour(timeQuery).toLowerCase();
      filtered = filtered.filter(g => (g.time?.trim().toLowerCase() || '') === convertedTime);
    }
    filteredGroups = filtered;
    sortGroups();
  }

  function sortGroups() {
    const sortOption = sortBy?.value || "";
    filteredGroups.sort((a, b) => {
      const nameA = a.title.toLowerCase();
      const nameB = b.title.toLowerCase();
      const subjectA = a.subject.toLowerCase();
      const subjectB = b.subject.toLowerCase();
      switch (sortOption) {
        case "name-asc": return nameA.localeCompare(nameB);
        case "name-desc": return nameB.localeCompare(nameA);
        case "subject-asc": return subjectA.localeCompare(subjectB);
        case "subject-desc": return subjectB.localeCompare(subjectA);
        case "schedule-asc": 
          try {
            return new Date("1970/01/01 " + a.time) - new Date("1970/01/01 " + b.time);
          } catch (e) {
            return 0;
          }
        case "schedule-desc": 
          try {
            return new Date("1970/01/01 " + b.time) - new Date("1970/01/01 " + a.time);
          } catch (e) {
            return 0;
          }
        default: return 0;
      }
    });
    displayGroupsPage(1);
  }

  subjectFilter.addEventListener("change", () => {
    otherSubjectInput.style.display = subjectFilter.value === "other" ? "block" : "none";
    filterGroups();
  });

  otherSubjectInput.addEventListener("input", filterGroups);

  async function openEditForm(id) {
    const group = groupsData.find(g => g.id == id);
    if (!group) return;
    createGroupFormDiv.style.display = "block";
    document.getElementById("groupName").value = group.title;
    document.getElementById("subject").value = group.subject;
    document.getElementById("time").value = convertTo24Hour(group.time);
    imagePreview.src = group.image || 'https://via.placeholder.com/150';
    imagePreview.style.display = "block";
    selectedImageData = group.image || '';
    document.getElementById("moreInfo").value = group.moreInfo || '';
    createGroupForm.dataset.editId = id;
    createGroupFormDiv.scrollIntoView({ behavior: "smooth" });
  }

  // Delete group with confirmation
  async function deleteGroup(id) {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      loading.style.display = "block";
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });

      const result = await response.json();

      if (result.error) {
        alert("Error: " + result.error);
      } else {
        fetchGroups();
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete the group. Please try again.");
    } finally {
            loading.style.display = "none";
          }
        }

        // Handling form saving (add or modify)
        createGroupForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const title = document.getElementById("groupName").value.trim();
          const subject = document.getElementById("subject").value.trim();
          const timeRaw = document.getElementById("time").value.trim();
          const moreInfo = document.getElementById("moreInfo").value.trim();

          if (!title || !subject || !timeRaw) {
            alert("Please fill in all required fields.");
            return;
          }

          const group = {
            title,
            subject,
            time: convertTo12Hour(timeRaw),
            image: selectedImageData || imageUrlInput.value.trim() || 'https://via.placeholder.com/150',
            moreInfo
          };

          loading.style.display = "block";

          try {
            let response;
            if (createGroupForm.dataset.editId) {
              response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  action: 'update', 
                  id: createGroupForm.dataset.editId, 
                  ...group 
                })
              });
            } else {
              response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  action: 'create', 
                  ...group 
                })
              });
            }

            const result = await response.json();

            if (result.error) {
              alert("Error: " + result.error);
            } else {
              createGroupFormDiv.style.display = 'none';
              createGroupForm.reset();
              selectedImageData = "";
              imagePreview.style.display = "none";
              delete createGroupForm.dataset.editId;
              fetchGroups();
            }
          } catch (error) {
            console.error("Error saving group:", error);
            alert("Failed to save the group. Please try again.");
          } finally {
            loading.style.display = "none";
          }
        });

        cancelBtn.addEventListener("click", () => {
          createGroupFormDiv.style.display = "none";
          createGroupForm.reset();
          selectedImageData = "";
          imagePreview.style.display = "none";
          imagePreview.src = "";
          imageUrlInput.value = "";
          imageFileInput.value = "";
          otherSubjectInput.style.display = "none";
          delete createGroupForm.dataset.editId;
        });

        // Add new group button
        addGroupBtn.addEventListener("click", () => {
          createGroupFormDiv.style.display = "block";
          createGroupForm.reset();
          selectedImageData = "";
          imagePreview.style.display = "none";
          imagePreview.src = "";
          imageUrlInput.value = "";
          imageFileInput.value = "";
          otherSubjectInput.style.display = "none";
          delete createGroupForm.dataset.editId;
          createGroupFormDiv.scrollIntoView({ behavior: "smooth" });
        });

        // Subject filter change
        document.getElementById("subject").addEventListener("change", e => {
          otherSubjectInput.style.display = e.target.value === "other" ? "block" : "none";
        });

        // Search, filter, and sort event listeners
        if (searchBar) searchBar.addEventListener("input", filterGroups);
        if (subjectFilter) subjectFilter.addEventListener("change", filterGroups);
        if (timeFilter) timeFilter.addEventListener("input", filterGroups);
        if (sortBy) sortBy.addEventListener("change", sortGroups);

        // Modal event listeners
        const moreInfoModal = document.getElementById('moreInfoModal');
        const closeModalBtn = document.getElementById('closeModalBtn');

        if (closeModalBtn) {
          closeModalBtn.addEventListener('click', () => {
            if (moreInfoModal) moreInfoModal.style.display = 'none';
          });
        }

        if (moreInfoModal) {
          moreInfoModal.addEventListener('click', (e) => {
            if (e.target === moreInfoModal) {
              moreInfoModal.style.display = 'none';
            }
          });
        }
      });