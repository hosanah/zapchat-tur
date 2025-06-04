import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';

const Events = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: ''
  });
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    all_day: false,
    location: '',
    type: 'passeio',
    status: 'agendado',
    priority: 'media',
    color: '#99CD85',
    reminder_minutes: 30,
    attendees: [],
    notes: '',
    trip_id: ''
  });
  const [trips, setTrips] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');

  // Configurações de cores por tipo
  const typeColors = {
    passeio: '#99CD85',
    manutencao: '#FF6B6B',
    reuniao: '#4ECDC4',
    treinamento: '#45B7D1',
    outros: '#96CEB4'
  };

  // Configurações de cores por status
  const statusColors = {
    agendado: '#FFA726',
    confirmado: '#66BB6A',
    em_andamento: '#42A5F5',
    concluido: '#26A69A',
    cancelado: '#EF5350'
  };

  useEffect(() => {
    fetchEvents();
    fetchTrips();
    if (user.role === 'master') {
      fetchCompanies();
    }
  }, [selectedCompany]);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (user.role === 'master' && selectedCompany) {
        params.company_id = selectedCompany;
      }
      
      const response = await api.get('/events', { params });
      const eventsData = response.data.data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_date,
        end: event.end_date,
        allDay: event.all_day,
        backgroundColor: event.color || typeColors[event.type],
        borderColor: event.color || typeColors[event.type],
        textColor: '#FFFFFF',
        extendedProps: {
          description: event.description,
          location: event.location,
          type: event.type,
          status: event.status,
          priority: event.priority,
          reminder_minutes: event.reminder_minutes,
          attendees: event.attendees,
          notes: event.notes,
          trip: event.trip,
          creator: event.creator,
          company: event.company
        }
      }));
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      showError('Erro ao carregar lista de eventos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const params = {};
      if (user.role === 'master' && selectedCompany) {
        params.company_id = selectedCompany;
      }
      
      const response = await api.get('/trips', { params });
      setTrips(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar passeios:', error);
      showError('Erro ao carregar lista de passeios');
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const applyFilters = () => {
    let filtered = events;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.extendedProps.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.extendedProps.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros por tipo, status e prioridade
    if (filters.type) {
      filtered = filtered.filter(event => event.extendedProps.type === filters.type);
    }
    if (filters.status) {
      filtered = filtered.filter(event => event.extendedProps.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(event => event.extendedProps.priority === filters.priority);
    }

    setFilteredEvents(filtered);
  };

  const handleDateSelect = (selectInfo) => {
    setFormData({
      ...formData,
      start_date: selectInfo.startStr,
      end_date: selectInfo.endStr,
      all_day: selectInfo.allDay
    });
    setModalMode('create');
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start_date: event.start,
      end_date: event.end,
      all_day: event.allDay,
      ...event.extendedProps
    });
    setModalMode('view');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
      };

      if (modalMode === 'create') {
        await api.post('/events', eventData);
        showSuccess('Evento criado com sucesso!');
      } else if (modalMode === 'edit') {
        await api.put(`/events/${selectedEvent.id}`, eventData);
        showSuccess('Evento atualizado com sucesso!');
      }

      setShowModal(false);
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar evento';
      showError(errorMessage);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await api.delete(`/events/${eventId}`);
        showSuccess('Evento excluído com sucesso!');
        setShowModal(false);
        fetchEvents();
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao excluir evento';
        showError(errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      all_day: false,
      location: '',
      type: 'passeio',
      status: 'agendado',
      priority: 'media',
      color: '#99CD85',
      reminder_minutes: 30,
      attendees: [],
      notes: '',
      trip_id: ''
    });
  };

  const openEditModal = () => {
    setFormData({
      title: selectedEvent.title,
      description: selectedEvent.description || '',
      start_date: new Date(selectedEvent.start_date).toISOString().slice(0, 16),
      end_date: selectedEvent.end_date ? new Date(selectedEvent.end_date).toISOString().slice(0, 16) : '',
      all_day: selectedEvent.all_day,
      location: selectedEvent.location || '',
      type: selectedEvent.type,
      status: selectedEvent.status,
      priority: selectedEvent.priority,
      color: selectedEvent.color || '#99CD85',
      reminder_minutes: selectedEvent.reminder_minutes || 30,
      attendees: selectedEvent.attendees || [],
      notes: selectedEvent.notes || '',
      trip_id: selectedEvent.trip?.id || ''
    });
    setModalMode('edit');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'agendado': return <Clock className="w-4 h-4" />;
      case 'confirmado': return <CheckCircle className="w-4 h-4" />;
      case 'em_andamento': return <Play className="w-4 h-4" />;
      case 'concluido': return <CheckCircle className="w-4 h-4" />;
      case 'cancelado': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluido': return 'bg-teal-100 text-teal-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'baixa': return 'bg-gray-100 text-gray-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zapchat-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-zapchat-primary to-zapchat-medium p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Agenda de Eventos</h1>
              <p className="text-zapchat-light">Gerencie eventos e compromissos relacionados aos passeios</p>
            </div>
          </div>
          <button
            onClick={() => {
              setModalMode('create');
              setSelectedEvent(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-white text-zapchat-primary px-4 py-2 rounded-lg font-medium hover:bg-zapchat-light transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por Tipo */}
          <div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
            >
              <option value="">Todos os tipos</option>
              <option value="passeio">Passeio</option>
              <option value="manutencao">Manutenção</option>
              <option value="reuniao">Reunião</option>
              <option value="treinamento">Treinamento</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="confirmado">Confirmado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Filtro por Prioridade */}
          <div>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
            >
              <option value="">Todas as prioridades</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          {/* Filtro por Empresa (apenas para master) */}
          {user.role === 'master' && (
            <div>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
              >
                <option value="">Todas as empresas</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Controles de Visualização */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCalendarView('dayGridMonth')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              calendarView === 'dayGridMonth' 
                ? 'bg-zapchat-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setCalendarView('timeGridWeek')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              calendarView === 'timeGridWeek' 
                ? 'bg-zapchat-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setCalendarView('timeGridDay')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              calendarView === 'timeGridDay' 
                ? 'bg-zapchat-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setCalendarView('listWeek')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              calendarView === 'listWeek' 
                ? 'bg-zapchat-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={calendarView}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={filteredEvents}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          locale="pt-br"
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            list: 'Lista'
          }}
          eventDisplay="block"
          displayEventTime={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          allDayText="Dia inteiro"
          noEventsText="Nenhum evento para exibir"
          moreLinkText="mais"
          key={calendarView}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header do Modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' && 'Novo Evento'}
                  {modalMode === 'edit' && 'Editar Evento'}
                  {modalMode === 'view' && 'Detalhes do Evento'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {modalMode === 'view' ? (
                /* Visualização do Evento */
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                    {selectedEvent.description && (
                      <p className="text-gray-600 mt-1">{selectedEvent.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data/Hora de Início
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedEvent.start_date).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    {selectedEvent.end_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data/Hora de Fim
                        </label>
                        <p className="text-gray-900">
                          {new Date(selectedEvent.end_date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    )}

                    {selectedEvent.location && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Local
                        </label>
                        <p className="text-gray-900">{selectedEvent.location}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zapchat-light text-zapchat-dark">
                        {selectedEvent.type}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                        {getStatusIcon(selectedEvent.status)}
                        <span className="ml-1">{selectedEvent.status}</span>
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedEvent.priority)}`}>
                        {selectedEvent.priority}
                      </span>
                    </div>
                  </div>

                  {selectedEvent.trip && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passeio Relacionado
                      </label>
                      <p className="text-gray-900">{selectedEvent.trip.title}</p>
                      <p className="text-gray-600 text-sm">{selectedEvent.trip.destination}</p>
                    </div>
                  )}

                  {selectedEvent.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <p className="text-gray-900">{selectedEvent.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={openEditModal}
                      className="bg-zapchat-primary text-white px-4 py-2 rounded-lg hover:bg-zapchat-medium transition-colors flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedEvent.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulário de Criação/Edição */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                        placeholder="Digite o título do evento"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                        placeholder="Descrição do evento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data/Hora de Início *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data/Hora de Fim
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Local
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                        placeholder="Local do evento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                      >
                        <option value="passeio">Passeio</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="reuniao">Reunião</option>
                        <option value="treinamento">Treinamento</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                      >
                        <option value="agendado">Agendado</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passeio Relacionado
                      </label>
                      <select
                        value={formData.trip_id}
                        onChange={(e) => setFormData({ ...formData, trip_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                      >
                        <option value="">Nenhum passeio</option>
                        {trips.map(trip => (
                          <option key={trip.id} value={trip.id}>
                            {trip.title} - {trip.destination}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor
                      </label>
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lembrete (minutos antes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reminder_minutes}
                        onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.all_day}
                          onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                          className="rounded border-gray-300 text-zapchat-primary focus:ring-zapchat-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Evento de dia inteiro</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zapchat-primary focus:border-transparent"
                        placeholder="Observações adicionais"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-zapchat-primary text-white px-4 py-2 rounded-lg hover:bg-zapchat-medium transition-colors"
                    >
                      {modalMode === 'create' ? 'Criar Evento' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

