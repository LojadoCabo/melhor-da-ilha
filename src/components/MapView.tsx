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
    <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
      <Map
        defaultCenter={center}
        defaultZoom={11}
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        {businesses.map((biz) => {
          if (!biz.location?.lat || !biz.location?.lng) return null;
          return (
            <AdvancedMarker
              key={biz.id}
              position={{ lat: biz.location.lat, lng: biz.location.lng }}
              onClick={() => onMarkerClick(biz)}
            >
              <Pin background="#0d9488" glyphColor="#ffffff" borderColor="#0f766e" />
            </AdvancedMarker>
          );
        })}
      </Map>
    </div>
  );
};
