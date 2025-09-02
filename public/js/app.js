// =====================
// App configuration
// =====================
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Keep /api for Laravel routes

// Authentication state
let currentUser = null;

// Initialize application
document.addEventListener("DOMContentLoaded", function() {
  console.log("Application de gestion de réclamations initialisée");
  
  // Load user from session
  loadUserSession();
  
  // Setup navigation
  setupNavigation();
  updateNavVisibility();
  enforceAccessControl();
  
  // Setup authentication forms
  setupAuthForms();
  
  // Setup reclamation forms
  setupReclamationForms();
  
  // Setup tracking functionality
  setupTrackingFunctionality();
});

// Load user from session storage
function loadUserSession() {
  const userData = sessionStorage.getItem('currentUser');
  if (userData) {
    currentUser = JSON.parse(userData);
    updateAuthUI();
  }
}

// Save user to session storage
function saveUserSession(user) {
  currentUser = user;
  sessionStorage.setItem('currentUser', JSON.stringify(user));
  updateAuthUI();
  updateNavVisibility();
}

// Clear user session
function clearUserSession() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  updateAuthUI();
  updateNavVisibility();
}

// Update UI based on auth state
function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userNav = document.getElementById('user-nav');
  
  if (currentUser) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
    if (userNav) {
      userNav.style.display = 'flex';
      document.getElementById('user-name').textContent = currentUser.name;
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (userNav) userNav.style.display = 'none';
  }
}

// Role-based nav visibility
function updateNavVisibility() {
  const hideForAdmin = ['correction.html', 'suivi.html'];
  const hideForClient = ['admin.html'];
  const navLinks = document.querySelectorAll('nav a');
  if (!navLinks.length) return;

  navLinks.forEach(a => {
    a.parentElement.style.display = '';
  });

  if (!currentUser) return; // Show everything by default for guests

  if (currentUser.role === 'admin') {
    navLinks.forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (hideForAdmin.some(x => href.endsWith(x))) {
        a.parentElement.style.display = 'none';
      }
    });
  } else {
    navLinks.forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (hideForClient.some(x => href.endsWith(x))) {
        a.parentElement.style.display = 'none';
      }
    });
  }
}

// Page access control (redirect if wrong role)
function enforceAccessControl() {
  const page = getCurrentPage();
  if (!currentUser) return; // No enforcement for guests for now

  if (page === 'admin.html' && currentUser.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  if ((page === 'correction.html' || page === 'suivi.html') && currentUser.role === 'admin') {
    window.location.href = 'admin.html';
  }
}

function getCurrentPage() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf('/') + 1).toLowerCase() || 'index.html';
}

// Setup navigation
function setupNavigation() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: requireAuthHeaders()
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          clearUserSession();
          window.location.href = 'index.html';
        } else {
          alert("Erreur lors de la déconnexion");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        clearUserSession();
        window.location.href = 'index.html';
      });
    });
  }
}

// Setup authentication forms
function setupAuthForms() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      // Validation côté client
      if (!email || !password) {
        alert("Tous les champs sont obligatoires");
        return;
      }
      
      if (!isValidEmail(email)) {
        alert("Format d'email invalide");
        return;
      }
      
      // API call to Laravel backend
      authenticateUser(email, password);
    });
  }
  
  // Registration form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Registration fields
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('register-email')?.value.trim();
      const password = document.getElementById('register-password')?.value;
      const confirmPassword = document.getElementById('confirm-password')?.value;
      
      // Validation côté client selon AuthController
      if (!name || !email || !password || !confirmPassword) {
        alert("Tous les champs sont obligatoires");
        return;
      }
      
      if (name.length > 255) {
        alert("Le nom ne peut pas dépasser 255 caractères");
        return;
      }
      
      if (!isValidEmail(email)) {
        alert("Format d'email invalide");
        return;
      }
      
      if (password.length < 8) {
        alert("Le mot de passe doit contenir au moins 8 caractères");
        return;
      }
      
      if (password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas !");
        return;
      }
      
      console.log("Register payload: ", {name, email, password, password_confirmation: confirmPassword});
      
      // API call to Laravel backend
      registerUser({ name, email, password, password_confirmation: confirmPassword });
    });
  }
}

