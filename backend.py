from fastapi import FastAPI, BackgroundTasks
import cv2
import numpy as np
import pyttsx3
import threading
import random
import queue
import mediapipe as mp
import speech_recognition as sr

app = FastAPI()

# Text-to-Speech
engine = pyttsx3.init()
engine.setProperty('rate', 200)
speech_queue = queue.Queue()

def speech_worker():
    while True:
        text = speech_queue.get()
        if text is None:
            break
        engine.say(text)
        engine.runAndWait()
        speech_queue.task_done()

speech_thread = threading.Thread(target=speech_worker, daemon=True)
speech_thread.start()

# Exercise Counters
counters = {"squat": 0, "pushes": 0, "crunch": 0, "lunge": 0, "plank": 0}
exercise_mode = None
cap = None
stop_event = threading.Event()
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

def start_workout(mode):
    global exercise_mode, cap, stop_event
    stop_event.clear()
    exercise_mode = mode
    cap = cv2.VideoCapture(0)

    def run_camera():
        global counters
        while cap.isOpened() and not stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                break
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb_frame)

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                landmarks = results.pose_landmarks.landmark
                key_points = {
                    "squat": (landmarks[mp_pose.PoseLandmark.LEFT_HIP].y, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y),
                    "pushes": (landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y),
                }
                if key_points.get(mode):
                    if key_points[mode][1] < key_points[mode][0]:
                        counters[mode] += 1

            cv2.putText(frame, f"{mode.capitalize()} Count: {counters[mode]}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow('Exercise Counter', frame)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

    threading.Thread(target=run_camera, daemon=True).start()

@app.get("/start/{exercise}")
def start(exercise: str, background_tasks: BackgroundTasks):
    if exercise in counters:
        background_tasks.add_task(start_workout, exercise)
        return {"message": f"Started {exercise}"}
    return {"error": "Invalid exercise"}

@app.get("/stop")
def stop():
    global cap, stop_event
    stop_event.set()
    if cap:
        cap.release()
        cv2.destroyAllWindows()
    return {"message": "Exercise stopped"}

@app.get("/report")
def generate_report():
    total_reps = sum(counters.values())
    report = {exercise: count for exercise, count in counters.items()}
    report["total"] = total_reps
    return {"report": report}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
