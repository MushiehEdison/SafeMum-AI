import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MapContainer, TileLayer, Marker,
  useMap, useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Search, SlidersHorizontal, X, MapPin, ChevronLeft,
  AlertCircle, Car, Check, User, Building2, ChevronRight,
  Clock, Phone, Navigation, Bell, Share2, Star,
  ImageOff, Heart, Droplets, Wind,
  Activity, Stethoscope, Ambulance, Baby, Loader,
} from "lucide-react";
import { getNearbyFacilities } from "../../API/facilities";

/* ────────────────────────────────────────────────────────────────────────────
   FIX LEAFLET DEFAULT ICON ISSUE
──────────────────────────────────────────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ────────────────────────────────────────────────────────────────────────────
   PIN / MARKER ICONS (CACHED FOR PERFORMANCE)
──────────────────────────────────────────────────────────────────────────── */
const pinCache = new Map();

function createCustomPin({ color, active, size = 34 }) {
  const cacheKey = `${color}-${active}-${size}`;
  if (pinCache.has(cacheKey)) return pinCache.get(cacheKey);
  
  const s = active ? size + 10 : size;
  const html = `
    <svg width="${s}" height="${s + 10}" viewBox="0 0 ${s} ${s + 10}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${color.slice(1)}">
          <feDropShadow dx="0" dy="${active ? 4 : 2}" stdDeviation="${active ? 5 : 3}" flood-color="rgba(0,0,0,${active ? 0.4 : 0.22})"/>
        </filter>
      </defs>
      ${active ? `<circle cx="${s/2}" cy="${s/2}" r="${s/2 - 2}" fill="${color}" opacity="0.15"/>` : ""}
      <path d="M${s/2} ${s+8} C${s/2} ${s+8} 3 ${s*0.65} 3 ${s/2} A${s/2 - 3} ${s/2 - 3} 0 1 1 ${s-3} ${s/2} C${s-3} ${s*0.65} ${s/2} ${s+8} ${s/2} ${s+8}Z" 
        fill="${color}" filter="url(#shadow-${color.slice(1)})"/>
      <circle cx="${s/2}" cy="${s/2}" r="${Math.max(6, Math.round(s * 0.22))}" fill="white" opacity="0.95"/>
      ${active ? `<circle cx="${s/2}" cy="${s/2}" r="${Math.max(4, Math.round(s * 0.14))}" fill="${color}"/>` : ""}
    </svg>
  `;
  
  const icon = L.divIcon({
    className: "custom-marker",
    html,
    iconSize: [s, s + 10],
    iconAnchor: [s / 2, s + 8],
    popupAnchor: [0, -s],
  });
  
  pinCache.set(cacheKey, icon);
  return icon;
}

const PINS = {
  hospital: createCustomPin({ color: "#16a34a", active: false, size: 34 }),
  hospitalActive: createCustomPin({ color: "#16a34a", active: true, size: 44 }),
  clinic: createCustomPin({ color: "#6b7280", active: false, size: 32 }),
  clinicActive: createCustomPin({ color: "#6b7280", active: true, size: 42 }),
  chw: createCustomPin({ color: "#111111", active: false, size: 32 }),
  chwActive: createCustomPin({ color: "#111111", active: true, size: 42 }),
};

