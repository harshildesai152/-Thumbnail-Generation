import { useEffect, useRef, useState } from 'react';
import { JobUpdate } from '@/types';
import socketioClient from 'socket.io-client';

/**
 * Socket hook for real-time job updates
 * Uses dynamic imports to avoid SSR issues with socket.io-client
 */
export const useSocket = (userId?: string) => {
  const socketRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [jobUpdates, setJobUpdates] = useState<JobUpdate[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);

  // Mark as client ready after hydration
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  useEffect(() => {
    if (!isClientReady || !userId) return;

    let socket: any = null;

    // Dynamically import socket.io-client to avoid SSR issues
    const initializeSocket = async () => {
      try {
        // @ts-ignore - Dynamic import for socket.io-client
        const io = await socketioClient.default;

        // Create socket connection
        socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005', {
          transports: ['websocket', 'polling'],
          forceNew: true,
          timeout: 5000,
        });

        socketRef.current = socket;

        // Handle connection
        socket.on('connect', () => {
          console.log('✅ Connected to socket server');
          setIsConnected(true);

          // Join user room
          socket.emit('join-user', userId);
          console.log(`👤 Joined user room: ${userId}`);
        });

        // Handle disconnection
        socket.on('disconnect', (reason: string) => {
          console.log('❌ Disconnected from socket server:', reason);
          setIsConnected(false);
        });

        // Handle job updates
        socket.on('job-update', (update: JobUpdate) => {
          console.log('📡 Job update received:', update);
          setJobUpdates(prev => [...prev, update]);
        });

        // Handle connection errors
        socket.on('connect_error', (error: any) => {
          console.error('🔌 Socket connection error:', error.message);
          setIsConnected(false);
        });

        // Handle reconnection
        socket.on('reconnect', (attemptNumber: number) => {
          console.log(`🔄 Reconnected to socket server (attempt ${attemptNumber})`);
          setIsConnected(true);
        });

      } catch (error) {
        console.error('❌ Failed to initialize socket:', error);
        setIsConnected(false);
      }
    };

    initializeSocket();

    // Cleanup function
    return () => {
      if (socket) {
        console.log('🧹 Cleaning up socket connection');
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [userId, isClientReady]);

  // Method to clear job updates (useful after processing them)
  const clearJobUpdates = () => {
    setJobUpdates([]);
  };

  // Method to get the latest update for a specific job
  const getLatestUpdateForJob = (jobId: string): JobUpdate | undefined => {
    return jobUpdates
      .filter(update => update.jobId === jobId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  return {
    socket: null, // Real socket would be returned here
    isConnected,
    jobUpdates,
    clearJobUpdates,
    getLatestUpdateForJob,
  };
};
