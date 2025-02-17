"use client";

import { useEffect, useRef, useState } from "react";
import "./page.css"; // Add responsive CSS styles
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

const Home: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
    const [currentExercise, setCurrentExercise] = useState<string | null>(null);
    const [repCounter, setRepCounter] = useState<number>(0);
    const [statusText, setStatusText] = useState<string>("Select an exercise to begin");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Setup Camera
    const setupCamera = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
            }
            setStream(userStream);
            await new Promise((resolve) => {
                if (videoRef.current) {
                    videoRef.current.onloadedmetadata = () => resolve(true);
                }
            });
        } catch (error) {
            console.error("Error accessing camera:", error);
            setStatusText("Error accessing camera. Please allow camera permissions.");
        }
    };

    // Setup Pose Detection Model
    const setupModel = async () => {
        await tf.setBackend("webgl");
        await tf.ready();

        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        const poseDetector = await poseDetection.createDetector(model, detectorConfig);

        setDetector(poseDetector);
    };

    // Start Exercise
    const startExercise = async (exercise: string) => {
        setCurrentExercise(exercise);
        setRepCounter(0);
        setStatusText(`Starting ${exercise}...`);
        await setupCamera();
        await setupModel();
        startPoseDetection();
    };

    // Stop Exercise & Cleanup
    const exitExercise = () => {
        setCurrentExercise(null);
        setRepCounter(0);
        setStatusText("Select an exercise to begin");
        setIsProcessing(false);

        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    // Start Pose Detection
    const startPoseDetection = async () => {
        if (!detector || !videoRef.current) return;

        setIsProcessing(true);

        const processFrame = async () => {
            if (!detector || !videoRef.current || !canvasRef.current) {
                setIsProcessing(false);
                return;
            }

            const poses = await detector.estimatePoses(videoRef.current);
            drawPose(poses);

            requestAnimationFrame(processFrame);
        };

        processFrame();
    };

    // Draw Pose on Canvas
    const drawPose = (poses: poseDetection.Pose[]) => {
        if (!canvasRef.current || !videoRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        ctx.clearRect(0, 0, videoWidth, videoHeight);

        if (poses.length > 0) {
            poses.forEach((pose) => {
                drawKeypoints(ctx, pose.keypoints);
                drawSkeleton(ctx, pose.keypoints);
            });
        }
    };

    // Draw Keypoints
    const drawKeypoints = (ctx: CanvasRenderingContext2D, keypoints: poseDetection.Keypoint[]) => {
        keypoints.forEach((keypoint) => {
            if (keypoint && keypoint.score !== undefined && keypoint.score > 0.3) {
                ctx.beginPath();
                ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
            }
        });
    };

    // Draw Skeleton Connections
    const drawSkeleton = (ctx: CanvasRenderingContext2D, keypoints: poseDetection.Keypoint[]) => {
        const skeletonPairs = [
            [0, 1], [1, 2], [2, 3], [3, 7], // Face
            [0, 4], [4, 5], [5, 6], [6, 8], // Face
            [9, 10], // Shoulders
            [9, 11], [11, 13], [13, 15], // Left arm
            [10, 12], [12, 14], [14, 16], // Right arm
            [11, 23], [23, 25], [25, 27], // Left leg
            [12, 24], [24, 26], [26, 28], // Right leg
            [23, 24] // Hips
        ];

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;

        skeletonPairs.forEach(([start, end]) => {
            const startPoint = keypoints[start];
            const endPoint = keypoints[end];

            if (startPoint && endPoint && startPoint.score !== undefined && endPoint.score !== undefined && startPoint.score > 0.3 && endPoint.score > 0.3) {
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(endPoint.x, endPoint.y);
                ctx.stroke();
            }
        });
    };

    return (
        <div className="container">
            <header>
                <h1>Fitness Tracker</h1>
            </header>
            <div className="exercise-selector">
                <button onClick={() => startExercise("Pushups")}>Start Pushups</button>
                <button onClick={() => startExercise("Squats")}>Start Squats</button>
                <button onClick={() => startExercise("Bicep Curls")}>Start Bicep Curls</button>
                <button onClick={exitExercise} disabled={!currentExercise}>Exit</button>
            </div>
            <div className="camera-feed">
                <video ref={videoRef} autoPlay playsInline></video>
                <canvas ref={canvasRef} className="pose-canvas"></canvas>
            </div>
            <div className="stats">
                <p>Reps: <span>{repCounter}</span></p>
                <p>Status: <span>{statusText}</span></p>
                <p>Current Exercise: <span>{currentExercise || "None"}</span></p>
            </div>
        </div>
    );
};

export default Home;
