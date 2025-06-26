import React, { useState, useEffect } from 'react';
import { userService, companyService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Edit, Trash2, CheckCircle, XCircle, X, Save } from 'lucide-react';

const Users = () => {
  const { user, isMaster } = useAuth();
  const { showSuccess, showError } = useToast();

  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    companyId: ''
  });

  useEffect(() => {
    loadUsers();
    if (isMaster()) {
      loadCompanies();
    }
  }, [currentPage, searchTerm, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined
      };
      const response = await userService.getAll(params);
      const { users: list = [], pagination } = response.data || {};
      setUsers(list);
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || list.length);
      } else {
        setTotalPages(1);
        setTotalItems(list.length);
      }
    } catch (err) {
      console.error(err);
      showError('Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await companyService.getAll();
      setCompanies(response.data.companies || []);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
      phone: '',
      companyId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (!isMaster()) submitData.companyId = user.companyId;
      if (editingUser) {
        if (!submitData.password) delete submitData.password;
        await userService.update(editingUser.id, submitData);
        showSuccess('Usuário atualizado com sucesso!');
      } else {
        await userService.create(submitData);
        showSuccess('Usuário criado com sucesso!');
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Erro ao salvar usuário';
      showError(msg);
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      password: '',
      role: u.role,
      phone: u.phone || '',
      companyId: u.company_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await userService.delete(id);
      showSuccess('Usuário excluído com sucesso!');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
      showError('Erro ao excluir usuário');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const current = users.find(u => u.id === id);
      await userService.updateStatus(id, !current.isActive);
      showSuccess('Status atualizado');
      setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      console.error(err);
      showError('Erro ao atualizar status');
    }
  };

  const filteredUsers = users;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
          <p className="text-sm text-gray-600">Total de registros: {totalItems}</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingUser(null); setShowModal(true); }}
          className="bg-zapchat-primary text-white px-4 py-2 rounded-md hover:bg-zapchat-medium transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">Todos os papéis</option>
            <option value="master">Master</option>
            <option value="admin">Admin</option>
            <option value="user">Usuário</option>
          </select>
          <button onClick={loadUsers} className="bg-zapchat-primary text-white px-4 py-2 rounded-md hover:bg-zapchat-medium">
            Filtrar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zapchat-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Nome</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Papel</th>
                <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 whitespace-nowrap">{u.firstName} {u.lastName}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{u.email}</td>
                  <td className="px-3 py-2 whitespace-nowrap capitalize">{u.role}</td>
                  <td className="px-3 py-2">
                    {u.isActive ? (
                      <span className="inline-flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600">
                        <XCircle className="h-4 w-4 mr-1" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm">
                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline mr-3">
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button onClick={() => handleToggleStatus(u.id)} className="text-yellow-600 hover:underline mr-3">
                      {u.isActive ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Anterior
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1
                    ? 'bg-zapchat-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Próxima
            </button>
          </nav>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Sobrenome"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                required={!editingUser}
              />
              <input
                type="text"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
              >
                <option value="user">Usuário</option>
                <option value="admin">Admin</option>
                <option value="master">Master</option>
              </select>
              {isMaster() && formData.role !== 'master' && (
                <select
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  required
                >
                  <option value="">Selecione a empresa</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded-md flex items-center">
                  <X className="w-4 h-4 mr-1" /> Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-zapchat-primary text-white rounded-md flex items-center">
                  <Save className="w-4 h-4 mr-1" /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
