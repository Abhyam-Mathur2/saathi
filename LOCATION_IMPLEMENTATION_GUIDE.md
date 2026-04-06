# Location-Based Filtering Implementation Guide

## Overview
This implementation adds secure, validated location-based filtering to the Saathi platform. Users and volunteers can only see reports and other volunteers within their current location radius, ensuring location accuracy and preventing incorrect entries.

## Features Implemented

### 1. Location Validation Utility (`locationValidation.js`)
**File:** [frontend/src/utils/locationValidation.js](frontend/src/utils/locationValidation.js)

**Functions:**
- `isValidIndianCoordinates()` - Validates coordinates are within India's geographical bounds
- `isCoordinateAccurate()` - Checks location accuracy (must be ≤500m)
- `reverseGeocodeCoordinates()` - Converts coordinates to human-readable address
- `forwardGeocodeAddress()` - Verifies address and returns coordinates (with India validation)
- `calculateDistance()` - Calculates distance between two locations
- `filterByLocationRadius()` - Filters items by radius from user location
- `getCurrentLocation()` - Gets current location with validation
- `isLocationVerified()` - Checks if location data is verified

**Usage:**
```javascript
import { getCurrentLocation, forwardGeocodeAddress } from '../utils/locationValidation';

// Get current location
const location = await getCurrentLocation();
// Returns: { latitude, longitude, accuracy, address, isVerified }

// Verify entered address
const result = await forwardGeocodeAddress('New Delhi, India');
// Returns: { success, latitude, longitude, address, isGeocodedFromAddress }
```

### 2. LocationInput Component (`LocationInput.js`)
**File:** [frontend/src/components/LocationInput.js](frontend/src/components/LocationInput.js)

**Purpose:** Secure, reusable location input with validation and verification

**Features:**
- Browser geolocation with accuracy verification
- Address validation using OpenStreetMap Nominatim
- India-only location validation
- Displays location verification status (GPS or Address verified)
- Shows coordinates and accuracy in meters
- Prevents unverified location submission

**Props:**
- `onLocationChange` - Callback with verified location data
- `showCoordinates` - Display lat/lon (default: true)
- `required` - Mark as required field (default: true)
- `label` - Custom label (default: "Location")
- `readOnly` - Prevent manual address editing (default: false)

**Usage:**
```javascript
import LocationInput from '../components/LocationInput';

<LocationInput
  onLocationChange={(location) => {
    // location: { latitude, longitude, address, isVerified }
    setUserLocation(location);
  }}
  showCoordinates={true}
  required={true}
  label="Your Current Location"
/>
```

### 3. Backend Location Filtering

#### Report Filtering
**File:** [backend/controllers/reportController.js](backend/controllers/reportController.js)

**Endpoint:** `GET /api/reports`

**Query Parameters:**
- `latitude` - User's latitude (required for filtering)
- `longitude` - User's longitude (required for filtering)
- `radiusKm` - Search radius in kilometers (default: 25)

**Response Includes:**
```json
{
  "success": true,
  "data": [/* filtered reports */],
  "meta": {
    "total": 150,
    "nearby": 12,
    "radiusKm": 25,
    "userLocation": { "latitude": 28.7041, "longitude": 77.1025 }
  }
}
```

**Usage:**
```javascript
// Without filtering - all reports
const allReports = await axios.get('/api/reports');

// With location filtering - only nearby reports
const nearbyReports = await axios.get('/api/reports', {
  params: {
    latitude: 28.7041,
    longitude: 77.1025,
    radiusKm: 25  // 25km radius
  }
});
```

#### Volunteer Filtering
**File:** [backend/controllers/volunteerController.js](backend/controllers/volunteerController.js)

**Endpoint:** `GET /api/volunteers`

**Query Parameters:** Same as reports
- `latitude`, `longitude`, `radiusKm`

### 4. Updated Forms with Location Verification

#### ReportSubmission Form
**File:** [frontend/src/pages/ReportSubmission.js](frontend/src/pages/ReportSubmission.js)

**Changes:**
- Replaced manual location input with `LocationInput` component
- Added `locationVerified` flag check before form submission
- Validates location is verified (GPS or address-verified) before allowing submission

**Initialization:**
```javascript
const [formData, setFormData] = useState({
  // ... other fields
  address: '',
  latitude: 28.7041,
  longitude: 77.1025,
  locationVerified: false  // Must be true before submit
});

const handleLocationChange = (locationData) => {
  setFormData(prev => ({
    ...prev,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    address: locationData.address,
    locationVerified: locationData.isVerified || locationData.isGeocodedFromAddress
  }));
};
```

#### VolunteerRegistration Form  
**File:** [frontend/src/pages/VolunteerRegistration.js](frontend/src/pages/VolunteerRegistration.js)

**Changes:**
- Replaced manual location input with `LocationInput` component
- Added location verification requirement before registration
- Stores `locationVerified` flag in form state

## Location Verification Levels

### Level 1: GPS Verified
- Obtained via browser's Geolocation API
- Has accuracy metadata (meters)
- Most reliable

**Badge:** Green "Verified" badge
**Status Flag:** `isVerified: true`

### Level 2: Address Verified
- User enters address manually
- Geocoded using OpenStreetMap and verified to be in India
- User intentionally confirmed the address

**Badge:** Blue "Address Verified" badge
**Status Flag:** `isGeocodedFromAddress: true`

### Unverified
- User hasn't confirmed location
- Can see suggestions but cannot submit forms

## Default Behavior

### Report Submission
1. User opens ReportSubmission form
2. Default location: Delhi center (28.7041°N, 77.1025°E)
3. User must use ONE of:
   - "Use My Current Location" button (triggers browser geolocation)
   - "Enter Address" button (manual address verification)
