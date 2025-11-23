export const photoTagTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Você apareceu em uma nova foto!</title>
    <style>
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background-color: #fafafa;
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
        border-bottom: 1px solid #efefef;
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
      .header h1 {
        font-size: 20px;
        margin: 0;
        color: #262626;
      }
      .header p {
        font-size: 14px;
        color: #8e8e8e;
        margin: 5px 0 0;
      }
      .post-content img {
        width: 100%;
        display: block;
      }
      .cta {
        text-align: center;
        padding: 15px 20px;
        border-top: 1px solid #efefef;
      }
      .btn {
        text-decoration: none;
        background-color: #3897f0;
        color: #fff;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 14px;
      }
      .footer {
        background-color: #fafafa;
        text-align: center;
        padding: 10px;
        font-size: 12px;
        color: #8e8e8e;
        border-top: 1px solid #efefef;
      }
    </style>
  </head>
  <body>
    <div class="container">
      
      <!-- Cabeçalho -->
      <div class="header">
        <div class="user-info">
          <% if (user.avatarUrl) { %>
            <img class="avatar" src="<%= user.avatarUrl %>" alt="Avatar de <%= user.name %>">
          <% } else { %>
            <div class="avatar-fallback">
              <%= user.name.charAt(0).toUpperCase() %>
            </div>
          <% } %>
          <h1><%= user.name %></h1>
        </div>
        <p><strong><%= user.name %></strong> postou uma foto em que você aparece! 📸</p>
      </div>
      
      <!-- Imagem -->
      <div class="post-content">
        <img src="<%= media.imageUrl %>" alt="Foto do post">
      </div>
      
      <!-- Call-to-Action -->
      <div class="cta">
        <a class="btn" href="http://computacao.unir.br/mural/?post=<%= post.id %>">Ver Foto</a>
      </div>
      
      <!-- Rodapé -->
      <div class="footer">
        <p>Este email foi enviado automaticamente. Por favor, não responda.</p>
        <p>Sua Equipe © <%= new Date().getFullYear() %></p>
      </div>

    </div>
  </body>
</html>
`;
