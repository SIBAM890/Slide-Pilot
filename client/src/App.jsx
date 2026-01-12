import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Broadcaster from './components/Broadcaster';
import Controller from './components/Controller';
import { Cast, Monitor, Smartphone } from 'lucide-react';
import './App.css';

function Home() {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                SlidePilot
            </h1>
            <p className="text-xl text-slate-400 mb-12">Select your role to get started</p>

            <div className="flex gap-8">
                <Link to="/share" className="group relative bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-blue-500 transition-all hover:scale-105 w-64 text-center">
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                    <Monitor className="mx-auto mb-4 text-blue-400" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Broadcaster</h2>
                    <p className="text-slate-400 text-sm">Present from this device (Laptop)</p>
                </Link>

                <Link to="/view" className="group relative bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-purple-500 transition-all hover:scale-105 w-64 text-center">
                    <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                    <Smartphone className="mx-auto mb-4 text-purple-400" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Controller</h2>
                    <p className="text-slate-400 text-sm">View and control (Smart Board)</p>
                </Link>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/share" element={<Broadcaster />} />
                <Route path="/view" element={<Controller />} />
            </Routes>
        </Router>
    );
}

export default App;