// Setup reclamation forms
function setupReclamationForms() {
  const complaintForm = document.getElementById('complaint-form');
  if (complaintForm) {
    complaintForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!currentUser) {
        alert("Veuillez vous connecter pour soumettre une réclamation");
        window.location.href = 'login.html';
        return;
      }
      
      const complaintData = {
        type: document.getElementById('complaint-type').value,
        subject: document.getElementById('subject').value.trim(),
        description: document.getElementById('description').value.trim(),
        contact_info: document.getElementById('contact-info').value.trim()
      };
      
      // Validation côté client selon ComplaintController
      if (!complaintData.type || !complaintData.subject || !complaintData.description || !complaintData.contact_info) {
        alert("Tous les champs sont obligatoires");
        return;
      }
      
      const validTypes = ['Internet', 'Téléphonie', 'TV', 'Facturation', 'Autre'];
      if (!validTypes.includes(complaintData.type)) {
        alert("Type de réclamation invalide");
        return;
      }
      
      if (complaintData.subject.length > 255) {
        alert("Le sujet ne peut pas dépasser 255 caractères");
        return;
      }
      
      createComplaint(complaintData);
    });
  }
  
  // Tab functionality
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// Setup tracking functionality
function setupTrackingFunctionality() {
  const trackingForm = document.getElementById('tracking-form');
  if (trackingForm) {
    trackingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const trackingNumber = document.getElementById('tracking-number').value.trim();
      
      if (!trackingNumber) {
        alert("Veuillez saisir un numéro de référence");
        return;
      }
      
      trackComplaint(trackingNumber);
    });
  }
}

// =====================
// Tracking Functions
// =====================

