import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bot, Droplets, Zap, Thermometer, AlertCircle,
  HelpCircle, CheckCircle2, MapPin, Phone, Send, Loader,
  Heart, X, AlertTriangle, Building2, User,
} from 'lucide-react';
import { UserAuthContext } from '../../Context/UserAuthContext';
import { sendEmergencyAlert } from '../../API/alerts';
import { getNearbyFacilities } from '../../API/facilities';
import { getProfile } from '../../API/patient';

const SYMPTOMS = [
  { icon: Droplets, label: 'Heavy bleeding that will not stop', severity: 'high', description: 'Soaking through more than 1 pad per hour' },
  { icon: Zap, label: 'Severe pain or cramping', severity: 'high', description: 'Pain that makes it hard to stand or walk' },
  { icon: Thermometer, label: 'Fever and feeling very unwell', severity: 'medium', description: 'Temperature above 38°C / 100.4°F' },
  { icon: AlertCircle, label: 'Dizziness or I feel faint', severity: 'high', description: 'Lightheadedness when standing up' },
  { icon: HelpCircle, label: 'Something else feels very wrong', severity: 'medium', description: 'Trust your instinct — you know your body' },
];

export default function EmergencyAlert() {
  const navigate = useNavigate();
  const { user } = useContext(UserAuthContext);

  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [otherSymptomText, setOtherSymptomText] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, facilitiesRes] = await Promise.all([
          getProfile(),
          getNearbyFacilities(),
        ]);
        setUserProfile(profileRes.data.data || profileRes.data);
        setNearbyFacilities(facilitiesRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch emergency data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stepTitles = {
    1: "What's happening?",
    2: 'Who to alert?',
    3: 'Confirm',
    4: 'Help en route',
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.warn('Location denied:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  function goBack() {
    if (step === 1) navigate('/');
    else setStep(s => s - 1);
  }

  function toggleSymptom(label) {
    setSelectedSymptoms(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  }

  function toggleRecipient(recipient) {
    setSelectedRecipients(prev => {
      const exists = prev.find(r => r.id === recipient.id);
      return exists ? prev.filter(r => r.id !== recipient.id) : [...prev, recipient];
    });
  }

  function isSelected(id) {
    return !!selectedRecipients.find(r => r.id === id);
  }

  async function handleSend() {
    setIsSending(true);
    try {
      const symptomsList = selectedSymptoms.map(s =>
        s === 'Something else feels very wrong' && otherSymptomText ? otherSymptomText : s
      );
      await sendEmergencyAlert({
        symptom: symptomsList.join(', '),
        recipients: selectedRecipients.map(r => ({ id: r.id, type: r.type, name: r.name })),
        location: {
          latitude:  userCoords?.latitude  || null,
          longitude: userCoords?.longitude || null,
          area:      userProfile?.location || '',
        },
      });
      setStep(4);
    } catch (err) {
      console.error('Failed to send alert:', err);
    } finally {
      setIsSending(false);
    }
  }

  const symptomDisplay = selectedSymptoms
    .map(s => s === 'Something else feels very wrong' && otherSymptomText ? otherSymptomText : s)
    .join(', ');

  const hasOtherSelected = selectedSymptoms.includes('Something else feels very wrong');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <Loader size={24} className="animate-spin text-red-400" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          
          {/* Header */}
          <div className="pt-12 pb-4">
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center mb-6"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-medium text-red-500 uppercase tracking-wide">Emergency</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{stepTitles[step]}</h1>
              </div>
              {step < 4 && (
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-400 font-medium"
                >
                  Exit
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map(n => (
                <div
                  key={n}
                  className="flex-1 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: n <= step ? '#ef4444' : '#fecaca',
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[10px] text-gray-400">Symptoms</span>
              <span className="text-[10px] text-gray-400">Contacts</span>
              <span className="text-[10px] text-gray-400">Confirm</span>
              <span className="text-[10px] text-gray-400">Help</span>
            </div>
          </div>

          <div className="pb-32 md:pb-12">
            
            {/* STEP 1 - Symptoms */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <Bot size={20} className="text-white" />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-900">{user?.name || userProfile?.name},</span> I'm here with you. Tell me what you're experiencing — select all that apply — so I can get you the right help.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {SYMPTOMS.map(({ icon: Icon, label, description }) => {
                    const active = selectedSymptoms.includes(label);
                    return (
                      <button
                        key={label}
                        onClick={() => toggleSymptom(label)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          active
                            ? 'bg-red-50 border-2 border-red-500 shadow-sm'
                            : 'bg-white border border-gray-100 hover:border-gray-200 shadow-sm'
                        }`}
                      >
                        <div className="flex gap-3">
                          <Icon size={22} className={active ? 'text-red-500' : 'text-gray-400'} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold mb-1 ${active ? 'text-red-600' : 'text-gray-900'}`}>
                              {label}
                            </p>
                            <p className="text-xs text-gray-400">{description}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            active ? 'border-red-500 bg-red-500' : 'border-gray-300'
                          }`}>
                            {active && <CheckCircle2 size={11} className="text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {hasOtherSelected && (
                  <textarea
                    value={otherSymptomText}
                    onChange={e => setOtherSymptomText(e.target.value)}
                    placeholder="Describe what you're feeling..."
                    rows={3}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 resize-none"
                  />
                )}

                <button
                  onClick={() => selectedSymptoms.length > 0 && setStep(2)}
                  disabled={selectedSymptoms.length === 0}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    selectedSymptoms.length > 0
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedSymptoms.length > 0 ? `Continue (${selectedSymptoms.length} selected)` : 'Select symptoms'}
                </button>
              </div>
            )}

            {/* STEP 2 - Recipients */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">⚠️ Select who should receive your alert.</span> We recommend alerting your primary hospital and CHW.
                  </p>
                </div>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Your care team</p>

                <div className="space-y-3">
                  {/* Primary Hospital */}
                  {userProfile?.primaryHospital && (
                    <div
                      onClick={() => toggleRecipient({
                        id: userProfile.primaryHospital.id,
                        name: userProfile.primaryHospital.name,
                        phone: userProfile.primaryHospital.phone,
                        role: 'Hospital',
                        type: 'hospital',
                      })}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected(userProfile.primaryHospital.id)
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Building2 size={19} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Hospital</span>
                            <span className="text-[10px] text-gray-400">{userProfile.primaryHospital.distance}</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{userProfile.primaryHospital.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{userProfile.primaryPhysician}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone size={10} className="text-gray-300" />
                            <span className="text-xs text-gray-400">{userProfile.primaryHospital.phone}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          isSelected(userProfile.primaryHospital.id) ? 'border-red-500 bg-red-500' : 'border-gray-300'
                        }`}>
                          {isSelected(userProfile.primaryHospital.id) && <CheckCircle2 size={11} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CHW */}
                  {userProfile?.primaryCHW && (
                    <div
                      onClick={() => toggleRecipient({
                        id: userProfile.primaryCHW.id,
                        name: userProfile.primaryCHW.name,
                        phone: userProfile.primaryCHW.phone,
                        role: 'CHW',
                        type: 'chw',
                      })}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected(userProfile.primaryCHW.id)
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <User size={19} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Community Health Worker</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{userProfile.primaryCHW.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{userProfile.primaryCHW.speciality} · {userProfile.primaryCHW.area}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Phone size={10} className="text-gray-300" />
                            <span className="text-xs text-gray-400">{userProfile.primaryCHW.phone}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                          isSelected(userProfile.primaryCHW.id) ? 'border-red-500 bg-red-500' : 'border-gray-300'
                        }`}>
                          {isSelected(userProfile.primaryCHW.id) && <CheckCircle2 size={11} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nearby Facilities — always visible */}
                {nearbyFacilities.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Nearby facilities</p>
                    <div className="space-y-2">
                      {nearbyFacilities.slice(0, 4).map(f => {
                        const isChosen = !!selectedRecipients.find(r => r.id === f.id);
                        return (
                          <div
                            key={f.id}
                            onClick={() => {
                              if (isChosen) {
                                setSelectedRecipients(prev => prev.filter(r => r.id !== f.id));
                              } else {
                                setSelectedRecipients(prev => [...prev, {
                                  id: f.id, name: f.name, phone: f.phone,
                                  role: 'Hospital', type: 'hospital',
                                }]);
                              }
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isChosen ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Hospital</span>
                                  <span className="text-[10px] text-gray-400">{f.distance || f.dist}</span>
                                  {f.hasPostLossCare && (
                                    <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">Post-loss care</span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-gray-900">{f.name}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isChosen ? 'border-red-500 bg-red-500' : 'border-gray-300'
                              }`}>
                                {isChosen && <CheckCircle2 size={11} className="text-white" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {selectedRecipients.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">Select at least one recipient to continue</p>
                )}

                <button
                  onClick={() => selectedRecipients.length > 0 && setStep(3)}
                  disabled={selectedRecipients.length === 0}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    selectedRecipients.length > 0
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedRecipients.length > 0 ? `Continue (${selectedRecipients.length} selected)` : 'Select recipients'}
                </button>
              </div>
            )}

            {/* STEP 3 - Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-red-400" />
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Emergency Alert</p>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-green-400 leading-relaxed">
                    <p>Patient: {user?.name || userProfile?.name}</p>
                    <p>Symptoms: {symptomDisplay || 'Medical emergency'}</p>
                    <p>Location: {userProfile?.location?.area || 'Current location'}</p>
                    <p>Time: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Alerting</p>
                  <div className="space-y-2">
                    {selectedRecipients.map((r, idx) => (
                      <div key={`${r.type}-${r.id}-${idx}`} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          {r.type === 'chw' ? (
                            <User size={14} className="text-purple-500" />
                          ) : (
                            <Building2 size={14} className="text-green-600" />
                          )}
                          <span className="text-sm text-gray-700">{r.name}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          r.type === 'chw' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {r.type === 'chw' ? 'CHW' : 'Hospital'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                >
                  {isSending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader size={18} className="animate-spin" />
                      Sending alert...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send size={18} />
                      Send Emergency Alert
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full text-center text-sm text-gray-400 py-2"
                >
                  Cancel — this was a mistake
                </button>
              </div>
            )}

            {/* STEP 4 - Success */}
            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="py-8">
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
                    <CheckCircle2 size={48} className="text-green-500" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Sent</h2>
                  <p className="text-gray-500">Help is on the way. Stay calm and keep your phone nearby.</p>
                </div>

                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Responding</p>
                  <div className="space-y-3">
                    {selectedRecipients.map((r, idx) => (
                      <div key={`${r.type}-${r.id}-${idx}`} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${r.type === 'chw' ? 'bg-purple-100' : 'bg-green-100'} flex items-center justify-center`}>
                              {r.type === 'chw' ? <User size={18} className="text-purple-600" /> : <Building2 size={18} className="text-green-600" />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{r.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                  r.type === 'chw' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                                }`}>
                                  {r.type === 'chw' ? 'Community Health Worker' : 'Hospital'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-green-500">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-medium">Notified</span>
                          </div>
                        </div>
                        <a
                          href={`tel:${r.phone}`}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-50 text-green-600 font-semibold text-sm no-underline"
                        >
                          <Phone size={14} />
                          Call {r.name.split(' ')[0]}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 flex gap-3">
                  <Heart size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    "You did the right thing reaching out. Help is coming. You are not alone."
                  </p>
                </div>

                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel alert — false alarm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-in zoom-in duration-200">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Cancel alert?</h3>
              <p className="text-sm text-gray-500">Responders will be notified this was a false alarm.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
              >
                Go back
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3 rounded-xl bg-red-500 text-sm font-medium text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}