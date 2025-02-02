
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json();
  if (response.ok) {
    alert('Login realizado com sucesso! Bem-vindo de volta.'); // Mensagem personalizada
    localStorage.setItem('token', data.token);
    window.location.href = '/protegido.html';
  } else {
    alert('Erro ao fazer login: ' + (data.error || 'Verifique suas credenciais.')); // Mensagem personalizada
  }
});