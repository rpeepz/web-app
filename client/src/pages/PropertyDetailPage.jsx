import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardMedia, Button, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useSnackbar } from "../components/AppSnackbar";

//TODO add calendar showing how beds are booked on each day
//TODO BUILD CALENDAR COMPONENT TO REUSE that containes a bed list for each day and how many are booked
export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState("");
  const snackbar = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3001/api/properties/${id}`)
      .then(res => res.json())
      .then(data => setProperty(data));
  }, [id]);

  if (!property) return <Typography>Loading...</Typography>;

  const nights = startDate && endDate
    ? dayjs(endDate).startOf("day").diff(dayjs(startDate).startOf("day"), "day")
    : 0;

  const total = nights * (property.pricePerNight || 0);
  
  const handleBook = async () => {
    if (!startDate || !endDate) return setStatus("Please select valid dates");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/api/bookings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          propertyId: id,
          startDate,
          endDate
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      snackbar("Booking success!")
      setStatus("Booked success!");
      navigate("/trips");
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={2}>{property.title}</Typography>
      {property.images?.[0] && (
        <CardMedia
          component="img"
          height="260"
          image={`http://localhost:3001${property.images[0]}`}
          sx={{ width: 400, objectFit: "cover", mb: 2 }}
        />
      )}
      <Typography variant="body1" mb={1}>{property.description}</Typography>
      <Typography variant="subtitle1" mb={1}>Price: ${property.pricePerNight} / night</Typography>
      <Box display="flex" gap={2} alignItems="center" my={2}>
        <DatePicker
          label="Start date"
          value={startDate}
          onChange={val => setStartDate(val ? dayjs(val) : null)}
        />
        <DatePicker
          label="End date"
          value={endDate}
          onChange={val => setEndDate(val ? dayjs(val) : null)}
        />
        <Button variant="contained" onClick={handleBook}>Book</Button>
      </Box>
      <Typography>
        {nights > 0 ? `Total (${nights} nights): $${total}` : ""}
      </Typography>
      {status && <Typography color={status.startsWith("Error") ? "error" : "primary"}>{status}</Typography>}
    </Box>
  );
}