const USER_ICON = L.divIcon({
  className: "user-location-marker",
  html: `
    <div style="position:relative;width:24px;height:24px">
      <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(37,99,235,0.2);border:2px solid rgba(37,99,235,0.4);animation:pulse-ring 2s infinite ease-out;"></div>
      <div style="position:absolute;top:4px;left:4px;width:16px;height:16px;border-radius:50%;background:#2563eb;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>
    </div>
    <style>
      @keyframes pulse-ring {
        0% { transform: scale(0.8); opacity: 0.8; }
        70% { transform: scale(2); opacity: 0; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    </style>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function getPinForFacility(facility, activeId) {
  const isActive = facility.id === activeId || facility._id === activeId;
  if (facility.type === "Hospital") return isActive ? PINS.hospitalActive : PINS.hospital;
  if (facility.type === "Clinic" || facility.type === "Health Centre") return isActive ? PINS.clinicActive : PINS.clinic;
  return isActive ? PINS.chwActive : PINS.chw;
}

/* ────────────────────────────────────────────────────────────────────────────
   HELPER COMPONENTS
──────────────────────────────────────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          strokeWidth={0}
          fill={i <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"}
          style={{ display: "inline-block" }}
        />
      ))}
    </div>
  );
}

function getTravelTime(distanceKm) {
  const carMinutes = Math.max(1, Math.round((distanceKm / 35) * 60));
  const walkMinutes = Math.max(1, Math.round((distanceKm / 4.5) * 60));
  return { car: `${carMinutes} min`, walk: `${walkMinutes} min` };
}

function openGoogleMapsDirections(from, to, mode = "driving") {
  const origin = from ? `${from.lat},${from.lng}` : "";
  const destination = `${to.lat},${to.lng}`;
  const url = `https://www.google.com/maps/dir/${origin}/${destination}/?travelmode=${mode}&dir_action=navigate`;
  window.open(url, "_blank");
}

/* ────────────────────────────────────────────────────────────────────────────
   MAP HELPERS
──────────────────────────────────────────────────────────────────────────── */
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick });
  return null;
}

function FlyToUser({ position, shouldFly }) {
  const map = useMap();
  const hasFlown = useRef(false);
  
  useEffect(() => {
    if (position && shouldFly && !hasFlown.current) {
      hasFlown.current = true;
      setTimeout(() => {
        map.flyTo(position, 14, { duration: 1.2, animate: true });
      }, 300);
    }
  }, [position, shouldFly, map]);
  
  return null;
}

