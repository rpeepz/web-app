import React, { useState } from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Divider, Toolbar, AppBar, Typography, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HotelIcon from "@mui/icons-material/Hotel";
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../components/AppSnackbar";


const drawerWidth = 220;

export default function NavigationDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const handleLogout = () => {
    localStorage.clear();
    snackbar("Logged out successfully", "info");
    navigate("/login");
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        <ListItemButton onClick={() => navigate("/")}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/profile")}>
          <ListItemIcon><AccountCircleIcon /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/wishlist")}>
          <ListItemIcon><FavoriteIcon /></ListItemIcon>
          <ListItemText primary="Wishlist" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/properties")}>
          <ListItemIcon><HotelIcon /></ListItemIcon>
          <ListItemText primary="Browse Properties" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/my-listings")}>
          <ListItemIcon><BusinessIcon /></ListItemIcon>
          <ListItemText primary="My Listings" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/add-property")}>
          <ListItemIcon><AddCircleIcon /></ListItemIcon>
          <ListItemText primary="Add Property" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/trips")}>
          <ListItemIcon><HotelIcon /></ListItemIcon>
          <ListItemText primary="My Trips" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/reservations")}>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Reservations" />
        </ListItemButton>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Property Rental Platform
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawer}
      </Drawer>
      {/* Main content, push right if drawer is open */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: open ? `${drawerWidth}px` : 0, transition: "margin .2s" }}>
        {children}
      </Box>
    </Box>
  );
}
