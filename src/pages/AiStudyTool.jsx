import React, { useState } from 'react';
import { Upload, FileText, BrainCircuit, Check, Save, Layers, HelpCircle, Loader, Trash2, ChevronRight, ChevronLeft, RotateCw, X } from 'lucide-react';
import { extractTextFromPdf } from '../lib/pdfParser';
import { generateStudyMaterial } from '../lib/gemini';
import { useStudy } from '../context/StudyContext';
import { useNotification } from '../context/NotificationContext';
import { cn } from '../lib/utils';

export default function AiStudyTool() {
    const { saveDeck, saveQuiz, flashcardDecks, quizzes, deleteDeck, deleteQuiz } = useStudy();
    const { notify, confirm } = useNotification();

    // Core State
    const [activeTab, setActiveTab] = useState('library'); // 'generate' | 'library' | 'study'

    // Generator State
    const [file, setFile] = useState(null);
    const [mode, setMode] = useState('flashcards');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [title, setTitle] = useState('');

    // Study Session State
    const [studySession, setStudySession] = useState(null); // { type: 'deck'|'quiz', data: ... }
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false); // Moved to top level
    const [quizAnswers, setQuizAnswers] = useState({}); // { questionIndex: optionString }
    const [showQuizResults, setShowQuizResults] = useState(false);

    // --- Generator Logic ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setTitle(e.target.files[0].name.replace('.pdf', ''));
        }
    };

    const handleGenerate = async () => {
        if (!file) { notify('warning', 'Please upload a PDF'); return; }
        setIsLoading(true);
        try {
            let text;
            try {
                text = await extractTextFromPdf(file);
                if (text.length < 50) throw new Error("PDF text too short.");
            } catch (err) { throw new Error("PDF Error: " + err.message); }

            const content = await generateStudyMaterial(text, mode);
            setGeneratedContent(content);
            notify('success', 'Generated successfully!');
        } catch (error) {
            console.error(error);
            notify('error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!generatedContent || !title) return;
        if (mode === 'flashcards') saveDeck(title, generatedContent);
        else saveQuiz(title, generatedContent);

        setGeneratedContent(null);
        setFile(null);
        setTitle('');
        setActiveTab('library');
    };

    // --- Study Logic ---
    const startStudy = (item, type) => {
        setStudySession({ type, data: item });
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setQuizAnswers({});
        setShowQuizResults(false);
        setActiveTab('study');
    };

    const handleQuizSelect = (qIndex, option) => {
        if (showQuizResults) return;
        setQuizAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const calculateScore = () => {
        if (!studySession || studySession.type !== 'quiz') return 0;
        let correct = 0;
        studySession.data.questions.forEach((q, i) => {
            if (quizAnswers[i] === q.answer) correct++;
        });
        return correct;
    };

    // --- Render Helpers ---
    const renderFlashcardSession = () => {
        const deck = studySession.data;
        const card = deck.cards[currentCardIndex];

        const handleFlip = () => {
            if (isAnimating) return;
            setIsAnimating(true);
            setTimeout(() => {
                setIsFlipped(!isFlipped);
                setTimeout(() => setIsAnimating(false), 150);
            }, 150);
        };

        const handleNext = () => {
            if (currentCardIndex < deck.cards.length - 1) {
                setIsFlipped(false);
                setCurrentCardIndex(curr => curr + 1);
            }
        };

        const handlePrev = () => {
            if (currentCardIndex > 0) {
                setIsFlipped(false);
                setCurrentCardIndex(curr => curr - 1);
            }
        };

        return (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto py-10">
                <div className="flex justify-between w-full mb-6 items-center">
                    <h2 className="text-xl font-bold text-[var(--app-text-color)]">{deck.title}</h2>
                    <span className="text-sm text-[var(--text-muted)]">{currentCardIndex + 1} / {deck.cards.length}</span>
                </div>

                <div
                    className="w-full aspect-[3/2] cursor-pointer group perspective-none"
                    onClick={handleFlip}
                >
                    <div className={cn(
                        "relative w-full h-full shadow-xl rounded-2xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 overflow-hidden transition-all duration-300 hover:border-blue-500/50 ease-in-out",
                        isAnimating ? "scale-x-0 opacity-50" : "scale-x-100 opacity-100" // The Magic Flip
                    )}>
                        {/* Content Container */}
                        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                            {!isFlipped ? (
                                <>
                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">Term</span>
                                    <h3 className="text-3xl font-bold text-[var(--app-text-color)]">{card.front}</h3>
                                    <p className="absolute bottom-6 text-xs text-[var(--text-muted)]">Click to reveal definition</p>
                                </>
                            ) : (
                                <>
                                    <span className="text-xs font-bold text-green-500 uppercase tracking-wider mb-4">Definition</span>
                                    <p className="text-xl leading-relaxed text-[var(--app-text-color)]">{card.back}</p>
                                    <p className="absolute bottom-6 text-xs text-[var(--text-muted)]">Click to see term</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={handlePrev}
                        disabled={currentCardIndex === 0}
                        className="p-4 rounded-full bg-gray-100 dark:bg-white/5 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentCardIndex === deck.cards.length - 1}
                        className="p-4 rounded-full bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    };

    const renderQuizSession = () => {
        const quiz = studySession.data;
        const score = calculateScore();
        const currentQuestion = quiz.questions[currentCardIndex];
        const isLastQuestion = currentCardIndex === quiz.questions.length - 1;

        if (showQuizResults) {
            return (
                <div className="max-w-2xl mx-auto py-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="glass-panel p-10 rounded-3xl border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                        <div className="w-24 h-24 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-4xl">
                            {score / quiz.questions.length >= 0.8 ? '🏆' : score / quiz.questions.length >= 0.5 ? '👍' : '📚'}
                        </div>
                        <h2 className="text-3xl font-bold text-[var(--app-text-color)] mb-2">Quiz Complete!</h2>
                        <p className="text-[var(--text-muted)] mb-6">You scored</p>
                        <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                            {Math.round((score / quiz.questions.length) * 100)}%
                        </div>
                        <p className="text-gray-400">{score} out of {quiz.questions.length} correct</p>
                    </div>

                    <div className="space-y-4 text-left">
                        <h3 className="font-bold text-[var(--app-text-color)] ml-2">Answer Key</h3>
                        {quiz.questions.map((q, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border ${quizAnswers[idx] === q.answer ? 'bg-green-50 border-green-200 dark:bg-green-900/10' : 'bg-red-50 border-red-200 dark:bg-red-900/10'}`}>
                                <div className="text-sm font-bold mb-1 text-[var(--app-text-color)]">Q{idx + 1}: {q.question}</div>
                                <div className="flex justify-between text-xs">
                                    <span className={quizAnswers[idx] === q.answer ? 'text-green-600' : 'text-red-500'}>
                                        You: {quizAnswers[idx] || 'Skipped'}
                                    </span>
                                    <span className="text-gray-500">Correct: {q.answer}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setActiveTab('library')}
                        className="w-full py-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-xl font-bold transition-all"
                    >
                        Back to Library
                    </button>
                </div>
            );
        }

        return (
            <div className="max-w-2xl mx-auto py-10 h-full flex flex-col">
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full mb-8 overflow-hidden">
                    <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${((currentCardIndex + 1) / quiz.questions.length) * 100}%` }}
                    ></div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <span className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-2">Question {currentCardIndex + 1} of {quiz.questions.length}</span>
                    <h3 className="text-2xl font-bold text-[var(--app-text-color)] mb-8 leading-relaxed">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuizSelect(currentCardIndex, opt)}
                                className={cn(
                                    "w-full text-left p-5 rounded-2xl border-2 transition-all font-medium flex items-center justify-between group",
                                    quizAnswers[currentCardIndex] === opt
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                        : "border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 hover:border-blue-200 dark:hover:border-white/20 text-gray-600 dark:text-gray-300"
                                )}
                            >
                                <span>{opt}</span>
                                {quizAnswers[currentCardIndex] === opt && <Check className="w-5 h-5" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                    <button
                        onClick={() => setCurrentCardIndex(curr => curr - 1)}
                        disabled={currentCardIndex === 0}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-0 transition-all flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" /> Previous
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={() => setShowQuizResults(true)}
                            disabled={!quizAnswers[currentCardIndex]} // Require answer to finish? Optional.
                            className="px-8 py-3 rounded-xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                        >
                            Submit Quiz <Check className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentCardIndex(curr => curr + 1)}
                            className="px-8 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                            Next <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    {activeTab === 'study' && (
                        <button onClick={() => setActiveTab('library')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                            {activeTab === 'study' ? 'Study Session' : 'AI Study Assistant'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {activeTab === 'study' ? (studySession?.type === 'deck' ? 'Flashcard Mode' : 'Quiz Mode') : 'Generate & Study'}
                        </p>
                    </div>
                </div>

                {activeTab !== 'study' && (
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                        <button onClick={() => setActiveTab('library')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'library' ? "bg-white dark:bg-white/10 shadow text-blue-600" : "text-gray-500")}>Library</button>
                        <button onClick={() => setActiveTab('generate')} className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'generate' ? "bg-white dark:bg-white/10 shadow text-blue-600" : "text-gray-500")}>Generate</button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {activeTab === 'study' && studySession && (
                    <div className="flex-1 overflow-y-auto">
                        {studySession.type === 'deck' ? renderFlashcardSession() : renderQuizSession()}
                    </div>
                )}

                {activeTab === 'library' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto p-1">
                        {flashcardDecks.map(deck => (
                            <div key={deck.id} onClick={() => startStudy(deck, 'deck')} className="glass-panel p-6 rounded-2xl relative group cursor-pointer hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id); }}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-full z-10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-[var(--app-text-color)] mb-1 group-hover:text-blue-600 transition-colors">{deck.title}</h3>
                                <p className="text-sm text-[var(--text-muted)]">{deck.cards.length} Cards • {deck.date}</p>
                            </div>
                        ))}
                        {quizzes.map(quiz => (
                            <div key={quiz.id} onClick={() => startStudy(quiz, 'quiz')} className="glass-panel p-6 rounded-2xl relative group cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all">
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteQuiz(quiz.id); }}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-full z-10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-[var(--app-text-color)] mb-1 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                                <p className="text-sm text-[var(--text-muted)]">{quiz.questions.length} Questions • {quiz.date}</p>
                            </div>
                        ))}
                        {flashcardDecks.length === 0 && quizzes.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <BrainCircuit className="w-10 h-10 opacity-30" />
                                </div>
                                <p className="text-lg font-medium">Your library is empty.</p>
                                <button onClick={() => setActiveTab('generate')} className="mt-4 text-blue-500 font-bold hover:underline">Create your first study set</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'generate' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
                        <div className="space-y-6 overflow-y-auto p-1">
                            {/* Upload Area */}
                            <div className="glass-panel p-8 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500/50 transition-colors bg-blue-50/50 dark:bg-white/5 flex flex-col items-center justify-center text-center space-y-4 min-h-[250px]">
                                <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                                    <FileText className="w-8 h-8 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[var(--app-text-color)]">Upload Material</h3>
                                    <p className="text-sm text-gray-400">PDFs up to 10MB</p>
                                </div>
                                <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />
                                <label htmlFor="pdf-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                                    {file ? 'Replace File' : 'Select PDF'}
                                </label>
                                {file && <div className="flex items-center gap-2 text-green-500 text-sm font-medium"><Check className="w-4 h-4" /> {file.name}</div>}
                            </div>

                            {/* Options */}
                            <div className="glass-panel p-6 rounded-2xl space-y-4">
                                <h3 className="font-bold text-[var(--app-text-color)]">Configuration</h3>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Week 4 Review)" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-[var(--app-text-color)]" />
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setMode('flashcards')} className={cn("p-4 rounded-xl border-2 text-left transition-all", mode === 'flashcards' ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-transparent bg-gray-50 dark:bg-white/5")}>
                                        <Layers className={cn("w-6 h-6 mb-2", mode === 'flashcards' ? "text-blue-500" : "text-gray-400")} />
                                        <div className="font-bold text-[var(--app-text-color)]">Flashcards</div>
                                    </button>
                                    <button onClick={() => setMode('quiz')} className={cn("p-4 rounded-xl border-2 text-left transition-all", mode === 'quiz' ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-transparent bg-gray-50 dark:bg-white/5")}>
                                        <HelpCircle className={cn("w-6 h-6 mb-2", mode === 'quiz' ? "text-indigo-500" : "text-gray-400")} />
                                        <div className="font-bold text-[var(--app-text-color)]">Quiz</div>
                                    </button>
                                </div>
                                <button onClick={handleGenerate} disabled={!file || isLoading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg">
                                    {isLoading ? <Loader className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
                                    {isLoading ? 'Processing...' : 'Generate Content'}
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="glass-panel p-6 rounded-3xl h-full flex flex-col relative overflow-hidden min-h-[500px]">
                            {!generatedContent ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 opacity-50">
                                    <BrainCircuit className="w-24 h-24 stroke-1" />
                                    <p className="text-lg">Preview will appear here</p>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full animate-in fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-[var(--app-text-color)]">Preview</h2>
                                        <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"><Save className="w-4 h-4" /> Save</button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                        {mode === 'flashcards' ? generatedContent.map((c, i) => (
                                            <div key={i} className="bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                                                <div className="font-bold text-[var(--app-text-color)]">{c.front}</div>
                                                <div className="text-sm text-[var(--text-muted)] mt-2">{c.back}</div>
                                            </div>
                                        )) : generatedContent.map((q, i) => (
                                            <div key={i} className="bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                                                <div className="font-bold mb-2 text-[var(--app-text-color)]">{q.question}</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {q.options.map((opt, oi) => (
                                                        <div key={oi} className={cn("text-xs p-2 rounded border", opt === q.answer ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 text-gray-500")}>{opt}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
