# 📦 Instruções de Instalação - Módulo de Eventos

## 🚀 **Dependências Necessárias**

### **Frontend - FullCalendar**
Execute no diretório `frontend/`:

```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list --legacy-peer-deps
```

### **Backend - Sem dependências adicionais**
Todas as dependências já estão incluídas no projeto.

## 📁 **Arquivos Incluídos**

### **Novos Arquivos (Backend)**
- `backend/src/models/Event.js` - Modelo de eventos
- `backend/src/controllers/EventController.js` - Controlador CRUD
- `backend/src/middleware/eventValidations.js` - Validações
- `backend/src/routes/events.js` - Rotas da API

### **Novos Arquivos (Frontend)**
- `frontend/src/pages/events/Events.jsx` - Página do calendário

### **Arquivos Modificados (Backend)**
- `backend/src/models/index.js` - Relacionamentos adicionados
- `backend/src/server.js` - Rotas de eventos registradas

### **Arquivos Modificados (Frontend)**
- `frontend/src/App.jsx` - Rota /events adicionada
- `frontend/src/components/layout/ModernLayout.jsx` - Menu de eventos

## 🔧 **Como Aplicar**

1. **Extrair** o ZIP na pasta do projeto
2. **Copiar** os arquivos para suas respectivas pastas
3. **Instalar** as dependências do FullCalendar
4. **Reiniciar** os servidores (backend e frontend)

## 🎯 **Resultado**

Após aplicar os arquivos, o sistema terá:
- ✅ **Módulo de eventos** completo
- ✅ **Interface de calendário** moderna
- ✅ **CRUD completo** funcionando
- ✅ **Filtros por empresa** implementados
- ✅ **Navegação** atualizada com link "Eventos"

## 🔗 **Acesso**

Após login, acesse: **Menu → Eventos**

