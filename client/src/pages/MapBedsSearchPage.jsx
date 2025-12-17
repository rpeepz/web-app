import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
import L from "leaflet";



// Default fallback to Houston, TX
const DEFAULT_LOCATION = { lat: 29.7604, lng: -95.3698 };
const DEFAULT_RADIUS_MILES = 30;

//TODO populate from aggregate of all database citys
const locations = [
  { label: "Houston, TX", lat: 29.7604, lng: -95.3698 },
  { label: "Miami, FL", lat: 25.7617, lng: -80.1918 },
  { label: "New York, NY", lat: 40.7128, lng: -74.006 },
  // Add more as needed
];

function MapController({ onCenterChange, onZoomChange }) {
  const map = useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onCenterChange({ lat: c.lat, lng: c.lng });
    },
    zoomend: () => {
      const z = map.getZoom();
      onZoomChange(z);
    }
  });

  // Optionally, focus to a location programmatically
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
}
function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
      map.setView([center.lat, center.lng]);
    }, [center, map]);
    return null;
  }
  

export default function MapBedsSearchPage() {
  const [center, setCenter] = useState(DEFAULT_LOCATION);
  const [zoom, setZoom] = useState(11);
  const [radius, setRadius] = useState(DEFAULT_RADIUS_MILES);
  const [properties, setProperties] = useState([]);
  const [bedProps, setBedProps] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    // Use browser geolocation to get close to user
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {}, // fail, keep Houston
      { enableHighAccuracy: false, timeout: 3000 }
    );
  }, []);

  useEffect(() => {
    // Fetch all bed-type properties
    fetch("http://localhost:3001/api/properties")
      .then(res => res.json())
      .then(data => setProperties(data.filter(p => p.type === "bed" && p.latitude && p.longitude)));
  }, []);

  useEffect(() => {
    // Filter beds in visible radius after properties or center/zoom change
    if (!properties.length) return;

    const distance = (a, b) => {
      const toRad = (x) => (x * Math.PI) / 180;
      const R = 3958.8; // Miles
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const aa =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(a.lat)) *
          Math.cos(toRad(b.lat)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
      return R * c;
    };

    setBedProps(
      properties.filter(
        p =>
          distance(center, { lat: p.latitude, lng: p.longitude }) <= radius
      )
    );
  }, [center, properties, radius]);

  // Optionally update on zoom (static for now, but could use mapRef.current.getZoom() for dynamic)
  // Or make radius proportional to zoom

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h4" mb={2}>
        Find Beds Near You
      </Typography>
      <Box sx={{ mb: 2, maxWidth: 300 }}>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => {
          navigator.geolocation.getCurrentPosition((pos) => {setCenter({lat: pos.coords.latitude,lng: pos.coords.longitude});
                setZoom(12); // or whatever zoom level feels best
            }, () => { alert("Could not get your location");});}}>
        Focus on My Location
        </Button>

        <TextField
          select
          label="Select Location"
          value={locations.find(l => l.lat === center.lat && l.lng === center.lng)?.label || ""}
          onChange={e => {
            const selected = locations.find(l => l.label === e.target.value);
            if (selected) setCenter({ lat: selected.lat, lng: selected.lng });
          }}
          sx={{ minWidth: 200 }}
        >
          {locations.map(loc => (
            <MenuItem key={loc.label} value={loc.label}>
              {loc.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} style={{ height: "500px", width: "100%", borderRadius: "8px" }} ref={mapRef} >
        <RecenterMap center={center} />
        <MapController onCenterChange={setCenter} onZoomChange={setZoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[center.lat, center.lng]}
          radius={radius * 1609.34} // miles to meters
          pathOptions={{ fillColor: "blue", fillOpacity: 0.07, color: "blue" }}
        />
        {bedProps.map((p) => (
          <Marker
            key={p._id}
            position={[p.latitude, p.longitude]}
            icon={L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/69/69524.png", iconSize: [28, 28] })}
          >
            <Popup>
              <Typography variant="h6" fontWeight={600}>{p.title}</Typography>
              <Typography variant="body2">{p.address}</Typography>
              <Typography variant="body2">${p.pricePerNight}/night</Typography>
              <Typography variant="body2">Type: Bed</Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <Typography sx={{ mt: 3 }}>
        Showing {bedProps.length} beds within {radius} miles of map center.
      </Typography>
    </Box>
  );
}
