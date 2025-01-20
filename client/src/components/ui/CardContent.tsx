// client/src/components/ui/CardContent.tsx
import React from 'react';

interface CardContentProps {
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ children }) => {
  return (
    <div className="card-content">
      {children}
    </div>
  );
};

export default CardContent;