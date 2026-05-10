document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');
        fetchData(token);
    } else {
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
    }
}

async function handleLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const loginError = document.getElementById('loginError');

    loginError.innerText = '';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('adminToken', data.token);
            checkAuth();
        } else {
            loginError.innerText = data.message || 'Login failed';
        }
    } catch (error) {
        console.error(error);
        loginError.innerText = 'Server error';
    }
}

function handleLogout() {
    localStorage.removeItem('adminToken');
    checkAuth();
}

async function fetchData(token) {
    try {
        // Show loading state to provide immediate feedback to the user
        const contactTbody = document.querySelector('#contactTable tbody');
        const admissionTbody = document.querySelector('#admissionTable tbody');
        if (contactTbody) contactTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; font-weight: bold; color: #555;">Loading contacts... please wait.</td></tr>';
        if (admissionTbody) admissionTbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 20px; font-weight: bold; color: #555;">Loading admissions... please wait.</td></tr>';

        // Fetch Contacts and Admissions in parallel to reduce wait time
        const [contactRes, admissionRes] = await Promise.all([
            fetch('/api/contact', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/admission', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (contactRes.status === 401 || admissionRes.status === 401) {
            handleLogout();
            return;
        }

        const contacts = await contactRes.json();
        const admissions = await admissionRes.json();

        populateContacts(contacts);
        populateAdmissions(admissions);
        
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function populateContacts(contacts) {
    const tbody = document.querySelector('#contactTable tbody');
    tbody.innerHTML = '';
    
    contacts.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.phone || 'N/A'}</td>
            <td>${c.message || 'N/A'}</td>
            <td>${new Date(c.createdAt).toLocaleString()}</td>
            <td>
                <button onclick='openEditContact(${JSON.stringify(c).replace(/'/g, "&#39;")})' style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;" title="Edit">✏️</button>
                <button onclick="deleteRow('contact', '${c._id}')" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer; margin-left:5px;" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateAdmissions(admissions) {
    const tbody = document.querySelector('#admissionTable tbody');
    tbody.innerHTML = '';

    admissions.forEach(a => {
        // Legacy support to fix absolute paths sent previously
        let srcPath = a.marksheetPath.replace(/\\/g, '/');
        if (srcPath.includes('/uploads/')) {
            srcPath = 'uploads/' + srcPath.split('/uploads/').pop();
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.name}</td>
            <td>${a.email}</td>
            <td>${a.phone}</td>
            <td>${a.course}</td>
            <td>${a.gender}</td>
            <td>
                ${srcPath.startsWith('data:image') 
                    ? `<a href="${srcPath}" download="marksheet"><img src="${srcPath}" alt="Marksheet" class="preview-img"></a>`
                    : srcPath.match(/\.(jpeg|jpg|gif|png)$/i) 
                        ? `<a href="/${srcPath}" target="_blank"><img src="/${srcPath}" alt="Marksheet" class="preview-img"></a>` 
                        : `<a href="/${srcPath}" target="_blank" style="font-weight: bold; color: var(--primary);">View File</a>`
                }
            </td>
            <td>${new Date(a.createdAt).toLocaleString()}</td>
            <td>
                <button onclick='openEditAdmission(${JSON.stringify(a).replace(/'/g, "&#39;")})' style="background:var(--primary); color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer;" title="Edit">✏️</button>
                <button onclick="deleteRow('admission', '${a._id}')" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:3px; cursor:pointer; margin-left:5px;" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========================
// CRUD Operations
// ========================

// DELETE Logic
async function deleteRow(type, id) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`/api/${type}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            fetchData(token); // Refresh table
        } else {
            alert('Failed to delete record');
        }
    } catch (error) {
        console.error('Delete error', error);
    }
}

// MODAL CONTROLS
function closeModals() {
    document.getElementById('editContactModal').classList.add('hidden');
    document.getElementById('editAdmissionModal').classList.add('hidden');
}

// CONTACT EDIT
function openEditContact(contact) {
    document.getElementById('editContactId').value = contact._id;
    document.getElementById('editContactName').value = contact.name;
    document.getElementById('editContactEmail').value = contact.email;
    document.getElementById('editContactPhone').value = contact.phone || '';
    document.getElementById('editContactMessage').value = contact.message || '';
    document.getElementById('editContactModal').classList.remove('hidden');
}

async function saveContactEdit() {
    const id = document.getElementById('editContactId').value;
    const data = {
        name: document.getElementById('editContactName').value,
        email: document.getElementById('editContactEmail').value,
        phone: document.getElementById('editContactPhone').value,
        message: document.getElementById('editContactMessage').value
    };
    await updateRecord('contact', id, data);
    closeModals();
}

// ADMISSION EDIT
function openEditAdmission(admission) {
    document.getElementById('editAdmissionId').value = admission._id;
    document.getElementById('editAdmissionName').value = admission.name;
    document.getElementById('editAdmissionEmail').value = admission.email;
    document.getElementById('editAdmissionPhone').value = admission.phone;
    document.getElementById('editAdmissionCourse').value = admission.course;
    document.getElementById('editAdmissionModal').classList.remove('hidden');
}

async function saveAdmissionEdit() {
    const id = document.getElementById('editAdmissionId').value;
    const data = {
        name: document.getElementById('editAdmissionName').value,
        email: document.getElementById('editAdmissionEmail').value,
        phone: document.getElementById('editAdmissionPhone').value,
        course: document.getElementById('editAdmissionCourse').value
    };
    await updateRecord('admission', id, data);
    closeModals();
}

async function updateRecord(type, id, data) {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`/api/${type}/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            fetchData(token);
        } else {
            alert(`Failed to update ${type}`);
        }
    } catch (error) {
        console.error('Update error', error);
    }
}
