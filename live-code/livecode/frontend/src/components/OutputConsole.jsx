import React, { useState } from 'react';

const OutputConsole = ({ output, status, loading, customInput, onCustomInputChange, testResults, problem, initialTestIndex = 0, aiFeedback }) => {
    const [activeTab, setActiveTab] = useState('console'); // 'console' | 'testcase' | 'ai'
    const [activeTestIndex, setActiveTestIndex] = useState(initialTestIndex);

    React.useEffect(() => {
        setActiveTestIndex(initialTestIndex);
        if (aiFeedback && activeTab === 'console') {
            setActiveTab('ai');
        }
    }, [initialTestIndex, aiFeedback]);

    return (
        <div className="bg-[#1a1a1a] text-[#eff1f6f2] h-full overflow-hidden flex flex-col font-sans border-t border-[#3e3e3e]">
            {/* Console Header Tabs */}
            <div className="flex bg-[#282828] border-b border-[#3e3e3e] px-4 shrink-0">
                <div 
                    onClick={() => setActiveTab('console')}
                    className={`px-4 py-2 text-xs font-bold ${activeTab === 'console' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'} cursor-pointer transition-colors uppercase tracking-wider`}>
                    Console
                </div>
                <div 
                    onClick={() => setActiveTab('testcase')}
                    className={`px-4 py-2 text-xs font-bold ${activeTab === 'testcase' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white'} cursor-pointer transition-colors uppercase tracking-wider`}>
                    Testcase
                </div>
                {aiFeedback && (
                    <div 
                        onClick={() => setActiveTab('ai')}
                        className={`px-4 py-2 text-xs font-bold flex items-center gap-2 ${activeTab === 'ai' ? 'text-[#a855f7] border-b-2 border-[#a855f7]' : 'text-gray-500 hover:text-white'} cursor-pointer transition-colors uppercase tracking-wider animate-pulse`}>
                        <span className="text-lg">✨</span> AI Insight
                    </div>
                )}
                {status && (
                    <div className="ml-auto flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${(status === 'Accepted' || status === 'Success') ? 'text-[#00b8a3] bg-[#00b8a3]/10' :
                                'text-[#ef4743] bg-[#ef4743]/10'
                            }`}>
                            {status}
                        </span>
                    </div>
                )}
            </div>

            {/* Console Content */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin flex flex-col">
                {activeTab === 'ai' && aiFeedback ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#a855f7]/5 border border-[#a855f7]/20 rounded-lg p-4">
                                <div className="text-[10px] font-bold text-[#a855f7] uppercase tracking-widest mb-1">Complexity</div>
                                <div className="text-lg font-mono text-white">{aiFeedback.bigO || 'N/A'}</div>
                            </div>
                            <div className="bg-[#2cbb5d]/5 border border-[#2cbb5d]/20 rounded-lg p-4">
                                <div className="text-[10px] font-bold text-[#2cbb5d] uppercase tracking-widest mb-1">Quality Score</div>
                                <div className="text-lg font-mono text-white">{aiFeedback.qualityScore || 0} / 10</div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Readability</div>
                            <p className="text-sm text-gray-300 leading-relaxed bg-[#282828] p-3 rounded-lg border border-[#3e3e3e]">
                                {aiFeedback.readability}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Best Practices</div>
                            <ul className="grid grid-cols-1 gap-2">
                                {(aiFeedback.bestPractices || []).map((bp, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-[#282828] p-2 rounded border border-[#3e3e3e]">
                                        <span className="text-gray-500 mt-0.5">•</span>
                                        {bp}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Technical Feedback</div>
                            <div className="text-sm text-gray-300 italic leading-relaxed border-l-2 border-[#a855f7] pl-4 py-1">
                                {aiFeedback.feedback}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'testcase' ? (
                    <div className="flex-1 flex flex-col space-y-4">
                        {problem && problem.testCases && problem.testCases.filter(tc => !tc.hidden).length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {problem.testCases.filter(tc => !tc.hidden).map((tc, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onCustomInputChange(tc.input)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded flex items-center transition-colors border bg-[#282828] border-[#3e3e3e] text-gray-400 hover:bg-[#323232] hover:text-white`}
                                    >
                                        Case {index + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex-1 flex flex-col space-y-2">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Input</div>
                            <textarea
                                value={customInput}
                                onChange={(e) => onCustomInputChange(e.target.value)}
                                placeholder="Enter your custom test cases here..."
                                className="flex-1 bg-[#282828] text-[#eff1f6f2] border border-[#3e3e3e] rounded p-2 text-sm font-mono focus:outline-none focus:border-gray-500 resize-none min-h-[100px]"
                            />
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex items-center gap-3 py-2 text-gray-500 font-medium">
                        <div className="w-3 h-3 border border-gray-600 border-t-white rounded-full animate-spin"></div>
                        <span className="text-sm">Running code...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {testResults && testResults.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {testResults.map((r, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveTestIndex(i)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-2 transition-colors border ${activeTestIndex === i ? 'bg-[#3e3e3e] border-[#5e5e5e] text-white' : 'bg-[#282828] border-[#3e3e3e] text-gray-400 hover:bg-[#323232]'}`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'Accepted' || r.status === 'Success' ? 'bg-[#00b8a3]' : 'bg-[#ef4743]'}`}></div>
                                            Case {r.testCaseId}
                                        </button>
                                    ))}
                                </div>
                                {testResults[activeTestIndex] && (
                                    <div className="space-y-4">
                                        {(() => {
                                            const isHidden = problem?.testCases?.[activeTestIndex]?.hidden;
                                            return (
                                                <>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Input</div>
                                                        <pre className="whitespace-pre-wrap leading-relaxed text-sm font-mono text-gray-200 bg-[#282828] p-3 rounded border border-[#3e3e3e]">
                                                            {isHidden ? "Hidden Test Case" : testResults[activeTestIndex].input}
                                                        </pre>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Expected Output</div>
                                                        <pre className="whitespace-pre-wrap leading-relaxed text-sm font-mono text-gray-200 bg-[#282828] p-3 rounded border border-[#3e3e3e]">
                                                            {isHidden ? "Hidden" : testResults[activeTestIndex].expectedOutput}
                                                        </pre>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actual Output</div>
                                                        <pre className={`whitespace-pre-wrap leading-relaxed text-sm font-mono p-3 rounded border border-[#3e3e3e] ${(testResults[activeTestIndex].status === 'Accepted' || testResults[activeTestIndex].status === 'Success') ? 'bg-[#282828] text-gray-200' : 'bg-[#ef4743]/10 text-[#ef4743] border-[#ef4743]/30'}`}>
                                                            {testResults[activeTestIndex].actualOutput || 'No output'}
                                                        </pre>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                                {output ? (
                                    <div className="space-y-2 pt-4 border-t border-[#3e3e3e]">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Stdout</div>
                                        <pre className="whitespace-pre-wrap leading-relaxed text-sm font-mono text-gray-200 bg-[#282828] p-4 rounded border border-[#3e3e3e]">
                                            {output}
                                        </pre>
                                    </div>
                                ) : null}
                            </div>
                        ) : output ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Output</div>
                                    <pre className="whitespace-pre-wrap leading-relaxed text-sm font-mono text-gray-200 bg-[#282828] p-4 rounded border border-[#3e3e3e]">
                                        {output}
                                    </pre>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                                <p className="text-xs font-medium uppercase tracking-[0.2em]">Ready for execution</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputConsole;
