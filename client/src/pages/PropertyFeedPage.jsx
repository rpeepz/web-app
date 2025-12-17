import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Grid, Card, CardMedia, CardContent, CardActions, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import PropertySearchBar from "../components/PropertySearchBar";
import { useSnackbar } from "../components/AppSnackbar";

export default function PropertyFeedPage() {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  
  const [wishlist, setWishlist] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const snackbar = useSnackbar();
  
  // Fetch user's wishlist on mount
  useEffect(() => {
    if (!user?.id) return;
    fetch("http://localhost:3001/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => setWishlist(data.wishList || []));
  }, [user.id, token]);

  

  const handleToggleWishlist = async (propertyId) => {
    if (!token) return; // Optionally show login prompt/toast
    const inWishlist = wishlist.includes(propertyId);
    const method = inWishlist ? "DELETE" : "POST";
    const res = await fetch(`http://localhost:3001/api/properties/${propertyId}/wishlist`, {
        method,
        headers: { "Authorization": `Bearer ${token}` }
      });
    if (res.ok) {
      setWishlist(prev => {
        if (inWishlist) {
          snackbar("Property removed from wishlist", "info")
          return prev.filter(id => id !== propertyId);
        }
        else {
          snackbar("Property wishlisted", "info")
          return [...prev, propertyId];
        }
      });
    }
  };
  

  // Fetch all properties on mount
  useEffect(() => {
    fetch("http://localhost:3001/api/properties")
      .then(res => res.json())
      .then(data => setProperties(data));
  }, []);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", my: 4 }}>
      <Typography variant="h4" mb={2}>Browse Properties</Typography>
      <PropertySearchBar properties={properties} onFilter={setFiltered} />
      <Grid container spacing={2}>
        {filtered.map(prop => (
          <Grid item xs={12} sm={6} md={4} key={prop._id}>
            <Card>
                

              <CardMedia
                component="img"
                height="160"
                image={`http://localhost:3001${prop.images?.[0]}` || "https://mui.com/static/images/cards/contemplative-reptile.jpg"}
                alt={prop.title}
              />
              <CardContent>
                <Typography variant="h6">{prop.title}</Typography>
                <Typography color="text.secondary">{prop.category} – {prop.type}</Typography>
                <Typography variant="body2">{prop.address}</Typography>
                <Typography variant="body2">${prop.pricePerNight}/night</Typography>
                <Typography variant="body2">{prop.facilities?.join(", ")}</Typography>
              </CardContent>
              
              <CardActions>
                <Button href={`/property/${prop._id}`} size="small">View Details</Button>
                <IconButton onClick={() => handleToggleWishlist(prop._id)} color={wishlist.includes(prop._id) ? "error" : "default"}>
                    {wishlist.includes(prop._id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {!filtered.length && (
        <Typography sx={{ mt: 5, color: "gray" }}>
          No properties found for your search.
        </Typography>
      )}
    </Box>
  );
}
