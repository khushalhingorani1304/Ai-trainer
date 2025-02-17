from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import cv2
import numpy as np
import base64
import mediapipe as mp
import os
import logging
import datetime
from flask_cors import CORS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))
    return angle

# Exercise state tracking
exercise_states = {
    'Pushups': {'stage': None, 'reps': 0},
    'Squats': {'stage': None, 'reps': 0},
    'Bicep Curls': {'stage': None, 'reps': 0}
}

def process_frame(frame, exercise_type):
    try:
        # Convert frame to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        # Process with MediaPipe Pose
        results = pose.process(image)

        if not results.pose_landmarks:
            logger.warning("No pose landmarks detected")
            return {'reps': exercise_states[exercise_type]['reps']}

        landmarks = results.pose_landmarks.landmark
        logger.debug(f"Processing frame for {exercise_type}")

        if exercise_type == 'Pushups':
            # Pushup logic
            left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            angle = calculate_angle(left_shoulder, left_elbow, [left_elbow[0], left_elbow[1] - 0.1])
            
            if angle > 100 and exercise_states[exercise_type]['stage'] != 'up':
                exercise_states[exercise_type]['stage'] = 'up'
                logger.debug("Pushup up position detected")
                
            if angle < 55 and exercise_states[exercise_type]['stage'] == 'up':
                exercise_states[exercise_type]['stage'] = 'down'
                exercise_states[exercise_type]['reps'] += 1
                logger.info(f"Pushup completed! Total reps: {exercise_states[exercise_type]['reps']}")
                
            return {'reps': exercise_states[exercise_type]['reps'], 'stage': exercise_states[exercise_type]['stage']}

        elif exercise_type == 'Squats':
            # Squat logic
            left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                       landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            left_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                        landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            angle = calculate_angle(left_hip, left_knee, left_ankle)
            
            if angle > 150 and exercise_states[exercise_type]['stage'] != 'up':
                exercise_states[exercise_type]['stage'] = 'up'
                logger.debug("Squat up position detected")
                
            if angle < 110 and exercise_states[exercise_type]['stage'] == 'up':
                exercise_states[exercise_type]['stage'] = 'down'
                exercise_states[exercise_type]['reps'] += 1
                logger.info(f"Squat completed! Total reps: {exercise_states[exercise_type]['reps']}")
                
            return {'reps': exercise_states[exercise_type]['reps'], 'stage': exercise_states[exercise_type]['stage']}

        elif exercise_type == 'Bicep Curls':
            # Bicep curl logic
            left_shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            left_elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            left_wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                         landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
            
            if angle > 160 and exercise_states[exercise_type]['stage'] != 'down':
                exercise_states[exercise_type]['stage'] = 'down'
                logger.debug("Bicep curl down position detected")
                
            if angle < 30 and exercise_states[exercise_type]['stage'] == 'down':
                exercise_states[exercise_type]['stage'] = 'up'
                exercise_states[exercise_type]['reps'] += 1
                logger.info(f"Bicep curl completed! Total reps: {exercise_states[exercise_type]['reps']}")
                
            return {'reps': exercise_states[exercise_type]['reps'], 'stage': exercise_states[exercise_type]['stage']}

        return {'reps': 0}

    except Exception as e:
        print(f"Error processing frame: {e}")
        return {'reps': 0}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    print("Server is running and healthy")
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running successfully',
        'timestamp': datetime.datetime.now().isoformat()
    }), 200

@app.route('/process_frame', methods=['POST'])
@limiter.limit("10 per second")
def process_frame_endpoint():
    try:
        print("Received frame processing request")
        data = request.json
        if not data or 'frame' not in data or 'exercise_type' not in data:
            logger.warning("Invalid request data")
            return jsonify({'error': 'Invalid request data'}), 400

        frame_data = data['frame']
        exercise_type = data['exercise_type']

        if exercise_type not in ['Pushups', 'Squats', 'Bicep Curls']:
            logger.warning(f"Invalid exercise type: {exercise_type}")
            return jsonify({'error': 'Invalid exercise type'}), 400

        # Decode base64 frame
        frame_bytes = base64.b64decode(frame_data)
        frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
        frame = cv2.imdecode(frame_array, flags=cv2.IMREAD_COLOR)

        # Process frame with AI model
        result = process_frame(frame, exercise_type)

        logger.info(f"Successfully processed frame for {exercise_type}")
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

def webcam_interface():
    cap = cv2.VideoCapture(0)
    exercise_type = 'Pushups'  # Default exercise
    print("Press 'p' for Pushups, 's' for Squats, 'b' for Bicep Curls, 'q' to quit")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Process frame
        result = process_frame(frame, exercise_type)
        
        # Display rep count
        cv2.putText(frame, f"Exercise: {exercise_type}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.putText(frame, f"Reps: {result['reps']}", (10, 70), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        cv2.imshow('Fitness Tracker', frame)
        
        # Handle key presses
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('p'):
            exercise_type = 'Pushups'
        elif key == ord('s'):
            exercise_type = 'Squats'
        elif key == ord('b'):
            exercise_type = 'Bicep Curls'
    
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)

# import cv2
# import numpy as np
# import pyttsx3
# import threading
# import random
# import queue
# import tkinter as tk
# from tkinter import messagebox
# import mediapipe as mp
# import speech_recognition as sr

# # Initialize Text-to-Speech
# engine = pyttsx3.init()
# engine.setProperty('rate', 200)
# speech_queue = queue.Queue()

# def speech_worker():
#     while True:
#         text = speech_queue.get()
#         if text is None:
#             break
#         engine.say(text)
#         engine.runAndWait()
#         speech_queue.task_done()

