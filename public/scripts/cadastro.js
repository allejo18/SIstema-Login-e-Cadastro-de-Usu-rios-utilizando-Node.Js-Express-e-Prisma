document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const celular = document.getElementById('celular').value;
  const cpf = document.getElementById('cpf').value;
  const senha = document.getElementById('senha').value;

  const response = await fetch('/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, celular, cpf, senha }),
  });

  const data = await response.json();
  if (response.ok) {
    alert('Cadastro realizado com sucesso! Bem-vindo ao nosso sistema.'); // Mensagem personalizada
    window.location.href = '/login.html';
  } else {
    alert('Erro ao cadastrar: ' + (data.error || 'Tente novamente mais tarde.')); // Mensagem personalizada
  }
});