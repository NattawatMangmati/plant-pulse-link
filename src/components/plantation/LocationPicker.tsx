import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

function CenterMarkerOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
      <MapPin className="h-8 w-8 text-destructive -mt-8 drop-shadow-lg" fill="currentColor" />
    </div>
  );
}

function MapCenterTracker({ onCenterChange }: { onCenterChange: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });
  return null;
}

function SetMapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      map.setView([lat, lng], 15);
      initialized.current = true;
    }
  }, []);
  return null;
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const defaultLat = lat ?? 13.7563;
  const defaultLng = lng ?? 100.5018;

  const handleCenterChange = useCallback((newLat: number, newLng: number) => {
    // We track but don't auto-save, user must click confirm
    centerRef.current = { lat: newLat, lng: newLng };
  }, []);

  const centerRef = useRef({ lat: defaultLat, lng: defaultLng });

  const handleConfirm = () => {
    onChange(centerRef.current.lat, centerRef.current.lng);
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full h-64 rounded-md overflow-hidden border border-border">
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={15}
          className="w-full h-full z-0"
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <SetMapCenter lat={defaultLat} lng={defaultLng} />
          <MapCenterTracker onCenterChange={handleCenterChange} />
        </MapContainer>
        <CenterMarkerOverlay />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleConfirm}>
        <MapPin className="h-4 w-4 mr-1" /> ปักหมุดตำแหน่งนี้
      </Button>
    </div>
  );
}
