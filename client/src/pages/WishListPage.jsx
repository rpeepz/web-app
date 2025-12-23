import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardMedia, CardContent, IconButton } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../components/AppSnackbar";
import { fetchWithAuth } from "../utils/api";

export default function WishListPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const userRes = await fetchWithAuth("http://localhost:3001/api/auth/me");
        const user = await userRes.json();
        if (!user.wishList?.length) return setProperties([]);
        // Fetch each property in parallel
        const props = await Promise.all(
          user.wishList.map(pid =>
            fetch(`http://localhost:3001/api/properties/${pid}`).then(r => r.json())
          )
        );
        setProperties(props.filter(Boolean));
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, []);

  const handleRemove = async (propId) => {
    const res = await fetchWithAuth(`http://localhost:3001/api/properties/${propId}/wishlist`, {
      method: "DELETE"
    });
    if (res.ok) {
      setProperties(prev => prev.filter(p => p._id !== propId));
      snackbar("Property removed from wishlist", "info");
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2}>My Wishlist</Typography>
      {loading && <Typography>Loading...</Typography>}
      <Grid container spacing={2}>
        {properties.map(prop => (
          <Grid item xs={12} sm={6} md={4} key={prop._id}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={`http://localhost:3001${prop.images?.[0]}`}
                alt={prop.title}
                onClick={() => navigate(`/property/${prop._id}`)}
                sx={{ cursor: "pointer" }}
              />
              <CardContent>
                <Typography variant="h6">{prop.title}</Typography>
                <Typography variant="body2">{prop.address}</Typography>
              </CardContent>
              <IconButton
                sx={{ color: "error.main", ml: 1, mb: 1 }}
                onClick={() => handleRemove(prop._id)}
                aria-label="Remove from wishlist"
              >
                <FavoriteIcon />
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
      {!loading && !properties.length && <Typography sx={{ mt: 7, color: "gray" }}>No wishlisted properties.</Typography>}
    </Box>
  );
}
