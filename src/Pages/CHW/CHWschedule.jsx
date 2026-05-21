import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, MapPin, Phone, User,
  CheckCircle2, XCircle, Plus, Filter, ChevronLeft,
  ChevronRight, Home, Navigation, Bell, AlertCircle,
  Video, MessageCircle, Star, Users, Heart,
  Sun, Moon, Cloud, Droplets, Activity
} from "lucide-react";
import NavCHW from "../../Components/NavCHW";

/* ─── Dummy Data ─── */
const dummySchedule = [
  {
    id: 1,
    patientName: "Sarah Mwangi",
    patientId: 1,
    type: "Home visit",
    date: "2026-05-25",
    time: "10:00 AM",
    duration: 60,
    location: "Parklands, Nairobi",
    phone: "+254711000001",
    status: "confirmed",
    notes: "First home visit. Bring counselling materials.",
    priority: "high",
    reminderSent: true
  },
  {
    id: 2,
    patientName: "Amara Ochieng",
    patientId: 2,
    type: "Follow-up call",
    date: "2026-05-25",
    time: "2:00 PM",
    duration: 30,
    location: "Phone call",
    phone: "+254711000002",
    status: "pending",
    notes: "Check on emotional state and medication adherence.",
    priority: "medium",
    reminderSent: false
  },
  {
    id: 3,
    patientName: "Fatuma Hassan",
    patientId: 3,
    type: "Wellness check",
    date: "2026-05-26",
    time: "11:30 AM",
    duration: 45,
    location: "Eastleigh, Nairobi",
    phone: "+254711000003",
    status: "confirmed",
    notes: "First week post-loss assessment.",
    priority: "high",
    reminderSent: true
  },
  {
    id: 4,
    patientName: "Wanjiru Kimani",
    patientId: 4,
    type: "Check-in call",
    date: "2026-05-27",
    time: "9:00 AM",
    duration: 20,
    location: "Phone call",
    phone: "+254711000004",
    status: "confirmed",
    notes: "Monthly follow-up for resolved case.",
    priority: "low",
    reminderSent: false
  },
  {
    id: 5,
    patientName: "Blessing Okonkwo",
    patientId: 5,
    type: "Hospital follow-up",
    date: "2026-05-23",
    time: "3:00 PM",
    duration: 60,
    location: "Kenyatta National Hospital",
    phone: "+254711000005",
    status: "completed",
    notes: "Check post-escalation status.",
    priority: "high",
    reminderSent: true
  },
  {
    id: 6,
    patientName: "Grace Muthoni",
    patientId: 6,
    type: "Home visit",
    date: "2026-05-28",
    time: "1:00 PM",
    duration: 60,
    location: "Westlands, Nairobi",
    phone: "+254711000006",
    status: "pending",
    notes: "New case - initial assessment.",
    priority: "high",
    reminderSent: false
  }
];

const taskTypes = [
  { value: "all", label: "All tasks", icon: Calendar },
  { value: "Home visit", label: "Home visits", icon: Home },
  { value: "Follow-up call", label: "Follow-up calls", icon: Phone },
  { value: "Check-in call", label: "Check-in calls", icon: MessageCircle },
  { value: "Wellness check", label: "Wellness checks", icon: Heart },
  { value: "Hospital follow-up", label: "Hospital follow-ups", icon: Activity }
];

const statusConfig = {
  confirmed: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", label: "Confirmed" },
  pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Pending" },
  completed: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", label: "Completed" },
  cancelled: { color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "Cancelled" }
};

