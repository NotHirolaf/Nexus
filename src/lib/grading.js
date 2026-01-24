export const GRADING_SCHEME = [
    { letter: 'A+', gpa: 4.0, min: 90, max: 100 },
    { letter: 'A', gpa: 4.0, min: 85, max: 89 },
    { letter: 'A-', gpa: 3.7, min: 80, max: 84 },
    { letter: 'B+', gpa: 3.3, min: 77, max: 79 },
    { letter: 'B', gpa: 3.0, min: 73, max: 76 },
    { letter: 'B-', gpa: 2.7, min: 70, max: 72 },
    { letter: 'C+', gpa: 2.3, min: 67, max: 69 },
    { letter: 'C', gpa: 2.0, min: 63, max: 66 },
    { letter: 'C-', gpa: 1.7, min: 60, max: 62 },
    { letter: 'D+', gpa: 1.3, min: 57, max: 59 },
    { letter: 'D', gpa: 1.0, min: 53, max: 56 },
    { letter: 'D-', gpa: 0.7, min: 50, max: 52 },
    { letter: 'F', gpa: 0.0, min: 0, max: 49 },
];

/**
 * strictMode: if true, uses floor/exact comparison. If false (default), rounds to nearest integer.
 */
export function getGradeFromPercentage(percentage, strictMode = false) {
    // Ensure percentage is a number
    const val = parseFloat(percentage);
    if (isNaN(val)) return { letter: 'N/A', gpa: 0.0 };

    const checkVal = strictMode ? val : Math.round(val);

    // Handle cases > 100 just in case (e.g. bonus), assume A+
    if (checkVal > 100) return { letter: 'A+', gpa: 4.0 };

    const grade = GRADING_SCHEME.find(g => checkVal >= g.min && checkVal <= g.max);
    return grade || { letter: 'F', gpa: 0.0 };
}
