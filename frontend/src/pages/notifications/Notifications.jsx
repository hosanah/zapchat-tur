import React, { useEffect, useState } from 'react';
import { notificationService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Notifications = () => {
  const { showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await notificationService.list();
      setItems(res.data?.notifications || []);
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
      showError('Erro ao marcar como lida');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <ul>
      {items.map((n) => (
        <li key={n.id}>
          <span>{n.content}</span>
          {!n.read && (
            <button onClick={() => markRead(n.id)}>Ler</button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Notifications;
