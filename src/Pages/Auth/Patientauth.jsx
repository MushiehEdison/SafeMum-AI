import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Baby, Heart, MapPin, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { registerPatient } from "../../API/auth";
import { useUserAuth } from "../../Context/UserAuthContext";
import API from "../../API/axios";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const COUNTRIES = [
  { flag: "🇨🇲", code: "+237", name: "CM" },
  { flag: "🇳🇬", code: "+234", name: "NG" },
  { flag: "🇰🇪", code: "+254", name: "KE" },
  { flag: "🇬🇭", code: "+233", name: "GH" },
  { flag: "🇿🇦", code: "+27",  name: "ZA" },
  { flag: "🇺🇬", code: "+256", name: "UG" },
  { flag: "🇸🇳", code: "+221", name: "SN" },
];

const DEFAULT_POS = [3.848, 11.502];

function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null);
  useMapEvents({});
  return (
    <Marker
      position={position}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const m = markerRef.current;
          if (m) onDragEnd(m.getLatLng());
        },
      }}
    />
  );
}

function LocationPicker({ formData, setFormData }) {
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState(formData.locationName || "");
  const [mapPos, setMapPos] = useState(
    formData.latitude ? [formData.latitude, formData.longitude] : DEFAULT_POS
  );
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        setMapPos(latlng);
        updateFromCoords(latlng[0], latlng[1]);
      },
      () => {}
    );
    setMapReady(true);
  }, []);

  async function updateFromCoords(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const name = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setQuery(name);
      setFormData((p) => ({ ...p, latitude: lat, longitude: lng, locationName: name }));
    } catch {
      setFormData((p) => ({ ...p, latitude: lat, longitude: lng }));
    }
  }

  function handleQueryChange(val) {
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {}
    }, 400);
  }

  function handleSelect(item) {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setMapPos([lat, lng]);
    setQuery(item.display_name);
    setSuggestions([]);
    setFormData((p) => ({ ...p, latitude: lat, longitude: lng, locationName: item.display_name }));
    mapRef.current?.setView([lat, lng], 14);
  }

  function handleDragEnd(latlng) {
    setMapPos([latlng.lat, latlng.lng]);
    updateFromCoords(latlng.lat, latlng.lng);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Start typing your area..."
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 outline-none focus:border-black"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
              >
                <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" />
                <span className="line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {mapReady && (
        <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 200 }}>
          <MapContainer
            center={mapPos}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            <DraggableMarker position={mapPos} onDragEnd={handleDragEnd} />
          </MapContainer>
        </div>
      )}

      <p className="text-xs text-gray-400">📍 Drag the pin to your exact location</p>
      {formData.locationName && (
        <p className="text-xs text-gray-600 font-medium truncate">{formData.locationName}</p>
      )}
    </div>
  );
}

// ── Dev OTP Popup ─────────────────────────────────────────────────────────────
function DevOtpPopup({ code, onClose }) {
  if (!code) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4 pointer-events-none">
      <div className="pointer-events-auto bg-white border border-amber-200 rounded-2xl shadow-2xl p-5 w-full max-w-sm animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🧪</span>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Prototype Mode</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          SMS delivery is disabled in this demo. Use the code below to verify:
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl py-3 px-4 text-center">
          <p className="text-3xl font-bold tracking-[0.4em] text-amber-700 font-mono">{code}</p>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          In production, this code would be sent via SMS.
        </p>
      </div>
    </div>
  );
}

