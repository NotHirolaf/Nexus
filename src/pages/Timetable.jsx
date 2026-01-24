import React from 'react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const times = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

const CourseBlock = ({ name, room, color, dayIndex, startTime, duration }) => {
    // Simple positioning logic for demo (assuming 60px per hour + gaps)
    // dayIndex: 0-4 (Mon-Fri)
    // startTime: 8 = 0, 9 = 1, etc.

    const topOffset = (startTime - 8) * 64 + 48; // 48px header height + time slots
    const height = duration * 64;

    // Custom cols based on day (1-indexed for grid, +1 for time col)
    const colStart = dayIndex + 2;

    return (
        <div
            className={`absolute w-[calc(20%-10px)] rounded-xl p-3 border-l-4 shadow-sm hover:scale-[1.02] transition-all cursor-pointer backdrop-blur-sm bg-opacity-80 ${color}`}
            style={{
                top: `${topOffset}px`,
                height: `${height - 8}px`, // slightly smaller for gap
                left: `calc(20% * ${dayIndex} + 60px)`, // Offset for time col
                width: 'calc(20% - 16px)'
            }}
        >
            <div className="text-xs font-bold text-black dark:text-gray-900">{name}</div>
            <div className="text-[10px] text-black dark:text-gray-800 mt-1">{room}</div>
        </div>
    );
};

export default function Timetable() {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6 px-2">
                <h1 className="text-3xl font-bold text-black dark:text-white">Timetable</h1>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Add Course
                    </button>
                </div>
            </div>

            <div className="glass-panel flex-1 rounded-2xl overflow-hidden relative flex flex-col">
                {/* Header Row */}
                <div className="flex border-b border-gray-200 dark:border-white/10 bg-white/30 dark:bg-black/20">
                    <div className="w-16 p-3 flex-shrink-0 text-center text-xs font-bold text-black dark:text-gray-500">TIME</div>
                    {days.map(day => (
                        <div key={day} className="flex-1 p-3 text-center text-sm font-bold text-black dark:text-gray-300 border-l border-gray-200/50 dark:border-white/5">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto relative bg-white/20 dark:bg-black/10">
                    {/* Grid Lines */}
                    {times.map((time) => (
                        <div key={time} className="flex h-16 border-b border-gray-200/30 dark:border-white/5">
                            <div className="w-16 flex-shrink-0 p-2 text-right text-xs text-gray-400 font-medium">{time}</div>
                            {days.map((d, i) => (
                                <div key={`${d}-${time}`} className="flex-1 border-l border-gray-200/30 dark:border-white/5 bg-white/5 dark:bg-white/[0.02]"></div>
                            ))}
                        </div>
                    ))}

                    {/* Events (Overlaid) */}
                    {/* Note: In a real app, use CSS Grid heavily. Here we use absolute mostly for the "visual" prototype flexibility */}

                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {/* Actual event positioning context needs correct width logic, doing relative simple here */}

                        {/* CS 101 - Mon 10-11:30 */}
                        <div className="absolute top-[128px] left-[calc(16.66%+10px)] w-[calc(16.66%-20px)] h-[90px] bg-blue-100 dark:bg-blue-300/80 border-l-4 border-blue-500 rounded-lg p-2 pointer-events-auto hover:scale-105 transition-transform shadow-sm">
                            <div className="text-xs font-bold text-blue-900">CS 101</div>
                            <div className="text-[10px] text-blue-800">10:00 - 11:30</div>
                            <div className="text-[10px] text-blue-800 mt-1">Lec Hall A</div>
                        </div>

                        {/* Calc II - Tue 13:00-14:30 */}
                        <div className="absolute top-[320px] left-[calc(33.33%+10px)] w-[calc(16.66%-20px)] h-[90px] bg-purple-100 dark:bg-purple-300/80 border-l-4 border-purple-500 rounded-lg p-2 pointer-events-auto hover:scale-105 transition-transform shadow-sm">
                            <div className="text-xs font-bold text-purple-900">MATH 202</div>
                            <div className="text-[10px] text-purple-800">1:00 - 2:30 PM</div>
                            <div className="text-[10px] text-purple-800 mt-1">Room 304</div>
                        </div>

                        {/* Physics - Wed 9:00-11:00 */}
                        <div className="absolute top-[64px] left-[calc(50%+10px)] w-[calc(16.66%-20px)] h-[120px] bg-orange-100 dark:bg-orange-300/80 border-l-4 border-orange-500 rounded-lg p-2 pointer-events-auto hover:scale-105 transition-transform shadow-sm">
                            <div className="text-xs font-bold text-orange-900">PHYS 101</div>
                            <div className="text-[10px] text-orange-800">9:00 - 11:00 AM</div>
                            <div className="text-[10px] text-orange-800 mt-1">Lab B</div>
                        </div>

                        {/* CS 101 - Wed 10-11:30 (Overlap? Logic handled by ensuring unique slots usually) */}

                        {/* History - Fri 14:00-15:00 */}
                        <div className="absolute top-[384px] left-[calc(83.33%+10px)] w-[calc(16.66%-20px)] h-[60px] bg-emerald-100 dark:bg-emerald-300/80 border-l-4 border-emerald-500 rounded-lg p-2 pointer-events-auto hover:scale-105 transition-transform shadow-sm">
                            <div className="text-xs font-bold text-emerald-900">HIST 105</div>
                            <div className="text-[10px] text-emerald-800">2:00 - 3:00 PM</div>
                            <div className="text-[10px] text-emerald-800 mt-1">Hall C</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
