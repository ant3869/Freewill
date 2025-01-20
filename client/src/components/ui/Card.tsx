// client/src/components/ui/Card.tsx
interface CardProps {
    children: React.ReactNode;
    className?: string; // Add className for styling
  }
  
  const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
      <div className={`card ${className || ''}`}>
        {children}
      </div>
    );
  };
  
  export default Card;
  