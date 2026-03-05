// ========================================
// 1. FETCH GET BÁSICO
// ========================================

async function exemploGetBasico() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  const data = await response.json();
  console.log(data);
}

// ========================================
// 2. FETCH POST BÁSICO
// ========================================

async function exemploPostBasico() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Título',
      body: 'Conteúdo',
      userId: 1
    })
  });
  const data = await response.json();
  console.log(data);
}

// ========================================
// 3. CRIAR CARD DINAMICAMENTE
// ========================================

function exemploCriarCard(user, container) {
  const card = document.createElement('div');
  card.className = 'user-card';
  card.innerHTML = `
    <h3>${user.name}</h3>
    <p>Email: ${user.email}</p>
    <p>Cidade: ${user.address.city}</p>
  `;
  container.appendChild(card);
}

// ========================================
// 4. CALCULAR TEMPO DE REQUISIÇÃO
// ========================================

async function exemploCalcularTempo() {
  const startTime = Date.now();
  
  // Fazer requisição
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  const data = await response.json();
  
  const endTime = Date.now();
  const tempo = endTime - startTime;
  console.log(`Levou ${tempo}ms`);
}

// ========================================
// EXEMPLO COMPLETO COMBINANDO TUDO
// ========================================

async function exemploCompleto() {
  const container = document.getElementById('usersContainer');
  const startTime = Date.now();
  
  try {
    // GET - Buscar usuários
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    
    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }
    
    const users = await response.json();
    const endTime = Date.now();
    
    console.log(`Tempo: ${endTime - startTime}ms`);
    console.log(`Status: ${response.status}`);
    
    // Criar cards para cada usuário
    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'user-card';
      card.innerHTML = `
        <h3>${user.name}</h3>
        <p>Email: ${user.email}</p>
        <p>Cidade: ${user.address.city}</p>
      `;
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}
