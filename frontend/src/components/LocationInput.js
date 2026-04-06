import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MapPin, LocateFixed, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  getCurrentLocation,
  reverseGeocodeCoordinates,
  forwardGeocodeAddress,
  isValidIndianCoordinates,
  isLocationVerified,
} from '../utils/locationValidation';

/**
 * LocationInput Component
 * Secure location input with validation and verification
 * 
 * Props:
 * - onLocationChange: callback when location is verified
 * - showCoordinates: show lat/lng display (default: true)
 * - required: mark as required field (default: true)
 * - label: custom label (default: "Location")
 * - readOnly: prevent manual address editing (default: false)
 */
const LocationInput = ({
  onLocationChange,
  showCoordinates = true,
  required = true,
  label = 'Location',
  readOnly = false,
}) => {
  const [locating, setLocating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [locationData, setLocationData] = useState({
    address: '',
    latitude: 28.7041, // Default: Delhi center
    longitude: 77.1025,
    accuracy: null,
    isVerified: false,
    isGeocodedFromAddress: false,
  });
  const [manualAddress, setManualAddress] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);

  /**
   * Fetch current location using browser geolocation
   */
  const handleFetchCurrentLocation = async () => {
    setLocating(true);
    try {
      const location = await getCurrentLocation();
      setLocationData({
        ...location,
        isVerified: true, // Marked as verified via geolocation
      });
      setManualAddress('');
      setShowAddressInput(false);
      
      if (onLocationChange) {
        onLocationChange({
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.displayAddress,
          isVerified: true,
        });
      }
      
      toast.success('Location verified from GPS!');
    } catch (error) {
      toast.error(error.error || 'Failed to get location');
    } finally {
      setLocating(false);
    }
  };

  /**
   * Verify manually entered address
   */
  const handleVerifyAddress = async () => {
    if (!manualAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setVerifying(true);
    try {
      const result = await forwardGeocodeAddress(manualAddress);
      
      if (!result.success) {
        toast.error(result.error);
        setVerifying(false);
        return;
      }

      // Validate coordinates
      const validation = isValidIndianCoordinates(result.latitude, result.longitude);
      if (!validation.valid) {
        toast.error(validation.error);
        setVerifying(false);
        return;
      }

      setLocationData({
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: null,
        isVerified: false,
        isGeocodedFromAddress: true, // Geocoded from address input
      });
      setManualAddress('');
      setShowAddressInput(false);

      if (onLocationChange) {
        onLocationChange({
          latitude: result.latitude,
          longitude: result.longitude,
          address: result.address,
          isVerified: false,
          isGeocodedFromAddress: true,
        });
      }

      toast.success('Address verified and location set!');
    } catch (error) {
      toast.error('Failed to verify address');
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Allow changing location via address input
   */
  const handleChangeLocation = () => {
    setShowAddressInput(true);
    setManualAddress('');
  };

  /**
   * Cancel address verification
   */
  const handleCancel = () => {
    setShowAddressInput(false);
    setManualAddress('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {locationData.isVerified && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            <CheckCircle className="w-3 h-3" />
            Verified
          </span>
        )}
        {locationData.isGeocodedFromAddress && (
          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <CheckCircle className="w-3 h-3" />
            Address Verified
          </span>
        )}
      </div>

      {!showAddressInput ? (
        <div className="space-y-3">
          {/* Current Location Display */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Current Location:</p>
                <p className="text-sm font-medium text-slate-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>{locationData.address}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Coordinates Display */}
          {showCoordinates && (
            <div className="p-2 bg-slate-50 rounded text-xs text-slate-600 font-mono">
              <div>Lat: {locationData.latitude.toFixed(6)}</div>
              <div>Lon: {locationData.longitude.toFixed(6)}</div>
              {locationData.accuracy && (
                <div>Accuracy: {Math.round(locationData.accuracy)}m</div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleFetchCurrentLocation}
              disabled={locating}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary-300 bg-primary-50 text-sm font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {locating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Locating...
                </>
              ) : (
                <>
                  <LocateFixed className="w-4 h-4" />
                  Use My Current Location
                </>
              )}
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={handleChangeLocation}
                disabled={locating}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Enter Address
              </button>
            )}
          </div>
        </div>
      ) : (
        // Address Input Mode
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Enter your location address. It will be verified before confirming.</span>
          </p>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="e.g., Delhi, India or 110001"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              onKeyPress={(e) =>
                e.key === 'Enter' && handleVerifyAddress()
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleVerifyAddress}
              disabled={verifying || !manualAddress.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Verify Address
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={verifying}
              className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
