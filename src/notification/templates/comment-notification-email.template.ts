export const emailTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Novo Comentário no Seu Post</title>
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
      .post-content {
        position: relative;
      }
      .post-content img {
        width: 100%;
        display: block;
      }
      .comment-box {
        padding: 15px 20px;
      }
      .comment-box .comment-text {
        font-size: 16px;
        line-height: 1.5;
        margin: 0 0 10px;
      }
      .comment-box .icons {
        font-size: 18px;
        color: #ed4956;
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
      <!-- Cabeçalho com informações do usuário -->
      <div class="header">
        <div class="user-info">
          <% if (comment.post.user.avatarUrl) { %>
            <img class="avatar" src="<%= comment.post.user.avatarUrl %>" alt="Avatar de <%= comment.post.user.name %>">
          <% } else { %>
            <div class="avatar-fallback">
              <%= comment.post.user.name.charAt(0).toUpperCase() %>
            </div>
          <% } %>
          <h1><%= comment.post.user.name %></h1>
        </div>
        <p>Você recebeu um novo comentário! <span>&#128172;</span></p>
      </div>
      
      <!-- Imagem do post -->
      <div class="post-content">
        <% if (comment.post.imageUrl) { %>
          <img src="http://computacao.unir.br/mural/api/posts/<%= comment.post.id %>/download-image" alt="Imagem do post">
        <% } else { %>
          <p style="padding: 20px; text-align: center;">Sem imagem no post</p>
        <% } %>
      </div>
      
      <!-- Comentário -->
      <div class="comment-box">
        <p class="comment-text">“<%= comment.content %>”</p>
        <div class="icons">
          <span title="Curtir">&#10084;</span>
          &nbsp;&nbsp;
          <span title="Comentar">&#128172;</span>
        </div>
      </div>
      
      <!-- Call-to-Action -->
      <div class="cta">
        <a class="btn" href="http://computacao.unir.br/mural/?post=<%= comment.post.id %>">Visualizar Post</a>
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
