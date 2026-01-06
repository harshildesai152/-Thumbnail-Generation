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

    // cleanup previous socket if exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    let socket: any = null;

    // Dynamically import socket.io-client to avoid SSR issues
    const initializeSocket = async () => {
      try {
        // Double check if we already have a connection to avoid race conditions
        if (socketRef.current && socketRef.current.connected) return;

        // @ts-ignore - Dynamic import for socket.io-client
        const io = await socketioClient.default || socketioClient;

        // Create socket connection
        socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005', {
          transports: ['websocket', 'polling'],
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          timeout: 10000,
        });

        console.log('🔌 FRONTEND: Creating socket connection to:', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3005');

        socketRef.current = socket;

        // Handle connection
        socket.on('connect', () => {
          console.log('✅ Connected to socket server');
          setIsConnected(true);

          // Join user room
          if (userId) {
             socket.emit('join-user', userId);
             console.log(`👤 Joined user room: ${userId}`);
          }
        });

        // Handle disconnection
        socket.on('disconnect', (reason: string) => {
          console.log('❌ Disconnected from socket server:', reason);
          setIsConnected(false);
        });

        // Handle job updates
        socket.on('job-update', (update: JobUpdate) => {
          console.log('📡 FRONTEND: Job update received:', update);
          console.log('📡 FRONTEND: Current job updates array length:', jobUpdates.length);
          setJobUpdates(prev => {
            // Check if we already have this specific update (debounce)
            const exists = prev.some(p =>
              p.jobId === update.jobId &&
              p.status === update.status &&
              p.progress === update.progress
            );
            if (exists) {
              console.log('📡 FRONTEND: Duplicate update detected, skipping');
              return prev;
            }
            console.log('📡 FRONTEND: Adding new update to array');
            return [...prev, update];
          });
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
          // Re-join room on reconnect
          if (userId) {
            socket.emit('join-user', userId);
          }
        });

      } catch (error) {
        console.error('❌ Failed to initialize socket:', error);
        setIsConnected(false);
      }
    };

    initializeSocket();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection');
        socketRef.current.disconnect();
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
    socket: socketRef.current,
    isConnected,
    jobUpdates,
    clearJobUpdates,
    getLatestUpdateForJob,
  };
};
