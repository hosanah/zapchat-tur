import React, { useEffect, useState } from 'react';
import { settingService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Settings = () => {
  const { showSuccess, showError } = useToast();
  const [guidelines, setGuidelines] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingService.get();
        setGuidelines(res.data?.setting?.guidelines || '');
      } catch (err) {
        console.error(err);
        showError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await settingService.update({ guidelines });
      showSuccess('Configurações salvas');
    } catch (err) {
      console.error(err);
      showError('Erro ao salvar configurações');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea value={guidelines} onChange={(e) => setGuidelines(e.target.value)} />
      <button type="submit">Salvar</button>
    </form>
  );
};

export default Settings;
