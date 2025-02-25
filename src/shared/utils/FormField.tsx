import { ChangeEvent, FocusEvent } from 'react';
import { Option } from '../../shared/types/studentTypes';

type FormFieldProps = {
  type: 'text' | 'number' | 'select';
  name: string;
  value: string;
  placeholder?: string;
  options?: Option[];
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export const FormField = ({
  type,
  name,
  value,
  placeholder,
  options,
  error,
  onChange,
  onBlur
}: FormFieldProps) => (
  <div className={`form-group ${error ? 'has-error' : ''}`}>
    {type === 'select' ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="form-control"
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        className="form-control"
      />
    )}
    
    {error && <span className="error-message">{error}</span>}
  </div>
);