// client/src/components/ui/CardHeader.tsx
interface CardHeaderProps {
    title?: string; // Change to optional
    children?: React.ReactNode; // Allow children as well
  }
  
  const CardHeader: React.FC<CardHeaderProps> = ({ title, children }) => {
    return (
      <div className="card-header">
        {title && <h2>{title}</h2>}
        {children}
      </div>
    );
  };
  
  export default CardHeader;
  