import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, CardMedia, Grid } from "@mui/material";

export default function TripListPage() {
  const [bookings, setBookings] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3001/api/bookings/guest", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setBookings);
  }, [token]);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2}>My Trips</Typography>
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
                <Typography variant="body2">{bk.property.address}</Typography>
                <Typography variant="body2">
                  Dates: {bk.startDate?.slice(0,10)} – {bk.endDate?.slice(0,10)}
                </Typography>
                <Typography variant="body2">
                  Total: ${bk.totalPrice}
                </Typography>
                <Typography variant="body2">
                  Status: {bk.status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {!bookings.length && <Typography sx={{ mt: 7, color: "gray" }}>No trips/bookings found.</Typography>}
    </Box>
  );
}
