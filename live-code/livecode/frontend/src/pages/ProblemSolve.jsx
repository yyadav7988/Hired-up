import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api';
import ProblemPanel from '../components/ProblemPanel';
import OutputConsole from '../components/OutputConsole';

const DEFAULT_TEMPLATES = {
    javascript: `// Write your JavaScript code here\n\nfunction solution() {\n    console.log("Hello, HiredUp!");\n}\n\nsolution();`,
    python: `# Write your Python code here\n\ndef solution():\n    print("Hello, HiredUp!")\n\nif __name__ == "__main__":\n    solution()`,
    cpp: `// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, HiredUp!" << std::endl;\n    return 0;\n}`
};

const ProblemSolve = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState({ id: 'javascript', label: 'JavaScript' });
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [testResults, setTestResults] = useState(null);
    const [aiFeedback, setAiFeedback] = useState(null);
    const [initialTestIndex, setInitialTestIndex] = useState(0);
    const [theme, setTheme] = useState(() => localStorage.getItem('hiredUpTheme') || 'dark');
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hiredUpTheme', theme);
    }, [theme]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleFocusMode = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        // Force theme change when entering/exiting focus mode
        toggleTheme();
    };

    const languages = [
        { id: 'javascript', label: 'JavaScript' },
        { id: 'python', label: 'Python (Local)' },
        { id: 'cpp', label: 'C++ (Local)' }
    ];

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const { data } = await api.get(`/problems/${id}`);
                setProblem(data);

                // Use starter code from DB if exists, otherwise use template
                const savedCode = localStorage.getItem(`hiredUp_code_${id}_${language.id}`);
                const starter = data.starterCode?.[language.id] || DEFAULT_TEMPLATES[language.id] || '';
                setCode(savedCode || starter);

                // Pre-fill the custom input with the first visible test case
                if (data.testCases && data.testCases.length > 0) {
                    setCustomInput(data.testCases[0].input);
                } else if (data.exampleInput) {
                    setCustomInput(data.exampleInput);
                }
            } catch (err) {
                console.error('Failed to fetch problem', err);
                // Even if problem fetch fails (e.g. for general practice), set a template
                const savedCode = localStorage.getItem(`hiredUp_code_${id}_${language.id}`);
                setCode(savedCode || DEFAULT_TEMPLATES[language.id]);
                // Set a mock problem for general practice if id is not found or it's a generic route
                setProblem({ title: 'General Practice', description: 'Practice your coding skills here.' });
            }
        };
        fetchProblem();
    }, [id, language.id]);

    // Auto-save code to localStorage whenever it changes
    useEffect(() => {
        if (code !== undefined && code !== null) {
            localStorage.setItem(`hiredUp_code_${id}_${language.id}`, code);
        }
    }, [code, id, language.id]);

    const handleRunCode = async () => {
        setLoading(true);
        setStatus('Processing...');
        try {
            const langMap = {
                'javascript': 63,
                'python': 71,
                'cpp': 54
            };
            const { data } = await api.post('/execute/run', {
                source_code: code,
                language_id: langMap[language.id] || 63,
                testCases: problem?.testCases || [],
                stdin: customInput,
                problemId: id !== 'practice' ? id : undefined
            });
            
            let outputText = '';
            if (data.testCaseResults && data.testCaseResults.length > 0) {
                 setTestResults(data.testCaseResults);
                 if (data.stdout && data.stdout !== 'Test cases processed locally.') {
                     outputText = data.stdout;
                 }
            } else {
                 setTestResults(null);
                 outputText = data.stdout || data.stderr || 'No output';
            }
            
            setOutput(outputText);
            setStatus(data.status?.description || 'Completed');
        } catch (err) {
            setOutput(err.response?.data?.error || 'Execution failed');
            setStatus('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (id === 'practice') {
             setOutput('Cannot submit practice code. Use Run instead.');
             setStatus('Info');
             return;
        }
        setSubmitting(true);
        setStatus('Submitting...');
        try {
            const langMap = { 'javascript': 63, 'python': 71, 'cpp': 54 };
            const runRes = await api.post('/execute/run', {
                source_code: code,
                language_id: langMap[language.id] || 63,
                testCases: problem?.testCases || [],
                problemId: id
            });
            
            const runData = runRes.data;
            const finalStatus = runData.status?.description || 'Completed';
            const finalOutput = runData.stdout || runData.stderr || 'No output';

            if (runData.testCaseResults && runData.testCaseResults.length > 0) {
                 setTestResults(runData.testCaseResults);
                 // Auto-select the first failing testcase if there is one
                 const failedIdx = runData.testCaseResults.findIndex(r => r.status !== 'Accepted' && r.status !== 'Success');
                 setInitialTestIndex(failedIdx !== -1 ? failedIdx : 0);
            } else {
                 setTestResults(null);
                 setInitialTestIndex(0);
            }

            const subRes = await api.post('/submissions', {
                problemId: id,
                code,
                language: language.id,
                status: finalStatus,
                output: finalOutput,
                executionTime: runData.time || 0
            });
            
            if (subRes.data && subRes.data.aiFeedback) {
                setAiFeedback(subRes.data.aiFeedback);
            }

            setStatus(finalStatus === 'Accepted' ? 'Success' : 'Failed');
            setOutput('Submission saved successfully!\nStatus: ' + finalStatus);
        } catch (err) {
            setStatus('Error');
            setOutput('Submission failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleLanguageChange = (e) => {
        const selected = languages.find(l => l.id === e.target.value);
        setLanguage(selected);
        const savedCode = localStorage.getItem(`hiredUp_code_${id}_${selected.id}`);
        if (savedCode) {
            setCode(savedCode);
        } else {
            setCode(DEFAULT_TEMPLATES[selected.id]);
        }
    };

    if (!problem && id !== 'practice') return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-[#1a1a1a] text-[#eff1f6f2] overflow-hidden font-sans">
            {/* Header */}
            <header className="h-12 bg-[#282828] border-b border-[#3e3e3e] flex items-center px-4 justify-between z-50">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span className="text-xl">←</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-[#3e3e3e]"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-200">{problem?.title || 'Coding Practice'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleFocusMode}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all border border-[#3e3e3e] hover:border-[#5e5e5e] ${isFullscreen ? 'bg-indigo-600 border-indigo-400' : ''}`}
                        title={isFullscreen ? 'Exit Focus Mode' : 'Enter Focus Mode (Fullscreen)'}
                    >
                        {isFullscreen ? '内' : '🔲'}
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all border border-[#3e3e3e] hover:border-[#5e5e5e]"
                        style={{ backgroundColor: 'var(--leetcode-dark-layer)', fontSize: '1rem' }}
                        title="Toggle Dark/Bright Mode"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    <select
                        className="bg-[#3e3e3e] border border-[#4e4e4e] rounded px-3 py-1 text-xs font-medium text-gray-200 outline-none cursor-pointer hover:bg-[#4e4e4e]"
                        value={language.id}
                        onChange={handleLanguageChange}
                    >
                        {languages.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.label}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <button
                            onClick={handleRunCode}
                            disabled={loading || submitting}
                            className="px-4 py-1.5 rounded bg-[#3e3e3e] text-white text-xs font-bold hover:bg-[#4e4e4e] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'RUNNING...' : 'Run'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || submitting}
                            className="px-4 py-1.5 rounded bg-[#2cbb5d] text-white text-xs font-bold hover:bg-[#34d06c] transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'PROCESSING...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Split Interface */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Problem Description */}
                <div className="w-[40%] min-w-[300px] flex flex-col border-r border-[#3e3e3e]">
                    <ProblemPanel problem={problem} />
                </div>

                {/* Right: Editor & Console */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
                    <div className="flex-1 relative min-h-0">
                        <Editor
                            height="100%"
                            language={language.id === 'cpp' ? 'cpp' : language.id}
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                lineNumbersMinChars: 4,
                                wordWrap: 'on',
                                backgroundColor: '#1e1e1e',
                                automaticLayout: true
                            }}
                        />
                    </div>
                    {/* Console Section - Fixed height, scroll handled inside OutputConsole */}
                    <div className="h-[250px] border-t border-[#3e3e3e] flex-shrink-0">
                        <OutputConsole 
                            output={output} 
                            status={status} 
                            loading={loading} 
                            customInput={customInput}
                            onCustomInputChange={setCustomInput}
                            testResults={testResults}
                            problem={problem}
                            initialTestIndex={initialTestIndex}
                            aiFeedback={aiFeedback}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemSolve;
