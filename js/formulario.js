// ../js/formulario.js

// --- 1. Importar las funciones necesarias de Firebase SDK v9 modular ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
// Asegúrate de que 'collection', 'addDoc' y 'serverTimestamp' estén importadas aquí
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";


// --- 2. Tu Configuración de Firebase (misma que en login.js y el HTML de tu amigo) ---
const firebaseConfig = {
    apiKey: "AIzaSyDKq4YA4Qk9ceD1XQcaEZnPMth1lqSN4rE",
    authDomain: "mudanzas-caba.firebaseapp.com",
    databaseURL: "https://mudanzas-caba-default-rtdb.firebaseio.com",
    projectId: "mudanzas-caba",
    storageBucket: "mudanzas-caba.firebasestorage.app",
    messagingSenderId: "292614458356",
    appId: "1:292614458356:web:e6466388d4b671fdc187a1", 
    measurementId: "G-4R9LY1W8MN", 
};

// --- 3. Inicializa Firebase y obtiene instancias de Auth y Firestore ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app); // 'db' ya está disponible aquí


// --- 4. Referencias a los elementos del DOM ---
const multiStepForm = document.getElementById('multiStepForm');
const formSteps = document.querySelectorAll('.form-step');
const nextButtons = document.querySelectorAll('.next');
const prevButtons = document.querySelectorAll('.prev');

// Nuevas referencias para el control de visibilidad
const mainFormContent = document.getElementById('main-form-content');
const notLoggedInMessage = document.getElementById('not-logged-in-message');


let currentStep = 0;

// --- 5. Funciones existentes para el formulario de varios pasos (sin cambios) ---
function showStep(index) {
    formSteps.forEach((step, i) => {
        step.classList.toggle('active', i === index);
    });
}

function validateStep(step) {
    let isValid = true;
    const currentInputs = formSteps[step].querySelectorAll('[required]');
    currentInputs.forEach(input => {
        if (input.type === 'email' && !input.value.trim().match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
            alert(`Por favor, introduce un correo electrónico válido.`);
            input.focus();
            isValid = false;
        } else if (input.value.trim() === '' || (input.tagName === 'SELECT' && input.value === '')) {
            alert('Por favor, completa todos los campos requeridos.');
            input.focus();
            isValid = false;
        }
    });
    if (!isValid) return false; 

    // Validaciones específicas de cada paso
    if (step === 0) {
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();

        if (/\d/.test(nombre)) {
            alert('El nombre no puede contener números.');
            document.getElementById('nombre').focus();
            return false;
        }
        if (!/^\d{6,15}$/.test(telefono)) {
            alert('El teléfono no puede contener símbolos, espacios ni letras. Debe tener entre 6 y 15 dígitos.');
            document.getElementById('telefono').focus();
            return false;
        }
    }

    if (step === 1) {
        const origen = document.getElementById('origen').value.trim();
        const destino = document.getElementById('destino').value.trim();
        const fecha = document.getElementById('fecha').value;
        const direccionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.\,\-\#\/]{2,}$/; 

        if (!direccionRegex.test(origen)) {
            alert('La dirección de origen no es válida. Asegúrate de incluir número de calle, piso, departamento, etc.');
            document.getElementById('origen').focus();
            return false;
        }
        if (!direccionRegex.test(destino)) {
            alert('La dirección de destino no es válida. Asegúrate de incluir número de calle, piso, departamento, etc.');
            document.getElementById('destino').focus();
            return false;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); 

        const fechaMinimaPermitida = new Date(hoy);
        fechaMinimaPermitida.setDate(hoy.getDate() + 3); 

        const fechaSeleccionada = new Date(fecha);
        fechaSeleccionada.setHours(0, 0, 0, 0); 

        if (fechaSeleccionada < fechaMinimaPermitida) {
            alert('La fecha de la mudanza debe tener al menos tres días de anticipación desde hoy.');
            document.getElementById('fecha').focus();
            return false;
        }
    }

    return true;
}

// --- 6. Event Listeners para navegación del formulario (sin cambios) ---
nextButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        } else {
            // alert('Por favor, completa todos los campos requeridos.'); 
        }
    });
});

prevButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentStep--;
        showStep(currentStep);
    });
});


// --- 7. Manejar el envío del formulario (submit) ---
multiStepForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
        return;
    }

    const user = auth.currentUser; 
    if (!user) {
        console.error("No hay usuario autenticado. No se puede enviar el formulario.");
        alert("Por favor, inicia sesión para enviar tu solicitud.");
        return;
    }

    // Recolectar todos los datos del formulario
    const formData = {
        userId: user.uid, 
        userName: user.displayName || document.getElementById('nombre').value.trim() || user.email,
        userEmail: document.getElementById('email').value.trim() || user.email,
        telefono: document.getElementById('telefono').value.trim(),
        origen: document.getElementById('origen').value.trim(),
        destino: document.getElementById('destino').value.trim(),
        fechaMudanza: document.getElementById('fecha').value,
        tipoVivienda: document.getElementById('tipo').value,
        detallesAdicionales: document.getElementById('detalles').value.trim(),
        estado: "pendiente",
        fechaSolicitud: serverTimestamp() 
    };

    try {
        // AQUÍ ES DONDE USAMOS DIRECTAMENTE LAS FUNCIONES IMPORTADAS
        const docRef = await addDoc(collection(db, "solicitudes_mudanza"), formData); 
        console.log("Documento de cotización guardado con ID:", docRef.id);
        alert("¡Tu solicitud de mudanza ha sido enviada con éxito! Nos pondremos en contacto pronto.");

        document.getElementById('multiStepForm').reset();
        currentStep = 0;
        showStep(currentStep);
    } catch (error) {
        console.error("Error al enviar la solicitud a Firestore:", error);
        alert("Hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo. Revisa la consola para más detalles.");
    }
});


// --- 8. Establecer la fecha mínima para el input de fecha (hoy) ---
const hoy = new Date().toISOString().split('T')[0];
const fechaInput = document.getElementById('fecha');
if (fechaInput) {
    fechaInput.min = hoy;
}

// --- 9. Control de visibilidad del formulario basado en el estado de autenticación ---
auth.onAuthStateChanged((user) => {
    if (user) {
        if (mainFormContent) {
            mainFormContent.classList.remove('hidden');
        }
        if (notLoggedInMessage) {
            notLoggedInMessage.classList.add('hidden');
        }
        console.log("Usuario logueado en formulario.html:", user.email);

        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        if (nombreInput && !nombreInput.value && user.displayName) {
            nombreInput.value = user.displayName;
        }
        if (emailInput && !emailInput.value && user.email) {
            emailInput.value = user.email;
        }
        
        showStep(currentStep); 

    } else {
        if (mainFormContent) {
            mainFormContent.classList.add('hidden');
        }
        if (notLoggedInMessage) {
            notLoggedInMessage.classList.remove('hidden');
        }
        console.log("Usuario no logueado en formulario.html, redirigiendo a login.html");
        window.location.href = '../pages/login.html'; // Asegúrate de la ruta correcta
    }
});