/* ────────────────────────────────────────────────────────────────────────────
   DETAIL CONTENT COMPONENT (unchanged)
──────────────────────────────────────────────────────────────────────────── */
function DetailContent({ facility, userLocation, onDirections, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const isCHW = facility.type === "Community Health Worker";
  const accentColor = isCHW ? "#111111" : facility.type === "Hospital" ? "#16a34a" : "#6b7280";
  const travel = getTravelTime(facility.distanceKm);
  const images = facility.images || [];
  const shortDescription = (facility.description || "").length > 150 
    ? facility.description.substring(0, 150) + "..."
    : facility.description || "";
  
  const handleSendAlert = async () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };
  
  const handleShare = async () => {
    const shareText = `${facility.name}\n${facility.address}\nRating: ${facility.rating}★\nPhone: ${facility.phone}\n\nhttps://maps.google.com/?q=${facility.latitude},${facility.longitude}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: facility.name,
          text: shareText,
          url: `https://maps.google.com/?q=${facility.latitude},${facility.longitude}`,
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <div style={{ position: "relative", height: 200, backgroundColor: "#f4f3f0", flexShrink: 0, overflow: "hidden" }}>
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={facility.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                  style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                  style={{ position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.5)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                  <ChevronRight size={18} />
                </button>
                <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                  {images.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)}
                      style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: idx === currentImageIndex ? "white" : "rgba(255,255,255,0.5)", border: "none", padding: 0, cursor: "pointer" }} />
                  ))}
                </div>
              </>
            )}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px", background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
              <h2 style={{ color: "white", fontSize: 20, fontWeight: 700, margin: 0, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{facility.name}</h2>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, margin: "4px 0 0" }}>{facility.type} • {facility.address}</p>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
            <ImageOff size={36} color="#d1d5db" />
            <p style={{ fontSize: 13, color: "#9ca3af" }}>No images available</p>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px", background: "linear-gradient(to top, #f4f3f0, transparent)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{facility.name}</h2>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{facility.type} • {facility.address}</p>
            </div>
          </div>
        )}
        
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          {facility.emergency && (
            <span style={{ backgroundColor: "#dc2626", color: "white", padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, backdropFilter: "blur(4px)" }}>Emergency</span>
          )}
          {isCHW && facility.available !== undefined && (
            <span style={{ backgroundColor: facility.available ? "#16a34a" : "#6b7280", color: "white", padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, backdropFilter: "blur(4px)" }}>
              {facility.available ? "Available" : "Unavailable"}
            </span>
          )}
        </div>
      </div>
      
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          
          <span style={{ width: 1, height: 16, backgroundColor: "#e5e7eb" }} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>{facility.hours}</span>
        </div>
        
        {!isCHW && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {facility.hasPostLossCare && (
              <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                <Heart size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> Post-Loss Care
              </span>
            )}
            {facility.hasBloodBank && (
              <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                <Droplets size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> Blood Bank
              </span>
            )}
            {facility.hasSurgical && (
              <span style={{ backgroundColor: "#e0e7ff", color: "#3730a3", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                <Activity size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> Surgical Unit
              </span>
            )}
            {facility.hasMaternity && (
              <span style={{ backgroundColor: "#fce7f3", color: "#9d174d", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                <Baby size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> Maternity Care
              </span>
            )}
          </div>
        )}
        
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
            {showFullDescription ? facility.description : shortDescription}
          </p>
          {(facility.description || "").length > 150 && (
            <button onClick={() => setShowFullDescription(!showFullDescription)}
              style={{ background: "none", border: "none", color: accentColor, fontSize: 12, fontWeight: 600, marginTop: 8, cursor: "pointer", padding: 0 }}>
              {showFullDescription ? "Show less" : "Read more"}
            </button>
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #e8e6e1", borderBottom: "1px solid #e8e6e1", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} color="#6b7280" /><span style={{ fontWeight: 700 }}>{facility.distanceKm} km away</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Car size={14} color="#9ca3af" /><span style={{ fontSize: 12 }}>{travel.car} by car</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} color="#9ca3af" /><span style={{ fontSize: 12 }}>{travel.walk} walking</span></div>
        </div>
        
        {facility.amenities && facility.amenities.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 10 }}>Amenities</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {facility.amenities.map((amenity) => (
                <span key={amenity} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, backgroundColor: "#f8f7f4", color: "#374151" }}>{amenity}</span>
              ))}
            </div>
          </div>
        )}
        
        {isCHW && facility.coverageArea && (
          <div style={{ padding: "12px", backgroundColor: "#f8f7f4", borderRadius: 12, marginBottom: 16, border: "1px solid #e8e6e1" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>Coverage Area</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: 0 }}>{facility.coverageArea}</p>
            {facility.specialty && (
              <>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.16em", margin: "8px 0 4px" }}>Specialty</p>
                <p style={{ fontSize: 13, color: "#4b5563", margin: 0 }}>{facility.specialty}</p>
              </>
            )}
          </div>
        )}
        
        <a href={`tel:${facility.phone}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", backgroundColor: "#f8f7f4", borderRadius: 12, textDecoration: "none", marginBottom: 16, border: "1px solid #e8e6e1", transition: "all 0.2s" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><Phone size={18} color={accentColor} /></div>
          <div><p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Call for assistance</p><p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{facility.phone}</p></div>
        </a>
        
        {isCHW ? (
          <>
            <a href={`tel:${facility.phone}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", backgroundColor: accentColor, color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 10, cursor: "pointer" }}>
              <Phone size={16} /> Call {facility.name.split(" ")[0]}
            </a>
            <button onClick={handleShare} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", backgroundColor: "white", border: "1px solid #e8e6e1", borderRadius: 14, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              {copied ? <Check size={16} color="#16a34a" /> : <Share2 size={16} />}{copied ? "Copied" : "Share Contact"}
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={onDirections} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              <Navigation size={18} /> Get Directions (Google Maps)
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={handleSendAlert} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", backgroundColor: alertSent ? "#16a34a" : "#dc2626", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                {alertSent ? <Check size={16} /> : <Bell size={16} />}{alertSent ? "Alert Sent" : "Emergency Alert"}
              </button>
              <button onClick={handleShare} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", backgroundColor: "white", border: "1px solid #e8e6e1", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                {copied ? <Check size={16} color="#16a34a" /> : <Share2 size={16} />}{copied ? "Copied" : "Share"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   MINI PREVIEW CARD
──────────────────────────────────────────────────────────────────────────── */
function MiniCard({ facility, position, onViewDetails, onClose }) {
  const isCHW = facility.type === "Community Health Worker";
  const accentColor = isCHW ? "#111111" : facility.type === "Hospital" ? "#16a34a" : "#6b7280";
  const travel = getTravelTime(facility.distanceKm);
  const cardWidth = 260;
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 375;
  const left = Math.max(8, Math.min(position.x - cardWidth / 2, screenWidth - cardWidth - 8));
  
  return (
    <div style={{ position: "absolute", left, top: position.y - 85, width: cardWidth, zIndex: 1300, animation: "slideUp 0.15s ease-out" }}>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ backgroundColor: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 28px rgba(0,0,0,0.12)", border: "1px solid #e8e6e1" }}>
        <div style={{ height: 3, backgroundColor: accentColor }} />
        <div style={{ padding: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isCHW ? <User size={16} color={accentColor} /> : <Building2 size={16} color={accentColor} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{facility.name}</p>
              <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>{isCHW ? facility.specialty : facility.type} • {facility.distanceKm} km</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><X size={14} color="#9ca3af" /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Stars rating={facility.rating} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>{facility.rating}</span>
            <span style={{ fontSize: 11, color: "#bbb" }}>•</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Car size={10} color="#9ca3af" /><span style={{ fontSize: 11, color: "#6b7280" }}>{travel.car}</span></div>
          </div>
          <button onClick={onViewDetails} style={{ width: "100%", padding: "10px", backgroundColor: accentColor, color: "white", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            View Full Details <ChevronRight size={12} style={{ marginLeft: 6, verticalAlign: "middle" }} />
          </button>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: -1 }}>
        <div style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid white", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.1))" }} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   FILTER MODAL
──────────────────────────────────────────────────────────────────────────── */
function FilterModal({ filters, onFilterChange, onClose }) {
  const filterOptions = [
    { key: "hospitalsOnly", label: "Hospitals only", icon: Building2 },
    { key: "clinicsOnly", label: "Clinics only", icon: Stethoscope },
    { key: "chwOnly", label: "Community Health Workers", icon: User },
    { key: "postLossOnly", label: "Post-Loss Care", icon: Heart },
    { key: "emergencyOnly", label: "Emergency Services", icon: Ambulance },
  ];
  
  const activeCount = Object.values(filters).filter(Boolean).length;
  
  return (
    <div style={{ position: "absolute", top: 80, right: 16, width: 280, backgroundColor: "white", borderRadius: 20, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", zIndex: 1200, overflow: "hidden", border: "1px solid #e8e6e1" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f0eeea" }}>
        <div><h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Filters</h3>{activeCount > 0 && <p style={{ fontSize: 11, color: "#16a34a", margin: "4px 0 0" }}>{activeCount} active</p>}</div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#f8f7f4", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
      </div>
      <div style={{ padding: "12px 16px" }}>
        {filterOptions.map((option) => {
          const Icon = option.icon;
          return (
            <label key={option.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f8f7f4", cursor: "pointer" }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: filters[option.key] ? "#16a34a" : "white", border: `1.5px solid ${filters[option.key] ? "#16a34a" : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                {filters[option.key] && <Check size={12} color="white" strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon size={13} color="#666" /><p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{option.label}</p></div></div>
              <input type="checkbox" checked={!!filters[option.key]} onChange={() => onFilterChange({ ...filters, [option.key]: !filters[option.key] })} style={{ display: "none" }} />
            </label>
          );
        })}
      </div>
      {activeCount > 0 && (
        <div style={{ padding: "12px 16px 20px", borderTop: "1px solid #f0eeea" }}>
          <button onClick={() => onFilterChange({ hospitalsOnly: false, clinicsOnly: false, chwOnly: false, postLossOnly: false, emergencyOnly: false })}
            style={{ width: "100%", padding: "10px", backgroundColor: "#f8f7f4", border: "none", borderRadius: 12, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>Clear all</button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   DESKTOP SIDE PANEL
──────────────────────────────────────────────────────────────────────────── */
function SidePanel({ facility, userLocation, onDirections, onClose }) {
  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 400, backgroundColor: "white", boxShadow: "-4px 0 32px rgba(0,0,0,0.08)", zIndex: 1100, display: "flex", flexDirection: "column", animation: "slideIn 0.22s ease" }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}><X size={18} color="white" /></button>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <DetailContent facility={facility} userLocation={userLocation} onDirections={onDirections} onClose={onClose} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   MOBILE DRAGGABLE BOTTOM SHEET
──────────────────────────────────────────────────────────────────────────── */
function DraggableSheet({ facility, userLocation, onDirections, onClose }) {
  const [height, setHeight] = useState(window.innerHeight * 0.55);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const startHeight = useRef(height);
  
  const snapPoints = {
    collapsed: Math.min(140, window.innerHeight * 0.2),
    expanded: window.innerHeight * 0.55,
    full: window.innerHeight * 0.9,
  };
  
  const handleDragStart = (clientY) => { setIsDragging(true); dragStartY.current = clientY; startHeight.current = height; };
  const handleDragMove = (clientY) => { if (!isDragging) return; const delta = dragStartY.current - clientY; let newHeight = startHeight.current + delta; newHeight = Math.max(snapPoints.collapsed, Math.min(snapPoints.full, newHeight)); setHeight(newHeight); };
  const handleDragEnd = (clientY) => {
    setIsDragging(false);
    const delta = dragStartY.current - clientY;
    const finalHeight = startHeight.current + delta;
    const distances = { collapsed: Math.abs(finalHeight - snapPoints.collapsed), expanded: Math.abs(finalHeight - snapPoints.expanded), full: Math.abs(finalHeight - snapPoints.full) };
    let targetHeight = snapPoints.expanded;
    if (distances.collapsed < distances.expanded && distances.collapsed < distances.full) targetHeight = snapPoints.collapsed;
    else if (distances.full < distances.expanded && distances.full < distances.collapsed) targetHeight = snapPoints.full;
    if (targetHeight === snapPoints.collapsed) onClose();
    else setHeight(targetHeight);
  };
  
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height, backgroundColor: "white", borderRadius: "20px 20px 0 0", boxShadow: "0 -4px 28px rgba(0,0,0,0.08)", zIndex: 1200, transition: isDragging ? "none" : "height 0.25s cubic-bezier(0.32, 1.15, 0.5, 1)", display: "flex", flexDirection: "column", touchAction: "none" }}>
      <div style={{ padding: "12px 0 8px", display: "flex", justifyContent: "center", cursor: "grab", touchAction: "none" }}
        onMouseDown={(e) => handleDragStart(e.clientY)} onMouseMove={(e) => isDragging && handleDragMove(e.clientY)} onMouseUp={(e) => handleDragEnd(e.clientY)}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)} onTouchMove={(e) => { e.preventDefault(); handleDragMove(e.touches[0].clientY); }} onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientY)}>
        <div style={{ width: 40, height: 4, backgroundColor: "#d1d5db", borderRadius: 4 }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 12px", borderBottom: "1px solid #f0eeea" }}>
        <div><p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", margin: 0 }}>{facility.type}</p><p style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0" }}>{facility.name}</p></div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#f8f7f4", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <DetailContent facility={facility} userLocation={userLocation} onDirections={onDirections} onClose={onClose} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   MAIN MAP COMPONENT
──────────────────────────────────────────────────────────────────────────── */
export default function MaternalHealthMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [previewFacility, setPreviewFacility] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hospitalsOnly: false,
    clinicsOnly: false,
    chwOnly: false,
    postLossOnly: false,
    emergencyOnly: false,
  });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900);
  const [hasFlownToUser, setHasFlownToUser] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null);
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setHasFlownToUser(true);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationDenied(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);
  
// Remove the standalone facilities useEffect, then change the location useEffect:
useEffect(() => {
  if (!navigator.geolocation) {
    setLocationDenied(true);
    fetchFacilities(null, null); // fetch anyway, no distance sorting
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setHasFlownToUser(true);
      fetchFacilities(latitude, longitude); // ← pass coords
    },
    (error) => {
      setLocationDenied(true);
      fetchFacilities(null, null); // fetch anyway
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}, []);

const fetchFacilities = useCallback(async (lat, lng) => {
  try {
    const res = await getNearbyFacilities(lat, lng);
    setFacilities(res.data.data || []);
  } catch (err) {
    console.error('Failed to fetch facilities:', err);
  } finally {
    setLoading(false);
  }
}, []);
  
  const visibleFacilities = useMemo(() => {
    let filtered = [...facilities];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          (f.name || "").toLowerCase().includes(query) ||
          (f.address || "").toLowerCase().includes(query) ||
          (f.county || "").toLowerCase().includes(query)
      );
    }
    
    if (filters.hospitalsOnly) filtered = filtered.filter((f) => f.type === "Hospital");
    if (filters.clinicsOnly) filtered = filtered.filter((f) => f.type === "Clinic" || f.type === "Health Centre");
    if (filters.chwOnly) filtered = filtered.filter((f) => f.type === "Community Health Worker");
    if (filters.postLossOnly) filtered = filtered.filter((f) => f.hasPostLossCare);
    if (filters.emergencyOnly) filtered = filtered.filter((f) => f.emergency === true);
    
    return filtered;
  }, [facilities, searchQuery, filters]);
  
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const topOffset = locationDenied ? 48 : 0;
  
  const handleMarkerClick = useCallback((facility, map) => {
    const point = map.latLngToContainerPoint([facility.latitude, facility.longitude]);
    setPreviewPosition({ x: point.x, y: point.y });
    setPreviewFacility(facility);
    setSelectedFacility(null);
  }, []);
  
  const handleDirections = useCallback((facility) => {
    openGoogleMapsDirections(userLocation, { lat: facility.latitude, lng: facility.longitude }, "driving");
  }, [userLocation]);
  
  const handleMapClick = useCallback(() => {
    setPreviewFacility(null);
    setSelectedFacility(null);
  }, []);
  
  const activeFacilityId = previewFacility?.id ?? previewFacility?._id ?? selectedFacility?.id ?? selectedFacility?._id ?? null;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f4f3f0" }}>
        <Loader size={24} className="animate-spin" color="#aaa" />
      </div>
    );
  }
  
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", fontFamily: "'Manrope', system-ui, -apple-system, sans-serif", background: "#f4f3f0" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .leaflet-container { width: 100%; height: 100%; background-color: #e8e6e1; }
        .leaflet-control-zoom { border: none !important; border-radius: 12px !important; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important; }
        .leaflet-control-zoom a { width: 38px !important; height: 38px !important; line-height: 38px !important; font-size: 18px !important; color: #374151 !important; background: white !important; border: none !important; }
        .leaflet-control-zoom a:hover { background: #f8f7f4 !important; }
        .leaflet-control-attribution { display: none; }
        .leaflet-bar { border: none !important; }
        .custom-marker { background: transparent; border: none; }
      `}</style>
      
      <MapContainer center={[4.0511, 9.7679]} zoom={13} zoomControl={true} style={{ width: "100%", height: "100%" }}
        ref={(map) => { if (map) mapRef.current = map; }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' subdomains={["a", "b", "c"]} maxZoom={19} />
        
        {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_ICON} />}
        
        {visibleFacilities.map((facility) => (
          <Marker key={`${facility.type}-${facility.id || facility._id}`} position={[facility.latitude, facility.longitude]} icon={getPinForFacility(facility, activeFacilityId)}
            eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); if (mapRef.current) handleMarkerClick(facility, mapRef.current); } }} />
        ))}
        
        <FlyToUser position={userLocation ? [userLocation.lat, userLocation.lng] : null} shouldFly={!!userLocation && !hasFlownToUser} />
        <MapClickHandler onMapClick={handleMapClick} />
      </MapContainer>
      
      {locationDenied && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "#fef3c7", borderBottom: "1px solid #fde68a", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 1000 }}>
          <AlertCircle size={14} color="#92400e" /><span style={{ fontSize: 12, fontWeight: 500, color: "#92400e" }}>Location access needed for accurate distances and directions</span>
        </div>
      )}
      
      <button onClick={() => window.history.back()} style={{ position: "absolute", top: 16 + topOffset, left: 16, width: 44, height: 44, borderRadius: "50%", backgroundColor: "white", border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
        <ChevronLeft size={20} color="#111" strokeWidth={2} />
      </button>
      
      <div style={{ position: "absolute", top: 16 + topOffset, left: 72, right: selectedFacility && isDesktop ? 432 : 80, maxWidth: 500, zIndex: 1000, display: "flex", gap: 8, transition: "right 0.22s ease" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", backgroundColor: "white", borderRadius: 30, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "0 16px", border: "1px solid #e8e6e1" }}>
          <Search size={16} color="#9ca3af" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search hospitals, clinics, or CHWs..."
            style={{ flex: 1, border: "none", outline: "none", padding: "12px 10px", fontSize: 14, fontFamily: "inherit", backgroundColor: "transparent" }} />
          {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}><X size={14} color="#9ca3af" /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ width: 44, height: 44, borderRadius: 30, backgroundColor: "white", border: "1px solid #e8e6e1", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <SlidersHorizontal size={18} color={activeFilterCount > 0 ? "#16a34a" : "#374151"} />
          {activeFilterCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: "50%", backgroundColor: "#16a34a", color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{activeFilterCount}</span>}
        </button>
      </div>
      
      {(searchQuery || activeFilterCount > 0) && visibleFacilities.length > 0 && (
        <div style={{ position: "absolute", top: 68 + topOffset, left: 72, backgroundColor: "white", borderRadius: 30, padding: "4px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", border: "1px solid #e8e6e1", zIndex: 1000 }}>
          {visibleFacilities.length} facility{visibleFacilities.length !== 1 ? "s" : ""} found
        </div>
      )}
      
      {showFilters && <FilterModal filters={filters} onFilterChange={setFilters} onClose={() => setShowFilters(false)} />}
      
      {previewFacility && !selectedFacility && (
        <MiniCard facility={previewFacility} position={previewPosition}
          onViewDetails={() => { setSelectedFacility(previewFacility); setPreviewFacility(null); }}
          onClose={() => setPreviewFacility(null)} />
      )}
      
      {selectedFacility && isDesktop && (
        <SidePanel facility={selectedFacility} userLocation={userLocation} onDirections={() => handleDirections(selectedFacility)} onClose={() => setSelectedFacility(null)} />
      )}
      
      {selectedFacility && !isDesktop && (
        <DraggableSheet facility={selectedFacility} userLocation={userLocation} onDirections={() => handleDirections(selectedFacility)} onClose={() => setSelectedFacility(null)} />
      )}
      
      {!selectedFacility && !previewFacility && (
        <div style={{ position: "absolute", bottom: 20, left: 16, backgroundColor: "white", borderRadius: 16, padding: "10px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e8e6e1", zIndex: 900 }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>Facility Types</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#16a34a" }} /><span style={{ fontSize: 11, color: "#6b7280" }}>Hospital</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#6b7280" }} /><span style={{ fontSize: 11, color: "#6b7280" }}>Clinic / Health Centre</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#111111" }} /><span style={{ fontSize: 11, color: "#6b7280" }}>Community Health Worker</span></div>
          </div>
        </div>
      )}
    </div>
  );
}