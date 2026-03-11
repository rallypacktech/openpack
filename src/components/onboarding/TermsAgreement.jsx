import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Lock, ExternalLink, CheckSquare } from "lucide-react";
import { createPageUrl } from "@/utils";

const TERMS_VERSION = "1.0";

export default function TermsAgreement({ onAgree }) {
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkedPrivacy, setCheckedPrivacy] = useState(false);
  const [checkedEULA, setCheckedEULA] = useState(false);
  const [checkedAge, setCheckedAge] = useState(false);
  const [loading, setLoading] = useState(false);

  const allChecked = checkedTerms && checkedPrivacy && checkedEULA && checkedAge;

  const handleAgree = async () => {
    if (!allChecked) return;
    setLoading(true);
    await onAgree(TERMS_VERSION, new Date().toISOString());
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to RallyPack</h1>
          <p className="text-gray-500 text-sm">
            Before you get started, please review and agree to our terms and policies.
            These protect both you and your family's data.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Terms & Conditions */}
          <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-blue-600 flex-shrink-0"
              checked={checkedTerms}
              onChange={(e) => setCheckedTerms(e.target.checked)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900 text-sm">Terms & Conditions</span>
              </div>
              <p className="text-xs text-gray-600">
                I have read and agree to the{" "}
                <a
                  href={createPageUrl("TermsAndConditions")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms and Conditions <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </label>

          {/* Privacy Policy */}
          <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-blue-600 flex-shrink-0"
              checked={checkedPrivacy}
              onChange={(e) => setCheckedPrivacy(e.target.checked)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900 text-sm">Privacy Policy</span>
              </div>
              <p className="text-xs text-gray-600">
                I have read and agree to the{" "}
                <a
                  href={createPageUrl("PrivacyPolicy")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy <ExternalLink className="w-3 h-3" />
                </a>
                , including how we collect, use, and protect my data.
              </p>
            </div>
          </label>

          {/* EULA */}
          <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-blue-600 flex-shrink-0"
              checked={checkedEULA}
              onChange={(e) => setCheckedEULA(e.target.checked)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900 text-sm">End User License Agreement & Confidentiality</span>
              </div>
              <p className="text-xs text-gray-600">
                I have read and agree to the{" "}
                <a
                  href={createPageUrl("EULA")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  EULA <ExternalLink className="w-3 h-3" />
                </a>
                {" "}and{" "}
                <a
                  href={createPageUrl("ConfidentialityAgreement")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Confidentiality Agreement <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </label>

          {/* Age */}
          <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-colors">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-blue-600 flex-shrink-0"
              checked={checkedAge}
              onChange={(e) => setCheckedAge(e.target.checked)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900 text-sm">Age Confirmation</span>
              </div>
              <p className="text-xs text-gray-600">
                I confirm that I am <strong>13 years of age or older</strong> and authorized to agree to these terms.
              </p>
            </div>
          </label>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-6 text-xs text-gray-500 text-center">
          By clicking "I Agree & Continue", you are electronically signing and agreeing to the above documents.
          Your agreement will be recorded with timestamp and version number.
          <br /><strong>Version {TERMS_VERSION} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
        </div>

        <Button
          onClick={handleAgree}
          disabled={!allChecked || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-base font-bold rounded-xl"
        >
          {loading ? "Recording your agreement..." : "I Agree & Continue →"}
        </Button>

        {!allChecked && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Please check all boxes above to continue
          </p>
        )}
      </div>
    </div>
  );
}