import React, { useEffect, useState } from 'react';
import { settingService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Settings = () => {
  const { showError, showSuccess } = useToast();
  const [guidelines, setGuidelines] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingService.get();
        setGuidelines(res.data?.setting?.guidelines || '');
      } catch (err) {
        console.error(err);
        showError('Erro ao carregar configura\u00E7\u00F5es');
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
      showSuccess('Configura\u00E7\u00F5es salvas');
    } catch (err) {
      console.error(err);
      showError('Erro ao salvar configura\u00E7\u00F5es');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Diretrizes</label>
        <textarea
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-zapchat-medium text-white rounded">
        Salvar
      </button>
    </form>
  );
};

export default Settings;
