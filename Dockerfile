# ================================
# Etapa base: Node para build
# ================================
FROM node:18-alpine AS base

# Instalar dependências do sistema para compilar libs nativas
RUN apk add --no-cache python3 make g++

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração do Angular (dentro de frontend/)
COPY frontend/package*.json ./frontend/

# Instalar dependências dentro da pasta correta
WORKDIR /app/frontend
RUN npm install --force

# ================================
# Etapa de build
# ================================
FROM base AS build

# Copiar todo o código do frontend
COPY frontend/ /app/frontend/

WORKDIR /app/frontend

# Rodar build do Angular
RUN npx ng build --configuration production

# ================================
# Etapa final: Nginx para servir a aplicação
# ================================
FROM nginx:alpine AS production

# Copiar build para o Nginx
COPY --from=build /app/frontend/dist/frontend /usr/share/nginx/html

# Configuração SPA Angular no Nginx
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Porta exposta
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
