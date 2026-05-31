import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Building2, MapPin, Calendar, Activity,
  CheckCircle2, TrendingUp, TrendingDown, LogOut, Edit2,
  Save, X, Navigation, Target, Award, Clock, Heart,
  ToggleLeft, ToggleRight, AlertCircle, Loader,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import NavCHW from "../../Components/NavCHW";
import { CHWAuthContext } from "../../Context/CHWAuthContext";
import { getCHWProfile, updateCHWProfile } from "../../API/chw";

/* ─── Fix Leaflet icon bug ─── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── Custom CHW Marker Icon ─── */
const chwIcon = L.divIcon({
  className: "chw-marker",
  html: `<div style="width:32px;height:32px;background:#16a34a;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #16a34a;"></div></div>`,
  iconSize: [32, 38],
  iconAnchor: [16, 38],
  popupAnchor: [0, -38],
});

/* ─── Map Click Handler Component ─── */
function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-300 mb-3 font-['Manrope']">
      {children}
    </p>
  );
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-5 py-2.5 text-xs font-medium font-['Manrope'] z-[9999] whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      {message}
    </div>
  );
}

export default function CHWProfile() {
  const navigate = useNavigate();
  const { chw: contextChw, logout } = useContext(CHWAuthContext);
  
  const [chwData, setChwData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [editDraft, setEditDraft] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
  });
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [isMapEditing, setIsMapEditing] = useState(false);
  const [tempLocation, setTempLocation] = useState({ lat: 0, lng: 0 });
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getCHWProfile();
        const data = res.data.data || res.data;
        setChwData(data);
        setIsAvailable(data.isAvailable ?? true);
        setEditDraft({
          fullName: data.fullName || data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          institution: data.institution || "",
          coverageArea: data.coverageArea || "",
        });
        setTempLocation({
          lat: data.latitude || -1.2679,
          lng: data.longitude || 36.8024,
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  const handleEdit = () => {
    setEditDraft({
      fullName: chwData.fullName || chwData.name || "",
      email: chwData.email || "",
      phone: chwData.phone || "",
      institution: chwData.institution || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullName: editDraft.fullName,
        email: editDraft.email,
        phone: editDraft.phone,
        institution: editDraft.institution,
        latitude: tempLocation.lat,
        longitude: tempLocation.lng,
        coverageArea: editDraft.coverageArea,
      };
      await updateCHWProfile(payload);
      setChwData(prev => ({
        ...prev,
        fullName: editDraft.fullName,
        email: editDraft.email,
        phone: editDraft.phone,
        institution: editDraft.institution,
        latitude: tempLocation.lat,
        longitude: tempLocation.lng,
      }));
      setIsEditing(false);
      setIsMapEditing(false);
      setMapKey(prev => prev + 1);
      showToast("Profile updated successfully");
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setEditDraft({
      fullName: chwData.fullName || chwData.name || "",
      email: chwData.email || "",
      phone: chwData.phone || "",
      institution: chwData.institution || "",
    });
    setTempLocation({
      lat: chwData.latitude || -1.2679,
      lng: chwData.longitude || 36.8024,
    });
    setIsEditing(false);
    setIsMapEditing(false);
  };

  const handleLocationSelect = (location) => {
    setTempLocation(location);
  };

  const handleSaveLocationOnly = async () => {
  try {
    await updateCHWProfile({
      latitude: tempLocation.lat,
      longitude: tempLocation.lng,
    });
    setChwData(prev => ({ ...prev, latitude: tempLocation.lat, longitude: tempLocation.lng }));
    setIsMapEditing(false);
    setMapKey(prev => prev + 1);
    showToast("Location updated");
  } catch (err) {
    console.error('Failed to save location:', err);
    showToast("Failed to update location");
  }
};

  const toggleAvailability = async () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);
    try {
      await updateCHWProfile({ isAvailable: newAvailability });
      showToast(newAvailability ? "You are now available" : "You are now unavailable");
    } catch (err) {
      setIsAvailable(!newAvailability);
      console.error('Failed to update availability:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/chw");
  };

  if (loading) {
    return (
      <>
        <NavCHW />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader size={24} className="animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (!chwData) {
    return (
      <>
        <NavCHW />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Profile not found</p>
        </div>
      </>
    );
  }

  const getInitials = () => {
    const name = chwData.fullName || chwData.name || "";
    return name.split(" ").map(n => n[0] || "").join("").slice(0, 2).toUpperCase();
  };

  const totalCases = chwData.stats?.totalCases || 0;
  const totalResolved = chwData.stats?.totalResolved || 0;
  const resolvedPercentage = totalCases > 0 ? (totalResolved / totalCases) * 100 : 0;
  const isHighResolved = resolvedPercentage >= 80;

  const statCards = [
    { label: "Total cases handled", value: totalCases, key: "totalCases" },
    { label: "Cases resolved", value: totalResolved, key: "resolved", highlight: isHighResolved },
    { label: "Cases escalated", value: chwData.stats?.totalEscalated || 0, key: "escalated" },
    { label: "Avg response time", value: `${chwData.stats?.avgResponseHours || 0} hrs`, key: "response" },
  ];

  const centerLat = chwData.latitude || -1.2679;
  const centerLng = chwData.longitude || 36.8024;
  const markerLat = tempLocation.lat || centerLat;
  const markerLng = tempLocation.lng || centerLng;
  
return (
    <>
      <NavCHW />

      <div className="min-h-screen bg-gray-50 font-['Manrope'] pb-28">
        <div className="md:ml-64">
          
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-lg font-bold text-gray-900 text-center">Profile</h1>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">

            <div className="text-center">
              <div className="w-[72px] h-[72px] rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-gray-700">{getInitials()}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{chwData.fullName || chwData.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-200">
                  {chwData.speciality || "Community Health Worker"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Member since {chwData.memberSince || "—"}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Available for cases</p>
                  <p className="text-xs text-gray-400 mt-0.5">When unavailable, no new cases will be assigned to you.</p>
                </div>
                <button onClick={toggleAvailability} className="transition-transform hover:scale-105">
                  {isAvailable ? (
                    <ToggleRight size={48} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={48} className="text-gray-300" />
                  )}
                </button>
              </div>
              {!isAvailable && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-600" />
                  <p className="text-xs text-amber-700 font-medium">
                    You are currently unavailable. Update this when you are ready to receive cases.
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Personal information</SectionLabel>
                {!isEditing ? (
                  <button onClick={handleEdit} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition">
                      <Save size={14} className="text-green-600" />
                    </button>
                    <button onClick={handleCancel} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition">
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <User size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Full name</span>
                    </div>
                    {isEditing ? (
                      <input type="text" value={editDraft.fullName} onChange={(e) => setEditDraft(prev => ({ ...prev, fullName: e.target.value }))}
                        className="text-sm text-gray-900 font-medium text-right bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 px-2" />
                    ) : (
                      <span className="text-sm text-gray-900 font-medium">{chwData.fullName || chwData.name}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Email</span>
                    </div>
                    {isEditing ? (
                      <input type="email" value={editDraft.email} onChange={(e) => setEditDraft(prev => ({ ...prev, email: e.target.value }))}
                        className="text-sm text-gray-900 font-medium text-right bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 px-2" />
                    ) : (
                      <span className="text-sm text-gray-900">{chwData.email}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Phone</span>
                    </div>
                    {isEditing ? (
                      <input type="tel" value={editDraft.phone} onChange={(e) => setEditDraft(prev => ({ ...prev, phone: e.target.value }))}
                        className="text-sm text-gray-900 font-medium text-right bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 px-2" />
                    ) : (
                      <span className="text-sm text-gray-900">{chwData.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Institution</span>
                    </div>
                    {isEditing ? (
                      <input type="text" value={editDraft.institution} onChange={(e) => setEditDraft(prev => ({ ...prev, institution: e.target.value }))}
                        className="text-sm text-gray-900 font-medium text-right bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 px-2" />
                    ) : (
                      <span className="text-sm text-gray-900">{chwData.institution}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Member since</span>
                    </div>
                    <span className="text-sm text-gray-900">{chwData.memberSince || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4">
  <div className="flex items-center gap-3">
    <MapPin size={14} className="text-gray-400" />
    <span className="text-xs text-gray-500">Coverage area</span>
  </div>
  {isEditing ? (
    <input type="text" value={editDraft.coverageArea}
      onChange={(e) => setEditDraft(prev => ({ ...prev, coverageArea: e.target.value }))}
      className="text-sm text-gray-900 font-medium text-right bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 px-2" />
  ) : (
    <span className="text-sm text-gray-900">{chwData.coverageArea || "—"}</span>
  )}
</div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Coverage area</SectionLabel>
                <button onClick={() => setIsMapEditing(true)} className="text-xs font-semibold text-green-600">
                  Change location
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  
                  <div className="flex items-center gap-1">
                    <Navigation size={12} className="text-gray-400" />
                    <span className="text-[11px] text-gray-400">Your location</span>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: "200px" }}>
                  <MapContainer
                    key={mapKey}
                    center={[centerLat, centerLng]}
                    zoom={14}
                    style={{ height: "100%", width: "100%" }}
                    dragging={true}
                    zoomControl={true}
                    scrollWheelZoom={true}
                  
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    
                    {markerLat !== 0 && markerLng !== 0 && (
                      <Marker position={[markerLat, markerLng]} icon={chwIcon} />
                    )}
                                        
                    {isMapEditing && <LocationPicker onLocationSelect={handleLocationSelect} />}
                  </MapContainer>
                </div>
                
                <div className="text-center mt-3">
                  {isMapEditing ? (
                    <>
                      <p className="text-[11px] text-gray-400 mb-1">Tap anywhere on the map to set a new location</p>
                      <p className="text-[11px] text-gray-400 font-mono mb-3">
                        Selected: {tempLocation.lat.toFixed(5)}, {tempLocation.lng.toFixed(5)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTempLocation({
                              lat: chwData.latitude || -1.2679,
                              lng: chwData.longitude || 36.8024,
                            });
                            setIsMapEditing(false);
                          }}
                          className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveLocationOnly}
                          className="flex-1 py-2 rounded-lg bg-gray-900 text-xs font-medium text-white hover:bg-gray-800 transition"
                        >
                          Save location
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-gray-400 font-mono">
                      {centerLat.toFixed(5)}°, {centerLng.toFixed(5)}°
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <SectionLabel>My statistics</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {statCards.map((card, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className={`text-2xl font-bold ${card.highlight ? "text-green-600" : "text-gray-900"}`}>
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-green-500" />
                    <span className="text-xs font-semibold text-gray-900">Resolution rate</span>
                  </div>
                  <span className={`text-sm font-bold ${isHighResolved ? "text-green-600" : "text-gray-900"}`}>
                    {Math.round(resolvedPercentage)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${resolvedPercentage}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  {isHighResolved ? "Excellent performance! Keep up the great work." : "Almost there! Keep supporting your patients."}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500 bg-white text-red-500 text-sm font-semibold hover:bg-red-50 transition"
              >
                <LogOut size={16} />
                Sign out
              </button>
              <p className="text-center text-[10px] text-gray-300 mt-4">
                SafeMum AI — CHW Portal v1.0
              </p>
            </div>

          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}