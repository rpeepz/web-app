// src/pages/BrowsePage.jsx (example name)
import React, { useMemo } from 'react';
import { Grid2 } from '@mui/material';
import MapView from '../components/HotelMapView';

export default function BrowsePage({ filters }) {

    const hotels = [
    {
        id: 6,
        name: 'Hotel Alpha',
        position: [47.61, -122.33], // approximate city center
        price: 120,
    },
    {
        id: 7,
        name: 'Hotel Bravo',
        position: [47.62, -122.30],
        price: 95,
    },
    {
        id: 8,
        name: 'Hotel Charlie',
        position: [47.60, -122.35],
        price: 140,
    },
    ];

  // Apply filters to hotels; for now, just pass everything
  const filteredHotels = useMemo(() => {
    if (!hotels) return [];
    // You can filter by price, rating, etc. here
    return hotels;
  }, [hotels, filters]);
  
console.log('BrowsePage   hotels:', filteredHotels);
console.log('NOT FILTERED hotels:', hotels);
console.log('FILTERS             ', filters);
  return (
    <div>
        <h1>Browse Hotels</h1>
        <Grid2 container spacing={2} sx={{ mb: 2, flexDirection: 'column' }}>
            <Grid2 sx={{flex: 'auto'}}>
                {/* TODO Your filter controls go here */}
                <div> Dropdown menu with locations to chose from </div>
                <div> Select a location will change center of map </div>
                <div> Pass 'center' data to MapView component </div>
                <MapView hotels={filteredHotels} />
            </Grid2>
            <div style={{ overflowY: 'auto' }}>
                {/* your search/filter controls and hotel list */}
                {/* Example placeholder: */}
                <h2>Hotels</h2>
                {filteredHotels.map((h) => (
                <div key={h.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                    <div>{h.name}</div>
                    <div>${h.price}/night</div>
                </div>
            ))}
            </div>
        </Grid2>
    </div>
  );
}
