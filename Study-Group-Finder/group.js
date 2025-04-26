document.addEventListener("DOMContentLoaded", () => {

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
    const createGroupForm = createGroupFormDiv.querySelector("form");
    const cancelBtn = document.getElementById("cancel-btn");
    const addGroupBtn = document.getElementById("add-group-btn");
    const imageUrlInput = document.getElementById("image-url");
    const imageFileInput = document.getElementById("image-file");
    const imagePreview = document.getElementById("image-preview");
    const pagination = document.getElementById("pagination");
    const moreInfo= document.getElementById("moreInfo");


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
  
  // Load data from localStorage or an external JSON file
    const savedGroups = localStorage.getItem("studyGroups");
    if (savedGroups) {
      groupsData = JSON.parse(savedGroups);
      filteredGroups = [...groupsData];
      loading.style.display = "none";
      displayGroupsPage(1);
    } else {
      fetch('./group.json')
        .then(response => {
          if (!response.ok) throw new Error("Failed to load data");
          return response.json();
        })
        .then(data => {
          loading.style.display = "none";
          groupsData = data;
          filteredGroups = [...groupsData];
          localStorage.setItem("studyGroups", JSON.stringify(groupsData));
          displayGroupsPage(1);
        })
        .catch(err => {
          loading.style.display = "none";
          error.style.display = "block";
          console.error("Error loading groups:", err);
        });
    }
  
  
  
    // Show/hide filter and sort options
    filterIcon.addEventListener("click", () => {
      filterContainer.style.display = filterContainer.style.display === "none" ? "block" : "none";
    });
  
    sortIcon.addEventListener("click", () => {
      sortContainer.style.display = sortContainer.style.display === "none" ? "block" : "none";
    });
  
  // Handling uploading an image from the device and converting it to base64 to display the preview
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
  
  // If the user enters an image link, we use it and disable file uploading.
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
  
      groups.forEach((group, index) => {
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
            <button class="btn btn-sm btn-outline-secondary more-btn" data-index="${index}">⋮</button>
            <div class="more-menu" style="display:none; position: absolute; top: 25px; right: 0; background: white; border: 1px solid #ccc; border-radius: 4px; z-index: 20;">
              <button class="btn btn-sm btn-link view-btn" data-index="${index}" style="display:block; width: 100%; text-align: left;">view</button>
              <button class="btn btn-sm btn-link edit-btn" data-index="${index}" style="display:block; width: 100%; text-align: left;">edit</button>
              <button class="btn btn-sm btn-link delete-btn" data-index="${index}" style="display:block; width: 100%; text-align: left; color: red;">delete</button>
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
    
      // Previous button
      const prevBtn = document.createElement("button");
      prevBtn.textContent = "←";
      prevBtn.classList.add("page-btn");
      prevBtn.disabled = currentPage === 1;
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) displayGroupsPage(currentPage - 1);
      });
      pagination.appendChild(prevBtn);
    
      //Number buttons
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
    
      document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', e => {
          openEditForm(e.target.dataset.index);
          e.target.parentElement.style.display = 'none';
        });
      });
    
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', e => {
          deleteGroup(e.target.dataset.index);
          e.target.parentElement.style.display = 'none';
        });
      });

      document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', e => {
          e.stopPropagation();
          const index = e.target.dataset.index;
          const group = filteredGroups[index];
      
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
      } else {
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
          case "schedule-asc": return new Date("1970/01/01 " + a.time) - new Date("1970/01/01 " + b.time);
          case "schedule-desc": return new Date("1970/01/01 " + b.time) - new Date("1970/01/01 " + a.time);
          default: return 0;
        }
      });
  
      displayGroupsPage(currentPage);
    }
  
    subjectFilter.addEventListener("change", () => {
      otherSubjectInput.style.display = subjectFilter.value === "other" ? "block" : "none";
      filterGroups();
    });
  
    
    otherSubjectInput.addEventListener("input", filterGroups);
    addGroupBtn.addEventListener("click", () => createGroupForm.style.display = "block");
    cancelBtn.addEventListener("click", () => createGroupForm.style.display = "none");
  
  
    function openEditForm(index) {
      const group = filteredGroups[index];
      if (!group) return;
  
      createGroupFormDiv.style.display = "block";
  
      document.getElementById("groupName").value = group.title;
      document.getElementById("subject").value = group.subject;
      document.getElementById("time").value = convertTo24Hour(group.time);
      imagePreview.src = group.image || 'https://via.placeholder.com/150';
      imagePreview.style.display = "block";
      selectedImageData = group.image || '';
  
      document.getElementById("moreInfo").value = group.moreInfo;

      if (group.subject.toLowerCase() === "other") {
        otherSubjectInput.style.display = "block";
        otherSubjectInput.value = group.subject;
      } else {
        otherSubjectInput.style.display = "none";
        otherSubjectInput.value = "";
      }
  
      createGroupForm.dataset.editIndex = index;
      createGroupFormDiv.scrollIntoView({ behavior: "smooth" });
  
    }
  
    // Delete group with confirmation
    function deleteGroup(index) {
      if (confirm("Are you sure you want to delete this group?")) {
        const groupToDelete = filteredGroups[index];
        groupsData = groupsData.filter(g => g !== groupToDelete);
        localStorage.setItem("studyGroups", JSON.stringify(groupsData));
        filterGroups();
      }
    }
  
    //Handling form saving (add or modify)
    createGroupForm.addEventListener("submit", e => {
      e.preventDefault();
  
      const titleInput = document.getElementById("groupName");
      const subjectInput = document.getElementById("subject");
      const timeInput = document.getElementById("time");
      const moreInfoInput = document.getElementById("moreInfo"); 



      let title = titleInput.value.trim();
      let subject = subjectInput.value.trim();
      const timeRaw = timeInput.value.trim();
      const moreInfo = moreInfoInput.value.trim(); 

  
      if (subject.toLowerCase() === "other" && otherSubjectInput.value.trim() !== "") {
        subject = otherSubjectInput.value.trim();
      }
  
      if (!title || !subject || !timeRaw) {
        alert("Please fill in the basic fields: Name, Subject, and Time");
        return;
      }
  
      const newGroup = {
        title,
        subject,
        time: convertTo12Hour(timeRaw),
        image: selectedImageData || imageUrlInput.value.trim() || 'https://via.placeholder.com/150',
        moreInfo,
      };
  
      if (createGroupForm.dataset.editIndex !== undefined) {
        
        const idx = parseInt(createGroupForm.dataset.editIndex);
        const originalGroupIndex = groupsData.indexOf(filteredGroups[idx]);
        if (originalGroupIndex !== -1) {
          groupsData[originalGroupIndex] = newGroup;
        }
        delete createGroupForm.dataset.editIndex;
      } else {
        groupsData.push(newGroup);
      }
  
      localStorage.setItem("studyGroups", JSON.stringify(groupsData));
      createGroupFormDiv.style.display = "none";
      createGroupForm.reset();
  
      selectedImageData = "";
      imagePreview.style.display = "none";
      imagePreview.src = "";
      imageUrlInput.value = "";
      imageFileInput.value = "";
      otherSubjectInput.style.display = "none";
  
      filterGroups();
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
      delete createGroupForm.dataset.editIndex;
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
      delete createGroupForm.dataset.editIndex;
  
      createGroupFormDiv.scrollIntoView({ behavior: "smooth" });
  
    });
  
    
    subjectFilter.addEventListener('change', () => {
      if(subjectFilter.value === 'other') {
        otherSubjectInput.style.display = 'block';  
        otherSubjectInput.focus();
      } else {
        otherSubjectInput.style.display = 'none';   
        otherSubjectInput.value = '';                
      }
    });
  
    createGroupForm.subject?.addEventListener("change", e => {
      otherSubjectInput.style.display = e.target.value === "other" ? "block" : "none";
    });
  
    searchBar?.addEventListener("input", filterGroups);
    subjectFilter?.addEventListener("change", filterGroups);
    timeFilter?.addEventListener("input", filterGroups);
    sortBy?.addEventListener("change", sortGroups);
  
    filterGroups();



    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('view-btn')) {
        const moreInfoTextarea = document.getElementById('moreInfo');
        
        let info = 'No info available';
        if (moreInfoTextarea) {
          const title = document.getElementById('title')?.value || '';
          const subject = document.getElementById('subject')?.value || '';
          const time = document.getElementById('time')?.value || '';
          const moreInfo = moreInfoTextarea.value || '';
          
          info = `Title: ${title}\nSubject: ${subject}\nTime: ${time}\n\nMore Info:\n${moreInfo}`;
        }
    
        document.getElementById('modalContent').textContent = info;
        document.getElementById('moreInfoModal').style.display = 'flex';
      }
    
      if (e.target.id === 'closeModalBtn' || e.target.id === 'moreInfoModal') {
        document.getElementById('moreInfoModal').style.display = 'none';
      }
    });
    
  



  document.getElementById('studyGroupForm').addEventListener('submit', function(e) {
      e.preventDefault();
    
     
    
      const newGroup = {
        title: title.value,
        subject: subject.value,
        time: time.value,
        moreInfo: moreInfo.value
      };
    
      filteredGroups.push(newGroup);
      renderGroups(); 
    
      this.reset(); 
    });
    
});

  
  