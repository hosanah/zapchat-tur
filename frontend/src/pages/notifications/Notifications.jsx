import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle } from 'lucide-react';

const Notifications = () => {
  const { showError, showSuccess } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.list();
      const data = res.data?.notifications || res.data?.data || res.notifications || [];
      setNotifications(data);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
      window.dispatchEvent(new CustomEvent('notifications:update'));
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      showSuccess('Notificação marcada como lida');
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      window.dispatchEvent(new CustomEvent('notifications:update'));
    } catch (err) {
      console.error(err);
      showError('Erro ao marcar como lida');
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minutos atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} horas atrás`;
    const days = Math.floor(hours / 24);
    return `${days} dias atrás`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600">Acompanhe suas notificações recentes</p>
        </div>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-card p-6 space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhuma notificação.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="flex justify-between items-start border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex-1">
                  <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>{n.message || n.title}</p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-zapchat-medium hover:text-zapchat-dark text-sm flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Marcar como lida</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
