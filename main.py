import cv2
import numpy as np
import pyttsx3
import threading
import random
import queue
import tkinter as tk
from tkinter import messagebox
import mediapipe as mp
import speech_recognition as sr

# Initialize Text-to-Speech
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

# Motivational Quotes
motivational_quotes = [
    "Keep pushing, you're doing great!",
    "Stay strong, every rep counts!",
    "You're unstoppable, keep going!",
    "Feel the burn, embrace the progress!",
    "Every step forward is a step closer to your goal!"
]

def speak_count(count):
    if count > 0:
        speech_queue.put(f"{count} reps completed!")

def speak_motivation():
    speech_queue.put(random.choice(motivational_quotes))

def generate_report():
    total_reps = sum(counters.values())
    report = "Workout Summary:\n" + "\n".join([f"{exercise.capitalize()}: {count}" for exercise, count in counters.items()])
    report += f"\nTotal Reps: {total_reps}\n"
    performance = "Excellent" if total_reps > 50 else "Good" if total_reps > 30 else "Needs Improvement"
    report += f"Performance: {performance}"
    messagebox.showinfo("Workout Report", report)
    speech_queue.put(report)
    root.quit()

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

# Exercise Counters
counters = {"squat": 0, "pushes": 0, "crunch": 0, "lunge": 0, "plank": 0}
positions = {"squat": "up", "pushes": "up", "crunch": "up", "lunge": "up", "plank": "up"}
exercise_mode = None
cap = None
stop_event = threading.Event()

# Speech Recognition
def listen_for_command():
    recognizer = sr.Recognizer()
    while True:
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source)
            print("Listening for commands...")
            try:
                audio = recognizer.listen(source, timeout=2, phrase_time_limit=2)
                command = recognizer.recognize_google(audio).lower()
                print(f"You said: {command}")
                
                if "exit all" in command or "generate report" in command:
                    generate_report()
                elif "start" in command:
                    detected_exercise = next((exercise for exercise in counters.keys() if exercise in command), None)
                    if detected_exercise:
                        start_workout(detected_exercise)
                elif "stop exercise" in command:
                    stop_exercise()
            except sr.UnknownValueError:
                print("Could not understand the command.")
            except sr.RequestError:
                print("Could not request results, check internet connection.")
            except Exception as e:
                print("Error in speech recognition:", e)

threading.Thread(target=listen_for_command, daemon=True).start()

def start_workout(mode):
    global exercise_mode, cap, stop_event
    stop_event.clear()
    exercise_mode = mode
    cap = cv2.VideoCapture(0)
    
    def run_camera():
        global counters, positions
        
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
                
                if mode in positions:
                    key_points = {
                        "squat": (landmarks[mp_pose.PoseLandmark.LEFT_HIP].y, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y),
                        "pushes": (landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y),
                        "crunch": (landmarks[mp_pose.PoseLandmark.NOSE].y, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y),
                        "lunge": (landmarks[mp_pose.PoseLandmark.LEFT_HIP].y, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y),
                        "plank": (landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y)
                    }
                    if key_points[mode][1] < key_points[mode][0] and positions[mode] != "down":
                        positions[mode] = "down"
                    elif key_points[mode][1] > key_points[mode][0] and positions[mode] == "down":
                        positions[mode] = "up"
                        counters[mode] += 1
                        speak_count(counters[mode])
                        if counters[mode] % 10 == 0:
                            speak_motivation()
                
            cv2.putText(frame, f"{mode.capitalize()} Count: {counters[mode]}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow('Exercise Counter', frame)
            
            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
    
    threading.Thread(target=run_camera, daemon=True).start()

def stop_exercise():
    global cap, stop_event
    stop_event.set()
    if cap:
        cap.release()
        cv2.destroyAllWindows()
    messagebox.showinfo("Info", "Exercise stopped.")

# GUI Setup
root = tk.Tk()
root.title("AI Workout Tracker")
root.geometry("450x450")
root.configure(bg="lightgray")

tk.Label(root, text="🏋 AI Workout Tracker", font=("Arial", 18, "bold"), bg="lightgray").pack(pady=10)
for exercise in counters.keys():
    tk.Button(root, text=f"Start {exercise.capitalize()}", font=("Arial", 12), command=lambda ex=exercise: start_workout(ex)).pack(pady=5)
tk.Button(root, text="Stop Exercise", font=("Arial", 12), bg="yellow", command=stop_exercise).pack(pady=10)
tk.Button(root, text="Exit All & Generate Report", font=("Arial", 12), bg="red", fg="white", command=generate_report).pack(pady=10)

root.mainloop()

speech_queue.put(None)
speech_thread.join()
