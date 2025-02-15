from fastapi import FastAPI, BackgroundTasks
import cv2
import numpy as np
import pyttsx3
import threading
import queue
import mediapipe as mp
import time

app = FastAPI()

# Text-to-Speech Engine
engine = pyttsx3.init()
engine.setProperty('rate', 200)
speech_queue = queue.Queue()
lock = threading.Lock()

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

# Exercise Tracking
counters = {"squat": 0, "pushup": 0, "crunch": 0, "lunge": 0, "plank": 0}
exercise_mode = None
cap = None
stop_event = threading.Event()
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

def calculate_angle(a, b, c):
    """Calculate the angle between three points."""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    ba = a - b
    bc = c - b
    
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    
    return np.degrees(angle)

def start_workout(mode):
    global exercise_mode, cap, stop_event
    stop_event.clear()
    exercise_mode = mode
    cap = cv2.VideoCapture(0)
    speech_queue.put(f"Starting {mode} exercise.")

    def run_camera():
        global counters
        reps = 0
        in_position = False  # Track movement state
        
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

                # Extract key joints
                left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
                left_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
                left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]

                left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
                left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y]
                left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y]

                # Exercise detection
                if mode == "squat":
                    angle = calculate_angle(left_hip, left_knee, left_ankle)
                    if angle < 90 and not in_position:
                        in_position = True
                    elif angle > 150 and in_position:
                        with lock:
                            counters[mode] += 1
                        in_position = False
                        speech_queue.put(f"Squat count: {counters[mode]}")

                elif mode == "pushup":
                    angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
                    if angle < 90 and not in_position:
                        in_position = True
                    elif angle > 160 and in_position:
                        with lock:
                            counters[mode] += 1
                        in_position = False
                        speech_queue.put(f"Push-up count: {counters[mode]}")

                elif mode == "crunch":
                    angle = calculate_angle(left_hip, left_shoulder, left_knee)
                    if angle < 70 and not in_position:
                        in_position = True
                    elif angle > 120 and in_position:
                        with lock:
                            counters[mode] += 1
                        in_position = False
                        speech_queue.put(f"Crunch count: {counters[mode]}")

                elif mode == "lunge":
                    angle = calculate_angle(left_hip, left_knee, left_ankle)
                    if angle < 70 and not in_position:
                        in_position = True
                    elif angle > 140 and in_position:
                        with lock:
                            counters[mode] += 1
                        in_position = False
                        speech_queue.put(f"Lunge count: {counters[mode]}")

                elif mode == "plank":
                    angle = calculate_angle(left_shoulder, left_hip, left_knee)
                    if 160 <= angle <= 180:
                        with lock:
                            counters[mode] += 1
                        speech_queue.put(f"Plank holding...")

            # Display counter
            cv2.putText(frame, f"{mode.capitalize()} Count: {counters[mode]}", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow('Exercise Counter', frame)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        speech_queue.put(f"Stopped {mode} exercise.")

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
    speech_queue.put("Exercise stopped.")
    return {"message": "Exercise stopped"}

@app.get("/report")
def generate_report():
    total_reps = sum(counters.values())
    return {"report": {**counters, "total": total_reps}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