export default function PatientAuth() {
  const navigate = useNavigate();
  const { verifyOtp } = useUserAuth();
  const [step, setStep]         = useState(1);
  const [isNewUser, setIsNewUser] = useState(true);
  const [formData, setFormData]  = useState({
    name: "", countryCode: "+237", phone: "", email: "", language: "English",
    latitude: null, longitude: null, locationName: "",
  });
  const [userType, setUserType]  = useState(null);
  const [otp, setOtp]            = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer]  = useState(60);
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState("");

  // ── NEW: dev OTP popup state ──────────────────────────────────────────────
  const [devOtp, setDevOtp]      = useState(null);

  const inputRefs = useRef([]);

  // OTP countdown
  useEffect(() => {
    if (step !== 2) return;
    setOtpTimer(60);
    const interval = setInterval(() => setOtpTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [step]);

  // ── Step 1 → register new user ────────────────────────────────────────────
  async function handleContinue() {
    setError("");
    setLoading(true);
    try {
      const res = await registerPatient({
        name:         formData.name.trim(),
        phone:        formData.phone.trim(),
        countryCode:  formData.countryCode,
        email:        formData.email.trim() || undefined,
        language:     formData.language,
        userType:     userType,
        latitude:     formData.latitude,
        longitude:    formData.longitude,
        locationName: formData.locationName,
      });
      // ── NEW: capture dev OTP from response ──
      setDevOtp(res.data?.data?.dev_otp || null);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1 → login existing user (send OTP) ───────────────────────────────
  async function handleLogin() {
    if (!formData.phone.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/api/patient/auth/send-otp", {
        phone:       formData.phone.trim(),
        countryCode: formData.countryCode,
      });
      // ── NEW: capture dev OTP from response ──
      setDevOtp(res.data?.data?.dev_otp || null);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Could not send OTP. Please check your number.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2 → verify OTP ───────────────────────────────────────────────────
  async function handleVerify() {
    const code = otp.join("");
    if (code.length < 6) return;
    setError("");
    setLoading(true);
    try {
      await verifyOtp(formData.phone.trim(), formData.countryCode, code);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  async function handleResend() {
    if (otpTimer > 0) return;
    setError("");
    try {
      const res = await API.post("/api/patient/auth/send-otp", {
        phone:       formData.phone.trim(),
        countryCode: formData.countryCode,
      });
      // ── NEW: capture dev OTP from response ──
      setDevOtp(res.data?.data?.dev_otp || null);
      setOtpTimer(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.response?.data?.error || "Could not resend OTP.");
    }
  }

  function handleOtpChange(i, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) handleVerify();
  }

  function handleOtpKey(i, e) {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  }

  const loginValid = formData.phone.trim();
  const step1Valid = isNewUser ? (formData.name.trim() && formData.phone.trim() && userType) : loginValid;
  const otpFilled  = otp.every((d) => d !== "");

  const inputCls  = "w-full bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 outline-none focus:border-black";
  const selectCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 outline-none focus:border-black appearance-none";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>

      {/* ── Dev OTP Popup — rendered outside main layout so it floats ── */}
      <DevOtpPopup code={devOtp} onClose={() => setDevOtp(null)} />

      <div className="min-h-screen flex bg-[#f8f6f2]">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-[#f0ece4] p-10 min-h-screen">
          <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-sm font-medium text-black tracking-tight">SafeMum AI</span>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl text-black italic leading-snug mb-8">
              "You are not alone<br />in this."
            </p>
            <ul className="flex flex-col gap-3">
              {["Track your recovery", "Find care near you", "Talk to someone who listens"].map((b) => (
                <li key={b} className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-400">Safe, private, always available.</p>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">
          {/* Step dots */}
          <div className="flex justify-end gap-2 mb-10">
            {[1, 2].map((s) => (
              <span key={s} className={`rounded-full transition-all ${step === s ? "w-3 h-3 bg-black" : "w-2 h-2 border border-gray-300 bg-transparent"}`} />
            ))}
          </div>

          <div className="max-w-md w-full mx-auto flex flex-col gap-6">

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">
                    {isNewUser ? "Welcome to SafeMum AI" : "Welcome back"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isNewUser ? "Let us get to know you a little." : "Enter your phone number to continue."}
                  </p>
                </div>

                {isNewUser && (
                  <input type="text" placeholder="Full name" value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className={inputCls} />
                )}

                <div className="flex gap-2">
                  <select value={formData.countryCode}
                    onChange={(e) => setFormData((p) => ({ ...p, countryCode: e.target.value }))}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-black w-28 shrink-0 appearance-none">
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input type="tel" placeholder="Phone number" value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className={`${inputCls} flex-1`} />
                </div>

                {isNewUser && (
                  <>
                    <input type="email" placeholder="Email (optional)" value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className={inputCls} />

                    <select value={formData.language}
                      onChange={(e) => setFormData((p) => ({ ...p, language: e.target.value }))}
                      className={selectCls}>
                      {["English", "French", "Swahili", "Hausa", "Arabic"].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>

                    <div>
                      <p className="text-sm font-medium text-black mb-3">Which best describes you right now?</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: "pregnant", Icon: Baby,  title: "I am currently pregnant",            sub: "I want to monitor my pregnancy and prevent complications" },
                          { key: "loss",     Icon: Heart, title: "I have experienced a pregnancy loss", sub: "I am recovering from a miscarriage, ectopic pregnancy, or stillbirth" },
                        ].map(({ key, Icon, title, sub }) => (
                          <button key={key} type="button" onClick={() => setUserType(key)}
                            className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${userType === key ? "border-black bg-black text-white" : "border-gray-200 bg-white text-black"}`}>
                            <Icon size={20} strokeWidth={1.6} />
                            <p className="text-xs font-semibold leading-snug">{title}</p>
                            <p className={`text-xs leading-relaxed ${userType === key ? "text-gray-300" : "text-gray-500"}`}>{sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                <button
                  onClick={isNewUser ? handleContinue : handleLogin}
                  disabled={!step1Valid || loading}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${step1Valid && !loading ? "bg-black text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                  {loading ? "Please wait…" : isNewUser ? "Continue" : "Send OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsNewUser(!isNewUser); setError(""); setUserType(null); }}
                  className="text-sm text-gray-400 hover:text-black text-center w-full"
                >
                  {isNewUser ? "Already have an account? Log in" : "New user? Create account"}
                </button>
              </>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">Verify your phone number</h1>
                  <p className="text-sm text-gray-500">
                    We sent a 6-digit code to {formData.countryCode} {formData.phone}. Enter it below.
                  </p>
                </div>

                <div className="flex gap-2 justify-between">
                  {otp.map((d, i) => (
                    <input key={i} ref={(el) => (inputRefs.current[i] = el)}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      className="w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-lg bg-white outline-none focus:border-black" />
                  ))}
                </div>

                {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                <button disabled={!otpFilled || loading} onClick={handleVerify}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${otpFilled && !loading ? "bg-black text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                  {loading ? "Verifying…" : "Verify and continue"}
                </button>

                <div className="flex flex-col items-center gap-2">
                  <button onClick={handleResend} disabled={otpTimer > 0}
                    className={`text-sm ${otpTimer > 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black"}`}>
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend code"}
                  </button>
                  <button onClick={() => { setStep(1); setError(""); setOtp(["","","","","",""]); setDevOtp(null); }}
                    className="text-sm text-gray-400 hover:text-black">
                    Change phone number
                  </button>
                </div>

                {/* ── NEW: show OTP hint button if popup was dismissed ── */}
                {!devOtp && (
                  <button
                    type="button"
                    onClick={() => setDevOtp("check Render logs")}
                    className="text-xs text-amber-500 hover:text-amber-700 text-center underline"
                  >
                    🧪 Show prototype OTP hint
                  </button>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}