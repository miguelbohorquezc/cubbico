//@ts-ignore
import { FormEvent } from 'react';
import './StudentForm.css';
import { useStudentForm } from './useStudentForm';
import { FormField } from '../../../shared/utils/FormField';
import { TEXT_FIELDS, SELECT_FIELDS } from './formConfig';
import { StudentFormState } from '../../../shared/types/studentTypes';

const StudentForm = () => {
  const { form, error, handleBlur, handleChange, handleSubmit } = useStudentForm();

  const renderSection = (title: string, subtitle: string) => (
    <div className='section-header'>
      <div className='header-info'>
        <h4>{title}</h4>
        <h6>{subtitle}</h6>
      </div>
    </div>
  );

  return (
    <div className="form-container">
      <form className='student-form' onSubmit={handleSubmit}>
        {renderSection("Estudiantes", "Información de nuevo estudiante.")}
        
        {SELECT_FIELDS.map(({ name, options }) => (
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