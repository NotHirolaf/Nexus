import React, { useState, useEffect, useRef } from 'react';
import ICAL from 'ical.js';
import { Upload, Trash2, Plus, X, GripVertical } from 'lucide-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const times = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

const colors = [
    { class: 'bg-blue-100 dark:bg-blue-300/80 border-blue-500 text-blue-900', name: 'Blue' },
    { class: 'bg-purple-100 dark:bg-purple-300/80 border-purple-500 text-purple-900', name: 'Purple' },
    { class: 'bg-emerald-100 dark:bg-emerald-300/80 border-emerald-500 text-emerald-900', name: 'Emerald' },
    { class: 'bg-orange-100 dark:bg-orange-300/80 border-orange-500 text-orange-900', name: 'Orange' },
    { class: 'bg-pink-100 dark:bg-pink-300/80 border-pink-500 text-pink-900', name: 'Pink' },
    { class: 'bg-cyan-100 dark:bg-cyan-300/80 border-cyan-500 text-cyan-900', name: 'Cyan' },
    { class: 'bg-yellow-100 dark:bg-yellow-300/80 border-yellow-500 text-yellow-900', name: 'Yellow' },
    { class: 'bg-red-100 dark:bg-red-300/80 border-red-500 text-red-900', name: 'Red' },
];

const formatTime = (decimalTime) => {
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
};

const CourseBlock = ({ course, onEdit, onDragStart }) => {
    const { id, name, room, color, dayIndex, startTime, duration } = course;

    const topOffset = (startTime - 8) * 64 + 48;
    const height = duration * 64;
    const endTime = startTime + duration;

    return (
        <div
            className={`absolute w-[calc(20%-10px)] rounded-xl p-2 border-l-4 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer backdrop-blur-sm bg-opacity-80 overflow-hidden group ${color}`}
            style={{
                top: `${topOffset}px`,
                height: `${Math.max(32, height - 8)}px`,
                left: `calc(20% * ${dayIndex} + 60px)`,
                width: 'calc(20% - 16px)',
                zIndex: 10
            }}
            onClick={() => onEdit(course)}
            onDragStart={(e) => onDragStart(e, course)}
            draggable
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{name}</div>
                    <div className="text-[10px] opacity-90 truncate">{room}</div>
                    <div className="text-[10px] opacity-75 mt-0.5 truncate font-mono">
                        {formatTime(startTime)} - {formatTime(endTime)}
                    </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1">
                    <GripVertical size={12} />
                </div>
            </div>
        </div>
    );
};

