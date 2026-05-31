import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, MapPin, Phone, User,
  CheckCircle2, XCircle, Plus, Filter, ChevronLeft,
  ChevronRight, Home, Navigation, Bell, AlertCircle,
  Video, MessageCircle, Star, Users, Heart,
  Sun, Moon, Cloud, Droplets, Activity, Send,
  Trash2, Edit2, X, Loader,
} from "lucide-react";
import NavCHW from "../../Components/NavCHW";
import { getCHWSchedule } from "../../API/chw";
import { getCHWPatients } from "../../API/chw";

const taskTypes = [
  { value: "all", label: "All tasks", icon: Calendar },
  { value: "Home visit", label: "Home visits", icon: Home },
  { value: "Follow-up call", label: "Follow-up calls", icon: Phone },
  { value: "Check-in call", label: "Check-in calls", icon: MessageCircle },
  { value: "Wellness check", label: "Wellness checks", icon: Heart },
  { value: "Hospital follow-up", label: "Hospital follow-ups", icon: Activity },
];

const statusConfig = {
  pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Pending confirmation" },
  confirmed: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "Confirmed" },
  completed: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", label: "Completed" },
  cancelled: { color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "Cancelled" },
};

const priorityConfig = {
  high: { color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  medium: { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  low: { color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" },
};

function getWeekDays(currentDate) {
  const week = [];
  const start = new Date(currentDate);
  start.setDate(start.getDate() - start.getDay());
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    week.push(day);
  }
  return week;
}

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
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

export default function CHWSchedule() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTaskType, setSelectedTaskType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    patientName: "",
    type: "Home visit",
    date: "",
    time: "",
    duration: 30,
    notes: "",
    priority: "medium",
    location: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [scheduleRes, patientsRes] = await Promise.all([
          getCHWSchedule(),
          getCHWPatients(),
        ]);
        setSchedule(scheduleRes.data.data || []);
        setPatients(patientsRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch schedule data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const weekDays = getWeekDays(currentDate);
  const selectedDateKey = formatDateKey(selectedDate);
  
  const dayTasks = schedule.filter(task => {
    const taskDate = new Date(task.date);
    return formatDateKey(taskDate) === selectedDateKey;
  });

  const filteredTasks = dayTasks.filter(task => {
    return selectedTaskType === "all" || task.type === selectedTaskType;
  });

  const upcomingTasks = schedule
    .filter(task => {
      const taskDate = new Date(task.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return taskDate >= today && task.status !== "completed";
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleStartTask = (task) => {
    if (task.type === "Home visit" || task.type === "Wellness check" || task.type === "Hospital follow-up") {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(task.location)}`, "_blank");
    } else {
      window.open(`tel:${task.phone}`);
    }
  };

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => (p.id || p._id) === patientId);
    setNewAppointment(prev => ({
      ...prev,
      patientId,
      patientName: patient?.firstName ? `${patient.firstName} ${patient.lastName}` : patient?.name || "",
      location: patient?.location || "",
    }));
  };

  const handleResendReminder = (task) => {
    showToast(`Reminder sent to ${task.patientName}`);
  };

  const getTaskIcon = (type) => {
    switch(type) {
      case "Home visit": return Home;
      case "Follow-up call": return Phone;
      case "Check-in call": return MessageCircle;
      case "Wellness check": return Heart;
      case "Hospital follow-up": return Activity;
      default: return Calendar;
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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

  return (
    <>
      <NavCHW />

      <div className="min-h-screen bg-gray-50 font-['Manrope'] pb-28">
        <div className="md:ml-64">
          
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigate("/chw")}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">My Schedule</h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition"
                >
                  <Plus size={14} />
                  Schedule
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">

            {/* Upcoming Tasks Summary */}
            <div className="mb-6">
              <SectionLabel>Upcoming tasks</SectionLabel>
              <div className="space-y-2">
                {upcomingTasks.map(task => {
                  const TaskIcon = getTaskIcon(task.type);
                  const priorityStyles = priorityConfig[task.priority] || priorityConfig.medium;
                  const taskDate = new Date(task.date);
                  const isTodayTask = taskDate.toDateString() === new Date().toDateString();
                  const taskId = task.id || task._id;
                  
                  return (
                    <div key={taskId} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <TaskIcon size={14} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{task.patientName}</p>
                            <div className={`w-1.5 h-1.5 rounded-full ${priorityStyles.dot}`} />
                            {!task.patientConfirmed && task.status === "pending" && (
                              <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                Awaiting confirmation
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{task.type}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[11px] text-gray-400">
                              {isTodayTask ? "Today" : taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {task.time}
                            </span>
                            <span className="text-[11px] text-gray-400">•</span>
                            <span className="text-[11px] text-gray-400">{task.location}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedTask(task); setShowTaskModal(true); }}
                          className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
                {upcomingTasks.length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                    <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming tasks</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => navigateWeek(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <h2 className="text-base font-bold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button onClick={() => navigateWeek(1)} className="p-2 rounded-lg hover:bg-gray-100 transition">
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>
                <button onClick={goToToday} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                  Today
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => {
                  const dateKey = formatDateKey(day);
                  const dayTasksCount = schedule.filter(task => {
                    const taskDate = new Date(task.date);
                    return formatDateKey(taskDate) === dateKey && task.status !== "completed";
                  }).length;
                  const isSelected = selectedDate.toDateString() === day.toDateString();
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`text-center p-3 rounded-xl transition-all ${
                        isSelected ? "bg-gray-900 text-white" : isCurrentDay ? "bg-gray-100 text-gray-900" : "hover:bg-gray-100"
                      }`}
                    >
                      <p className={`text-[11px] font-medium ${isSelected ? "text-gray-400" : "text-gray-500"}`}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className={`text-lg font-bold mt-1 ${isSelected ? "text-white" : "text-gray-900"}`}>
                        {day.getDate()}
                      </p>
                      {dayTasksCount > 0 && (
                        <div className={`text-[10px] font-semibold mt-1 ${isSelected ? "text-green-400" : "text-green-500"}`}>
                          {dayTasksCount} task{dayTasksCount !== 1 ? "s" : ""}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tasks for Selected Day */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <SectionLabel>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </SectionLabel>
                <button onClick={() => setShowFilters(!showFilters)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                  <Filter size={14} className="text-gray-400" />
                </button>
              </div>

              {showFilters && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                  {taskTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSelectedTaskType(type.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                          selectedTaskType === type.value ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200"
                        }`}
                      >
                        <Icon size={12} />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                  <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No tasks scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map(task => {
                    const TaskIcon = getTaskIcon(task.type);
                    const statusStyles = statusConfig[task.status] || statusConfig.pending;
                    const priorityStyles = priorityConfig[task.priority] || priorityConfig.medium;
                    const isOverdue = new Date(task.date) < new Date() && task.status === "pending";
                    const taskId = task.id || task._id;
                    
                    return (
                      <div key={taskId} className={`bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
                        isOverdue ? "border-l-4 border-l-red-500" : "border-gray-100"
                      }`}>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                <TaskIcon size={18} className="text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900">{task.patientName}</p>
                                  <div className={`w-1.5 h-1.5 rounded-full ${priorityStyles.dot}`} />
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{task.type}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles.bg} ${statusStyles.color} border ${statusStyles.border}`}>
                              {statusStyles.label}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-600">{task.time} · {task.duration} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-600">{task.location}</span>
                            </div>
                            {!task.patientConfirmed && task.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <Bell size={12} className="text-amber-500" />
                                <span className="text-xs text-amber-600">Awaiting patient confirmation</span>
                                <button onClick={() => handleResendReminder(task)} className="ml-auto text-[10px] text-green-600 font-medium">
                                  Send reminder
                                </button>
                              </div>
                            )}
                            {task.notes && (
                              <div className="flex items-start gap-2">
                                <AlertCircle size={12} className="text-gray-400 mt-0.5" />
                                <span className="text-xs text-gray-500 italic">{task.notes}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {task.status === "pending" && (
                              <>
                                <button onClick={() => handleStartTask(task)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition">
                                  <Navigation size={12} />
                                  {task.type === "Home visit" ? "Navigate" : "Call"}
                                </button>
                              </>
                            )}
                            {task.status === "confirmed" && (
                              <>
                                <button onClick={() => handleStartTask(task)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition">
                                  <Navigation size={12} />
                                  Start
                                </button>
                              </>
                            )}
                            {task.status === "completed" && (
                              <div className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 text-gray-500 text-xs font-medium">
                                <CheckCircle2 size={12} />
                                Completed
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Schedule Appointment</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-gray-100 transition">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Select Patient *</label>
                <select
                  value={newAppointment.patientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id || patient._id} value={patient.id || patient._id}>
                      {patient.firstName ? `${patient.firstName} ${patient.lastName}` : patient.name} - {patient.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Appointment Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Home visit", "Follow-up call", "Check-in call", "Wellness check", "Hospital follow-up"].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewAppointment(prev => ({ ...prev, type }))}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                        newAppointment.type === type ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Date *</label>
                  <input type="date" value={newAppointment.date} onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                    min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">Time *</label>
                  <input type="time" value={newAppointment.time} onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Duration (minutes)</label>
                <select value={newAppointment.duration} onChange={(e) => setNewAppointment(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400">
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Priority</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map(priority => (
                    <button key={priority} type="button" onClick={() => setNewAppointment(prev => ({ ...prev, priority }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition ${
                        newAppointment.priority === priority
                          ? priority === "high" ? "bg-red-500 text-white" : priority === "medium" ? "bg-amber-500 text-white" : "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Notes (for patient)</label>
                <textarea value={newAppointment.notes} onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3} placeholder="E.g., Bring medical records, fasting required, etc."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">
                  Cancel
                </button>
                <button className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium flex items-center justify-center gap-2">
                  <Send size={14} />
                  Schedule & Notify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  {(() => { const Icon = getTaskIcon(selectedTask.type); return <Icon size={14} className="text-gray-600" />; })()}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{selectedTask.type}</h2>
              </div>
              <button onClick={() => setShowTaskModal(false)} className="p-2 rounded-full hover:bg-gray-100 transition">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Patient</p>
                <p className="text-base font-semibold text-gray-900">{selectedTask.patientName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400 mb-1">Date & Time</p><p className="text-sm font-medium text-gray-900">{selectedTask.date} at {selectedTask.time}</p></div>
                <div><p className="text-xs text-gray-400 mb-1">Duration</p><p className="text-sm font-medium text-gray-900">{selectedTask.duration} minutes</p></div>
              </div>

              <div><p className="text-xs text-gray-400 mb-1">Location</p><p className="text-sm text-gray-900">{selectedTask.location}</p></div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Contact</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900">{selectedTask.phone}</p>
                  <button onClick={() => window.open(`tel:${selectedTask.phone}`)} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">Call</button>
                </div>
              </div>

              {selectedTask.notes && (
                <div><p className="text-xs text-gray-400 mb-1">Notes</p><div className="bg-gray-50 rounded-xl p-3"><p className="text-sm text-gray-600">{selectedTask.notes}</p></div></div>
              )}

              <div className="flex gap-3 pt-3">
                <button onClick={() => handleStartTask(selectedTask)} className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold">
                  {selectedTask.type === "Home visit" ? "Start Navigation" : "Call Patient"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}