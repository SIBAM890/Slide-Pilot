import io from 'socket.io-client';

// CHANGE THIS URL to your Render/Heroku URL when deploying!
// For local dev, use 'http://localhost:3000'
const SERVER_URL = import.meta.env.PROD ? '/' : 'http://localhost:3000';

export const socket = io(SERVER_URL);

// Simple ID generator for sessions
export const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
];
