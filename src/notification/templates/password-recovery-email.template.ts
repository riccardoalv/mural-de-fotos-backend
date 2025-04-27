export const passwordRecoveryTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Recuperação de Senha</title>
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
      .header h1 {
        font-size: 24px;
        margin: 0;
        color: #262626;
      }
      .header p {
        font-size: 14px;
        color: #8e8e8e;
        margin: 5px 0 0;
      }
      .content {
        padding: 20px;
        text-align: center;
      }
      .btn {
        text-decoration: none;
        background-color: #3897f0;
        color: #fff;
        padding: 10px 20px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 14px;
        display: inline-block;
        margin-top: 20px;
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
        <h1>Recuperação de Senha</h1>
        <p>Você solicitou a redefinição da sua senha</p>
      </div>

      <!-- Conteúdo principal -->
      <div class="content">
        <p>Para redefinir sua senha, clique no botão abaixo:</p>
        <a class="btn" href="<%= recoveryUrl %>">Redefinir Senha</a>
        <p style="margin-top: 20px; font-size: 14px; color: #8e8e8e;">
          Se você não solicitou esta recuperação, ignore este e-mail.
        </p>
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
