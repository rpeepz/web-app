import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, Grid, Card, CardMedia, CardContent, CardActions, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IconButton from "@mui/material/IconButton";
import PropertySearchBar from "../components/PropertySearchBar";
import { useSnackbar } from "../components/AppSnackbar";
import { fetchWithAuth, formatPriceDisplay } from "../utils/api";

export default function PropertyFeedPage() {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  
  const [wishlist, setWishlist] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const snackbar = useSnackbar();
  
  // Fetch user's wishlist on mount
  useEffect(() => {
    if (!user?.id) return;
    fetchWithAuth("http://localhost:3001/api/auth/me")
        .then(res => res.json())
        .then(data => setWishlist(data.wishList || []));
  }, [user.id]);

  

  const handleToggleWishlist = async (propertyId) => {
    if (!user?.id) { // User not logged in
      snackbar("Must be logged in to add to your wishlist", "error")
      return;
  }
  const inWishlist = wishlist.includes(propertyId);
  const method = inWishlist ? "DELETE" : "POST";
    const res = await fetchWithAuth(`http://localhost:3001/api/properties/${propertyId}/wishlist`);
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
      .then(data => {
        // Filter to show only active properties to guests
        const activeProperties = data.filter(prop => prop.isActive !== false);
        setProperties(activeProperties);
      });
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
                image={`http://localhost:3001${prop.images?.[0]?.path || prop.images?.[0]}` || "https://mui.com/static/images/cards/contemplative-reptile.jpg"}
                alt={prop.title}
              />
              <CardContent>
                <Typography variant="h6">{prop.title}</Typography>
                <Typography color="text.secondary">{prop.category} – {prop.type}</Typography>
                <Typography variant="body2">{prop.address}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatPriceDisplay(prop)}</Typography>
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
