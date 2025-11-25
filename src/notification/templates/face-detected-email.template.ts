export const photoTagTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Aviso: Você foi marcado em uma foto!</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background-color: #f8f8f8;
        margin: 0;
        padding: 0;
        color: #262626;
      }
      .container {
        max-width: 600px;
        background-color: #fff;
        margin: 40px auto;
        border: 1px solid #dbdbdb;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .header {
        padding: 20px;
        text-align: center;
        border-bottom: 2px solid #f2c14e;
        background-color: #fff3cd;
      }
      .header h1 {
        font-size: 24px;
        margin: 0;
        color: #856404;
      }
      .header p {
        font-size: 14px;
        color: #856404;
        margin: 10px 0 0;
      }
      .header .user-info {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      }
      .header .user-info img.avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
        object-fit: cover;
      }
      .header .user-info .avatar-fallback {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 10px;
        background-color: #ccc;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 20px;
      }
      .post-content img {
        width: 100%;
        display: block;
        margin-top: 20px;
      }
      .cta {
        text-align: center;
        padding: 20px;
        background-color: #ffeeba;
        border-top: 1px solid #f8e4b3;
      }
      .cta a {
        text-decoration: none;
        background-color: #f8a145;
        color: #fff;
        padding: 12px 24px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 16px;
      }
      .footer {
        background-color: #f8f8f8;
        text-align: center;
        padding: 10px;
        font-size: 12px;
        color: #8e8e8e;
        border-top: 1px solid #f2c14e;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Cabeçalho -->
      <div class="header">
        <h1>Atenção! Você foi marcado em uma nova foto</h1>
        <p>Alerta: alguém postou uma foto em que você aparece. Verifique imediatamente.</p>
      </div>
      
      <!-- Informações do usuário -->
      <div class="user-info">
        <% if (user.avatarUrl) { %>
          <img class="avatar" src="<%= user.avatarUrl %>" alt="Avatar de <%= user.name %>">
        <% } else { %>
          <div class="avatar-fallback">
            <%= user.name.charAt(0).toUpperCase() %>
          </div>
        <% } %>
        <h2><%= user.name %></h2>
      </div>
      
      <!-- Imagem -->
      <div class="post-content">
        <img src="<%= media.imageUrl %>" alt="Imagem marcada com você">
      </div>
      
      <!-- Call-to-Action -->
      <div class="cta">
        <a href="http://computacao.unir.br/mural/?post=<%= post.id %>">Ver Foto Agora</a>
      </div>
      
      <!-- Rodapé -->
      <div class="footer">
        <p>Este email foi enviado automaticamente. Não responda a este endereço.</p>
        <p>Sua Equipe © <%= new Date().getFullYear() %></p>
      </div>
    </div>
  </body>
</html>
`;
