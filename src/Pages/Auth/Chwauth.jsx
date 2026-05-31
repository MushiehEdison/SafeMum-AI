import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCHWAuth } from "../../Context/CHWAuthContext";

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

export default function CHWAuth() {
  const navigate = useNavigate();
  const { login, register } = useCHWAuth();

  const [activeTab, setActiveTab] = useState("signin");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSignInPwd, setShowSignInPwd] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", countryCode: "+237", phone: "",
    password: "", confirmPassword: "",
    speciality: "Nurse", institution: "", radius: "5km",
    latitude: null, longitude: null, locationName: "",
  });

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const update = (k, v) => setFormData((p) => ({ ...p, [k]: v }));
  const STEPS = ["Tell us about yourself", "Your work", "Almost done"];

  const handleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await login(signInEmail, signInPassword);
      navigate("/chw");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        countryCode: formData.countryCode,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        speciality: formData.speciality,
        institution: formData.institution,
        locationName: formData.locationName,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius: formData.radius,
      });
      navigate("/chw");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
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
              "Your community<br />needs you."
            </p>
            <ul className="flex flex-col gap-3">
              {["Receive case assignments", "Follow up with women in your area", "Make a real difference locally"].map((b) => (
                <li key={b} className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />{b}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-400">Empowering health workers everywhere.</p>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-8">
            {["signin", "register"].map((t) => (
              <button key={t} onClick={() => { setActiveTab(t); setStep(1); setError(""); }}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === t ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"}`}>
                {t === "signin" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {/* Step dots */}
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
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* ── SIGN IN ── */}
            {activeTab === "signin" && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-black mb-1">Welcome back</h1>
                  <p className="text-sm text-gray-500">Sign in to your CHW account.</p>
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
                  disabled={loading || !signInEmail || !signInPassword}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    !loading && signInEmail && signInPassword
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {loading ? "Signing in…" : "Sign in"}
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
                    <input type="text" placeholder="Full name" value={formData.name}
                      onChange={(e) => update("name", e.target.value)} className={inputCls} />
                    <input type="email" placeholder="Email" value={formData.email}
                      onChange={(e) => update("email", e.target.value)} className={inputCls} />
                    <div className="flex gap-2">
                      <select value={formData.countryCode} onChange={(e) => update("countryCode", e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-black w-28 shrink-0 appearance-none">
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                      </select>
                      <input type="tel" placeholder="Phone number" value={formData.phone}
                        onChange={(e) => update("phone", e.target.value)} className={`${inputCls} flex-1`} />
                    </div>
                    <PasswordField
                      value={formData.password}
                      onChange={(e) => update("password", e.target.value)}
                      show={showPassword}
                      onToggle={() => setShowPassword((p) => !p)}
                    />
                    <PasswordField
                      value={formData.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      show={showConfirm}
                      onToggle={() => setShowConfirm((p) => !p)}
                      placeholder="Confirm password"
                    />
                    <button
                      onClick={() => { setError(""); setStep(2); }}
                      disabled={!formData.name || !formData.email || !formData.password}
                      className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        formData.name && formData.email && formData.password
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}>
                      Continue
                    </button>
                  </>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className={labelCls}>Speciality</label>
                        <select value={formData.speciality} onChange={(e) => update("speciality", e.target.value)} className={selectCls}>
                          {["Nurse", "Midwife", "Volunteer Counsellor", "Community Health Volunteer"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Institution</label>
                        <input type="text" placeholder="Clinic, hospital, or organisation (optional)"
                          value={formData.institution} onChange={(e) => update("institution", e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Coverage area</label>
                        <LocationPicker formData={formData} setFormData={setFormData} />
                      </div>
                      <div>
                        <label className={labelCls}>Coverage radius</label>
                        <select value={formData.radius} onChange={(e) => update("radius", e.target.value)} className={selectCls}>
                          {["2km", "5km", "10km", "15km", "20km"].map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)}
                        className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-black text-sm font-semibold">
                        Back
                      </button>
                      <button onClick={() => { setError(""); setStep(3); }}
                        className="flex-1 py-3.5 rounded-xl bg-black text-white text-sm font-semibold">
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
                        ["Name", formData.name],
                        ["Email", formData.email],
                        ["Phone", `${formData.countryCode} ${formData.phone}`],
                        ["Speciality", formData.speciality],
                        ["Coverage area", formData.locationName || "—"],
                        ["Radius", formData.radius],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-gray-500">{k}</span>
                          <span className="text-black font-medium text-right max-w-48 truncate">{v || "—"}</span>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 accent-black" />
                      <span className="text-sm text-gray-600">I confirm that the information above is accurate</span>
                    </label>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)}
                        className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-black text-sm font-semibold">
                        Back
                      </button>
                      <button
                        onClick={handleRegister}
                        disabled={!confirmed || loading}
                        className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                          confirmed && !loading ? "bg-[#16a34a] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}>
                        {loading ? "Registering…" : "Register"}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 italic text-center leading-relaxed">
                      Your account will be verified by the SafeMum AI team before you can receive case assignments.
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