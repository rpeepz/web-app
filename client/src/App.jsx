import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { SnackbarProvider } from "./components/AppSnackbar";
import NavigationDrawer from "./components/NavigationDrawer";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AddPropertyPage from "./pages/AddPropertyPage";
import PropertyFeedPage from "./pages/PropertyFeedPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import TripListPage from "./pages/TripListPage";
import HostListingsPage from "./pages/HostListingsPage";
import ReservationListPage from "./pages/ReservationListPage";
import ProfilePage from "./pages/ProfilePage";
import WishListPage from "./pages/WishListPage";
import BrowsePage from './pages/BrowsePage';

function App() {
  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <SnackbarProvider>
          <NavigationDrawer>
            <Routes>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute> <DashboardPage /> </ProtectedRoute>} />
              <Route path="/add-property" element={<ProtectedRoute> <AddPropertyPage /> </ProtectedRoute>} />
              <Route path="/properties" element={<PropertyFeedPage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
              <Route path="/trips" element={<ProtectedRoute requiredRole="guest"> <TripListPage /> </ProtectedRoute>} />
              <Route path="/my-listings" element={<ProtectedRoute> <HostListingsPage /> </ProtectedRoute>} />
              <Route path="/reservations" element={<ProtectedRoute> <ReservationListPage /> </ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute> <ProfilePage /> </ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute> <WishListPage /> </ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </NavigationDrawer>
        </SnackbarProvider>
      </LocalizationProvider>
     </Router>
  );
}
export default App;
