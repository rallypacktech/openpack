import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, X, Mail } from "lucide-react";

const AUDIENCE_OPTIONS = [
  { value: 'general', label: 'General / Household', path: '/LearnMore' },
  { value: 'equine', label: 'Equine / Horses', path: '/equine' },
  { value: 'canine', label: 'Canine / Dogs', path: '/canine' },
  { value: 'feline', label: 'Feline / Cats', path: '/feline' },
  { value: 'infant', label: 'Infants', path: '/infant' },
  { value: 'avian', label: 'Avian / Birds', path: '/avian' },
  { value: 'reptile', label: 'Reptiles', path: '/reptile' },
  { value: 'livestock', label: 'Livestock', path: '/livestock' },
];

export default function AdminReferralForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    referee_email: '',
    referee_name: '',
    organization_name: '',
    audience_type: 'general',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.referee_email) {
      setError('Business email is required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('adminReferBusiness', formData);
      setResult(response.data);
      setFormData({
        referee_email: '',
        referee_name: '',
        organization_name: '',
        audience_type: 'general',
        message: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to send referral');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAudience = AUDIENCE_OPTIONS.find(o => o.value === formData.audience_type);

  if (result) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Send className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">{result.message}</p>
              <p className="text-xs text-green-700 mt-1">
                Audience: {result.audience} · Status: Contacted
              </p>
            </div>
          </div>
          {result.mailto_url && (
            <Button type="button" size="sm" onClick={() => window.open(result.mailto_url, '_blank')}>
              <Mail className="w-4 h-4 mr-2" /> Open Email Client
            </Button>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => { setResult(null); if (onSuccess) onSuccess(result); }}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="org_name">Organization Name</Label>
          <Input
            id="org_name"
            value={formData.organization_name}
            onChange={(e) => handleChange('organization_name', e.target.value)}
            placeholder="e.g., Blue Ribbon Stables"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input
            id="contact_name"
            value={formData.referee_name}
            onChange={(e) => handleChange('referee_name', e.target.value)}
            placeholder="e.g., Jane Smith"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Business Email *</Label>
          <Input
            id="contact_email"
            type="email"
            required
            value={formData.referee_email}
            onChange={(e) => handleChange('referee_email', e.target.value)}
            placeholder="jane@blueribbonstables.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="audience_type">Audience / Species Type</Label>
          <Select
            value={formData.audience_type}
            onValueChange={(val) => handleChange('audience_type', val)}
          >
            <SelectTrigger id="audience_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedAudience && (
        <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded">
          The email will include the audience type ({selectedAudience.label}) and link to <strong>/BusinessOnboarding</strong> and <strong>{selectedAudience.path}</strong>.
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="message">Personal Message (optional)</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Add a personal note to the business..."
          rows={3}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
          ) : (
            <><Send className="w-4 h-4 mr-2" /> Send Referral Email</>
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
        )}
      </div>
    </form>
  );
}