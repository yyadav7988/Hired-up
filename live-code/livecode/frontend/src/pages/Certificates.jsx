import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('hiredUpTheme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('hiredUpTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const { data } = await api.get('/certificates');
            setCertificates(data);
        } catch (err) {
            console.error('Failed to fetch certificates', err);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleUpload = async () => {
        if (!file) return setMessage('Please select a file first.');
        
        setUploading(true);
        setMessage('AI is scanning your certificate...');
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/certificates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('✨ Certificate verified successfully!');
            setFile(null);
            fetchCertificates();
        } catch (err) {
            setMessage('❌ Verification failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-[#eff1f6f2] font-sans p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm mb-2 block">← Back to Dashboard</Link>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            Smart Skill Validation
                        </h1>
                        <p className="text-gray-400 mt-2">Vision AI-powered certificate verification and fraud detection.</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="w-12 h-12 flex items-center justify-center rounded-full transition-all border border-white/10 hover:border-purple-500/40 bg-white/5"
                        title="Toggle Dark/Bright Mode"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <div className="col-span-1">
                        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-6 sticky top-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-purple-500">✨</span> Verify New Certificate
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-[#3e3e3e] rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer relative group">
                                    <input 
                                        type="file" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*,.pdf"
                                    />
                                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">📄</div>
                                    <p className="text-sm text-gray-400">
                                        {file ? file.name : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">JPG, PNG, PDF (Max 5MB)</p>
                                </div>

                                <button 
                                    onClick={handleUpload}
                                    disabled={uploading || !file}
                                    className={`w-full py-3 rounded-xl font-bold transition-all ${
                                        uploading 
                                        ? 'bg-purple-600/20 text-purple-400 cursor-not-allowed' 
                                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                                    } disabled:opacity-50`}
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                            AI ANALYZING...
                                        </span>
                                    ) : 'START AI VERIFICATION'}
                                </button>

                                {message && (
                                    <p className={`text-center text-sm font-medium mt-4 ${message.includes('❌') ? 'text-red-400' : 'text-purple-400'}`}>
                                        {message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certificates Grid */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {certificates.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-[#1a1a1a] rounded-2xl border border-[#2e2e2e]">
                                    <div className="text-4xl mb-4 opacity-20">🛡️</div>
                                    <p className="text-gray-500">No verified certificates found.</p>
                                </div>
                            ) : (
                                certificates.map(cert => (
                                    <div key={cert._id} className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-5 hover:border-purple-500/30 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded uppercase tracking-widest">
                                                {cert.platform}
                                            </div>
                                            <div className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                cert.status === 'VERIFIED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                                {cert.status}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg mb-1 leading-tight group-hover:text-purple-400 transition-colors">{cert.courseName}</h3>
                                        <p className="text-xs text-gray-500 mb-4">{cert.candidateName}</p>
                                        
                                        <div className="pt-4 border-t border-[#2e2e2e] flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Trust Score</span>
                                                <span className="text-xs font-mono text-gray-300">{cert.trustScore}%</span>
                                            </div>
                                            <a 
                                                href={`http://localhost:5001${cert.filePath}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
                                            >
                                                VIEW DOCUMENT →
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificates;
