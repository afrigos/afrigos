import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Globe,
  Building,
  Home
} from "lucide-react";

export interface DeliveryAddress {
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email?: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  address?: DeliveryAddress;
  onSave: (address: DeliveryAddress) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  showValidation?: boolean;
}

// UK Postcode validation regex
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

// US ZIP code validation regex
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

// Phone validation regex
const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

export function AddressForm({ 
  address, 
  onSave, 
  onCancel, 
  title = "Delivery Address",
  description = "Enter your complete delivery address",
  showValidation = true
}: AddressFormProps) {
  const [formData, setFormData] = useState<DeliveryAddress>({
    streetAddress: address?.streetAddress || "",
    apartment: address?.apartment || "",
    city: address?.city || "",
    state: address?.state || "",
    postcode: address?.postcode || "",
    country: address?.country || "United Kingdom",
    phone: address?.phone || "",
    email: address?.email || "",
    deliveryInstructions: address?.deliveryInstructions || "",
    isDefault: address?.isDefault || false
  });

  const [errors, setErrors] = useState<Partial<DeliveryAddress>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validatePostcode = (postcode: string, country: string): boolean => {
    if (!postcode.trim()) return false;
    
    if (country === "United Kingdom") {
      return UK_POSTCODE_REGEX.test(postcode);
    } else if (country === "United States") {
      return US_ZIP_REGEX.test(postcode);
    }
    
    // For other countries, just check if it's not empty
    return postcode.trim().length > 0;
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone.trim()) return false;
    return PHONE_REGEX.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryAddress> = {};
    
    // Required fields
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }
    
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!formData.state.trim()) {
      newErrors.state = "State/County is required";
    }
    
    if (!validatePostcode(formData.postcode, formData.country)) {
      newErrors.postcode = formData.country === "United Kingdom" 
        ? "Please enter a valid UK postcode (e.g., SW1A 1AA)"
        : formData.country === "United States"
        ? "Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)"
        : "Postcode/ZIP code is required";
    }
    
    if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    
    if (validateForm()) {
      onSave(formData);
    }
    
    setIsValidating(false);
  };

  const handleInputChange = (field: keyof DeliveryAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getPostcodePlaceholder = (country: string): string => {
    switch (country) {
      case "United Kingdom":
        return "e.g., SW1A 1AA";
      case "United States":
        return "e.g., 12345 or 12345-6789";
      default:
        return "Postcode/ZIP code";
    }
  };

  const getStateLabel = (country: string): string => {
    switch (country) {
      case "United Kingdom":
        return "County";
      case "United States":
        return "State";
      default:
        return "State/Province";
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Street Address */}
          <div className="space-y-2">
            <Label htmlFor="streetAddress" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Street Address *</span>
            </Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              placeholder="123 Main Street"
              className={errors.streetAddress ? "border-red-500" : ""}
            />
            {errors.streetAddress && showValidation && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.streetAddress}</span>
              </p>
            )}
          </div>

          {/* Apartment/Suite */}
          <div className="space-y-2">
            <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
            <Input
              id="apartment"
              value={formData.apartment}
              onChange={(e) => handleInputChange('apartment', e.target.value)}
              placeholder="Apt 4B, Suite 100, etc."
            />
          </div>

          {/* City and State Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>City *</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="London"
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && showValidation && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.city}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">{getStateLabel(formData.country)} *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder={formData.country === "United Kingdom" ? "Greater London" : "California"}
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && showValidation && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.state}</span>
                </p>
              )}
            </div>
          </div>

          {/* Postcode and Country Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postcode" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Postcode/ZIP *</span>
              </Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                placeholder={getPostcodePlaceholder(formData.country)}
                className={errors.postcode ? "border-red-500" : ""}
              />
              {errors.postcode && showValidation && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.postcode}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Country *</span>
              </Label>
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Belgium">Belgium</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Phone Number *</span>
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+44 20 7123 4567"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && showValidation && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email (optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
            />
          </div>

          {/* Delivery Instructions */}
          <div className="space-y-2">
            <Label htmlFor="deliveryInstructions">Delivery Instructions (optional)</Label>
            <textarea
              id="deliveryInstructions"
              value={formData.deliveryInstructions}
              onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
              placeholder="Leave with neighbor, call before delivery, etc."
              className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
              rows={3}
            />
          </div>

          {/* Default Address Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked.toString())}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isDefault">Set as default delivery address</Label>
          </div>

          {/* Validation Summary */}
          {showValidation && Object.keys(errors).length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">Please fix the following errors:</p>
              <ul className="text-sm text-red-600 mt-1 space-y-1">
                {Object.values(errors).map((error, index) => (
                  error && <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              {formData.isDefault && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Default Address</span>
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isValidating}>
                {isValidating ? "Validating..." : "Save Address"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