// Track complaint by reference number
function trackComplaint(referenceNumber) {
  const submitBtn = document.querySelector('#tracking-form button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // Show loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche...';
  submitBtn.disabled = true;
  
  console.log('🔍 Recherche de la réclamation:', referenceNumber);
  console.log('🌐 URL de l\'API:', `${API_BASE_URL}/complaints/track/${referenceNumber}`);
  
  fetch(`${API_BASE_URL}/complaints/track/${referenceNumber}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(response => {
    console.log('📡 Réponse du serveur:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('📊 Données reçues:', data);
    if (data.success) {
      console.log('✅ Réclamation trouvée:', data.complaint);
      displayComplaintStatus(data.complaint);
    } else {
      console.error('❌ Erreur de l\'API:', data.message);
      alert("Réclamation non trouvée: " + data.message);
    }
  })
  .catch(error => {
    console.error('❌ Erreur de connexion:', error);
    alert("Erreur de connexion au serveur: " + error.message);
  })
  .finally(() => {
    // Reset button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  });
}

// Display complaint status and details
function displayComplaintStatus(complaint) {
  // Update reference number
  document.getElementById('complaint-reference').textContent = complaint.reference_id;
  
  // Generate status timeline
  generateStatusTimeline(complaint);
  
  // Generate complaint details
  generateComplaintDetails(complaint);
  
  // Generate status history
  generateStatusHistory(complaint);
  
  // Generate responses section
  generateResponsesSection(complaint);
  
  // Show all sections
  document.getElementById('tracking-results').style.display = 'block';
  document.getElementById('history-section').style.display = 'block';
  document.getElementById('responses-section').style.display = 'block';
  
  // Scroll to results
  document.getElementById('tracking-results').scrollIntoView({ 
    behavior: 'smooth' 
  });
}

// Generate status timeline
function generateStatusTimeline(complaint) {
  console.log('🎯 Génération de la timeline pour le statut:', complaint.status);
  
  const timeline = document.getElementById('status-timeline');
  if (!timeline) {
    console.error('❌ Élément timeline non trouvé');
    return;
  }
  
  const statuses = ['Nouveau', 'En cours', 'Résolu', 'Fermé'];
  let currentStatus = complaint.status || 'Nouveau';
  const currentStatusIndex = statuses.indexOf(currentStatus);
  
  console.log('📊 Statut actuel:', currentStatus, 'Index:', currentStatusIndex);
  
  let timelineHTML = '';
  
  statuses.forEach((status, index) => {
    let statusClass = '';
    let icon = '';
    let date = '-';
    
    if (index < currentStatusIndex) {
      statusClass = 'completed';
      icon = '<i class="fas fa-check"></i>';
      // Find the date when this status was set
      const statusHistory = complaint.status_histories?.find(h => h.new_status === status);
      if (statusHistory) {
        date = new Date(statusHistory.created_at).toLocaleDateString('fr-FR');
      }
    } else if (index === currentStatusIndex) {
      statusClass = 'active';
      icon = '<i class="fas fa-cog"></i>';
      date = 'En cours';
    }
    
    console.log(`  ${status}: ${statusClass} (${date})`);
    
    timelineHTML += `
      <div class="status-step ${statusClass}">
        <div class="status-icon">${icon}</div>
        <h4>${status}</h4>
        <span>${date}</span>
      </div>
    `;
  });
  
  timeline.innerHTML = timelineHTML;
  console.log('✅ Timeline générée avec succès');
}

// Generate complaint details
function generateComplaintDetails(complaint) {
  const detailsContainer = document.getElementById('complaint-details');
  
  const detailsHTML = `
    <div class="detail-card">
      <h4>Référence</h4>
      <p class="value">${complaint.reference_id}</p>
    </div>
    
    <div class="detail-card">
      <h4>Date de soumission</h4>
      <p class="value">${new Date(complaint.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
    </div>
    
    <div class="detail-card">
      <h4>Type de réclamation</h4>
      <p class="value">${complaint.type}</p>
    </div>
    
    <div class="detail-card">
      <h4>Sujet</h4>
      <p class="value">${complaint.subject}</p>
    </div>
    
    <div class="detail-card">
      <h4>Statut actuel</h4>
      <p class="value"><span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></p>
    </div>
    
    <div class="detail-card">
      <h4>Priorité</h4>
      <p class="value"><span class="priority ${complaint.priority?.toLowerCase() || 'normal'}">${complaint.priority || 'Normale'}</span></p>
    </div>
    
    <div class="detail-card">
      <h4>Responsable</h4>
      <p class="value">${complaint.assigned_agent ? complaint.assigned_agent.name : 'Non assigné'}</p>
    </div>
  `;
  
  detailsContainer.innerHTML = detailsHTML;
}

// Generate status history
function generateStatusHistory(complaint) {
  const historyContainer = document.getElementById('history-timeline');
  
  if (!complaint.status_histories || complaint.status_histories.length === 0) {
    historyContainer.innerHTML = '<p class="no-history">Aucun historique disponible</p>';
    return;
  }
  
  let historyHTML = '';
  
  // Sort by creation date (newest first)
  const sortedHistory = complaint.status_histories.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  sortedHistory.forEach(history => {
    const date = new Date(history.created_at);
    const formattedDate = date.toLocaleDateString('fr-FR');
    const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    historyHTML += `
      <div class="history-item">
        <div class="history-date">${formattedDate}<br>${formattedTime}</div>
        <div class="history-content">
          <h4>Changement de statut: ${history.old_status || 'Création'} → ${history.new_status}</h4>
          <p>${history.notes || 'Aucune note disponible'}</p>
          <small>Modifié par: ${history.changed_by ? history.changed_by.name : 'Système'}</small>
        </div>
      </div>
    `;
  });
  
  historyContainer.innerHTML = historyHTML;
}

// Generate responses section
function generateResponsesSection(complaint) {
  const responsesContainer = document.getElementById('responses-list');
  
  if (!complaint.responses || complaint.responses.length === 0) {
    responsesContainer.innerHTML = '<p class="no-responses">Aucune réponse disponible pour le moment</p>';
    return;
  }
  
  let responsesHTML = '';
  
  // Sort by creation date (newest first)
  const sortedResponses = complaint.responses.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  sortedResponses.forEach(response => {
    const date = new Date(response.created_at);
    const formattedDate = date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    responsesHTML += `
      <div class="response-item">
        <div class="response-header">
          <div class="response-author">
            <i class="fas fa-user-tie"></i>
            <span>${response.admin ? response.admin.name : 'Administrateur'}</span>
          </div>
          <div class="response-date">${formattedDate}</div>
        </div>
        <div class="response-content">
          <p>${response.response}</p>
        </div>
      </div>
    `;
  });
  
  responsesContainer.innerHTML = responsesHTML;
}

// =====================
// Authentication Functions
// =====================

// Authenticate user with Laravel backend
function authenticateUser(email, password) {
  fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(data => {
        throw new Error(data.message || 'Erreur de connexion');
      });
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      saveUserSession({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token
      });
      
      // Redirection basée sur le rôle
      if (data.user.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'correction.html';
      }
    } else {
      alert("Échec de l'authentification: " + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert("Erreur de connexion au serveur: " + error.message);
  });
}

// Register user with Laravel backend
function registerUser(userData) {
  fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      saveUserSession({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        token: data.token
      });
      alert("Inscription réussie !");
      window.location.href = 'correction.html';
    } else {
      alert("Échec de l'inscription: " + data.message);
    }
  })
  .catch(error => {
    console.error('Fetch/register error:', error);
    alert("Erreur de connexion au serveur: " + error.message);
  });
}

// =====================
// Complaints CRUD (API)
// =====================

function requireAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (currentUser && currentUser.token) {
    headers['Authorization'] = `Bearer ${currentUser.token}`;
  }
  
  return headers;
}

// Create complaint
function createComplaint(payload) {
  fetch(`${API_BASE_URL}/complaints`, {
    method: 'POST',
    headers: requireAuthHeaders(),
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert(`Réclamation soumise avec succès ! Numéro: ${data.complaint.reference_id}`);
      document.getElementById('complaint-form').reset();
    } else {
      alert("Échec de la soumission: " + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert("Erreur de connexion au serveur");
  });
}

// List complaints (Admin)
function listComplaints(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetch(`${API_BASE_URL}/complaints${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: requireAuthHeaders()
  }).then(r => r.json());
}

// Update complaint status (Admin)
function updateComplaintStatus(id, status) {
  return fetch(`${API_BASE_URL}/complaints/${id}`, {
    method: 'PUT',
    headers: requireAuthHeaders(),
    body: JSON.stringify({ status })
  }).then(r => r.json());
}

// Delete complaint (Admin)
function deleteComplaint(id) {
  return fetch(`${API_BASE_URL}/complaints/${id}`, {
    method: 'DELETE',
    headers: requireAuthHeaders()
  }).then(r => r.json());
}

// Load complaints for admin
function loadComplaints() {
  fetch(`${API_BASE_URL}/complaints`, {
    method: 'GET',
    headers: requireAuthHeaders()
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      populateComplaintsTable(data.complaints);
    } else {
      alert("Erreur lors du chargement des réclamations");
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert("Erreur de connexion au serveur");
  });
}

// Populate complaints table
function populateComplaintsTable(complaints) {
  const tbody = document.querySelector('.complaints-table tbody');
  if (!tbody) return;
  
  tbody.innerHTML = ''; // Clear table
  
  complaints.forEach(complaint => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox"></td>
      <td>${complaint.reference_id}</td>
      <td>${complaint.user.name}</td>
      <td>${complaint.type}</td>
      <td>${new Date(complaint.created_at).toLocaleDateString()}</td>
      <td><span class="status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}">${complaint.status}</span></td>
      <td><span class="priority ${complaint.priority?.toLowerCase() || 'normal'}">${complaint.priority || 'Normale'}</span></td>
      <td>${complaint.assigned_to ? complaint.assigned_agent.name : 'Non assigné'}</td>
      <td>
        <div class="action-buttons">
          <button class="btn respond-btn" title="Répondre" data-id="${complaint.id}">
            <i class="fas fa-reply"></i>
          </button>
          <button class="btn assign-btn" title="Assigner" data-id="${complaint.id}">
            <i class="fas fa-user-tag"></i>
          </button>
          <button class="btn view-btn" title="Détails" data-id="${complaint.id}">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Add event listeners to buttons
  attachComplaintButtonsEvents();
}

// Load complaints on page load
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('admin.html')) {
    loadComplaints();
  }
});

// Add event listeners to filter dropdowns
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.filters select').forEach(select => {
    select.addEventListener('change', function() {
      loadComplaintsWithFilters();
    });
  });
});

