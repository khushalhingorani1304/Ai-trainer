"use client";
import { useState } from "react";
import axios from "axios";

export default function ExercisePage() {
    const [exercise, setExercise] = useState(null);
    const [report, setReport] = useState(null);

    const startExercise = async (type) => {
        setExercise(type);
        try {
            await axios.get(`http://127.0.0.1:8000/start/${type}`);
            alert(`${type} started!`);
        } catch (error) {
            console.error("Error starting exercise", error);
        }
    };

    const stopExercise = async () => {
        setExercise(null);
        try {
            await axios.get(`http://127.0.0.1:8000/stop`);
            alert("Exercise stopped!");
        } catch (error) {
            console.error("Error stopping exercise", error);
        }
    };

    const fetchReport = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/report`);
            setReport(response.data.report);
        } catch (error) {
            console.error("Error fetching report", error);
        }
    };

    return (
        <div className="container">
            <h1>AI Workout Tracker</h1>
            <div className="buttons">
                {["squat", "pushes", "crunch", "lunge", "plank"].map((ex) => (
                    <button key={ex} onClick={() => startExercise(ex)}>
                        Start {ex}
                    </button>
                ))}
                <button onClick={stopExercise}>Stop Exercise</button>
                <button onClick={fetchReport}>Generate Report</button>
            </div>
            {report && (
                <div className="report">
                    <h2>Workout Report</h2>
                    {Object.entries(report).map(([key, value]) => (
                        <p key={key}>{key}: {value}</p>
                    ))}
                </div>
            )}
            <style jsx>{`
                .container {
                    text-align: center;
                    padding: 20px;
                }
                .buttons {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin: 20px 0;
                }
                button {
                    padding: 10px;
                    font-size: 16px;
                    cursor: pointer;
                }
                .report {
                    margin-top: 20px;
                    border: 1px solid #ccc;
                    padding: 10px;
                }
            `}</style>
        </div>
    );
}
