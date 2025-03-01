
import React, { useState, useEffect } from 'react';

interface EditableCellProps {
  value: string | number | null;
  row: any;
  column: string;
  onUpdate: (row: any, column: string, value: any) => void;
  type?: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  disabled?: boolean;
}

export const EditableCell = ({
  value,
  row,
  column,
  onUpdate,
  type = 'text',
  options = [],
  disabled = false
}: EditableCellProps) => {
  const [editing, setEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState<any>(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCurrentValue(e.target.value);
  };

  const handleBlur = () => {
    setEditing(false);
    onUpdate(row, column, currentValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditing(false);
      onUpdate(row, column, currentValue);
    } else if (e.key === 'Escape') {
      setEditing(false);
      setCurrentValue(value);
    }
  };

  if (editing && !disabled) {
    switch (type) {
      case 'select':
        return (
          <select
            autoFocus
            className="w-full h-full rounded-md border border-input bg-background p-1"
            value={currentValue || ''}
            onChange={handleValueChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          >
            <option value="">Select...</option>
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            autoFocus
            type="number"
            className="w-full h-full rounded-md border border-input bg-background p-1"
            value={currentValue || ''}
            onChange={handleValueChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );

      case 'date':
        return (
          <input
            autoFocus
            type="date"
            className="w-full h-full rounded-md border border-input bg-background p-1"
            value={currentValue?.split('T')[0] || ''}
            onChange={handleValueChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );

      default:
        return (
          <input
            autoFocus
            type="text"
            className="w-full h-full rounded-md border border-input bg-background p-1"
            value={currentValue || ''}
            onChange={handleValueChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        );
    }
  }

  return (
    <div 
      className={`min-h-[2rem] px-1 py-1 flex items-center ${!disabled ? 'cursor-pointer hover:bg-muted/50' : ''}`}
      onClick={() => !disabled && setEditing(true)}
    >
      {type === 'date' && currentValue ? new Date(currentValue).toLocaleDateString() : currentValue}
      {currentValue === null || currentValue === undefined || currentValue === '' ? (
        <span className="text-muted-foreground italic">Click to edit</span>
      ) : null}
    </div>
  );
};
