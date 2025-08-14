import React from 'react';

interface InputFieldProps {
  type: string;
  value: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: string) => void;
  isValid: boolean;
  errorMessage: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  value,
  min,
  max,
  step,
  onChange,
  isValid,
  errorMessage
}) => {
  const handleBlur = () => {
    if (value === '') return;

    if (type === 'number') {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        onChange(numericValue.toFixed(2));
      }
    } else {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue)) {
        onChange(Math.min(99, Math.max(0, numericValue)).toString());
      }
    }
  };

  return (
    <div className="input-container">
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const newValue = e.target.value;
          if (type === 'number') {
            if (/^(\d+)?([.]?\d{0,2})?$/.test(newValue)) {
              onChange(newValue);
            }
          } else {
            if (/^\d*$/.test(newValue)) {
              onChange(newValue);
            }
          }
        }}
        onBlur={handleBlur}
        className={`grade-input ${isValid ? '' : 'invalid'}`}
      />
      {!isValid && <span className="error-message">{errorMessage}</span>}
    </div>
  );
};

export default React.memo(InputField);
