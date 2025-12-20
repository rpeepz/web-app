import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issue with bundlers (Vite, CRA, etc.)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ hotels, center }) {
    console.log(center)
  // pick a sensible default center, e.g., your primary city or region
  if (!center)
    center = [47.61, -122.33];
    // center = [26.119171, -80.137212];
console.log('MapView hotels:', hotels);
  return (
    <MapContainer
      center={center}
      zoom={13}        // Bigger is closer
      maxZoom={14}
      scrollWheelZoom={true}
      className="leaflet-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {hotels.map((hotel) => (
        <Circle
          key={hotel.id}
          center={hotel.position}
          radius={150} // in meters
          pathOptions={{
            color: '#222222',
            weight: 1,
            fillColor: '#cc7755',
            fillOpacity: 0.35,
        }}
        >
          <Popup>
            <strong>{hotel.name}</strong>
            <br />
            Approximate location
            <br />
            ${hotel.price}/night
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
