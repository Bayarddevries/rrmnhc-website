
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Photo } from '../types';

// Use a simple SVG for the marker to avoid import issues with Leaflet/Vite
const markerSvg = `data:image/svg+xml;base64,${btoa(`
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#DC2626" stroke="#991B1B" stroke-width="1"/>
  <circle cx="12" cy="9" r="3" fill="white"/>
</svg>
`)}`;

let DefaultIcon = L.icon({
    iconUrl: markerSvg,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to automatically fit the map to the markers
const FitBounds: React.FC<{ photos: Photo[] }> = ({ photos }) => {
  const map = useMap();
  
  React.useEffect(() => {
    const validPhotos = photos.filter(p => p.lat !== undefined && p.lng !== undefined);
    if (validPhotos.length === 0) return;
    
    const bounds = L.latLngBounds(validPhotos.map(p => [p.lat!, p.lng!]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [photos, map]);
  
  return null;
};

interface MapViewProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

const MapView: React.FC<MapViewProps> = ({ photos, onPhotoClick }) => {
  // Group photos by location (rounded to 4 decimal places for grouping)
  const groupedPhotos = useMemo<Record<string, Photo[]>>(() => {
    const groups: Record<string, Photo[]> = {};
    photos.forEach(photo => {
      if (photo.lat !== undefined && photo.lng !== undefined) {
        const key = `${photo.lat.toFixed(4)},${photo.lng.toFixed(4)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(photo);
      }
    });
    return groups;
  }, [photos]);

  const center: [number, number] = [50, -100]; // Default center (roughly Central Canada)

  return (
    <div className="w-full h-full animate-fadeIn bg-[#1a1a1a]">
      <MapContainer 
        center={center} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
        zoomControl={false}
      >
        <FitBounds photos={photos} />
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
        />
        
        {Object.entries(groupedPhotos).map(([key, group]: [string, Photo[]]) => {
          const [lat, lng] = key.split(',').map(Number);
          return (
            <Marker key={key} position={[lat, lng]}>
              <Popup className="custom-popup">
                <div className="p-2 max-w-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                  <h3 className="font-heading text-lg mb-2 text-zinc-800 border-bottom border-zinc-200 pb-1">
                    {group.length} {group.length === 1 ? 'Photo' : 'Photos'} at this location
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {group.map((photo: Photo) => (
                      <div 
                        key={photo.id} 
                        className="cursor-pointer group relative aspect-square overflow-hidden rounded-md border border-zinc-200 shadow-sm hover:shadow-md transition-all"
                        onClick={() => onPhotoClick(photo)}
                      >
                        <img 
                          src={photo.src} 
                          alt={photo.alt} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded">View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: #fdfbf7;
          border-radius: 8px;
          padding: 0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: #fdfbf7;
        }
      `}</style>
    </div>
  );
};

export default MapView;