// Load complaints with filters
function loadComplaintsWithFilters() {
  const statusFilter = document.querySelector('select:first-child')?.value;
  const typeFilter = document.querySelectorAll('select')[1]?.value;
  const dateFilter = document.querySelectorAll('select')[2]?.value;
  
  if (!statusFilter && !typeFilter && !dateFilter) return;
  
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== 'Tous') params.append('status', statusFilter);
  if (typeFilter && typeFilter !== 'Tous') params.append('type', typeFilter);
  if (dateFilter && dateFilter !== 'Tout') params.append('date_filter', dateFilter);
  
  fetch(`${API_BASE_URL}/complaints?${params}`, {
    method: 'GET',
    headers: requireAuthHeaders()
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      populateComplaintsTable(data.complaints);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

// =====================
// Utility Functions
// =====================

// Validation utilities
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') {
    alert(`Le champ "${fieldName}" est obligatoire`);
    return false;
  }
  return true;
}

function validateMaxLength(value, maxLength, fieldName) {
  if (value && value.length > maxLength) {
    alert(`Le champ "${fieldName}" ne peut pas dépasser ${maxLength} caractères`);
    return false;
  }
  return true;
}

// =====================
// Event Handlers
// =====================

// Attach event listeners to complaint action buttons
function attachComplaintButtonsEvents() {
  // Respond button
  document.querySelectorAll('.respond-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const complaintId = this.getAttribute('data-id');
      // Implement response functionality
      console.log('Respond to complaint:', complaintId);
    });
  });
  
  // Assign button
  document.querySelectorAll('.assign-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const complaintId = this.getAttribute('data-id');
      // Implement assignment functionality
      console.log('Assign complaint:', complaintId);
    });
  });
  
  // View button
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const complaintId = this.getAttribute('data-id');
      // Implement view functionality
      console.log('View complaint:', complaintId);
    });
  });
}

