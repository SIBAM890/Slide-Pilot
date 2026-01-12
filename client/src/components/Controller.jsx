import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { socket, ICE_SERVERS } from '../utils/webrtc';
import { ChevronLeft, ChevronRight, Cast } from 'lucide-react';

const Controller = () => {
    const [roomId, setRoomId] = useState('');
    const [connected, setConnected] = useState(false);
    const [joined, setJoined] = useState(false);
    const videoRef = useRef();
    const peerRef = useRef();

    useEffect(() => {
        // Listen for incoming signals (Offer from Broadcaster)
        socket.on('signal', (data) => {
            console.log("Received signal from:", data.caller);

            // If we don't have a peer yet, create one
            if (!peerRef.current) {
                const peer = new SimplePeer({
                    initiator: false,
                    trickle: false,
                    config: { iceServers: ICE_SERVERS }
                });

                peer.on('signal', (signalData) => {
                    // Send Answer back to the caller
                    socket.emit('signal', { target: data.caller, signal: signalData });
                });

                peer.on('stream', (stream) => {
                    console.log("Received Stream!");
                    if (videoRef.current) videoRef.current.srcObject = stream;
                    setConnected(true);
                });

                peer.on('error', err => console.error("Peer Error:", err));

                peerRef.current = peer;
            }

            // Process the signal
            peerRef.current.signal(data.signal);
        });

        return () => {
            socket.off();
            if (peerRef.current) peerRef.current.destroy();
        };
    }, []);

    const joinSession = () => {
        if (!roomId) return;
        setJoined(true);
        socket.emit('join-room', roomId);
    };

    const sendCommand = (cmd) => {
        socket.emit('control-command', { roomId, command: cmd });
    };

    // Touch Handling for Swipes
    const minSwipeDistance = 50;
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);

    const onTouchStart = (e) => {
        touchEndRef.current = null;
        touchStartRef.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
        touchEndRef.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartRef.current || !touchEndRef.current) return;

        const distance = touchStartRef.current - touchEndRef.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            sendCommand('NEXT');
            console.log('Swipe Left -> NEXT');
        }
        if (isRightSwipe) {
            sendCommand('PREV');
            console.log('Swipe Right -> PREV');
        }
    };

    // ... (rest of render)

    if (!joined) {
        // ... (join screen code)
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="text-center space-y-6">
                    <Cast size={64} className="mx-auto text-blue-500" />
                    <h1 className="text-4xl font-bold">Smart Board Viewer</h1>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter Session Code"
                            className="bg-gray-800 border border-gray-700 text-white text-2xl px-6 py-4 rounded-lg outline-none focus:border-blue-500 w-64 text-center uppercase"
                            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                        />
                        <button
                            onClick={joinSession}
                            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-blue-500">
                            Connect
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col h-screen bg-black overflow-hidden touch-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Screen Share View */}
            <div className="flex-grow relative flex items-center justify-center pointer-events-none">
                {!connected && (
                    <div className="text-gray-500 animate-pulse">Waiting for presenter stream...</div>
                )}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                />
            </div>

            {/* Touch Controls Overlay */}
            <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-12 z-10">
                <button
                    onClick={() => sendCommand('PREV')}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all active:scale-95">
                    <ChevronLeft size={24} /> PREV
                </button>

                <span className="text-gray-500 font-mono">LIVE SESSION: {roomId}</span>

                <button
                    onClick={() => sendCommand('NEXT')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all active:scale-95">
                    NEXT <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};


export default Controller;