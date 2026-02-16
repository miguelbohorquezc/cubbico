/**
 * @fileoverview Formulario para asignar activos tecnológicos a usuarios
 * @module presentation/features/techAssets/components/AssetAssignmentForm
 */

import React, { useState, useEffect } from 'react';
import { Input, Select, Button } from '../../../components/ui';
import { TechAsset } from '../../../../domain/entities/techAsset';
import { createAssignment, checkActiveAssignment } from '../../../../infrastructure/assetAssignment.service';
import { updateTechAsset } from '../../../../infrastructure/techAsset.service';
import { fetchStudents } from '../../../../infrastructure/student.service';
import { getUsers } from '../../../../infrastructure/user.service';
import { Student } from '../../../components/notes/types';
import { UserProfile } from '../../../../domain/entities/userFormData';
import Toast from '../../../components/common/Toast';

/**
 * Datos del formulario de asignación
 */
interface AssignmentFormData {
  assetId: string;
  userId: string;
  userType: 'estudiante' | 'profesor' | '';
  fechaEntrega: string;
  quienEntrega: string;
  observaciones: string;
}

/**
 * Props del formulario
 */
export interface AssetAssignmentFormProps {
  /** Lista de activos disponibles */
  availableAssets?: TechAsset[];
  /** Callback cuando se guarda exitosamente */
  onSuccess?: () => void;
  /** Callback para cancelar */
  onCancel?: () => void;
  /** Mostrar botón cancelar */
  showCancelButton?: boolean;
  /** Nombre del usuario actual (quien entrega) */
  currentUserName?: string;
}

/**
 * Componente de formulario para asignar activos
 */
