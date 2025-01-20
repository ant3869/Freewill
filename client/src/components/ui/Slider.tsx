// client/src/components/ui/Slider.tsx
interface SliderProps {
    value: number | number[]; // Support single value or an array of numbers
    onChange?: (value: number | number[]) => void;
    onValueChange?: (values: number[]) => void; // Add onValueChange for compatibility
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
  }
  
  const Slider: React.FC<SliderProps> = ({ value, onChange, onValueChange, min = 0, max = 100, step = 1, disabled }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.valueAsNumber;
      if (Array.isArray(value) && onValueChange) {
        onValueChange([val]); // Call onValueChange for ranges
      } else if (onChange) {
        onChange(val); // Call onChange for single value
      }
    };
  
    return (
      <input
        type="range"
        value={Array.isArray(value) ? value[0] : value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={handleChange}
        className="slider"
      />
    );
  };
  
  export default Slider;
  