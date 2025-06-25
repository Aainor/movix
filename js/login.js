// login.js

// --- 1. Tu Configuración de Firebase ---
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

// --- 2. Inicializa Firebase y obtén las instancias de Auth y Firestore ---
// ¡CAMBIO CLAVE AQUÍ! Usamos 'firebase.initializeApp' y 'firebase.auth()', 'firebase.firestore()'
const app = firebase.initializeApp(firebaseConfig); // CORRECTO: Llama a firebase.initializeApp
const auth = firebase.auth();                       // CORRECTO: Llama a firebase.auth() para obtener la instancia de autenticación
const db = firebase.firestore();                     // CORRECTO: Llama a firebase.firestore() para obtener la instancia de Firestore

// --- DOM Elements (Tu código existente, sin cambios aquí) ---
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
const messageDisplay = document.getElementById('message-display'); // Nuevo elemento para mensajes


// OJO: La lógica del carrusel NO DEBE IR AQUÍ en login.js.
// Si ya la moviste a carousel.js, ¡perfecto! Si no, quítala de aquí.
// Aquí iría el código que NO es del carrusel.


// Toggle entre Login y Registro
showRegister.addEventListener('click', () => {
    loginFormContainer.classList.add('hidden');
    registerFormContainer.classList.remove('hidden');
    messageDisplay.textContent = '';
});

showLogin.addEventListener('click', () => {
    registerFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
    messageDisplay.textContent = '';
});

// Función para mostrar mensajes al usuario
function displayMessage(message, isError = true) {
    messageDisplay.textContent = message;
    messageDisplay.style.color = isError ? 'red' : 'green';
}

// --- 4. Login con Email/Contraseña (Sintaxis compatible con CDN v9 compat) ---
loginForm.addEventListener('submit', (e) => { // Elimina 'async'
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;

    auth.signInWithEmailAndPassword(email, password) // Sintaxis v8/compat
        .then((userCredential) => {
            displayMessage("Inicio de sesión exitoso.", false);
            // onAuthStateChanged se encargará de actualizar la UI
        })
        .catch((error) => {
            let errorMessage = "Error al iniciar sesión.";
            if (error.code === 'auth/user-not-found') {
                errorMessage = "No se encontró ningún usuario con ese correo electrónico.";
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = "Contraseña incorrecta.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "El formato del correo electrónico es inválido.";
            }
            console.error("Error de inicio de sesión:", error.message);
            displayMessage(errorMessage);
        });
});

// --- 5. Registro con Email/Contraseña (Sintaxis compatible con CDN v9 compat) ---
registerForm.addEventListener('submit', (e) => { // Elimina 'async'
    e.preventDefault();

    if (registerPassword.value !== registerConfirm.value) {
        displayMessage("Las contraseñas no coinciden.");
        return;
    }

    const name = registerName.value;
    const email = registerEmail.value;
    const password = registerPassword.value;

    auth.createUserWithEmailAndPassword(email, password) // Sintaxis v8/compat
        .then((userCredential) => {
            const user = userCredential.user;
            return user.updateProfile({ // Sintaxis v8/compat para updateProfile
                displayName: name
            }).then(() => user); // Pasamos el usuario actualizado a la siguiente promesa
        })
        .then((user) => {
            // Guardar datos adicionales del usuario en Firestore (Sintaxis v8/compat)
            return db.collection("usuarios").doc(user.uid).set({
                nombre: name,
                email: email,
                rol: "cliente",
                fechaCreacion: new Date()
            });
        })
        .then(() => {
            displayMessage("¡Registro exitoso! Ya puedes iniciar sesión.", false);
            registerForm.reset();
            // onAuthStateChanged se encargará de actualizar la UI
        })
        .catch((error) => {
            let errorMessage = "Error al registrarse.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "El correo electrónico ya está en uso.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "La contraseña es demasiado débil (mínimo 6 caracteres).";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "El formato del correo electrónico es inválido.";
            }
            console.error("Error de registro:", error.message);
            displayMessage(errorMessage);
        });
});

// --- 6. Login con Google (Sintaxis compatible con CDN v9 compat) ---
googleLoginBtn.addEventListener('click', () => { // Elimina 'async'
    const provider = new firebase.auth.GoogleAuthProvider(); // Sintaxis v8/compat

    auth.signInWithPopup(provider) // Sintaxis v8/compat
        .then((result) => {
            const user = result.user;

            // Opcional: Guardar datos de Google user en Firestore si es nuevo o actualizarlos
            return db.collection("usuarios").doc(user.uid).set({ // Sintaxis v8/compat
                nombre: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                rol: "cliente",
                fechaUltimoLogin: new Date()
            }, { merge: true });
        })
        .then(() => {
            displayMessage("Inicio de sesión con Google exitoso.", false);
            // onAuthStateChanged se encargará de actualizar la UI
        })
        .catch((error) => {
            let errorMessage = "Error al iniciar sesión con Google.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Se canceló la ventana emergente de Google.";
            }
            console.error("Error de Google login:", error.message);
            displayMessage(errorMessage);
        });
});

// --- 7. Logout (Sintaxis compatible con CDN v9 compat) ---
logoutBtn.addEventListener('click', () => { // Elimina 'async'
    auth.signOut() // Sintaxis v8/compat
        .then(() => {
            displayMessage("Sesión cerrada correctamente.", false);
            // onAuthStateChanged manejará el cambio de UI
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error.message);
            displayMessage("Error al cerrar sesión: " + error.message);
        });
});

// Muestra la UI cuando el usuario está logueado
function showUserUI(user) {
    if (user) {
        userName.textContent = user.displayName || 'Usuario';
        userEmail.textContent = user.email;
        userPhoto.src = user.photoURL || "https://via.placeholder.com/100";
        userPhoto.style.display = user.photoURL ? 'block' : 'none';

        loginFormContainer.classList.add('hidden');
        registerFormContainer.classList.add('hidden');
        userContainer.classList.remove('hidden');
        messageDisplay.textContent = '';
    }
}

// --- 8. Verifica si el usuario ya está autenticado (Sintaxis compatible con CDN v9 compat) ---
auth.onAuthStateChanged((user) => { // Sintaxis v8/compat
    if (user) {
        showUserUI(user);
    } else {
        loginFormContainer.classList.remove('hidden');
        userContainer.classList.add('hidden');
        registerFormContainer.classList.add('hidden');
        loginForm.reset();
        registerForm.reset();
        messageDisplay.textContent = '';
    }
});