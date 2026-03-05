const API_URL = 'https://jsonplaceholder.typicode.com';

async function carregarUsuarios() {
  const startTime = Date.now();
  const loading = document.getElementById('loading');
  const container = document.getElementById('usuarios-container');
  const endpoint = `${API_URL}/users`;

  try {
    loading.classList.remove('hidden');
    container.innerHTML = '';

    const response = await fetch(endpoint);
    const usuarios = await response.json();
    const tempo = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Falha ao buscar usuários (status ${response.status})`);
    }

    const fragment = document.createDocumentFragment();

    usuarios.forEach((usuario) => {
      const card = document.createElement('article');
      card.className = 'user-card';
      card.innerHTML = `
        <h3>${usuario.name}</h3>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <p><strong>Cidade:</strong> ${usuario.address.city}</p>
      `;
      fragment.appendChild(card);
    });

    container.appendChild(fragment);
    atualizarInfo('GET', endpoint, response.status, tempo);
  } catch (error) {
    container.innerHTML = `<p class="feedback error">Erro: ${error.message}</p>`;
    atualizarInfo('GET', endpoint, 'erro', `${Date.now() - startTime}ms`);
  } finally {
    loading.classList.add('hidden');
  }
}

async function criarPost(event) {
  event.preventDefault();
  const startTime = Date.now();

  const tituloInput = document.getElementById('titulo');
  const conteudoInput = document.getElementById('conteudo');
  const resultado = document.getElementById('post-resultado');
  const endpoint = `${API_URL}/posts`;

  const titulo = tituloInput.value.trim();
  const conteudo = conteudoInput.value.trim();

  if (!titulo || !conteudo) {
    resultado.innerHTML = '<p class="feedback error">Preencha todos os campos.</p>';
    return;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: titulo,
        body: conteudo,
        userId: 1
      })
    });

    const data = await response.json();
    const tempo = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`Falha ao criar post (status ${response.status})`);
    }

    resultado.innerHTML = `
      <p class="feedback success">
        ✅ Post criado com sucesso! ID: ${data.id} (status ${response.status})
      </p>
    `;

    event.target.reset();
    atualizarInfo('POST', endpoint, response.status, tempo);
  } catch (error) {
    resultado.innerHTML = `<p class="feedback error">Erro: ${error.message}</p>`;
    atualizarInfo('POST', endpoint, 'erro', `${Date.now() - startTime}ms`);
  }
}

function atualizarInfo(metodo, url, status, tempo) {
  document.getElementById('info-metodo').textContent = metodo;
  document.getElementById('info-url').textContent = url;
  document.getElementById('info-status').textContent = status;
  document.getElementById('info-tempo').textContent = typeof tempo === 'number' ? `${tempo}ms` : tempo;
}

document.getElementById('btn-carregar').addEventListener('click', carregarUsuarios);
document.getElementById('form-post').addEventListener('submit', criarPost);
