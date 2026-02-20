/**
 * @fileoverview Formulario para crear/editar activos tecnológicos
 * @module presentation/features/techAssets/components/TechAssetForm
 */

import React, { useState } from 'react';
import { Input, Select, Button } from '../../../components/ui';
import { AssetType, AssetStatus } from '../../../../domain/entities/techAsset';
import {
  addTechAsset,
  updateTechAsset,
  checkSerialExists
} from '../../../../infrastructure/techAsset.service';
import Toast from '../../../components/common/Toast';

/**
 * Datos del formulario de activo tecnológico
 */
interface TechAssetFormData {
  tipo: AssetType | '';
  marca: string;
  modelo: string;
  serial: string;
  estado: AssetStatus;
  observaciones: string;
}

/**
 * Props del formulario
 */
export interface TechAssetFormProps {
  /** Modo del formulario: crear o editar */
  mode?: 'create' | 'edit';
  /** Datos iniciales para edición */
  initialData?: {
    id: string;
    tipo: AssetType;
    marca: string;
    modelo: string;
    serial: string;
    estado: AssetStatus;
    observaciones?: string;
  };
  /** Callback cuando se guarda exitosamente */
  onSuccess?: () => void;
  /** Callback para cancelar */
  onCancel?: () => void;
  /** Mostrar botón cancelar */
  showCancelButton?: boolean;
}

/**
 * Opciones para el select de tipo de activo
 */
const ASSET_TYPE_OPTIONS = [
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Proyector', label: 'Proyector' },
  { value: 'Cargador', label: 'Cargador' },
  { value: 'Mouse', label: 'Mouse' },
  { value: 'Teclado', label: 'Teclado' },
  { value: 'Audífonos', label: 'Audífonos' },
  { value: 'Cámara Web', label: 'Cámara Web' },
  { value: 'Parlante', label: 'Parlante' },
  { value: 'Otro', label: 'Otro' },
];

/**
 * Opciones para el select de estado
 */
const ASSET_STATUS_OPTIONS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'asignado', label: 'Asignado' },
  { value: 'mantenimiento', label: 'En Mantenimiento' },
  { value: 'dado_de_baja', label: 'Dado de Baja' },
];

/**
 * Componente de formulario para activos tecnológicos
 */
