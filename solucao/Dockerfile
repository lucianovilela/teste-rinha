# Etapa 1: Construir a imagem intermediária
FROM node:17 AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia o arquivo package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Realiza o build do projeto (substitua pelo seu comando de build específico)
#RUN npm run build

# Etapa 2: Criar a imagem final
FROM node:17

# Define o diretório de trabalho para a imagem final
WORKDIR /app

# Copia os arquivos construídos da imagem intermediária
COPY --from=builder /app .

# Define o comando para iniciar o aplicativo (substitua pelo seu comando específico)
CMD ["node", "index.js"]
