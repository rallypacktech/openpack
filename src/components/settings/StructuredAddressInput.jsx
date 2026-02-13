import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";

export default function StructuredAddressInput({ formData, onFieldChange, onAddressSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  const handleSelectAddress = (suggestion) => {
    const address = suggestion.address || {};
    
    const addressData = {
      street_address: [
        address.house_number,
        address.road || address.street
      ].filter(Boolean).join(' ') || address.hamlet || address.suburb || "",
      city: address.city || address.town || address.village || address.municipality || "",
      state_province: address.state || address.province || address.region || "",
      postal_code: address.postcode || "",
      country: address.country || "",
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    };

    setSearchQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onAddressSelect) {
      onAddressSelect(addressData);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Address */}
      <div ref={wrapperRef} className="relative">
        <Label htmlFor="address-search" className="text-sm font-medium text-gray-700">
          Search Address
        </Label>
        <div className="relative mt-1">
          <Input
            id="address-search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Start typing to search..."
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <MapPin className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectAddress(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.display_name}
                    </p>
                    {suggestion.address?.country && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {suggestion.address.country}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Street Address */}
      <div>
        <Label htmlFor="street_address" className="text-sm font-medium text-gray-700">
          Street Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="street_address"
          value={formData.street_address || ""}
          onChange={(e) => onFieldChange("street_address", e.target.value)}
          placeholder="123 Main St"
          className="mt-1"
          required
        />
      </div>

      {/* City, State, Zip in a row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city" className="text-sm font-medium text-gray-700">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city || ""}
            onChange={(e) => onFieldChange("city", e.target.value)}
            placeholder="Springfield"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="state_province" className="text-sm font-medium text-gray-700">
            State/Province <span className="text-red-500">*</span>
          </Label>
          <Input
            id="state_province"
            value={formData.state_province || ""}
            onChange={(e) => onFieldChange("state_province", e.target.value)}
            placeholder="IL"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="postal_code" className="text-sm font-medium text-gray-700">
            Zip/Postal Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="postal_code"
            value={formData.postal_code || ""}
            onChange={(e) => onFieldChange("postal_code", e.target.value)}
            placeholder="62701"
            className="mt-1"
            required
          />
        </div>
      </div>

      {/* Country */}
      <div>
        <Label htmlFor="country" className="text-sm font-medium text-gray-700">
          Country <span className="text-red-500">*</span>
        </Label>
        <Input
          id="country"
          value={formData.country || ""}
          onChange={(e) => onFieldChange("country", e.target.value)}
          placeholder="United States"
          className="mt-1"
          required
        />
      </div>
    </div>
  );
}