import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { socket, generateRoomId, ICE_SERVERS } from '../utils/webrtc';
import { Monitor, Copy, CheckCircle } from 'lucide-react';

const Broadcaster = () => {
    const [roomId, setRoomId] = useState('');
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, sharing, connected
    const [copied, setCopied] = useState(false);
    const videoRef = useRef();
    const peerRef = useRef();

    useEffect(() => {
        // Generate room ID on load
        const id = generateRoomId();
        setRoomId(id);
        socket.emit('join-room', id);

        // Listen for viewer joining
        socket.on('user-connected', (userId) => {
            console.log("Viewer connected, initiating peer connection to:", userId);
            startPeerConnection(userId, stream);
        });

        // Listen for WebRTC signals (Answer from Controller)
        socket.on('signal', (data) => {
            // We only expect answers here since we are the initiator
            peerRef.current?.signal(data.signal);
        });

        // Listen for Remote Controls
        socket.on('execute-command', (command) => {
            handleRemoteControl(command);
        });

        return () => {
            socket.off();
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (peerRef.current) peerRef.current.destroy();
        };
    }, []); // Run once on mount, but be careful with stream dependency if we want to support late stream start

    // Effect to update stream in video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const startScreenShare = async () => {
        try {
            const currentStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "always" },
                audio: false
            });

            setStream(currentStream);
            setStatus('sharing');

            // If someone is already waiting (rare in this flow, usually they join after), 
            // handle that? For now, we assume Viewer joins AFTER Broadcaster is ready (or refreshes).
            // Actually, if Viewer joins BEFORE stream is ready, 'user-connected' might fire.
            // But we need 'stream' to pass to SimplePeer. 
            // Current user-connected listener captures 'stream' from closure, which might be null if not started.
            // Better to keeping 'user-connected' simple: trigger a state or just rely on the fact that 
            // usually you start sharing THEN share the link.

        } catch (err) {
            console.error("Failed to get display media", err);
            setStatus('idle');
        }
    };

    // We need a ref to the current stream because the socket callback closes over the initial null stream
    const streamRef = useRef(null);
    streamRef.current = stream;

    const startPeerConnection = (userId, currentStream) => {
        // Use the ref if currentStream is not passed specifically (though we pass it from effect?)
        // Actually, the effect closure problem: 'user-connected' is defined on mount. 
        // We should move socket listener or use refs.
        const actualStream = streamRef.current;
        if (!actualStream) {
            console.warn("No stream available yet, cannot initiate peer connection.");
            return;
        }

        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: actualStream,
            config: { iceServers: ICE_SERVERS }
        });

        peer.on('signal', (data) => {
            socket.emit('signal', { target: userId, signal: data });
        });

        peer.on('connect', () => {
            setStatus('connected');
            console.log("Peer connected!");
        });

        peer.on('error', (err) => {
            console.error("Peer error:", err);
            setStatus('sharing'); // Revert to sharing but not connected
        });

        peerRef.current = peer;
    };

    const handleRemoteControl = (cmd) => {
        // Creates a synthetic keyboard event
        const keyMap = {
            'NEXT': { key: 'ArrowRight', keyCode: 39, code: 'ArrowRight' },
            'PREV': { key: 'ArrowLeft', keyCode: 37, code: 'ArrowLeft' },
            'SCROLL_DOWN': { key: 'ArrowDown', keyCode: 40, code: 'ArrowDown' }
        };

        if (keyMap[cmd]) {
            document.dispatchEvent(new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                ...keyMap[cmd]
            }));
            console.log(`Executed: ${cmd}`);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
            <div className="max-w-4xl w-full bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Monitor className="text-blue-500" /> SlidePilot Broadcaster
                    </h1>
                    <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-600">
                        <span className="text-slate-400 text-sm">Session Code:</span>
                        <span className="font-mono text-xl font-bold tracking-widest text-blue-400">{roomId}</span>
                        <button onClick={copyCode} className="ml-2 hover:text-white text-slate-400">
                            {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>

                {status === 'idle' && (
                    <div className="text-center py-20 bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700">
                        <p className="mb-6 text-slate-400">Ready to present? Start sharing your screen.</p>
                        <button
                            onClick={startScreenShare}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25">
                            Start Screen Share
                        </button>
                    </div>
                )}

                {(status === 'sharing' || status === 'connected') && (
                    <div className="relative">
                        <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-lg bg-black aspect-video border border-slate-700" />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                                • Live
                            </span>
                            {status === 'connected' && (
                                <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    • Smart Board Connected
                                </span>
                            )}
                        </div>
                        <p className="mt-4 text-center text-yellow-400 text-sm bg-yellow-400/10 py-2 rounded">
                            ⚠️ Keep this tab open but <b>click on your presentation tab</b> to enable keyboard controls.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Broadcaster;