export default function Timetable() {
    const [schedule, setSchedule] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('nexus_timetable');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        room: '',
        dayIndex: 0,
        startTime: '09:00',
        endTime: '10:00',
        color: colors[0].class
    });

    useEffect(() => {
        localStorage.setItem('nexus_timetable', JSON.stringify(schedule));
    }, [schedule]);

    // --- Drag & Drop Handlers ---
    const handleDragStart = (e, course) => {
        e.dataTransfer.setData('courseId', course.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const courseId = e.dataTransfer.getData('courseId');
        const course = schedule.find(c => c.id === courseId);

        if (!course) return;

        // Calculate drop position relative to container
        const containerRect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - containerRect.top - 48; // - header height
        const x = e.clientX - containerRect.left - 60; // - time col width

        // Calculate new time and day
        let newStartTime = 8 + (y / 64);
        // Snap to nearest 15 mins (0.25)
        newStartTime = Math.round(newStartTime * 4) / 4;

        const colWidth = (containerRect.width - 64) / 5;
        let newDayIndex = Math.floor(x / colWidth);

        // Clamp values
        if (newStartTime < 8) newStartTime = 8;
        if (newStartTime > 17) newStartTime = 17; // Don't allow drag too late
        if (newDayIndex < 0) newDayIndex = 0;
        if (newDayIndex > 4) newDayIndex = 4;

        updateCourse(courseId, { ...course, dayIndex: newDayIndex, startTime: newStartTime });
    };

    // --- CRUD ---
    const updateCourse = (id, updatedData) => {
        setSchedule(prev => prev.map(c => c.id === id ? updatedData : c));
    };

    const deleteCourse = (id) => {
        if (confirm("Delete this course?")) {
            setSchedule(prev => prev.filter(c => c.id !== id));
            closeModal();
        }
    };

    const saveCourse = (e) => {
        e.preventDefault();

        // Convert time strings to decimal
        const startParts = formData.startTime.split(':');
        const endParts = formData.endTime.split(':');
        const startDec = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
        const endDec = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;
        const duration = Math.max(0.25, endDec - startDec);

        const newCourseData = {
            id: editingCourse ? editingCourse.id : Date.now().toString(),
            name: formData.name,
            room: formData.room,
            dayIndex: Number(formData.dayIndex),
            startTime: startDec,
            duration: duration,
            color: formData.color
        };

        if (editingCourse) {
            updateCourse(editingCourse.id, newCourseData);
        } else {
            setSchedule([...schedule, newCourseData]);
        }
        closeModal();
    };

    // --- Modal Logic ---
    const openAddModal = () => {
        setEditingCourse(null);
        setFormData({
            name: '',
            room: '',
            dayIndex: 0,
            startTime: '09:00',
            endTime: '10:00',
            color: colors[Math.floor(Math.random() * colors.length)].class
        });
        setIsModalOpen(true);
    };

    const openEditModal = (course) => {
        setEditingCourse(course);

        // Convert decimal time back to HH:mm
        const toHHMM = (dec) => {
            const h = Math.floor(dec);
            const m = Math.round((dec - h) * 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        setFormData({
            name: course.name,
            room: course.room,
            dayIndex: course.dayIndex,
            startTime: toHHMM(course.startTime),
            endTime: toHHMM(course.startTime + course.duration),
            color: course.color || colors[0].class
        });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);


    // --- File Upload ---
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const icsData = e.target.result;
                const parsedSchedule = parseICS(icsData);
                setSchedule(parsedSchedule);
                alert(`Successfully imported ${parsedSchedule.length} unique classes!`);
            } catch (err) {
                console.error("Error parsing ICS:", err);
                alert("Failed to parse ICS file.");
            }
        };
        reader.readAsText(file);
    };

    const parseICS = (icsData) => {
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        const uniqueClasses = new Map();

        vevents.forEach(event => {
            const evt = new ICAL.Event(event);
            const summary = evt.summary;
            const location = evt.location || 'Unknown Room';
            const startDate = evt.startDate.toJSDate();
            const endDate = evt.endDate.toJSDate();

            let dayIndex = startDate.getDay() - 1;
            if (dayIndex < 0 || dayIndex > 4) return;

            const startHour = startDate.getHours() + (startDate.getMinutes() / 60);
            const endHour = endDate.getHours() + (endDate.getMinutes() / 60);
            const duration = endHour - startHour;
            const key = `${summary}-${dayIndex}-${startHour}-${duration}`;

            if (!uniqueClasses.has(key)) {
                const colorIndex = summary.length % colors.length;
                uniqueClasses.set(key, {
                    id: key + Math.random(), // Ensure true unique ID for React keys
                    name: summary,
                    room: location,
                    dayIndex: dayIndex,
                    startTime: startHour,
                    duration: duration,
                    color: colors[colorIndex].class
                });
            }
        });
        return Array.from(uniqueClasses.values());
    };

    const clearSchedule = () => {
        if (confirm('Are you sure you want to clear your timetable?')) {
            setSchedule([]);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-2">
                <h1 className="text-3xl font-bold text-black dark:text-white">Timetable</h1>
                <div className="flex gap-2">
                    <input type="file" accept=".ics" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <Upload size={16} /> ICS
                    </button>
                    <button onClick={openAddModal} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <Plus size={16} /> Add Class
                    </button>
                    {schedule.length > 0 && (
                        <button onClick={clearSchedule} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                            <Trash2 size={16} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Calendar Grid */}
            <div
                className="glass-panel flex-1 rounded-2xl overflow-hidden relative flex flex-col select-none"
            >
                {/* Header Row */}
                <div className="flex border-b border-gray-200 dark:border-white/10 bg-white/30 dark:bg-black/20 z-20 relative">
                    <div className="w-16 p-3 flex-shrink-0 text-center text-xs font-bold text-p">TIME</div>
                    {days.map(day => (
                        <div key={day} className="flex-1 p-3 text-center text-sm font-bold text-p border-l border-gray-200/50 dark:border-white/5">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                <div
                    className="flex-1 overflow-y-auto relative bg-white/20 dark:bg-black/10"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    {/* Grid Lines */}
                    {times.map((time) => (
                        <div key={time} className="flex h-16 border-b border-gray-200/30 dark:border-white/5 pointer-events-none">
                            <div className="w-16 flex-shrink-0 p-2 text-right text-xs text-p opacity-50 font-medium">{time}</div>
                            {days.map((d, i) => (
                                <div key={`${d}-${time}`} className="flex-1 border-l border-gray-200/30 dark:border-white/5 bg-white/5 dark:bg-white/[0.02]"></div>
                            ))}
                        </div>
                    ))}

                    {/* Events Layer */}
                    <div className="absolute top-0 left-0 w-full h-full">
                        {schedule.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center p-6 glass-card bg-opacity-50">
                                    <h3 className="text-lg font-bold text-p mb-2">No Classes Scheduled</h3>
                                    <p className="text-sm text-p opacity-70">Upload an .ics file or add classes manually</p>
                                </div>
                            </div>
                        )}
                        {schedule.map((course) => (
                            <CourseBlock
                                key={course.id}
                                course={course}
                                onEdit={openEditModal}
                                onDragStart={handleDragStart}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingCourse ? 'Edit Class' : 'Add New Class'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={saveCourse} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Class Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Calculus I"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Room / Location</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                        value={formData.room}
                                        onChange={e => setFormData({ ...formData, room: e.target.value })}
                                        placeholder="Room 304"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Day</label>
                                    <select
                                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                        value={formData.dayIndex}
                                        onChange={e => setFormData({ ...formData, dayIndex: e.target.value })}
                                    >
                                        {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map((c) => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${c.class.split(' ')[0].replace('bg-', 'bg-')} ${formData.color === c.class ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'border-transparent hover:scale-105'}`}
                                            onClick={() => setFormData({ ...formData, color: c.class })}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                {editingCourse && (
                                    <button
                                        type="button"
                                        onClick={() => deleteCourse(editingCourse.id)}
                                        className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                                <div className="flex-1"></div>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Save Class
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
