import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button } from "@mui/material";
import { useSnackbar } from "../components/AppSnackbar";

export default function HostListingsPage() {
  const [properties, setProperties] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const snackbar = useSnackbar();

  //snackbar("edit");

  // useEffect(() => {
  //   fetch("http://localhost:3001/api/properties")
  //     .then(res => res.json())
  //     .then(data => {
  //       console.log(data.ownerHost?._id);
  //       const mine = data.filter(p => p.ownerHost?._id === user?.id);
  //       setProperties(mine);
  //     });
  //   }, [user.id]);
    
  useEffect(() => {
    fetch("http://localhost:3001/api/properties/mine", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProperties(data);
    });
  }, [user.id]);

  // Add handleEdit, handleDelete functions here using PATCH/DELETE APIs

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", my: 4 }}>
      <Typography variant="h4" mb={2}>My Listings</Typography>
      <Grid container spacing={2}>
        {properties.map(prop => (
          <Grid item xs={12} sm={6} md={4} key={prop._id}>
            <Card>
              <CardMedia
                component="img"
                height="160"
                image={prop.images?.[0] || "https://mui.com/static/images/cards/contemplative-reptile.jpg"}
                alt={prop.title}
              />
              <CardContent>
                <Typography variant="h6">{prop.title}</Typography>
                <Typography color="text.secondary">{prop.category} – {prop.type}</Typography>
                <Typography variant="body2">{prop.address}</Typography>
                <Typography variant="body2">${prop.pricePerNight}/night</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" href={`/property/${prop._id}`}>View</Button>
                <Button size="small" color="warning">Edit</Button>
                <Button size="small" color="error">Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {!properties.length && (
        <Typography sx={{ mt: 5, color: "gray" }}>
          No listings created yet.
        </Typography>
      )}
    </Box>
  );
}
