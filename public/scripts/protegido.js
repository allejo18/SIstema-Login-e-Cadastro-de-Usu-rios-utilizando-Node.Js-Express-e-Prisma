


  document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa fazer login para acessar esta página.'); // Mensagem personalizada
      window.location.href = '/login.html';
      return;
    }
  
    const response = await fetch('/protegido', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  
    if (!response.ok) {
      alert('Sessão expirada. Faça login novamente.'); // Mensagem personalizada
      localStorage.removeItem('token');
      window.location.href = '/login.html';
      return;
    }
  
    const data = await response.json();
    document.getElementById('nomeUsuario').textContent = data.nome;
  
    // Botão de logout
    document.getElementById('logoutButton').addEventListener('click', () => {
      localStorage.removeItem('token');
      alert('Você saiu do sistema. Até logo!'); // Mensagem personalizada
      window.location.href = '/login.html';
    });
  });