// =====================
// Debug and Test Functions
// =====================

// Test function to debug complaint type validation
function testComplaintTypeValidation() {
  console.log('=== Testing Complaint Type Validation ===');
  
  const selectElement = document.getElementById('complaint-type');
  if (!selectElement) {
    console.log('Complaint type select not found');
    return;
  }
  
  console.log('Select element found:', selectElement);
  console.log('Current value:', selectElement.value);
  console.log('All options:');
  
  Array.from(selectElement.options).forEach((option, index) => {
    console.log(`Option ${index}: value="${option.value}", text="${option.text}"`);
    console.log(`  Value length: ${option.value.length}`);
    console.log(`  Value char codes:`, Array.from(option.value).map(c => c.charCodeAt(0)));
  });
  
  const validTypes = ['Internet', 'Téléphonie', 'TV', 'Facturation', 'Autre'];
  console.log('Valid types from controller:', validTypes);
  
  // Test each option value
  Array.from(selectElement.options).forEach((option, index) => {
    if (option.value) { // Skip empty option
      const isValid = validTypes.includes(option.value);
      console.log(`Option "${option.value}" is valid: ${isValid}`);
    }
  });
}

// Call test function when page loads (for debugging)
document.addEventListener('DOMContentLoaded', function() {
  // Add a small delay to ensure all elements are loaded
  setTimeout(() => {
    if (window.location.pathname.includes('correction.html')) {
      testComplaintTypeValidation();
    }
  }, 1000);
});
