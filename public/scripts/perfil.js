document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login.html';
      return;
    }
  
    // Carregar dados do usuário
    const response = await fetch('/perfil', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  
    if (!response.ok) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar perfil. Faça login novamente.',
      }).then(() => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
      });
      return;
    }
  
    const user = await response.json();
    document.getElementById('nome').value = user.nome;
    document.getElementById('email').value = user.email;
    document.getElementById('celular').value = user.celular;
    document.getElementById('fotoPerfil').src = user.fotoPerfil || '/uploads/default.png';
  
    // Upload de Foto de Perfil
    document.getElementById('uploadFoto').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      const formData = new FormData();
      formData.append('foto', file);
  
      const uploadResponse = await fetch('/upload-foto', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
  
      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        document.getElementById('fotoPerfil').src = data.fotoPerfil;
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Foto de perfil atualizada.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao atualizar a foto de perfil.',
        });
      }
    });
  
    // Editar Perfil
    document.getElementById('editarPerfilForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome').value;
      const email = document.getElementById('email').value;
      const celular = document.getElementById('celular').value;
  
      const editResponse = await fetch('/editar-perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, celular }),
      });
  
      if (editResponse.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Perfil atualizado com sucesso.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao atualizar o perfil.',
        });
      }
    });
  
    // Alterar Senha
    document.getElementById('alterarSenhaForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const senhaAtual = document.getElementById('senhaAtual').value;
      const novaSenha = document.getElementById('novaSenha').value;
      const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;
  
      if (novaSenha !== confirmarNovaSenha) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'As senhas não coincidem.',
        });
        return;
      }
  
      const senhaResponse = await fetch('/alterar-senha', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
  
      if (senhaResponse.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Senha alterada com sucesso.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao alterar a senha.',
        });
      }
    });
  
    // Logout
    document.getElementById('logoutButton').addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
    });
  });