import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../app/store/store';
import {
  fetchUsers,
  deleteUser,
  selectAllUsers,
  selectUsersLoading,
  selectUsersError
} from '../../../app/store/states/user.slice';
import { toggleUserStatus, updateUserRole, updateUserNames } from '../../../infrastructure/user.service';
import Tooltip from '../toolTip/Tooltip';
import EditAssignmentsModal from '../userForm/EditAssignmentsModal';

interface ConfirmModalState {
  isOpen: boolean;
  type: 'toggle' | 'role' | 'delete' | null;
  userId: string;
  userName: string;
  currentValue: string | boolean;
}

interface EditModalState {
  isOpen: boolean;
  userId: string;
  firstName: string;
  lastName: string;
}

interface EditAssignmentsModalState {
  isOpen: boolean;
  userId: string;
  userName: string;
  userRole: string;
}

interface UserTableProps {
  onEditUser?: (userId: string) => void;
  currentUserId?: string;
}

const UserTable = ({ currentUserId }: UserTableProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectUsersLoading);
  const error = useSelector(selectUsersError);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: null,
    userId: '',
    userName: '',
    currentValue: ''
  });

  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    userId: '',
    firstName: '',
    lastName: ''
  });

  const [editAssignmentsModal, setEditAssignmentsModal] = useState<EditAssignmentsModalState>({
    isOpen: false,
    userId: '',
    userName: '',
    userRole: ''
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = (user as any).displayName ||
      `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim();
    return (
      displayName.toLowerCase().includes(searchLower) ||
      (user.email?.toLowerCase().includes(searchLower)) ||
      ((user as any).role?.toLowerCase().includes(searchLower))
    );
  });

  const openConfirmModal = (
    type: 'toggle' | 'role' | 'delete',
    userId: string,
    userName: string,
    currentValue: string | boolean
  ) => {
    setConfirmModal({ isOpen: true, type, userId, userName, currentValue });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: null, userId: '', userName: '', currentValue: '' });
  };

  const openEditModal = (userId: string, firstName: string, lastName: string) => {
    setEditModal({ isOpen: true, userId, firstName, lastName });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, userId: '', firstName: '', lastName: '' });
  };

  const openEditAssignmentsModal = (userId: string, userName: string, userRole: string) => {
    setEditAssignmentsModal({ isOpen: true, userId, userName, userRole });
  };

  const closeEditAssignmentsModal = () => {
    setEditAssignmentsModal({ isOpen: false, userId: '', userName: '', userRole: '' });
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      if (confirmModal.type === 'toggle') {
        const newStatus = !(confirmModal.currentValue as boolean);
        await toggleUserStatus(confirmModal.userId, newStatus);
        dispatch(fetchUsers());
      } else if (confirmModal.type === 'role') {
        const newRole = confirmModal.currentValue === 'Coordinador' ? 'Docente' : 'Coordinador';
        await updateUserRole(confirmModal.userId, newRole, true);
        dispatch(fetchUsers());
      } else if (confirmModal.type === 'delete') {
        await dispatch(deleteUser(confirmModal.userId)).unwrap();
      }
      closeConfirmModal();
    } catch (err) {
      console.error('Error en accion:', err);
      alert('Error al realizar la accion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editModal.firstName.trim() || !editModal.lastName.trim()) {
      alert('Nombre y apellido son requeridos');
      return;
    }
    setActionLoading(true);
    try {
      await updateUserNames(editModal.userId, editModal.firstName.trim(), editModal.lastName.trim());
      dispatch(fetchUsers());
      closeEditModal();
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al actualizar el usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const getConfirmMessage = () => {
    if (confirmModal.type === 'toggle') {
      const action = confirmModal.currentValue ? 'inhabilitar' : 'habilitar';
      return `¿Desea ${action} al usuario "${confirmModal.userName}"?`;
    }
    if (confirmModal.type === 'role') {
      const newRole = confirmModal.currentValue === 'Coordinador' ? 'Docente' : 'Coordinador';
      return `¿Cambiar rol de "${confirmModal.userName}" a ${newRole}? Las asignaciones actuales se eliminaran.`;
    }
    if (confirmModal.type === 'delete') {
      return `¿Eliminar permanentemente al usuario "${confirmModal.userName}"? Esta accion no se puede deshacer.`;
    }
    return '';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 h-full flex flex-col overflow-hidden">
        {/* Header skeleton */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded-lg w-36 animate-pulse"></div>
              <div className="h-3 bg-gray-100 rounded w-28 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-100 rounded-xl w-72 animate-pulse"></div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="flex-1 overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 grid grid-cols-12 gap-4">
            <div className="col-span-5 h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="col-span-2 h-3 bg-gray-200 rounded w-10 animate-pulse"></div>
            <div className="col-span-2 h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            <div className="col-span-3 h-3 bg-gray-200 rounded w-16 animate-pulse ml-auto"></div>
          </div>

          {/* Table rows */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-50 grid grid-cols-12 gap-4 items-center">
              {/* Usuario */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-40 animate-pulse"></div>
                </div>
              </div>
              {/* Rol */}
              <div className="col-span-2">
                <div className="h-6 bg-gray-100 rounded-full w-20 animate-pulse"></div>
              </div>
              {/* Estado */}
              <div className="col-span-2">
                <div className="h-6 bg-gray-100 rounded-full w-16 animate-pulse"></div>
              </div>
              {/* Acciones */}
              <div className="col-span-3 flex justify-end gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 h-full flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar usuarios</h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchUsers())}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 h-full">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lista de Usuarios</h3>
            <p className="text-sm text-gray-500">{users.length} usuarios registrados</p>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-72 bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabla - Flex-1 para ocupar espacio disponible */}
      {filteredUsers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 font-medium">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Agrega un nuevo usuario para comenzar'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const firstName = (user as any).firstName || '';
                const lastName = (user as any).lastName || '';
                const displayName = (user as any).displayName ||
                  `${firstName} ${lastName}`.trim() || 'Sin nombre';
                const isActive = (user as any).isActive !== false;
                const role = (user as any).role || 'Sin rol';
                const initial = displayName.charAt(0).toUpperCase();

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors ${!isActive ? 'opacity-60' : ''}`}
                  >
                    {/* Usuario */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                          ${role === 'Coordinador' ? 'bg-purple-500' : 'bg-blue-500'}
                        `}>
                          {initial}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{displayName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${role === 'Coordinador'
                          ? 'bg-purple-100 text-purple-800'
                          : role === 'Docente'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {role === 'Coordinador' && (
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {role}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Editar nombre */}
                        <Tooltip text="Editar nombre" position="top">
                          <button
                            onClick={() => openEditModal(user.id!, firstName, lastName)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </Tooltip>

                        {/* Editar asignaciones - Solo para Docentes o Coordinadores que dan clases */}
                        {(role === 'Docente' || (role === 'Coordinador' && (user as any).willTeach)) && (
                          <Tooltip text="Editar asignaciones" position="top">
                            <button
                              onClick={() => openEditAssignmentsModal(user.id!, displayName, role)}
                              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                              </svg>
                            </button>
                          </Tooltip>
                        )}

                        {/* Cambiar rol */}
                        <Tooltip text="Cambiar rol" position="top">
                          <button
                            onClick={() => openConfirmModal('role', user.id!, displayName, role)}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                        </Tooltip>

                        {/* Toggle estado */}
                        <Tooltip text={isActive ? 'Inhabilitar' : 'Habilitar'} position="top">
                          <button
                            onClick={() => openConfirmModal('toggle', user.id!, displayName, isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              isActive
                                ? 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'
                                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {isActive ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        </Tooltip>

                        {/* Eliminar */}
                        {user.id !== currentUserId && (
                          <Tooltip text="Eliminar usuario" position="top">
                            <button
                              onClick={() => openConfirmModal('delete', user.id!, displayName, '')}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación - Mejorado UI/UX */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header con color contextual */}
            <div className={`px-6 py-4 ${
              confirmModal.type === 'delete'
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : confirmModal.type === 'toggle'
                ? confirmModal.currentValue
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {confirmModal.type === 'delete' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  ) : confirmModal.type === 'toggle' ? (
                    confirmModal.currentValue ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {confirmModal.type === 'delete'
                    ? 'Eliminar Usuario'
                    : confirmModal.type === 'toggle'
                    ? confirmModal.currentValue ? 'Inhabilitar Usuario' : 'Habilitar Usuario'
                    : 'Cambiar Rol'}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-600 leading-relaxed">{getConfirmMessage()}</p>

              {/* Warning para eliminar */}
              {confirmModal.type === 'delete' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">Esta acción eliminará permanentemente los datos del usuario.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                disabled={actionLoading}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-5 py-2.5 text-white rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm ${
                  confirmModal.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                    : confirmModal.type === 'toggle'
                    ? confirmModal.currentValue
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                      : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                }`}
              >
                {actionLoading && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {confirmModal.type === 'delete'
                  ? 'Sí, eliminar'
                  : confirmModal.type === 'toggle'
                  ? confirmModal.currentValue ? 'Inhabilitar' : 'Habilitar'
                  : 'Cambiar rol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición - Mejorado UI/UX */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Editar Usuario</h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={editModal.firstName}
                  onChange={(e) => setEditModal({ ...editModal, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Ingrese el nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <input
                  type="text"
                  value={editModal.lastName}
                  onChange={(e) => setEditModal({ ...editModal, lastName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                  placeholder="Ingrese el apellido"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                disabled={actionLoading}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm shadow-blue-200"
              >
                {actionLoading && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de asignaciones */}
      {editAssignmentsModal.isOpen && (
        <EditAssignmentsModal
          userId={editAssignmentsModal.userId}
          userName={editAssignmentsModal.userName}
          userRole={editAssignmentsModal.userRole}
          onClose={closeEditAssignmentsModal}
          onSuccess={() => {
            dispatch(fetchUsers());
          }}
        />
      )}
    </div>
  );
};

export default UserTable;
