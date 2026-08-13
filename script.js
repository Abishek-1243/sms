const KEY = "students";
const getStudents = () => JSON.parse(localStorage.getItem(KEY)) || [];
const saveStudents = (list) => localStorage.setItem(KEY, JSON.stringify(list));
const semName = (s) => ({1:"First",2:"Second",3:"Third",4:"Fourth",5:"Fifth",6:"Sixth"}[s] || s) + " Semester";

/* ---------- DASHBOARD ---------- */
function initDashboard(){
  const total = document.getElementById("totalStudents");
  if(!total) return;
  const students = getStudents();
  total.textContent = students.length;
  document.getElementById("computerStudents").textContent =
    students.filter(s=>["BSc CSIT","BIT","B.TECH"].includes(s.faculty)).length;
  document.getElementById("managementStudents").textContent =
    students.filter(s=>["BBA","BBS"].includes(s.faculty)).length;
  document.getElementById("artsStudents").textContent =
    students.filter(s=>["BA","BFA"].includes(s.faculty)).length;

  const recent = document.getElementById("recentStudents");
  if(students.length===0){
    recent.innerHTML = `<p style="color:var(--muted)">No students yet. <a href="add.html" style="color:var(--accent)">+ Add one</a></p>`;
    return;
  }
  recent.innerHTML = [...students].reverse().slice(0,5).map(s=>`
    <div class="recent-student">
      <div class="student-info">
        <div class="student-avatar">${s.name.charAt(0).toUpperCase()}</div>
        <div><h3>${s.name}</h3><p>${s.email}</p></div>
      </div>
      <div class="student-faculty">${s.faculty}</div>
    </div>`).join("");
}

/* ---------- MANAGE (list) ---------- */
function renderList(students){
  const grid = document.getElementById("studentGrid");
  if(!grid) return;
  document.getElementById("manageStudentCount").textContent = students.length;

  if(students.length===0){
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🎓</div><h3>No students found</h3><p>Try changing your search or filters.</p></div>`;
    return;
  }
  grid.innerHTML = students.map(s=>`
    <div class="student-card">
      <h3>${s.name}</h3>
      <p>${s.email}</p>
      <p>${s.contact} · ${s.address}</p>
      <p>${semName(s.semester)}</p>
      <span class="faculty-badge">${s.faculty}</span>
      <div class="action-buttons">
        <button class="view-btn" onclick="viewStudent(${s.id})">View</button>
        <button class="edit-btn" onclick="editStudent(${s.id})">Edit</button>
        <button class="delete-btn" onclick="deleteStudent(${s.id})">Delete</button>
      </div>
    </div>`).join("");
}

function applyFilters(){
  const search = (document.getElementById("searchStudent")?.value || "").toLowerCase();
  const faculty = document.getElementById("facultyFilter")?.value || "";
  const semester = document.getElementById("semesterFilter")?.value || "";
  const filtered = getStudents().filter(s=>
    (s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search) || s.contact.includes(search)) &&
    (faculty === "" || s.faculty === faculty) &&
    (semester === "" || s.semester === semester)
  );
  renderList(filtered);
}

function initManage(){
  if(!document.getElementById("studentGrid")) return;
  renderList(getStudents());
  ["searchStudent","facultyFilter","semesterFilter"].forEach(id=>{
    document.getElementById(id).addEventListener("input", applyFilters);
  });
  document.getElementById("clearFilters").addEventListener("click", ()=>{
    document.getElementById("searchStudent").value = "";
    document.getElementById("facultyFilter").value = "";
    document.getElementById("semesterFilter").value = "";
    renderList(getStudents());
  });
}

function viewStudent(id){
  const s = getStudents().find(x=>x.id===id);
  if(!s) return;
  localStorage.setItem("selectedStudent", JSON.stringify(s));
  location.href = "details.html";
}
function editStudent(id){
  const s = getStudents().find(x=>x.id===id);
  if(!s) return;
  localStorage.setItem("editingStudent", JSON.stringify(s));
  location.href = "add.html";
}
function deleteStudent(id){
  const s = getStudents().find(x=>x.id===id);
  if(!s || !confirm(`Delete ${s.name}?`)) return;
  saveStudents(getStudents().filter(x=>x.id!==id));
  applyFilters();
}

/* ---------- ADD / EDIT FORM ---------- */
function initForm(){
  const form = document.getElementById("studentForm");
  if(!form) return;
  const editing = JSON.parse(localStorage.getItem("editingStudent"));
  if(editing){
    document.getElementById("formTitle").textContent = "Edit Student";
    document.getElementById("submitBtn").textContent = "Update Student";
    ["name","email","contact","address","faculty","semester"].forEach(f=>{
      document.getElementById(f).value = editing[f];
    });
  }
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const data = {};
    ["name","email","contact","address","faculty","semester"].forEach(f=>{
      data[f] = document.getElementById(f).value.trim();
    });
    if(Object.values(data).some(v=>!v)){ alert("Please fill in all fields."); return; }

    const students = getStudents();
    if(editing){
      const i = students.findIndex(s=>s.id===editing.id);
      students[i] = {id: editing.id, ...data};
      localStorage.removeItem("editingStudent");
      alert("Student updated successfully!");
    } else {
      students.push({id: Date.now(), ...data});
      alert("Student added successfully!");
    }
    saveStudents(students);
    location.href = "manage.html";
  });
}

/* ---------- DETAILS ---------- */
function initDetails(){
  const el = document.getElementById("stName");
  if(!el) return;
  const s = JSON.parse(localStorage.getItem("selectedStudent"));
  if(!s) return;
  document.getElementById("stName").textContent = s.name;
  document.getElementById("stEmail").textContent = s.email;
  document.getElementById("stContact").textContent = s.contact;
  document.getElementById("stAddress").textContent = s.address;
  document.getElementById("stFaculty").textContent = s.faculty;
  document.getElementById("stSemester").textContent = semName(s.semester);
}

document.addEventListener("DOMContentLoaded", ()=>{
  initDashboard();
  initManage();
  initForm();
  initDetails();
});
