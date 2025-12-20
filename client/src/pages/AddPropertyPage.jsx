import React, { useState, useEffect } from "react";
import { TextField, Button, IconButton, InputAdornment, Box, MenuItem, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../components/AppSnackbar";
import LocationPicker from "../components/LocationPicker";
import ClearIcon from '@mui/icons-material/Clear';

async function reverseGeocode([lat, lng]) {
  const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;

  const res = await fetch(url);

  const data = await res.json();

  if (!data || !data.features || data.features.length === 0) {
    console.log("No address features data found");
    return {};
  }
  // console.log('DATA FEATURES:', data.features[0].properties);
  const {city, country, name: address} = data.features[0].properties
  /*
  city : "Plantation",
  country : "United States",
  countrycode : "US",
  county : "Broward County",
  extent : (4) [-80.2225091, 26.128197, -80.2223404, 26.1234056],
  locality : "Plantation Park",
  name : "Bayberry Drive",
  osm_id : 10802874,
  osm_key : "highway",
  osm_type : "W",
  osm_value : "residential",
  postcode : "33317",
  state : "Florida",
  type : "street",
  */
  return {city, country, address}; ;
  
}



const categories = ["apartment", "condo", "house", "hostel", "flat", "villa"];
const types = [
  { value: "whole", label: "Whole Property" },
  { value: "private", label: "Private Room" },
  { value: "bed", label: "Individual Bed" }
];
const facilityOptions = ["WiFi", "Kitchen", "Laundry", "Parking", "Pool", "AC", "TV"];

export default function AddPropertyPage() {
  const [form, setForm] = useState({
    title: "", type: "", category: "", description: "",
    pricePerNight: "", city: "", country:"", maxGuests: "",
    facilities: [], images: [], address: ""
  });
  const [error, setError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [facilityInput, setFacilityInput] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  useEffect(() => {
    async function fetchAddress() {
      if (form.position && form.position.length === 2) {
        try {
          const { city, country, address } = await reverseGeocode(form.position);
          setForm(prev => ({
              ...prev,
              address: address,
              city: city || prev.city,
              country: country || prev.country,
            }));
            console.log('Reverse geocoded address:', address, city, country);
          } catch (err) {
            console.error("Reverse geocoding failed:", err);
          }
        }
      }
      fetchAddress();
  }, [form.position]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleLocationChange(latlng) {
    setForm((prev) => ({ ...prev, position: latlng }));
  };

  const handleFacilities = (e) => {
    if (e.key === "Enter" && facilityInput) {
      setForm(prev => ({ ...prev, facilities: [...prev.facilities, facilityInput] }));
      setFacilityInput("");
      e.preventDefault();
    }
  };

  const handleFacilityDelete = (chipToDelete) => {
    setForm(prev => ({
      ...prev, facilities: prev.facilities.filter(f => f !== chipToDelete)
    }));
  };

  const handleImageChange = (e) => {
    setForm({ ...form, images: [...e.target.files] });
    setImagePreviews([...e.target.files].map(file => URL.createObjectURL(file)));
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }
  //TODO add lat and long from given city and state
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.position) {
      setAddressError("Please select a location on the map.");
      return;
    }
    setAddressError("");
    console.log('Submitting form:', form);
    // const token = localStorage.getItem("token");
    // const data = new FormData();
    // Object.entries(form).forEach(([key, val]) => {
    //   if (key === "images") for (let file of val) data.append("images", file);
    //   else if (key === "facilities") data.append("facilities", val.join(","));
    //   else data.append(key, val);
    // });


    // try {
    //   const res = await fetch("http://localhost:3001/api/properties", {
    //     method: "POST",
    //     headers: { "Authorization": `Bearer ${token}` },
    //     body: data
    //   });
    //   if (!res.ok) 
    //     throw new Error("Failed to create property");
    //   snackbar("Property added successfully");
    //   navigate("/");
    // } catch (err) {
    //   snackbar("Failed to save property", "error");
    //   setError(err.message);
    // }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h5" mb={2}>Add New Property</Typography>
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} encType="multipart/form-data">
        <TextField label="Title" name="title" fullWidth required margin="normal" value={form.title} onChange={handleInputChange} />
        <TextField select label="Type" name="type" fullWidth required margin="normal" value={form.type} onChange={handleInputChange}>
          {types.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
        </TextField>
        <TextField select label="Category" name="category" fullWidth margin="normal" value={form.category} onChange={handleInputChange}>
          {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField label="Description" name="description" fullWidth required multiline rows={3} margin="normal" value={form.description} onChange={handleInputChange} />
        
        <TextField  label="Approximate Address"
                    name="address" 
                    fullWidth 
                    required 
                    margin="normal" 
                    value={form.address} 
                    error={!!addressError}
                    helperText={addressError}
                    slotProps={{
                      input: { 
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            
                              <IconButton
                                onClick={ () => setForm(prev => ({ 
                                  ...prev, address: "", position: null
                                }))} 
                                edge="end">
                                <ClearIcon />
                              </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    

        />
        
        <div id="address" label="Address">
          {/* <label>Address</label> */}
          <LocationPicker value={form.position} onChange={handleLocationChange} />
        </div>


        <TextField label="Price per Night" name="pricePerNight" fullWidth required margin="normal" type="number" value={form.pricePerNight} onChange={handleInputChange} />
        <TextField label="Max Guests" name="maxGuests" fullWidth required margin="normal" type="number" value={form.maxGuests} onChange={handleInputChange} />
        <Box mt={2} mb={2}>
          <TextField
            label="Add Facility"
            value={facilityInput}
            onChange={e => setFacilityInput(e.target.value)}
            onKeyDown={handleFacilities}
            helperText="Press Enter to add"
          />
          <Box display="flex" flexWrap="wrap" mt={1}>
            {form.facilities.map(facility => (
              <Chip label={facility} onDelete={() => handleFacilityDelete(facility)} key={facility} sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
        </Box>
        <Button variant="contained" component="label" fullWidth sx={{ my: 2 }}>
          Upload Images (up to 6)
          <input type="file" name="images" accept="image/*" multiple hidden onChange={handleImageChange} />
        </Button>
        <Box display="flex" flexWrap="wrap" mb={2}>
          {imagePreviews.map((src, idx) => (
            <Box key={idx} sx={{ mr: 2 }}>
              <img src={src} alt={`preview-${idx}`} width={80} height={60} style={{ objectFit: "cover", borderRadius: 8 }} />
            </Box>
          ))}
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth>Add Property</Button>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
      </form>
    </Box>
  );
}
