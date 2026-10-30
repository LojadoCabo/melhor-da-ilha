import React from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Business } from '../types';

interface MapViewProps {
  businesses: Business[];
  onMarkerClick: (business: Business) => void;
}

export const MapView: React.FC<MapViewProps> = ({ businesses, onMarkerClick }) => {
  // Use a reasonable center for RMS
  const center = { lat: -12.9714, lng: -38.5014 };

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
      <p>Mapa indisponível no momento.</p>
    </div>
  );
};
