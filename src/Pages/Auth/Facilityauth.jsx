import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFacilityAuth } from "../../Context/FacilityAuthContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const COUNTRIES = [
  { flag: "🇨🇲", code: "+237" }, { flag: "🇳🇬", code: "+234" },
  { flag: "🇰🇪", code: "+254" }, { flag: "🇬🇭", code: "+233" },
  { flag: "🇿🇦", code: "+27" },  { flag: "🇺🇬", code: "+256" },
  { flag: "🇸🇳", code: "+221" },
];

const DEFAULT_POS = [-1.286389, 36.817223];

const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 outline-none focus:border-black";
const selectCls = "w-full bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 outline-none focus:border-black appearance-none";
const labelCls = "block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide";

function PasswordField({ value, onChange, show, onToggle, placeholder = "Password" }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputCls}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-black transition-colors">
      <span className="text-sm text-gray-700">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${checked ? "bg-black" : "bg-gray-200"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </div>
    </label>
  );
}

function MapInteraction({ onPlace }) {
  useMapEvents({
    click(e) {
      onPlace(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function LocationPicker({ formData, setFormData }) {
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState(formData.locationName || "");
  const [mapPos, setMapPos] = useState(
    formData.latitude ? [formData.latitude, formData.longitude] : DEFAULT_POS
  );
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const ll = [pos.coords.latitude, pos.coords.longitude];
        setMapPos(ll);
        updateFromCoords(ll[0], ll[1]);
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

  function handlePlace(lat, lng) {
    setMapPos([lat, lng]);
    updateFromCoords(lat, lng);
  }

  function handleDragEnd() {
    const m = markerRef.current;
    if (m) {
      const { lat, lng } = m.getLatLng();
      handlePlace(lat, lng);
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
        setSuggestions(await res.json());
      } catch {}
    }, 400);
  }

  function handleSelect(item) {
    const lat = parseFloat(item.lat), lng = parseFloat(item.lon);
    setMapPos([lat, lng]);
    setQuery(item.display_name);
    setSuggestions([]);
    setFormData((p) => ({ ...p, latitude: lat, longitude: lng, locationName: item.display_name }));
    mapRef.current?.setView([lat, lng], 14);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Start typing your area..."
          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-black"
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
            <MapInteraction onPlace={handlePlace} />
            <Marker
              position={mapPos}
              draggable
              ref={markerRef}
              eventHandlers={{ dragend: handleDragEnd }}
            />
          </MapContainer>
        </div>
      )}

      <p className="text-xs text-gray-400">📍 Click the map or drag the pin to set your exact location</p>
      {formData.locationName && (
        <p className="text-xs text-gray-600 font-medium truncate">{formData.locationName}</p>
      )}
    </div>
  );
}

export default function FacilityAuth() {
  const navigate = useNavigate();
  const { login, register } = useFacilityAuth();

  const [activeTab, setActiveTab] = useState("signin");
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSignInPwd, setShowSignInPwd] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    facilityName: "", facilityType: "Health Centre", ownership: "Public",
    email: "", countryCode: "+237", phone: "",
    county: "", district: "",
    capabilities: { postLoss: false, bloodBank: false, surgical: false, maternity: false },
    password: "", confirmPassword: "",
    latitude: null, longitude: null, locationName: "",
  });

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const update = (k, v) => setFormData((p) => ({ ...p, [k]: v }));
  const updateCap = (k) =>
    setFormData((p) => ({ ...p, capabilities: { ...p.capabilities, [k]: !p.capabilities[k] } }));

  const STEPS = ["Facility information", "Location and capabilities", "Review and submit"];

  const handleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await login(signInEmail, signInPassword);
      navigate("/facility");
    } catch (err) {
      setError(err.response?.data?.error || "Sign in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await register({
        facilityName:    formData.facilityName,
        facilityType:    formData.facilityType,
        ownership:       formData.ownership,
        email:           formData.email,
        countryCode:     formData.countryCode,
        phone:           formData.phone,
        locationName:    formData.locationName,
        latitude:        formData.latitude,
        longitude:       formData.longitude,
        county:          formData.county,
        district:        formData.district,
        capabilities:    formData.capabilities,
        password:        formData.password,
        confirmPassword: formData.confirmPassword,
      });
      navigate("/facility");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@1,400&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>
      <div className="min-h-screen flex bg-[#f8f6f2]">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-[#f0ece4] p-10 min-h-screen">
          <span style={{ fontFamily: "'DM Mono', monospace" }} className="text-sm font-medium text-black">SafeMum AI</span>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl text-black italic leading-snug mb-8">
              "Be ready before<br />they arrive."
            </p>
            <ul className="flex flex-col gap-3">
              {["Receive emergency alerts instantly", "Manage incoming referrals", "Update your capabilities in real time"].map((b) => (
                <li key={b} className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />{b}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-400">Connecting facilities to those who need them.</p>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-8">
            {["signin", "register"].map((t) => (
              <button key={t} onClick={() => { setActiveTab(t); setStep(1); setError(null); }}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === t ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
                {t === "signin" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {activeTab === "register" && (
            <div className="flex justify-end gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`rounded-full transition-all ${step === s ? "w-3 h-3 bg-black" : "w-2 h-2 border border-gray-300"}`} />
              ))}
            </div>
          )}

          <div className="max-w-md w-full mx-auto flex flex-col gap-5">

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ── SIGN IN ── */}
            {activeTab === "signin" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">Facility sign in</h1>
                  <p className="text-sm text-gray-500">Access your facility dashboard.</p>
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className={inputCls}
                />
                <PasswordField
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  show={showSignInPwd}
                  onToggle={() => setShowSignInPwd((p) => !p)}
                />
                <button
                  onClick={handleSignIn}
                  disabled={isLoading || !signInEmail || !signInPassword}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    isLoading || !signInEmail || !signInPassword
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white"
                  }`}
                >
                  {isLoading ? "Signing in…" : "Sign in"}
                </button>
              </>
            )}

            {/* ── REGISTER ── */}
            {activeTab === "register" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">{STEPS[step - 1]}</h1>
                  <p className="text-sm text-gray-500">Step {step} of 3</p>
                </div>

                {/* Step 1 */}
                {step === 1 && (
                  <>
                    <div>
                      <label className={labelCls}>Facility name</label>
                      <input type="text" placeholder="Full facility name" value={formData.facilityName}
                        onChange={(e) => update("facilityName", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Facility type</label>
                      <select value={formData.facilityType} onChange={(e) => update("facilityType", e.target.value)} className={selectCls}>
                        {["Dispensary", "Health Centre", "Hospital", "Referral Hospital"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Ownership</label>
                      <select value={formData.ownership} onChange={(e) => update("ownership", e.target.value)} className={selectCls}>
                        {["Public", "Private", "Faith-based"].map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" placeholder="Official email" value={formData.email}
                        onChange={(e) => update("email", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <div className="flex gap-2">
                        <select value={formData.countryCode} onChange={(e) => update("countryCode", e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-black w-28 shrink-0 appearance-none">
                          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                        </select>
                        <input type="tel" placeholder="Phone number" value={formData.phone}
                          onChange={(e) => update("phone", e.target.value)} className={`${inputCls} flex-1`} />
                      </div>
                    </div>
                    <button
                      onClick={() => { setError(null); setStep(2); }}
                      disabled={!formData.facilityName || !formData.email}
                      className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        formData.facilityName && formData.email
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continue
                    </button>
                  </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <>
                    <div>
                      <label className={labelCls}>Location</label>
                      <LocationPicker formData={formData} setFormData={setFormData} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>County</label>
                        <input type="text" placeholder="County" value={formData.county}
                          onChange={(e) => update("county", e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>District</label>
                        <input type="text" placeholder="District" value={formData.district}
                          onChange={(e) => update("district", e.target.value)} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Capabilities</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Toggle checked={formData.capabilities.postLoss} onChange={() => updateCap("postLoss")} label="Post-loss care" />
                        <Toggle checked={formData.capabilities.bloodBank} onChange={() => updateCap("bloodBank")} label="Blood bank" />
                        <Toggle checked={formData.capabilities.surgical} onChange={() => updateCap("surgical")} label="Surgical capacity" />
                        <Toggle checked={formData.capabilities.maternity} onChange={() => updateCap("maternity")} label="Maternity ward" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Password</label>
                      <PasswordField
                        value={formData.password}
                        onChange={(e) => update("password", e.target.value)}
                        show={showPassword}
                        onToggle={() => setShowPassword((p) => !p)}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Confirm password</label>
                      <PasswordField
                        value={formData.confirmPassword}
                        onChange={(e) => update("confirmPassword", e.target.value)}
                        show={showConfirm}
                        onToggle={() => setShowConfirm((p) => !p)}
                        placeholder="Confirm password"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => { setError(null); setStep(1); }}
                        className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-black text-sm font-semibold">
                        Back
                      </button>
                      <button
                        onClick={() => { setError(null); setStep(3); }}
                        disabled={!formData.password || formData.password !== formData.confirmPassword}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                          formData.password && formData.password === formData.confirmPassword
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Continue
                      </button>
                    </div>
                  </>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Review your details</p>
                      {[
                        ["Facility name", formData.facilityName],
                        ["Type", formData.facilityType],
                        ["Ownership", formData.ownership],
                        ["Email", formData.email],
                        ["Phone", `${formData.countryCode} ${formData.phone}`],
                        ["Location", formData.locationName || "—"],
                        ["County", formData.county || "—"],
                        ["District", formData.district || "—"],
                        ["Capabilities", Object.entries(formData.capabilities)
                          .filter(([, v]) => v)
                          .map(([k]) => ({ postLoss: "Post-loss", bloodBank: "Blood bank", surgical: "Surgical", maternity: "Maternity" }[k]))
                          .join(", ") || "None selected"],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-gray-500 shrink-0">{k}</span>
                          <span className="text-black font-medium text-right max-w-52 truncate ml-4">{v}</span>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 accent-black" />
                      <span className="text-sm text-gray-600">I confirm this information is accurate and authorised.</span>
                    </label>
                    <div className="flex gap-3">
                      <button onClick={() => { setError(null); setStep(2); }}
                        className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-black text-sm font-semibold">
                        Back
                      </button>
                      <button
                        onClick={handleRegister}
                        disabled={!confirmed || isLoading}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                          confirmed && !isLoading
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {isLoading ? "Registering…" : "Register"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 italic text-center leading-relaxed">
                      Facilities are manually verified by the SafeMum AI admin team before going live on the platform.
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}