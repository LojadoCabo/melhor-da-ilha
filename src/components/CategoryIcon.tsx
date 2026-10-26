import React from 'react';
import {
  Bike,
  UtensilsCrossed,
  Hammer,
  HeartPulse,
  Briefcase,
  Sparkles,
  ShoppingBag,
  Laptop,
  PartyPopper,
  Music,
  Shirt,
  Printer,
  HelpCircle,
  LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'Bike':
      return <Bike {...props} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed {...props} />;
    case 'Hammer':
      return <Hammer {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'PartyPopper':
      return <PartyPopper {...props} />;
    case 'Music':
      return <Music {...props} />;
    case 'Shirt':
      return <Shirt {...props} />;
    case 'Printer':
      return <Printer {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
};
