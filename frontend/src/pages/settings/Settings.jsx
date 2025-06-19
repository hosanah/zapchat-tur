import React, { useEffect, useState } from 'react';
import { settingsService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const bufferToDataUrl = (buf, mime = 'image/png') => {
  try {
    const binary = String.fromCharCode(...buf);
    const base64 = window.btoa(binary);
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
};

const Settings = () => {
  const { showSuccess, showError } = useToast();
  const [guidelines, setGuidelines] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsService.get();
        const setting = res.data?.setting;
        if (setting) {
          setGuidelines(setting.guidelines || '');
          if (setting.logo) {
            if (typeof setting.logo === 'string') {
              setLogoPreview(setting.logo);
            } else if (setting.logo.data) {
              const url = bufferToDataUrl(setting.logo.data);
              if (url) setLogoPreview(url);
            }
          }
        }
      } catch (err) {

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
    load();
  }, [showError]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError('Envie apenas arquivos de imagem');
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
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
    if (guidelines.trim().length < 5) {
      showError('As diretrizes devem ter ao menos 5 caracteres');
      return;
    }
    try {
      await settingsService.update({
        logo: logoPreview || null,
        guidelines,
      });
      showSuccess('Configurações salvas');
    } catch (err) {
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações Gerais</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Logo</label>
          {logoPreview && (
            <img src={logoPreview} alt="Pré-visualização" className="h-24 mb-2 object-contain" />
          )}
          <Input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Diretrizes</label>
          <Textarea
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            rows={4}
          />
        </div>
        <div className="text-right">
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  );
};
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
      </form>)


export default Settings;