# speech_thread = threading.Thread(target=speech_worker, daemon=True)
# speech_thread.start()

# # Motivational Quotes
# motivational_quotes = [
#     "Keep pushing, you're doing great!",
#     "Stay strong, every rep counts!",
#     "You're unstoppable, keep going!",
#     "Feel the burn, embrace the progress!",
#     "Every step forward is a step closer to your goal!"
# ]

# def speak_count(count):
#     if count > 0:
#         speech_queue.put(f"{count} reps completed!")

# def speak_motivation():
#     speech_queue.put(random.choice(motivational_quotes))

# def generate_report():
#     total_reps = sum(counters.values())
#     report = "Workout Summary:\n" + "\n".join([f"{exercise.capitalize()}: {count}" for exercise, count in counters.items()])
#     report += f"\nTotal Reps: {total_reps}\n"
#     performance = "Excellent" if total_reps > 50 else "Good" if total_reps > 30 else "Needs Improvement"
#     report += f"Performance: {performance}"
#     messagebox.showinfo("Workout Report", report)
#     speech_queue.put(report)
#     root.quit()

# # Initialize MediaPipe Pose
# mp_pose = mp.solutions.pose
# pose = mp_pose.Pose()
# mp_drawing = mp.solutions.drawing_utils

# # Exercise Counters
# counters = {"squat": 0, "pushes": 0, "crunch": 0, "lunge": 0, "plank": 0}
# positions = {"squat": "up", "pushes": "up", "crunch": "up", "lunge": "up", "plank": "up"}
# exercise_mode = None
# cap = None
# stop_event = threading.Event()

# # Speech Recognition
# def listen_for_command():
#     recognizer = sr.Recognizer()
#     while True:
#         with sr.Microphone() as source:
#             recognizer.adjust_for_ambient_noise(source)
#             print("Listening for commands...")
#             try:
#                 audio = recognizer.listen(source, timeout=2, phrase_time_limit=2)
#                 command = recognizer.recognize_google(audio).lower()
#                 print(f"You said: {command}")
                
#                 if "exit all" in command or "generate report" in command:
#                     generate_report()
#                 elif "start" in command:
#                     detected_exercise = next((exercise for exercise in counters.keys() if exercise in command), None)
#                     if detected_exercise:
#                         start_workout(detected_exercise)
#                 elif "stop exercise" in command:
#                     stop_exercise()
#             except sr.UnknownValueError:
#                 print("Could not understand the command.")
#             except sr.RequestError:
#                 print("Could not request results, check internet connection.")
#             except Exception as e:
#                 print("Error in speech recognition:", e)

# threading.Thread(target=listen_for_command, daemon=True).start()

# def start_workout(mode):
#     global exercise_mode, cap, stop_event
#     stop_event.clear()
#     exercise_mode = mode
#     cap = cv2.VideoCapture(0)
    
#     def run_camera():
#         global counters, positions
        
#         while cap.isOpened() and not stop_event.is_set():
#             ret, frame = cap.read()
#             if not ret:
#                 break
            
#             frame = cv2.flip(frame, 1)
#             rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             results = pose.process(rgb_frame)
            
#             if results.pose_landmarks:
#                 mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
#                 landmarks = results.pose_landmarks.landmark
                
#                 if mode in positions:
#                     key_points = {
#                         "squat": (landmarks[mp_pose.PoseLandmark.LEFT_HIP].y, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y),
#                         "pushes": (landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y),
#                         "crunch": (landmarks[mp_pose.PoseLandmark.NOSE].y, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y),
#                         "lunge": (landmarks[mp_pose.PoseLandmark.LEFT_HIP].y, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y),
#                         "plank": (landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y)
#                     }
#                     if key_points[mode][1] < key_points[mode][0] and positions[mode] != "down":
#                         positions[mode] = "down"
#                     elif key_points[mode][1] > key_points[mode][0] and positions[mode] == "down":
#                         positions[mode] = "up"
#                         counters[mode] += 1
#                         speak_count(counters[mode])
#                         if counters[mode] % 10 == 0:
#                             speak_motivation()
                
#             cv2.putText(frame, f"{mode.capitalize()} Count: {counters[mode]}", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
#             cv2.imshow('Exercise Counter', frame)
            
#             if cv2.waitKey(10) & 0xFF == ord('q'):
#                 break

#         cap.release()
#         cv2.destroyAllWindows()
    
#     threading.Thread(target=run_camera, daemon=True).start()

# def stop_exercise():
#     global cap, stop_event
#     stop_event.set()
#     if cap:
#         cap.release()
#         cv2.destroyAllWindows()
#     messagebox.showinfo("Info", "Exercise stopped.")

# # GUI Setup
# root = tk.Tk()
# root.title("AI Workout Tracker")
# root.geometry("450x450")
# root.configure(bg="lightgray")

# tk.Label(root, text="🏋 AI Workout Tracker", font=("Arial", 18, "bold"), bg="lightgray").pack(pady=10)
# for exercise in counters.keys():
#     tk.Button(root, text=f"Start {exercise.capitalize()}", font=("Arial", 12), command=lambda ex=exercise: start_workout(ex)).pack(pady=5)
# tk.Button(root, text="Stop Exercise", font=("Arial", 12), bg="yellow", command=stop_exercise).pack(pady=10)
# tk.Button(root, text="Exit All & Generate Report", font=("Arial", 12), bg="red", fg="white", command=generate_report).pack(pady=10)

# root.mainloop()

# speech_queue.put(None)
# speech_thread.join()

