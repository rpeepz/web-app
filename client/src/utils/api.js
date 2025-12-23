const API_URL = "http://localhost:3001/api";

// Store tokens
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

// Clear tokens on logout
export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// Refresh access token using refresh token
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    window.location.href = "/login";
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (error) {
    clearTokens();
    window.location.href = "/login";
    throw error;
  }
};

// Wrapper for fetch with automatic token refresh
export const fetchWithAuth = async (url, options = {}) => {
  let accessToken = getAccessToken();

  if (!accessToken) {
    throw new Error("No access token available");
  }

  // Don't set Content-Type if FormData is being sent (file uploads)
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };
  
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401, try refreshing token and retry
  if (response.status === 401) {
    try {
      accessToken = await refreshAccessToken();
      const retryHeaders = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
      
      if (!(options.body instanceof FormData)) {
        retryHeaders["Content-Type"] = "application/json";
      }

      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    } catch (error) {
      throw error;
    }
  }

  return response;
};

// Logout function
export const logout = async () => {
  const refreshToken = getRefreshToken();

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  clearTokens();
};

// Calculate price range from rooms/beds
export const calculatePriceRange = (rooms) => {
  if (!rooms || rooms.length === 0) return null;
  
  const prices = [];
  rooms.forEach(room => {
    if (room.beds && room.beds.length > 0) {
      room.beds.forEach(bed => {
        if (bed.pricePerBed) {
          prices.push(bed.pricePerBed);
        }
      });
    }
  });

  if (prices.length === 0) return null;

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    min: minPrice,
    max: maxPrice,
    hasPriceRange: minPrice !== maxPrice
  };
};

// Format price display for listings
export const formatPriceDisplay = (property) => {
  const priceRange = calculatePriceRange(property.rooms);
  
  if (!priceRange) {
    return property.pricePerNight ? `$${property.pricePerNight}` : "Call for price";
  }

  if (priceRange.hasPriceRange) {
    return `$${Math.round(priceRange.min)} - $${Math.round(priceRange.max)}/night`;
  } else {
    return `$${Math.round(priceRange.min)}/night`;
  }
};