const priorityConfig = {
  high: { color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  medium: { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  low: { color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500" }
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

export default function CHWSchedule() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTaskType, setSelectedTaskType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [schedule, setSchedule] = useState(dummySchedule);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

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

  const handleTaskStatusUpdate = (taskId, newStatus) => {
    setSchedule(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    setShowTaskModal(false);
  };

  const handleStartTask = (task) => {
    if (task.type === "Home visit" || task.type === "Wellness check" || task.type === "Hospital follow-up") {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(task.location)}`, "_blank");
    } else {
      window.open(`tel:${task.phone}`);
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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

  return (
    <>
      <NavCHW />

      <div className="min-h-screen bg-gray-50 font-['Manrope'] pb-28">
        <div className="md:ml-64">
          
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigate("/chw/dashboard")}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">My Schedule</h1>
                <div className="w-9" />
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
                  const priorityStyles = priorityConfig[task.priority];
                  const taskDate = new Date(task.date);
                  const isTodayTask = taskDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <TaskIcon size={14} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{task.patientName}</p>
                            <div className={`w-1.5 h-1.5 rounded-full ${priorityStyles.dot}`} />
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
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskModal(true);
                          }}
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
                    <p className="text-xs text-gray-400">All caught up for now!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateWeek(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <h2 className="text-base font-bold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={() => navigateWeek(1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Today
                </button>
              </div>

              {/* Week Days Grid */}
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
                        isSelected
                          ? "bg-gray-900 text-white"
                          : isCurrentDay
                          ? "bg-gray-100 text-gray-900"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <p className={`text-[11px] font-medium ${
                        isSelected ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className={`text-lg font-bold mt-1 ${
                        isSelected ? "text-white" : "text-gray-900"
                      }`}>
                        {day.getDate()}
                      </p>
                      {dayTasksCount > 0 && (
                        <div className={`text-[10px] font-semibold mt-1 ${
                          isSelected ? "text-green-400" : "text-green-500"
                        }`}>
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
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                >
                  <Filter size={14} className="text-gray-400" />
                </button>
              </div>

              {/* Task Type Filters */}
              {showFilters && (
                <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                  {taskTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSelectedTaskType(type.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                          selectedTaskType === type.value
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-600 border border-gray-200"
                        }`}
                      >
                        <Icon size={12} />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                  <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No tasks scheduled for this day</p>
                  <p className="text-xs text-gray-400 mt-1">Enjoy your free time!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map(task => {
                    const TaskIcon = getTaskIcon(task.type);
                    const statusStyles = statusConfig[task.status];
                    const priorityStyles = priorityConfig[task.priority];
                    const isOverdue = new Date(task.date) < new Date() && task.status === "pending";
                    
                    return (
                      <div key={task.id} className={`bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
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
                                <button
                                  onClick={() => handleStartTask(task)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition"
                                >
                                  <Navigation size={12} />
                                  {task.type === "Home visit" ? "Navigate" : "Call"}
                                </button>
                                <button
                                  onClick={() => handleTaskStatusUpdate(task.id, "confirmed")}
                                  className="flex-1 py-2 rounded-lg border border-green-500 text-green-600 text-xs font-medium hover:bg-green-50 transition"
                                >
                                  Confirm
                                </button>
                              </>
                            )}
                            {task.status === "confirmed" && (
                              <>
                                <button
                                  onClick={() => handleStartTask(task)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition"
                                >
                                  <Navigation size={12} />
                                  Start
                                </button>
                                <button
                                  onClick={() => handleTaskStatusUpdate(task.id, "completed")}
                                  className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition"
                                >
                                  Mark Complete
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

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  {(() => {
                    const Icon = getTaskIcon(selectedTask.type);
                    return <Icon size={14} className="text-gray-600" />;
                  })()}
                </div>
                <h2 className="text-lg font-bold text-gray-900">{selectedTask.type}</h2>
              </div>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <XCircle size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Patient</p>
                <p className="text-base font-semibold text-gray-900">{selectedTask.patientName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTask.date} at {selectedTask.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Duration</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTask.duration} minutes</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Location</p>
                <p className="text-sm text-gray-900">{selectedTask.location}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Contact</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900">{selectedTask.phone}</p>
                  <button
                    onClick={() => window.open(`tel:${selectedTask.phone}`)}
                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium"
                  >
                    Call
                  </button>
                </div>
              </div>

              {selectedTask.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-600">{selectedTask.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => handleStartTask(selectedTask)}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold"
                >
                  {selectedTask.type === "Home visit" ? "Start Navigation" : "Call Patient"}
                </button>
                {selectedTask.status !== "completed" && (
                  <button
                    onClick={() => handleTaskStatusUpdate(selectedTask.id, "completed")}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}