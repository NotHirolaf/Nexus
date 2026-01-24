import React, { useState, useEffect } from 'react';
import { Plus, Calculator, Trash2, ArrowRight, ChevronDown } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { getGradeFromPercentage } from '../lib/grading';

const GradeRow = ({ assessment, onUpdate, onDelete }) => {
    const handleInput = (field, value) => {
        // Allow empty string for better typing experience
        if (value === '') {
            onUpdate({ ...assessment, [field]: '' });
            return;
        }

        let num = parseFloat(value);
        if (isNaN(num)) return;

        // Clamp values between 0 and 100
        if (num < 0) num = 0;
        if (num > 100) num = 100;

        onUpdate({ ...assessment, [field]: num });
    };

    return (
        <div className="flex items-center gap-4 p-3 bg-white/40 dark:bg-white/5 rounded-xl border border-white/20 dark:border-white/5 animate-fadeIn">
            <input
                type="text"
                value={assessment.name}
                onChange={(e) => onUpdate({ ...assessment, name: e.target.value })}
                className="flex-1 bg-transparent border-none outline-none font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400"
                placeholder="Assessment Name"
            />
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={assessment.weight}
                    onChange={(e) => handleInput('weight', e.target.value)}
                    min="0"
                    max="100"
                    className="w-16 bg-white/50 dark:bg-black/20 rounded-lg px-2 py-1 text-center text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    placeholder="Wt %"
                />
                <span className="text-gray-400 text-xs">%</span>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={assessment.score}
                    onChange={(e) => handleInput('score', e.target.value)}
                    min="0"
                    max="100"
                    className="w-16 bg-white/50 dark:bg-black/20 rounded-lg px-2 py-1 text-center text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    placeholder="Score"
                />
                <span className="text-gray-400 text-xs">/100</span>
            </div>
            <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function GradeCalculator() {
    const { user } = useUser();
    const [selectedCourse, setSelectedCourse] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [assessmentsData, setAssessmentsData] = useState(() => {
        const saved = localStorage.getItem('nexus_grades');
        return saved ? JSON.parse(saved) : {};
    });

    // Initialize selected course when user data loads
    useEffect(() => {
        if (user?.courses?.length > 0 && !selectedCourse) {
            setSelectedCourse(user.courses[0]);
        }
    }, [user, selectedCourse]);

    // Save to local storage whenever data changes
    useEffect(() => {
        localStorage.setItem('nexus_grades', JSON.stringify(assessmentsData));
    }, [assessmentsData]);

    const getCurrentAssessments = () => {
        return assessmentsData[selectedCourse] || [];
    };

    const updateAssessment = (index, updatedItem) => {
        const currentList = getCurrentAssessments();
        const newList = [...currentList];
        newList[index] = updatedItem;
        setAssessmentsData({
            ...assessmentsData,
            [selectedCourse]: newList
        });
    };

    const addAssessment = () => {
        if (!selectedCourse) return;
        const currentList = getCurrentAssessments();
        const newList = [...currentList, { name: '', weight: '', score: '' }];
        setAssessmentsData({
            ...assessmentsData,
            [selectedCourse]: newList
        });
    };

    const deleteAssessment = (index) => {
        const currentList = getCurrentAssessments();
        const newList = currentList.filter((_, i) => i !== index);
        setAssessmentsData({
            ...assessmentsData,
            [selectedCourse]: newList
        });
    };

    const calculateGrade = () => {
        const currentList = getCurrentAssessments();
        if (currentList.length === 0) return { percent: 0, letter: 'N/A' };

        let completedWeight = 0;
        let weightedScoreSum = 0;
        let totalPlannedWeight = 0; // Everything added so far

        currentList.forEach(item => {
            const weight = parseFloat(item.weight) || 0;
            totalPlannedWeight += weight;

            // Only count items that have a numeric score entered
            // Check for empty string explicitly because 0 is a valid score
            if (item.score !== '' && !isNaN(item.score)) {
                const score = parseFloat(item.score);
                completedWeight += weight;
                weightedScoreSum += (score * weight); // e.g. 50 * 80 (raw multiplication)
            }
        });

        if (completedWeight === 0) return { percent: 0, letter: 'N/A', totalWeight: 0, plannedWeight: totalPlannedWeight };

        // Average = (Total Weighted Score) / (Total Weight Completed)
        // Ensure accurate division. If weight is 50 and score is 80 (4000), 4000/50 = 80.
        const currentAverage = weightedScoreSum / completedWeight;

        const grade = getGradeFromPercentage(currentAverage);

        return {
            percent: currentAverage.toFixed(1),
            letter: grade.letter,
            gpa: grade.gpa,
            totalWeight: completedWeight, // Used for "progress"
            plannedWeight: totalPlannedWeight
        };
    };

    const gradeInfo = calculateGrade();

    if (!user?.courses || user.courses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
                    <Calculator className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">No Courses Found</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    You need to add courses to your profile before you can calculate grades.
                </p>
                <Link
                    to="/"
                    onClick={() => {
                        // Reset onboarding triggers if needed, but for now just redirect or show helpful message
                        // Since we don't have a settings page yet, we might need a way to edit profile.
                        // For now let's assume valid onboarding.
                        localStorage.clear();
                        window.location.reload();
                    }}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-500 font-bold"
                >
                    Reset Profile & Add Courses <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Grade Calculator</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your performance per course.</p>
                </div>

                {/* Visual Grade Badge */}
                <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border-0 w-[300px] flex-shrink-0">
                    <div className="text-right flex-1">
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wider">Projected</div>
                        <div className="text-3xl font-bold leading-none flex items-baseline justify-end gap-2">
                            {gradeInfo.letter}
                            {gradeInfo.gpa !== undefined && <span className="text-lg opacity-60 font-medium">({gradeInfo.gpa})</span>}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/20 flex-shrink-0"></div>
                    <div className="text-left flex-1">
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wider">Average</div>
                        <div className="text-xl font-bold leading-none">{gradeInfo.percent}%</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Calculator */}
                <div className="md:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="relative z-50">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-lg text-gray-800 dark:text-gray-200 min-w-[200px] hover:bg-white/60 dark:hover:bg-white/10 transition-all"
                            >
                                {selectedCourse}
                                <ChevronDown className={`w-5 h-5 ml-auto text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsDropdownOpen(false)}
                                    ></div>
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 p-1">
                                        {user.courses.map(course => (
                                            <button
                                                key={course}
                                                onClick={() => {
                                                    setSelectedCourse(course);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCourse === course
                                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {course}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            onClick={addAssessment}
                            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3 min-h-[200px]">
                        {getCurrentAssessments().length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 space-y-2 py-8">
                                <Plus className="w-8 h-8 opacity-50" />
                                <p>No assessments added yet</p>
                                <button onClick={addAssessment} className="text-blue-500 text-sm hover:underline">Add your first item</button>
                            </div>
                        ) : (
                            getCurrentAssessments().map((item, index) => (
                                <GradeRow
                                    key={index}
                                    assessment={item}
                                    onUpdate={(updated) => updateAssessment(index, updated)}
                                    onDelete={() => deleteAssessment(index)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Course Stats / Info */}
                <div className="space-y-6">
                    <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center w-full">
                            <h3 className="font-bold text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-widest text-xs">Course Progress</h3>
                            <div className="w-40 h-40 rounded-full border-8 border-blue-500/10 flex items-center justify-center mb-4 relative">
                                <svg className="w-full h-full absolute top-0 left-0 -rotate-90 transform" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="46"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-blue-500 transition-all duration-1000 ease-out"
                                        strokeDasharray={`${(gradeInfo.totalWeight * 2.89) || 0} 289`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="flex flex-col items-center">
                                    <span className="text-4xl font-bold text-gray-800 dark:text-white">{Math.round(gradeInfo.totalWeight)}</span>
                                    <span className="text-xs text-gray-400">% Completed</span>
                                </div>
                            </div>
                            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {gradeInfo.totalWeight < 100 ? (
                                    <span>You've completed <span className="text-blue-500">{gradeInfo.totalWeight}%</span> of {selectedCourse}</span>
                                ) : (
                                    <span className="text-green-500">Course Complete!</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