4. Form shows verification status and coordinates
5. Only verified locations allow form submission

### Volunteer Registration
1. User opens VolunteerRegistration form
2. LocationInput appears in "Location" section
3. User must verify location (same options as reports)
4. Verified location shows in coordinates display
5. Registration requires location to be verified

### Viewing Reports/Volunteers
1. Create a page/component that fetches user's current location
2. Call API with location parameters:
   ```javascript
   const userVol = volunteers.find(v => v.email === session.email);
   const nearbyReports = await axios.get('/api/reports', {
     params: {
       latitude: userVol.location.coordinates[1],
       longitude: userVol.location.coordinates[0],
       radiusKm: 25
     }
   });
   ```

## Security Features

### Location Validation
- ✅ Only Indian coordinates accepted (bounds: 8.4°N to 35.8°N, 68.7°E to 97.25°E)
- ✅ Accuracy must be ≤500m for GPS locations
- ✅ Address verification ensures address resolves to valid India location
- ✅ Prevents fake/invalid location entries

### User Flow
- ✅ Cannot submit forms with unverified locations
- ✅ Must actively verify location (no auto-fill without permission)
- ✅ Verification badges show users how location was confirmed
- ✅ Clear feedback on location accuracy and verification status

## API Examples

### Example 1: Get Reports Near User
```javascript
// Volunteer at coordinates checking for nearby reports
const response = await axios.get(apiUrl('/api/reports'), {
  params: {
    latitude: 28.7041,      // Volunteer's latitude
    longitude: 77.1025,     // Volunteer's longitude
    radiusKm: 25            // Show reports within 25km
  }
});

console.log(response.data.meta); 
// { total: 150, nearby: 12, radiusKm: 25, userLocation: {...} }
```

### Example 2: Get Volunteers Near Citizen
```javascript
// Citizen at coordinates checking for nearby volunteers
const response = await axios.get(apiUrl('/api/volunteers'), {
  params: {
    latitude: 28.6692,      // Citizen's latitude  
    longitude: 77.0411,     // Citizen's longitude
    radiusKm: 15            // Show volunteers within 15km
  }
});

// Only volunteers within 15km returned
```

### Example 3: Submit Report with Verified Location
```javascript
// After LocationInput verification
const payload = {
  description: 'Food shortage in colony',
  issueType: 'Food',
  urgency: 8,
  location: {
    coordinates: [77.1025, 28.7041],  // [longitude, latitude]
    address: 'New Delhi, Delhi, India'
  }
};

const response = await axios.post(apiUrl('/api/reports'), payload);
```

## Testing Checklist

### Location Validation
- [ ] Enter location with GPS verification
- [ ] Verify accuracy shows (e.g., "123m accuracy")
- [ ] Try entering address manually
- [ ] See address verified badge
- [ ] Try submitting without verification - should fail
- [ ] Try location outside India - should fail/warn
- [ ] Try location >500m accuracy - should warn

### Form Submission
- [ ] ReportSubmission form shows LocationInput
- [ ] LocationInput displays current location correctly
- [ ] Can toggle between GPS and address entry
- [ ] Form prevents submission if location not verified
- [ ] VolunteerRegistration shows LocationInput
- [ ] Volunteer registration prevents incomp submission

### Filtering  
- [ ] Backend filtering returns only nearby reports
- [ ] `radiusKm` parameter works correctly
- [ ] Without location params, gets all reports
- [ ] Metadata shows correct counts

## Migration Notes

### For Existing Pages Using Location
1. **Remove old geolocation code** - Use getCurrentLocation() from locationValidation.js
2. **Replace manual location inputs** - Use LocationInput component
3. **Add locationVerified checks** - Prevent submission without verification
4. **Update API calls** - Add latitude/longitude query params for filtering

### For Dashboard/Admin Pages
- Dashboard can still fetch all reports without location filtering
- Add optional location filter dropdown for admin view
- Show "Total Reports" vs "Nearby Reports" (use metadata)

## Common Issues & Solutions

### Issue: Address geocoding fails
**Solution:** OpenStreetMap Nominatim requires "User-Agent" header - already included in locationValidation.js

### Issue: Coordinates showing "Lat X, Lng Y" format
**Solution:** Geocoding failed. User can still submit with coordinates but address will show as "Lat X, Lng Y"

### Issue: Accuracy >500m
**Solution:** Show warning but allow proceeding. User is in building, multi-floor apartment, or area with poor GPS

### Issue: Location working on desktop but not mobile
**Solution:** 
1. Ensure HTTPS (browser requires secure context)
2. Check browser location permissions
3. Ensure user is indoors with windows access (GPS needs sky view)

## Performance Considerations

### Frontend
- Geolocation calls are async - show loading state
- Address geocoding uses Nominatim (free, rate-limited) - cache results
- Distance calculations are client-side and fast

### Backend  
- Distance filtering is done in-memory (no complex queries)
- For 10,000+ reports, consider adding MongoDB geospatial index
- Current implementation: `location: '2dsphere'` index already in models

## Future Enhancements

1. **Neighborhoods/Geofencing** - Define service areas as polygons
2. **Distance Preferences** - Let users choose 5/15/25/50km radius
3. **Location History** - Track last X locations for quick selection
4. **Offline Maps** - Cache map tiles for offline viewing
5. **Auto-Updates** - Refresh location periodically if user moves
6. **Location Sharing** - Allow precise volunteer location sharing (with privacy)
7. **Impact Zones** - Geographic areas with specific volunteer teams

---

**Last Updated:** April 2026
**Status:** Production Ready
