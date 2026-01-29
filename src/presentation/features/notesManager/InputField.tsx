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
    <div className="relative">
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
        className={`
          w-16 px-2 py-1.5
          text-sm text-center font-medium
          bg-white border rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2
          [appearance:textfield]
          [&::-webkit-outer-spin-button]:appearance-none
          [&::-webkit-inner-spin-button]:appearance-none
          ${isValid
            ? 'border-gray-200 text-gray-700 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
            : 'border-red-300 text-red-600 bg-red-50 focus:ring-red-200 focus:border-red-400'
          }
        `}
      />
      {!isValid && (
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-red-500 whitespace-nowrap font-medium">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default React.memo(InputField);