const AssetAssignmentForm: React.FC<AssetAssignmentFormProps> = ({
  availableAssets = [],
  onSuccess,
  onCancel,
  showCancelButton = true,
  currentUserName = 'Administrador',
}) => {
  console.log('🎯 AssetAssignmentForm recibió availableAssets:', availableAssets);
  console.log('📊 Cantidad de activos disponibles:', availableAssets.length);

  // Estado del formulario
  const [formData, setFormData] = useState<AssignmentFormData>({
    assetId: '',
    userId: '',
    userType: '',
    fechaEntrega: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    quienEntrega: currentUserName,
    observaciones: '',
  });

  // Estado de datos
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<TechAsset | null>(null);

  // Estado de validación
  const [errors, setErrors] = useState<Partial<Record<keyof AssignmentFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AssignmentFormData, boolean>>>({});

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  /**
   * Cargar estudiantes y profesores al montar el componente
   */
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const [studentsData, usersData] = await Promise.all([
          fetchStudents(),
          getUsers()
        ]);

        // Filtrar solo estudiantes activos
        const activeStudents = studentsData.filter(s => s.status === 'activo' || !s.status);
        setStudents(activeStudents);

        // Filtrar solo usuarios tipo Docente
        const teacherUsers = usersData.filter(u => u.role === 'Docente');
        setTeachers(teacherUsers);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        showToast('Error al cargar la lista de usuarios', 'error');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  /**
   * Opciones para el select de activos
   */
  const assetOptions = availableAssets.map(asset => ({
    value: asset.id,
    label: `${asset.tipo} - ${asset.marca} ${asset.modelo} (Serial: ${asset.serial})`
  }));

  /**
   * Opciones para el select de tipo de usuario
   */
  const userTypeOptions = [
    { value: 'estudiante', label: 'Estudiante' },
    { value: 'profesor', label: 'Profesor' },
  ];

  /**
   * Opciones para el select de usuario (filtradas por tipo)
   */
  const getUserOptions = () => {
    if (!formData.userType) {
      return [];
    }

    if (formData.userType === 'estudiante') {
      return students.map(student => ({
        value: student.id,
        label: `${student.name} ${student.lastName} - ${student.className}`
      }));
    }

    if (formData.userType === 'profesor') {
      return teachers.map(teacher => ({
        value: teacher.id,
        label: `${teacher.displayName} (Docente)`
      }));
    }

    return [];
  };

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Si cambia el tipo de usuario, limpiar el usuario seleccionado
    if (name === 'userType') {
      setFormData(prev => ({ ...prev, [name]: value, userId: '' }));
    } else if (name === 'assetId') {
      // Guardar el activo seleccionado
      const asset = availableAssets.find(a => a.id === value);
      setSelectedAsset(asset || null);
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof AssignmentFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Maneja blur en los campos
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name as keyof AssignmentFormData);
  };

  /**
   * Valida un campo específico
   */
  const validateField = (fieldName: keyof AssignmentFormData): boolean => {
    let error = '';

    switch (fieldName) {
      case 'assetId':
        if (!formData.assetId) {
          error = 'Debe seleccionar un activo';
        }
        break;
      case 'userType':
        if (!formData.userType) {
          error = 'Debe seleccionar el tipo de usuario';
        }
        break;
      case 'userId':
        if (!formData.userId) {
          error = 'Debe seleccionar un usuario';
        }
        break;
      case 'fechaEntrega':
        if (!formData.fechaEntrega) {
          error = 'La fecha de entrega es requerida';
        }
        break;
      case 'quienEntrega':
        if (!formData.quienEntrega.trim()) {
          error = 'Debe especificar quién entrega el activo';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return !error;
  };

  /**
   * Valida todo el formulario
   */
  const validateForm = (): boolean => {
    const fieldsToValidate: (keyof AssignmentFormData)[] = [
      'assetId',
      'userType',
      'userId',
      'fechaEntrega',
      'quienEntrega'
    ];
    const validations = fieldsToValidate.map(field => validateField(field));

    // Marcar todos los campos como touched
    setTouched({
      assetId: true,
      userType: true,
      userId: true,
      fechaEntrega: true,
      quienEntrega: true,
      observaciones: true,
    });

    return validations.every(isValid => isValid);
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      showToast('Por favor, corrija los errores en el formulario', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Verificar que el activo no tenga asignación activa
      const hasActiveAssignment = await checkActiveAssignment(formData.assetId);
      if (hasActiveAssignment) {
        showToast('Este activo ya tiene una asignación activa', 'error');
        setIsSubmitting(false);
        return;
      }

      // Obtener datos del activo seleccionado
      if (!selectedAsset) {
        throw new Error('No se encontró el activo seleccionado');
      }

      // Obtener datos del usuario seleccionado
      console.log('🔍 Buscando usuario con ID:', formData.userId);
      console.log('📚 Tipo de usuario:', formData.userType);
      console.log('👥 Total de profesores disponibles:', teachers.length);
      console.log('🎓 Total de estudiantes disponibles:', students.length);

      let userName = '';
      if (formData.userType === 'estudiante') {
        const student = students.find(s => s.id === formData.userId);
        console.log('👨‍🎓 Estudiante encontrado:', student);
        userName = student ? `${student.name} ${student.lastName}` : 'Usuario no encontrado';
      } else {
        console.log('🔎 Buscando en teachers con IDs:', teachers.map(t => ({ id: t.id, name: t.displayName })));
        const teacher = teachers.find(t => t.id === formData.userId);
        console.log('👨‍🏫 Profesor encontrado:', teacher);
        userName = teacher ? teacher.displayName : 'Usuario no encontrado';
        console.log('📝 Nombre a guardar:', userName);
      }

      // Crear la asignación
      await createAssignment({
        assetId: selectedAsset.id,
        assetSerial: selectedAsset.serial,
        assetTipo: selectedAsset.tipo,
        assetMarca: selectedAsset.marca,
        assetModelo: selectedAsset.modelo,
        userId: formData.userId,
        userName: userName,
        userType: formData.userType as 'estudiante' | 'profesor',
        fechaEntrega: new Date(formData.fechaEntrega),
        quienEntrega: formData.quienEntrega.trim(),
        estado: 'activa',
        observaciones: formData.observaciones.trim(),
      });

      // Actualizar el estado del activo a "asignado"
      await updateTechAsset(selectedAsset.id, {
        estado: 'asignado'
      });

      showToast(
        `Activo ${selectedAsset.tipo} ${selectedAsset.marca} asignado a ${userName} exitosamente`,
        'success'
      );

      // Llamar a onSuccess después de un pequeño delay para que se vea el toast
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);

    } catch (error) {
      console.error('Error al asignar activo:', error);
      showToast(
        error instanceof Error ? error.message : 'Error al asignar el activo. Por favor, intenta de nuevo.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Activo */}
          <div className="md:col-span-2">
            <Select
              name="assetId"
              label="Activo Tecnológico"
              placeholder={
                availableAssets.length === 0
                  ? 'No hay activos disponibles'
                  : 'Seleccione un activo'
              }
              options={assetOptions}
              value={formData.assetId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.assetId ? errors.assetId : undefined}
              required
              disabled={availableAssets.length === 0}
            />
            {availableAssets.length === 0 && (
              <div className="mt-1.5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 font-medium mb-1">
                  ⚠️ No hay activos disponibles para asignar
                </p>
                <p className="text-xs text-yellow-700">
                  Para asignar un activo, primero debes registrar uno con estado <strong>"Disponible"</strong> en la pestaña "Activos".
                </p>
              </div>
            )}
          </div>

          {/* Tipo de Usuario */}
          <Select
            name="userType"
            label="Tipo de Usuario"
            placeholder="Seleccione tipo de usuario"
            options={userTypeOptions}
            value={formData.userType}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.userType ? errors.userType : undefined}
            required
          />

          {/* Usuario */}
          <Select
            name="userId"
            label="Usuario"
            placeholder={
              loadingUsers
                ? 'Cargando usuarios...'
                : !formData.userType
                ? 'Primero seleccione tipo de usuario'
                : getUserOptions().length === 0
                ? 'No hay usuarios disponibles'
                : 'Seleccione un usuario'
            }
            options={getUserOptions()}
            value={formData.userId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.userId ? errors.userId : undefined}
            required
            disabled={!formData.userType || loadingUsers || getUserOptions().length === 0}
          />

          {/* Fecha de Entrega */}
          <Input
            name="fechaEntrega"
            label="Fecha de Entrega"
            type="date"
            value={formData.fechaEntrega}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.fechaEntrega ? errors.fechaEntrega : undefined}
            required
          />

          {/* Quien Entrega */}
          <Input
            name="quienEntrega"
            label="Quien Entrega"
            placeholder="Nombre del responsable"
            type="text"
            value={formData.quienEntrega}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.quienEntrega ? errors.quienEntrega : undefined}
            required
          />

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              placeholder="Ej: Activo entregado con cargador y mouse. Usuario firmó acta de responsabilidad."
              value={formData.observaciones}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
              className="
                w-full px-3 py-2
                border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-orchid-blue-60 focus:border-orchid-blue-60
                transition-colors duration-200
                resize-none
              "
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Información adicional sobre la asignación (accesorios entregados, condiciones, etc.)
            </p>
          </div>

          {/* Información del Activo Seleccionado */}
          {selectedAsset && (
            <div className="md:col-span-2 p-4 bg-orchid-blue-10 border border-orchid-blue-30 rounded-lg">
              <h4 className="text-sm font-semibold text-orchid-blue-70 mb-2">
                Información del Activo
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Tipo:</span>{' '}
                  <span className="font-medium text-gray-900">{selectedAsset.tipo}</span>
                </div>
                <div>
                  <span className="text-gray-600">Marca:</span>{' '}
                  <span className="font-medium text-gray-900">{selectedAsset.marca}</span>
                </div>
                <div>
                  <span className="text-gray-600">Modelo:</span>{' '}
                  <span className="font-medium text-gray-900">{selectedAsset.modelo}</span>
                </div>
                <div>
                  <span className="text-gray-600">Serial:</span>{' '}
                  <span className="font-medium text-gray-900">{selectedAsset.serial}</span>
                </div>
                {selectedAsset.observaciones && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Observaciones:</span>{' '}
                    <span className="font-medium text-gray-900">{selectedAsset.observaciones}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          {showCancelButton && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || availableAssets.length === 0}
          >
            Asignar Activo
          </Button>
        </div>
      </form>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
};

export default AssetAssignmentForm;
