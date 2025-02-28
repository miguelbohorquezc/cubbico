import React from 'react';

interface GradeInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  placeholder: string;
}

const GradeInput: React.FC<GradeInputProps> = React.memo(({
  value,
  onChange,
  isValid,
  placeholder
}) => (
  <input
    type="number"
    min="1.00"
    max="5.00"
    step="0.01"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`grade-input ${isValid ? '' : 'invalid'}`}
    placeholder={placeholder}
  />
));

export default GradeInput;