# Imagem base Node
FROM node:18-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache python3 make g++

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração
COPY frontend/package*.json ./

# Instalar dependências
RUN npm install --force

# Copiar o restante do código
COPY frontend/ ./

# Expõe a porta do Angular
EXPOSE 4200

# Comando para rodar em modo dev/serve
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
