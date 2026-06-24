import React from 'react';
// import './color-picker.css';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  onChange: (color: string) => void;
  id: string;
  value?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onChange, id, value = "#000000" }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value); 
  };

  return (
    <div className=" flex w-full">
      <div className="form-input-wrapper">
        <div 
          className="form-input-fill min-w-full" 
          data-color={value} 
          style={{ backgroundColor: value }}
        />
        <Input 
        className='min-w-full w-full'
          type="color" 
          id={id} 
          name={id} 
          value={value} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );
}

export default ColorPicker;
