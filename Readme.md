# 🏋️ Fitness Tracker App

This is a **Full-Stack AI-Powered Fitness Tracking App** that uses **Pose Estimation** to track user exercises. The app consists of:

1. **Backend** (Node.js, Express, MongoDB)
2. **Pose Estimation Server** (Python with TensorFlow)
3. **Frontend** (React/Next.js)

---

## 🚀 How to Run the Project

To get the **Fitness Tracker** running locally, follow these **three steps**:

### **1️⃣ Start the Backend (Node.js API)**
The backend is built using **Node.js & Express** with **MongoDB**.

#### **Steps:**
1. Open a terminal.
2. Navigate to the `backend` directory:
   ```sh
   cd backend
   ```
3. Install dependencies (only needed the first time):
   ```sh
   npm install
   ```
4. Edit .env.sample to .env and put your username and password of mongodb in it

5. Start the backend server:
   ```sh
   npm run dev
   ```
6. The backend will be running at **`http://localhost:4000`**.

---

### **2️⃣ Start the Python Pose Estimation Server**
The Python server processes webcam frames and detects body movements.

#### **Steps:**
1. Open another terminal.
2. Navigate to the **main directory** (where `main.py` is located):
   ```sh
   cd main-directory
   ```
3. Install dependencies (only needed the first time):
   ```sh
   pip install -r requirements.txt
   ```
4. Start the Python server:
   ```sh
   python main.py
   ```
5. The Pose Estimation server will run at **`http://localhost:3001`**.

---

### **3️⃣ Start the Frontend (React/Next.js)**
The frontend is built with **Next.js** and displays the fitness tracker UI.

#### **Steps:**
1. Open another terminal.
2. Install dependencies (only needed the first time):
   ```sh
   npm install
   ```
3. Start the frontend:
   ```sh
   npm run dev
   ```
4. The app will be available at **`http://localhost:3000`**.

---

## 🎯 **Project Structure**
```
📂 project-root
│── 📂 backend          # Node.js/Express API
│── frontend            # Next.js React App
│── main.py             # Python Pose Estimation Server
│── requirements.txt    # Python dependencies
│── README.md           # Project Documentation
```

---

## 🛠️ **Technologies Used**
- **Backend:** Node.js, Express.js, MongoDB
- **AI Server:** Python, TensorFlow, OpenCV
- **Frontend:** Next.js (React), Tailwind CSS
- **Pose Detection:** MoveNet (TensorFlow.js)

---

## ❓ **Troubleshooting**
### 🔹 Backend Issues
- Make sure MongoDB is running.
- If you see a **CORS error**, ensure `cors` is correctly configured in `server.js` (see the backend setup).

### 🔹 Python Server Issues
- Ensure you have installed dependencies using:
  ```sh
  pip install -r requirements.txt
  ```
- If `tensorflow` or `cv2` throws an error, install them separately:
  ```sh
  pip install tensorflow opencv-python
  ```

### 🔹 Frontend Issues
- If `npm run dev` fails, try:
  ```sh
  rm -rf node_modules package-lock.json && npm install
  ```
- Restart the server if the UI doesn’t update.

---

## 🎉 **Contributing**
Feel free to fork this repo and submit a pull request. Contributions are welcome!

---

## 📝 **License**
This project is licensed under the **MIT License**.

---
🚀 **Happy Coding & Stay Fit!** 💪

