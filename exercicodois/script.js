const API_URL = 'https://jsonplaceholder.typicode.com';

const loadUsersBtn = document.getElementById('loadUsers');
const usersContainer = document.getElementById('usersContainer');
const loading = document.getElementById('loading');
const userForm = document.getElementById('userForm');
const userResult = document.getElementById('userResult');
const postForm = document.getElementById('postForm');
const postResult = document.getElementById('postResult');
const requestInfo = document.getElementById('requestInfo');
const searchInput = document.getElementById('searchInput');
const pagination = document.getElementById('pagination');
const cacheInfo = document.getElementById('cacheInfo');
const darkModeToggle = document.getElementById('darkModeToggle');

let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 6;
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

loadUsersBtn.addEventListener('click', fetchUsers);
userForm.addEventListener('submit', createUser);
postForm.addEventListener('submit', createPost);
searchInput.addEventListener('input', handleSearch);
darkModeToggle.addEventListener('click', toggleDarkMode);

// Carregar preferência de dark mode
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

async function fetchUsers() {
    const cacheKey = 'users';
    const cachedData = cache.get(cacheKey);
    
    // Verificar cache
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        allUsers = cachedData.data;
        filteredUsers = allUsers;
        displayUsers();
        showCacheInfo();
        return;
    }
    
    const startTime = performance.now();
    
    try {
        loading.classList.remove('hidden');
        usersContainer.innerHTML = '';
        cacheInfo.classList.add('hidden');
        
        const response = await fetch(`${API_URL}/users`);
        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        
        // Salvar no cache
        cache.set(cacheKey, {
            data: users,
            timestamp: Date.now()
        });
        
        allUsers = users;
        filteredUsers = users;
        
        displayRequestInfo('GET', `${API_URL}/users`, response.status, responseTime);
        displayUsers();
        
    } catch (error) {
        usersContainer.innerHTML = `<p style="color: red;">Erro ao carregar usuários: ${error.message}</p>`;
    } finally {
        loading.classList.add('hidden');
    }
}

function showCacheInfo() {
    cacheInfo.classList.remove('hidden');
    cacheInfo.textContent = '✅ Dados carregados do cache (mais rápido!)';
    setTimeout(() => cacheInfo.classList.add('hidden'), 3000);
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.address.city.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    displayUsers();
}

function displayUsers() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);
    
    usersContainer.innerHTML = '';
    
    if (usersToShow.length === 0) {
        usersContainer.innerHTML = '<p>Nenhum usuário encontrado.</p>';
        pagination.classList.add('hidden');
        return;
    }
    
    usersToShow.forEach((user, index) => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <h3>${user.name}</h3>
            <p>📧 ${user.email}</p>
            <p>🏙️ ${user.address?.city || 'N/A'}</p>
            <button class="delete-btn" onclick="deleteUser(${user.id})">🗑️ Deletar</button>
        `;
        usersContainer.appendChild(card);
    });
    
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    if (totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }
    
    pagination.classList.remove('hidden');
    pagination.innerHTML = '';
    
    // Botão anterior
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '←';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevBtn);
    
    // Botões de página
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => changePage(i);
        pagination.appendChild(pageBtn);
    }
    
    // Botão próximo
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '→';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

function changePage(page) {
    currentPage = page;
    displayUsers();
    usersContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function createUser(e) {
    e.preventDefault();
    
    const startTime = performance.now();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const city = document.getElementById('userCity').value;
    
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                address: {
                    city: city
                }
            })
        });
        
        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Adicionar usuário à lista local
        allUsers.unshift(data);
        filteredUsers = allUsers;
        displayUsers();
        
        displayRequestInfo('POST', `${API_URL}/users`, response.status, responseTime);
        
        userResult.className = 'result success';
        userResult.innerHTML = `
            <h3>✅ Usuário criado com sucesso!</h3>
            <p><strong>Status Code:</strong> ${response.status}</p>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
        `;
        
        userForm.reset();
        
    } catch (error) {
        userResult.className = 'result error';
        userResult.innerHTML = `
            <h3>❌ Erro ao criar usuário</h3>
            <p>${error.message}</p>
        `;
    }
}

async function deleteUser(userId) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
        return;
    }
    
    const startTime = performance.now();
    
    try {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        
        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Remover usuário da lista local
        allUsers = allUsers.filter(user => user.id !== userId);
        filteredUsers = filteredUsers.filter(user => user.id !== userId);
        displayUsers();
        
        displayRequestInfo('DELETE', `${API_URL}/users/${userId}`, response.status, responseTime);
        
        userResult.className = 'result success';
        userResult.innerHTML = `
            <h3>✅ Usuário deletado com sucesso!</h3>
            <p><strong>Status Code:</strong> ${response.status}</p>
            <p><strong>ID deletado:</strong> ${userId}</p>
        `;
        
        setTimeout(() => userResult.innerHTML = '', 3000);
        
    } catch (error) {
        userResult.className = 'result error';
        userResult.innerHTML = `
            <h3>❌ Erro ao deletar usuário</h3>
            <p>${error.message}</p>
        `;
    }
}

async function createPost(e) {
    e.preventDefault();
    
    const startTime = performance.now();
    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;
    
    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })
        });
        
        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        displayRequestInfo('POST', `${API_URL}/posts`, response.status, responseTime);
        
        postResult.className = 'result success';
        postResult.innerHTML = `
            <h3>✅ Post criado com sucesso!</h3>
            <p><strong>Status Code:</strong> ${response.status}</p>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Título:</strong> ${data.title}</p>
            <p><strong>Conteúdo:</strong> ${data.body}</p>
        `;
        
        postForm.reset();
        
    } catch (error) {
        postResult.className = 'result error';
        postResult.innerHTML = `
            <h3>❌ Erro ao criar post</h3>
            <p>${error.message}</p>
        `;
    }
}

function displayRequestInfo(method, url, status, responseTime) {
    const statusClass = status >= 200 && status < 300 ? 'success' : 'error';
    
    requestInfo.innerHTML = `
        <p><strong>Método:</strong> ${method}</p>
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Status Code:</strong> <span style="color: ${status >= 200 && status < 300 ? 'green' : 'red'}">${status}</span></p>
        <p><strong>Tempo de Resposta:</strong> ${responseTime}ms</p>
    `;
}
