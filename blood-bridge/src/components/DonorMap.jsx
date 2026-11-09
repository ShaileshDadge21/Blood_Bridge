import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // CRITICAL: Map breaks without this CSS

export default function DonorMap() {
  // Centered on KIMS Hospital, Bengaluru (our test SOS location)
  const center = [12.9546, 77.5754];

  return (
    // z-0 ensures the map doesn't float over your app's headers/modals
    <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0 relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        {/* Free OpenStreetMap tiles - no API key required */}
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pulsing SOS Radius */}
        <CircleMarker
          center={center}
          pathOptions={{ 
            color: '#dc2626', // Tailwind red-600
            fillColor: '#ef4444', // Tailwind red-500
            fillOpacity: 0.4 
          }}
          radius={25}
        >
          <Popup className="font-sans">
            <strong>KIMS Hospital, VV Puram</strong> <br /> 
            <span className="text-red-600 font-bold">Needs O- Blood (Critical)</span>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}