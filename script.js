import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlI0S22vdMexvdUQjEFLr0I5bvFoiPwjo",
  authDomain: "escaperoom-53adb.firebaseapp.com",
  projectId: "escaperoom-53adb",
  storageBucket: "escaperoom-53adb.firebasestorage.app",
  messagingSenderId: "379297108835",
  appId: "1:379297108835:web:48a5c5ca71b091cc567956",
  databaseURL: "https://escaperoom-53adb-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elements
const avatar = document.getElementById("avatar");
const stages = document.querySelectorAll(".stage");
const finalMessage = document.getElementById("finalMessage");
const timerDisplay = document.getElementById("timerDisplay");

// Countdown variables
let countdownDuration = 10 * 60; // 10 minutes in seconds
let countdownInterval = null;
let timerStarted = false;

// Listen for start signal from Firebase
onValue(ref(db, "timer/start"), (snapshot) => {
  const startFlag = snapshot.val();
  if (startFlag && !timerStarted) {
    timerStarted = true;
    startCountdown();
  }
});

function startCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    if (countdownDuration <= 0) {
      clearInterval(countdownInterval);
      timerDisplay.textContent = "00:00";
      set(ref(db, "finalMessage"), "Time’s up! Game Over!");
      return;
    }
    countdownDuration--;
    updateTimerDisplay(countdownDuration);
    set(ref(db, "timer/remaining"), countdownDuration);
  }, 1000);
}

function updateTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Restore timer if already running
onValue(ref(db, "timer/remaining"), (snapshot) => {
  const remaining = snapshot.val();
  if (remaining !== null && remaining > 0) {
    countdownDuration = remaining;
    updateTimerDisplay(remaining);
  }
});

// Listen for progress updates
onValue(ref(db, "level"), (snapshot) => {
  const level = snapshot.val();
  stages.forEach((stage, index) => {
    stage.classList.toggle("active", index < level);
  });
  const trackWidth = document.querySelector(".progress-track").offsetWidth;
  const step = trackWidth / (stages.length - 1);
  avatar.style.left = `${step * (level - 1)}px`;
});

// Listen for final message
onValue(ref(db, "finalMessage"), (snapshot) => {
  const msg = snapshot.val();
  finalMessage.textContent = msg || "";
});
