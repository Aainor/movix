// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKq4YA4Qk9ceD1XQcaEZnPMth1lqSN4rE",
  authDomain: "mudanzas-caba.firebaseapp.com",
  databaseURL: "https://mudanzas-caba-default-rtdb.firebaseio.com",
  projectId: "mudanzas-caba",
  storageBucket: "mudanzas-caba.firebasestorage.app",
  messagingSenderId: "292614458356",
  appId: "1:292614458356:web:8daa5f7ac8b48251c187a1",
  measurementId: "G-G9B7SQG3MG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// DOM Elements
const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirm = document.getElementById('register-confirm');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginFormContainer = document.getElementById('login-form');
const registerFormContainer = document.getElementById('register-form');
const userContainer = document.getElementById('user-container');
const logoutBtn = document.getElementById('logout');
const googleLoginBtn = document.getElementById('google-login');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPhoto = document.getElementById('user-photo');

// Carrusel de imágenes (4 segundos por imagen)
let slideIndex = 0;
showSlides();

function showSlides() {
    const slides = document.getElementsByClassName("mySlides");
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;
    slides[slideIndex-1].style.display = "block";  
    setTimeout(showSlides, 4000);
}

// Toggle entre Login y Registro
showRegister.addEventListener('click', () => {
    loginFormContainer.classList.add('hidden');
    registerFormContainer.classList.remove('hidden');
});

showLogin.addEventListener('click', () => {
    registerFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
});

// Login con Email/Contraseña
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showUserUI(userCredential.user);
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

// Registro con Email/Contraseña
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (registerPassword.value !== registerConfirm.value) {
        alert("Las contraseñas no coinciden");
        return;
    }
    
    const email = registerEmail.value;
    const password = registerPassword.value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user.updateProfile({
                displayName: registerName.value
            });
        })
        .then(() => {
            showUserUI(auth.currentUser);
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

// Login con Google
googleLoginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            showUserUI(result.user);
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            loginFormContainer.classList.remove('hidden');
            userContainer.classList.add('hidden');
            loginForm.reset();
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
});

// Muestra la UI cuando el usuario está logueado
function showUserUI(user) {
    if (user) {
        userName.textContent = user.displayName || 'Usuario';
        userEmail.textContent = user.email;
        userPhoto.src = user.photoURL || "https://via.placeholder.com/100";
        
        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.add('hidden');
        userContainer.classList.remove('hidden');
    }
}

// Verifica si el usuario ya está autenticado
auth.onAuthStateChanged((user) => {
    if (user) {
        showUserUI(user);
    } else {
        loginFormContainer.classList.remove('hidden');
        userContainer.classList.add('hidden');
    }
});