const TechAssetForm: React.FC<TechAssetFormProps> = ({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
  showCancelButton = true,
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState<TechAssetFormData>({
    tipo: initialData?.tipo || '',
    marca: initialData?.marca || '',
    modelo: initialData?.modelo || '',
    serial: initialData?.serial || '',
    estado: initialData?.estado || 'disponible',
    observaciones: initialData?.observaciones || '',
  });

  // Estado de validación
  const [errors, setErrors] = useState<Partial<Record<keyof TechAssetFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TechAssetFormData, boolean>>>({});

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
   * Maneja cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof TechAssetFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Maneja blur en los campos
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name as keyof TechAssetFormData);
  };

  /**
   * Valida un campo específico
   */
  const validateField = (fieldName: keyof TechAssetFormData): boolean => {
    let error = '';

    switch (fieldName) {
      case 'tipo':
        if (!formData.tipo) {
          error = 'El tipo de activo es requerido';
        }
        break;
      case 'marca':
        if (!formData.marca.trim()) {
          error = 'La marca es requerida';
        } else if (formData.marca.trim().length < 2) {
          error = 'La marca debe tener al menos 2 caracteres';
        }
        break;
      case 'modelo':
        if (!formData.modelo.trim()) {
          error = 'El modelo es requerido';
        } else if (formData.modelo.trim().length < 2) {
          error = 'El modelo debe tener al menos 2 caracteres';
        }
        break;
      case 'serial':
        if (!formData.serial.trim()) {
          error = 'El número de serie es requerido';
        } else if (formData.serial.trim().length < 3) {
          error = 'El número de serie debe tener al menos 3 caracteres';
        }
        break;
      case 'estado':
        if (!formData.estado) {
          error = 'El estado es requerido';
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
    const fieldsToValidate: (keyof TechAssetFormData)[] = ['tipo', 'marca', 'modelo', 'serial', 'estado'];
    const validations = fieldsToValidate.map(field => validateField(field));

    // Marcar todos los campos como touched
    setTouched({
      tipo: true,
      marca: true,
      modelo: true,
      serial: true,
      estado: true,
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
      if (mode === 'create') {
        // Verificar si el serial ya existe
        const serialExists = await checkSerialExists(formData.serial);
        if (serialExists) {
          setErrors(prev => ({ ...prev, serial: 'Ya existe un activo con este número de serie' }));
          showToast('Ya existe un activo con este número de serie', 'error');
          setIsSubmitting(false);
          return;
        }

        // Crear nuevo activo
        await addTechAsset({
          tipo: formData.tipo as AssetType,
          marca: formData.marca.trim(),
          modelo: formData.modelo.trim(),
          serial: formData.serial.trim(),
          estado: formData.estado,
          observaciones: formData.observaciones.trim(),
        });

        showToast(
          `Activo ${formData.tipo} ${formData.marca} ${formData.modelo} registrado exitosamente`,
          'success'
        );
      } else {
        // Actualizar activo existente
        if (!initialData?.id) {
          throw new Error('No se proporcionó el ID del activo para actualizar');
        }

        // Si se cambió el serial, verificar que no exista
        if (formData.serial !== initialData.serial) {
          const serialExists = await checkSerialExists(formData.serial);
          if (serialExists) {
            setErrors(prev => ({ ...prev, serial: 'Ya existe un activo con este número de serie' }));
            showToast('Ya existe un activo con este número de serie', 'error');
            setIsSubmitting(false);
            return;
          }
        }

        await updateTechAsset(initialData.id, {
          tipo: formData.tipo as AssetType,
          marca: formData.marca.trim(),
          modelo: formData.modelo.trim(),
          serial: formData.serial.trim(),
          estado: formData.estado,
          observaciones: formData.observaciones.trim(),
        });

        showToast(
          `Activo ${formData.tipo} ${formData.marca} ${formData.modelo} actualizado exitosamente`,
          'success'
        );
      }

      // Llamar a onSuccess después de un pequeño delay para que se vea el toast
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 1000);

    } catch (error) {
      console.error('Error al guardar activo:', error);
      showToast(
        error instanceof Error ? error.message : 'Error al guardar el activo. Por favor, intenta de nuevo.',
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
          {/* Tipo de Activo */}
          <Select
            name="tipo"
            label="Tipo de Activo"
            placeholder="Seleccione tipo de activo"
            options={ASSET_TYPE_OPTIONS}
            value={formData.tipo}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.tipo ? errors.tipo : undefined}
            required
          />

          {/* Estado */}
          <Select
            name="estado"
            label="Estado"
            placeholder="Seleccione estado"
            options={ASSET_STATUS_OPTIONS}
            value={formData.estado}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.estado ? errors.estado : undefined}
            required
          />

          {/* Marca */}
          <Input
            name="marca"
            label="Marca"
            placeholder="Ej: Dell, HP, Lenovo"
            type="text"
            value={formData.marca}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.marca ? errors.marca : undefined}
            required
          />

          {/* Modelo */}
          <Input
            name="modelo"
            label="Modelo"
            placeholder="Ej: Latitude 3420"
            type="text"
            value={formData.modelo}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.modelo ? errors.modelo : undefined}
            required
          />

          {/* Serial */}
          <div className="md:col-span-2">
            <Input
              name="serial"
              label="Número de Serie"
              placeholder="Ej: SN123456789"
              type="text"
              value={formData.serial}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.serial ? errors.serial : undefined}
              required
              disabled={mode === 'edit'}
            />
            {mode === 'edit' && (
              <p className="mt-1.5 text-xs text-gray-500">
                El número de serie no se puede modificar después de crear el activo
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              placeholder="Ej: Incluye cargador original. Batería en buen estado."
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
              Información adicional sobre el activo (accesorios, condición, etc.)
            </p>
          </div>
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
            disabled={isSubmitting}
          >
            {mode === 'edit' ? 'Guardar Cambios' : 'Registrar Activo'}
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

export default TechAssetForm;
