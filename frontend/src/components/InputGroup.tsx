import React from 'react';

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, required, className, ...props }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      className={`w-full border border-gray-300 rounded-lg p-2.5 uppercase focus:outline-none focus:border-blue-500 text-sm ${className}`} 
      {...props}
    />
  </div>
);