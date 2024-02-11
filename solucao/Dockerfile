# Use a imagem oficial do Node.js como base
FROM node:17

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o código-fonte da aplicação para o diretório de trabalho
COPY . .

# Exponha a porta em que a aplicação estará disponível (por exemplo, 3000)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]