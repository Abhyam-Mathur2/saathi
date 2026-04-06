/**
 * Location Validation Utilities
 * Validates coordinates and addresses for accurate location tracking
 */

// India geographical bounds
const INDIA_BOUNDS = {
  minLat: 8.4,
  maxLat: 35.8,
  minLon: 68.7,
  maxLon: 97.25,
};

/**
 * Validate if coordinates are within India
 */
export const isValidIndianCoordinates = (latitude, longitude) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { valid: false, error: 'Coordinates must be numbers' };
  }

  if (latitude < INDIA_BOUNDS.minLat || latitude > INDIA_BOUNDS.maxLat) {
    return { valid: false, error: 'Latitude outside India bounds (8.4° to 35.8°)' };
  }

  if (longitude < INDIA_BOUNDS.minLon || longitude > INDIA_BOUNDS.maxLon) {
    return { valid: false, error: 'Longitude outside India bounds (68.7° to 97.25°)' };
  }

  return { valid: true };
};

/**
 * Validate if coordinates have reasonable accuracy
 */
export const isCoordinateAccurate = (accuracy) => {
  // If accuracy is more than 500 meters, it's not accurate enough
  if (!accuracy || accuracy > 500) {
    return {
      valid: false,
      warning: 'Location accuracy is low. Please try again in an open area.',
    };
  }
  return { valid: true };
};

/**
 * Reverse geocode coordinates to get address
 * Uses OpenStreetMap Nominatim service
 */
export const reverseGeocodeCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Saathi-App', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};

    // Extract meaningful address parts; include more granular locality fallbacks.
    const locality =
      address.suburb ||
      address.neighbourhood ||
      address.quarter ||
      address.road ||
      address.city_district ||
      '';
    const city = address.city || address.town || address.village || address.hamlet || address.municipality || '';
    const district = address.county || address.district || address.state_district || '';
    const state = address.state || '';
    const country = address.country || '';

    const formattedAddress = [locality, city, district, state, country]
      .filter(Boolean)
      .join(', ');
    const displayName = String(data.display_name || '').trim();

    return {
      success: true,
      address: formattedAddress || displayName,
      displayAddress: formattedAddress || displayName || `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`,
      components: { locality, city, district, state, country },
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      address: `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`,
      displayAddress: `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`,
      error: error.message,
    };
  }
};

/**
 * Forward geocode address to coordinates
 * Uses OpenStreetMap Nominatim service
 */
export const forwardGeocodeAddress = async (address) => {
  if (!address || address.trim().length === 0) {
    return { success: false, error: 'Address cannot be empty' };
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&countrycodes=in`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Saathi-App',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Address not found. Try a different address or use "My Current Location".',
      };
    }

    // Get the first result
    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    const displayName = result.display_name;

    // Verify coordinates are in India
    const validation = isValidIndianCoordinates(latitude, longitude);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Address resolved outside India. Please check the address.',
      };
    }

    return {
      success: true,
      latitude,
      longitude,
      address: displayName,
      isGeocodedFromAddress: true,
    };
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return {
      success: false,
      error: 'Could not verify address. Try "My Current Location" instead.',
    };
  }
};

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

/**
 * Filter items by location radius
 */
export const filterByLocationRadius = (items, userCoordinates, radiusKm = 25) => {
  if (!userCoordinates || !Array.isArray(items)) {
    return [];
  }

  return items.filter((item) => {
    if (!item.location || !item.location.coordinates) {
      return false;
    }

    const distance = calculateDistance(userCoordinates, item.location.coordinates);
    return distance <= radiusKm;
  });
};

/**
 * Get current geolocation with validation
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ error: 'Geolocation is not supported in this browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Validate coordinates
        const coordValidation = isValidIndianCoordinates(latitude, longitude);
        if (!coordValidation.valid) {
          reject({ error: coordValidation.error });
          return;
        }

        // Check accuracy
        const accuracyValidation = isCoordinateAccurate(accuracy);
        if (!accuracyValidation.valid) {
          // Warning, but not fatal - allow proceeding
          console.warn(accuracyValidation.warning);
        }

        // Get address from coordinates
        const geocodeResult = await reverseGeocodeCoordinates(latitude, longitude);

        resolve({
          latitude,
          longitude,
          accuracy,
          address: geocodeResult.displayAddress,
          displayAddress: geocodeResult.displayAddress,
          isVerified: true, // Verified via geolocation
        });
      },
      (error) => {
        let message = 'Unable to fetch location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
          default:
            message = 'Error fetching location.';
        }
        reject({ error: message });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Check if location is verified (from geolocation or geocoding)
 */
export const isLocationVerified = (locationData) => {
  return locationData && (locationData.isVerified || locationData.isGeocodedFromAddress);
};
