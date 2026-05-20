import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bot, Droplets, Zap, Thermometer, AlertCircle,
  HelpCircle, CheckCircle2, MapPin, Phone, Send, Loader,
  Heart, X, AlertTriangle, Building2, User, ChevronRight,
} from 'lucide-react';

/* ─── Dummy data ─── */
const dummyUser = {
  name: 'Sarah',
  primaryHospital: {
    id: 1,
    name: 'Kenyatta National Hospital',
    phone: '+254200000001',
    address: 'Hospital Rd, Nairobi',
    distance: '3.2 km',
  },
  primaryPhysician: 'Dr. James Oloo',
  primaryCHW: {
    id: 1,
    name: 'Grace Otieno',
    speciality: 'Midwife',
    phone: '+254700000002',
    area: 'Westlands',
  },
};

const dummyLocation = {
  area: 'Parklands, Nairobi',
  lat: -1.2614,
  lng: 36.8022,
};

const nearestFacilities = [
  { id: 2, name: 'Aga Khan University Hospital', phone: '+254366200000', distance: '4.1 km', hasPostLossCare: true },
  { id: 3, name: 'MP Shah Hospital', phone: '+254203742000', distance: '5.3 km', hasPostLossCare: true },
  { id: 4, name: 'Nairobi West Hospital', phone: '+254722205700', distance: '6.8 km', hasPostLossCare: false },
];

const SYMPTOMS = [
  { icon: Droplets, label: 'Heavy bleeding that will not stop', severity: 'high', description: 'Soaking through more than 1 pad per hour' },
  { icon: Zap, label: 'Severe pain or cramping', severity: 'high', description: 'Pain that makes it hard to stand or walk' },
  { icon: Thermometer, label: 'Fever and feeling very unwell', severity: 'medium', description: 'Temperature above 38°C / 100.4°F' },
  { icon: AlertCircle, label: 'Dizziness or I feel faint', severity: 'high', description: 'Lightheadedness when standing up' },
  { icon: HelpCircle, label: 'Something else feels very wrong', severity: 'medium', description: 'Trust your instinct — you know your body' },
];

