# Usa a imagem oficial do Node.js como base
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração
COPY package.json yarn.lock ./

# Instala as dependências
RUN yarn install

# Copia o restante do código da aplicação
COPY . .

# Compila a aplicação
RUN yarn build

# Expõe a porta que o NestJS usará
EXPOSE 4000

# Define o comando padrão para iniciar a aplicação
CMD ["npm", "run", "start:prod:migrate"]

