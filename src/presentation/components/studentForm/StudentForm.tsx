//@ts-ignore
import { FormEvent } from 'react';
import './StudentForm.css';
import { useStudentForm } from './useStudentForm';
import { FormField } from '../../../shared/utils/FormField';
import { TEXT_FIELDS, SELECT_OPTIONS } from './formConfig';
import { StudentFormState } from '../../../shared/types/studentTypes';

const StudentForm = () => {
  const { 
    form, 
    error, 
    handleBlur, 
    handleChange, 
    handleSubmit, 
    classrooms 
  } = useStudentForm();

  const renderSection = (title: string, subtitle: string) => (
    <div className='section-header'>
      <div className='header-info'>
        <h4>{title}</h4>
        <h6>{subtitle}</h6>
      </div>
    </div>
  );

  // Generar opciones de salones desde los datos cargados
  const classroomOptions = classrooms.map(classroom => ({
    value: classroom.nombreSalon,
    label: classroom.nombreSalon
  }));

  // Actualizar SELECT_FIELDS para usar classroomOptions
  const dynamicSelectFields = [
    { name: 'document', options: SELECT_OPTIONS.document },
    { name: 'classRoom', options: SELECT_OPTIONS.classRoom },
    { 
      name: 'className', 
      options: [
        { value: '', label: 'Seleccione salón' },
        ...classroomOptions
      ]
    },
    { name: 'caracter', options: SELECT_OPTIONS.caracter }
  ];

  return (
    <div className="form-container">
      <form className='student-form' onSubmit={handleSubmit}>
        {renderSection("Estudiantes", "Información de nuevo estudiante.")}
        
        {dynamicSelectFields.map(({ name, options }) => (
          <FormField
            key={name}
            type="select"
            name={name}
            value={form[name as keyof StudentFormState]}
            options={options}
            error={error[name]}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ))}

        {TEXT_FIELDS.map(({ type, name, placeholder }) => (
          <FormField
            key={name}
            //@ts-ignore
            type={type}
            name={name}
            value={form[name as keyof StudentFormState]}
            placeholder={placeholder}
            error={error[name]}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ))}

        <button type="submit" className="submit-btn">
          Matricular Estudiante
        </button>
      </form>
    </div>
  );
};

export default StudentForm;