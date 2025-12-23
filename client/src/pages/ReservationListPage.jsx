import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, CardMedia, Grid } from "@mui/material";
import { fetchWithAuth } from "../utils/api";

export default function ReservationListPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchWithAuth("http://localhost:3001/api/bookings/host")
      .then(res => res.json())
      .then(setBookings);
  }, []);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2}>Reservations for My Properties</Typography>
      <Grid container spacing={2}>
        {bookings.map(bk => (
          <Grid item xs={12} sm={6} md={4} key={bk._id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={`http://localhost:3001${bk.property.images?.[0]}`}
                alt={bk.property.title}
              />
              <CardContent>
                <Typography variant="h6">{bk.property.title}</Typography>
                <Typography variant="body2">Guest: {bk.guest?.firstName} {bk.guest?.lastName}</Typography>
                <Typography variant="body2">Dates: {bk.startDate?.slice(0,10)} – {bk.endDate?.slice(0,10)}</Typography>
                <Typography variant="body2">Total: ${bk.totalPrice}</Typography>
                <Typography variant="body2">Status: {bk.status}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {!bookings.length && <Typography sx={{ mt: 7, color: "gray" }}>No reservations found.</Typography>}
    </Box>
  );
}
