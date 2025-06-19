import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Settings = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    logo: '',
    guidelines: ''
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsService.get();
        const setting = res.data.setting || {};
        setFormData({
          logo: setting.logo || '',
          guidelines: setting.guidelines || ''
        });
      } catch (err) {
        console.error(err);
        showError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [showError]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo' && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await settingsService.update(formData);
      showSuccess('Configurações salvas');
    } catch (err) {
      console.error(err);
      showError('Erro ao salvar configurações');
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-card p-6">
      <h2 className="text-xl font-bold mb-4">Configurações</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Logo</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleChange}
          />
          {formData.logo && (
            <img src={formData.logo} alt="Logo" className="h-20 mt-2" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Diretrizes</label>
          <textarea
            name="guidelines"
            value={formData.guidelines}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={6}
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="px-4 py-2 bg-zapchat-medium text-white rounded"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
