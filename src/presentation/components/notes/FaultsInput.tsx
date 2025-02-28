import React from 'react';

interface FaultsInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

const FaultsInput: React.FC<FaultsInputProps> = React.memo(({
  value,
  onChange,
  isValid
}) => (
  <input
    type="number"
    min="0"
    step="1"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`faults-input ${isValid ? '' : 'invalid'}`}
    placeholder="Fallas"
  />
));

export default FaultsInput;