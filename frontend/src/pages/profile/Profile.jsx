import React, { useEffect, useState } from 'react';
import { userService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const Profile = () => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await userService.getProfile();
        const user = res.data.user;
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
        });
      } catch (err) {
        showError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      showSuccess('Perfil atualizado');
    } catch (err) {
      showError('Erro ao atualizar perfil');
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="bg-white rounded-lg shadow-card p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Meu Perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sobrenome</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
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

export default Profile;