export default function EmergencyAlert() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [otherSymptomText, setOtherSymptomText] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [extraFacilityExpanded, setExtraFacilityExpanded] = useState(false);
  const [selectedExtraFacility, setSelectedExtraFacility] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const stepTitles = {
    1: 'What\'s happening?',
    2: 'Who to alert?',
    3: 'Confirm',
    4: 'Help en route',
  };

  function goBack() {
    if (step === 1) navigate('/');
    else setStep(s => s - 1);
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

  function handleSend() {
    setIsSending(true);
    setTimeout(() => { setIsSending(false); setStep(4); }, 1500);
  }

  const symptomDisplay = selectedSymptom === 'Something else feels very wrong' && otherSymptomText
    ? otherSymptomText
    : selectedSymptom;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        {/* Responsive container - centers on desktop, full width on mobile */}
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

          {/* Main Content - with extra bottom padding for mobile nav */}
          <div className="pb-32 md:pb-12">
            
            {/* STEP 1 - Symptoms */}
            {step === 1 && (
              <div className="space-y-6">
                {/* AI Message */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <Bot size={20} className="text-white" />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-900">{dummyUser.name},</span> I'm here with you. Tell me what you're experiencing so I can get you the right help.
                    </p>
                  </div>
                </div>

                {/* Symptoms Grid */}
                <div className="space-y-3">
                  {SYMPTOMS.map(({ icon: Icon, label, description }) => {
                    const active = selectedSymptom === label;
                    return (
                      <button
                        key={label}
                        onClick={() => setSelectedSymptom(label)}
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
                          {active && <CheckCircle2 size={20} className="text-red-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedSymptom === 'Something else feels very wrong' && (
                  <textarea
                    value={otherSymptomText}
                    onChange={e => setOtherSymptomText(e.target.value)}
                    placeholder="Describe what you're feeling..."
                    rows={3}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300 resize-none"
                  />
                )}

                <button
                  onClick={() => selectedSymptom && setStep(2)}
                  disabled={!selectedSymptom}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    selectedSymptom
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            )}

            {/* STEP 2 - Recipients */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">⚠️ Based on your symptoms,</span> we recommend alerting your primary hospital immediately.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Primary Hospital */}
                  <div
                    onClick={() => toggleRecipient({
                      id: dummyUser.primaryHospital.id,
                      name: dummyUser.primaryHospital.name,
                      phone: dummyUser.primaryHospital.phone,
                      role: 'Primary Hospital',
                      distance: dummyUser.primaryHospital.distance,
                      type: 'hospital',
                    })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected(dummyUser.primaryHospital.id)
                        ? 'border-red-500 bg-red-50/50'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <Building2 size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Primary Hospital</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{dummyUser.primaryHospital.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{dummyUser.primaryPhysician} · {dummyUser.primaryHospital.distance}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone size={11} className="text-gray-300" />
                          <span className="text-xs text-gray-400">{dummyUser.primaryHospital.phone}</span>
                        </div>
                      </div>
                      {isSelected(dummyUser.primaryHospital.id) && (
                        <CheckCircle2 size={20} className="text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* CHW */}
                  <div
                    onClick={() => toggleRecipient({
                      id: dummyUser.primaryCHW.id,
                      name: dummyUser.primaryCHW.name,
                      phone: dummyUser.primaryCHW.phone,
                      role: 'Community Health Worker',
                      type: 'chw',
                    })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected(dummyUser.primaryCHW.id)
                        ? 'border-red-500 bg-red-50/50'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <User size={20} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Your CHW</p>
                        <p className="font-semibold text-gray-900 mt-0.5">{dummyUser.primaryCHW.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{dummyUser.primaryCHW.speciality} · {dummyUser.primaryCHW.area}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone size={11} className="text-gray-300" />
                          <span className="text-xs text-gray-400">{dummyUser.primaryCHW.phone}</span>
                        </div>
                      </div>
                      {isSelected(dummyUser.primaryCHW.id) && (
                        <CheckCircle2 size={20} className="text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Additional Facilities */}
                  <div className={`rounded-xl border-2 border-dashed ${extraFacilityExpanded ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white'}`}>
                    <div
                      onClick={() => setExtraFacilityExpanded(!extraFacilityExpanded)}
                      className="flex items-center justify-between p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                          <MapPin size={20} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Other facility</p>
                          {selectedExtraFacility && (
                            <p className="text-xs text-green-600 mt-0.5">{selectedExtraFacility.name} selected</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className={`text-gray-400 transition-transform ${extraFacilityExpanded ? 'rotate-90' : ''}`} />
                    </div>

                    {extraFacilityExpanded && (
                      <div className="border-t border-gray-100 p-3 space-y-2">
                        {nearestFacilities.map(f => {
                          const isChosen = selectedExtraFacility?.id === f.id;
                          return (
                            <div
                              key={f.id}
                              onClick={() => {
                                if (isChosen) {
                                  setSelectedExtraFacility(null);
                                  setSelectedRecipients(prev => prev.filter(r => r.id !== f.id));
                                } else {
                                  setSelectedExtraFacility(f);
                                  setSelectedRecipients(prev => {
                                    const filtered = prev.filter(r => !nearestFacilities.find(nf => nf.id === r.id));
                                    return [...filtered, { id: f.id, name: f.name, phone: f.phone, role: 'Hospital', distance: f.distance, type: 'hospital' }];
                                  });
                                }
                              }}
                              className={`p-3 rounded-xl cursor-pointer transition-all ${
                                isChosen ? 'bg-red-100 border border-red-200' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400">{f.distance}</span>
                                    {f.hasPostLossCare && (
                                      <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Post-loss care</span>
                                    )}
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  isChosen ? 'border-red-500 bg-red-500' : 'border-gray-300'
                                }`}>
                                  {isChosen && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => selectedRecipients.length > 0 && setStep(3)}
                  disabled={selectedRecipients.length === 0}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    selectedRecipients.length > 0
                      ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
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
                    <p>Patient: {dummyUser.name} (post-loss, day 21)</p>
                    <p>Situation: {symptomDisplay || 'Medical emergency'}</p>
                    <p>Location: {dummyLocation.area}</p>
                    <p>Time: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Alerting</p>
                  <div className="space-y-2">
                    {selectedRecipients.map(r => (
                      <div key={r.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          {r.type === 'chw' ? <User size={14} className="text-purple-500" /> : <Building2 size={14} className="text-green-600" />}
                          <span className="text-sm text-gray-700">{r.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{r.role}</span>
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
                    {selectedRecipients.map(r => (
                      <div key={r.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${r.type === 'chw' ? 'bg-purple-100' : 'bg-green-100'} flex items-center justify-center`}>
                              {r.type === 'chw' ? <User size={18} className="text-purple-600" /> : <Building2 size={18} className="text-green-600" />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{r.name}</p>
                              <p className="text-xs text-gray-400">{r.role}</p>
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