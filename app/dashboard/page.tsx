"use client";

import { useEffect, useRef, useState } from 'react';
import './page.css';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

const Home: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentExercise, setCurrentExercise] = useState<string | null>(null);
    const [repCounter, setRepCounter] = useState<number>(0);
    const [statusText, setStatusText] = useState<string>('Select an exercise to begin');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const setupCamera = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
            }
            setStream(userStream);
            await new Promise((resolve) => {
                if (videoRef.current) {
                    videoRef.current.onloadedmetadata = () => {
                        resolve(true);
                    };
                }
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            setStatusText('Error accessing camera. Please allow camera permissions.');
        }
    };

    const setup = async () => {
        await tf.setBackend('webgl');
        await tf.ready();
    };

    const startExercise = async (exercise: string) => {
        setCurrentExercise(exercise);
        setRepCounter(0);
        setStatusText(`Starting ${exercise}...`);
        await setupCamera();
        setup();
    };

    const exitExercise = () => {
        setCurrentExercise(null);
        setRepCounter(0);
        setStatusText('Select an exercise to begin');
        setIsProcessing(false);

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startProcessing = async () => {
        if (!currentExercise || isProcessing) return;
        setIsProcessing(true);
        const context = canvasRef.current?.getContext('2d');

        const processFrame = async () => {
            if (!currentExercise || !context) {
                setIsProcessing(false);
                return;
            }

            if (canvasRef.current && videoRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

                const frame = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
                try {
                    const response = await fetch('http://localhost:3001/process_frame', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ frame, exercise_type: currentExercise })
                    });

                    const data = await response.json();
                    if (data.reps > 0) {
                        setRepCounter(data.reps);
                    }
                } catch (error) {
                    console.error('Error processing frame:', error);
                }

                requestAnimationFrame(processFrame);
            }
        };

        processFrame();
    };

    useEffect(() => {
        if (currentExercise) {
            startProcessing();
        }
    }, [currentExercise]);

    return (
        <div className="container">
            <header>
                <h1>Fitness Tracker</h1>
            </header>
            <div className="exercise-selector">
                <button onClick={() => startExercise('Pushups')}>Start Pushups</button>
                <button onClick={() => startExercise('Squats')}>Start Squats</button>
                <button onClick={() => startExercise('Bicep Curls')}>Start Bicep Curls</button>
                <button onClick={exitExercise} disabled={!currentExercise}>Exit</button>
            </div>
            <div className="camera-feed">
                <video ref={videoRef} autoPlay playsInline></video>
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            </div>
            <div className="stats">
                <p>Reps: <span id="rep-count">{repCounter}</span></p>
                <p>Status: <span id="status">{statusText}</span></p>
                <p>Current Exercise: <span id="status">{currentExercise || 'None'}</span></p>
            </div>
        </div>
    );
};

export default Home;