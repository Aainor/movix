// ../js/formulario.js

// --- 1. Importar las funciones necesarias de Firebase SDK v9 modular ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";


// --- 2. Tu Configuración de Firebase (misma que en login.js y la del HTML de tu amigo) ---
const firebaseConfig = {
    apiKey: "AIzaSyDKq4YA4Qk9ceD1XQcaEZnPMth1lqSN4rE",
    authDomain: "mudanzas-caba.firebaseapp.com",
    databaseURL: "https://mudanzas-caba-default-rtdb.firebaseio.com",
    projectId: "mudanzas-caba",
    storageBucket: "mudanzas-caba.firebasestorage.app",
    messagingSenderId: "292614458356",
    appId: "1:292614458356:web:e6466388d4b671fdc187a1", // <-- Usa este APP_ID del código de tu amigo.
    measurementId: "G-4R9LY1W8MN", // <-- Usa este Measurement ID del código de tu amigo.
};

// --- 3. Inicializa Firebase y obtiene instancias de Auth y Firestore ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Ahora se obtiene con getAuth()
const db = getFirestore(app); // Ahora se obtiene con getFirestore()


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
    if (!isValid) return false; // Si ya hay un error, salir

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
        hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

        const fechaMinimaPermitida = new Date(hoy);
        fechaMinimaPermitida.setDate(hoy.getDate() + 3); // Al menos 3 días de anticipación

        const fechaSeleccionada = new Date(fecha);
        fechaSeleccionada.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

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
            // alert('Por favor, completa todos los campos requeridos.'); // validateStep ya muestra el alert
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
        // La validación ya muestra un alert
        return;
    }

    const user = auth.currentUser; // Obtener el usuario autenticado
    if (!user) {
        console.error("No hay usuario autenticado. No se puede enviar el formulario.");
        alert("Por favor, inicia sesión para enviar tu solicitud.");
        return;
    }

    // Recolectar todos los datos del formulario
    const formData = {
        userId: user.uid, // Guarda el UID del usuario logueado
        userName: user.displayName || document.getElementById('nombre').value.trim() || user.email,
        userEmail: document.getElementById('email').value.trim() || user.email,
        telefono: document.getElementById('telefono').value.trim(),
        origen: document.getElementById('origen').value.trim(),
        destino: document.getElementById('destino').value.trim(),
        fechaMudanza: document.getElementById('fecha').value,
        tipoVivienda: document.getElementById('tipo').value,
        detallesAdicionales: document.getElementById('detalles').value.trim(),
        estado: "pendiente",
        // Usa serverTimestamp() de Firestore para la fecha del servidor (importado arriba)
        fechaSolicitud: serverTimestamp() 
    };

    try {
        // Guardar los datos en Firestore en la colección 'solicitudes_mudanza'
        const docRef = await addDoc(collection(db, "solicitudes_mudanza"), formData); // Sintaxis modular
        console.log("Documento de cotización guardado con ID:", docRef.id);
        alert("¡Tu solicitud de mudanza ha sido enviada con éxito! Nos pondremos en contacto pronto.");

        // Opcional: limpiar el formulario y volver al primer paso
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
// Mover el showStep(currentStep) dentro del onAuthStateChanged para que no se muestre
// antes de verificar el login.
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuario está logueado: Mostrar el formulario, ocultar el mensaje
        if (mainFormContent) {
            mainFormContent.classList.remove('hidden');
        }
        if (notLoggedInMessage) {
            notLoggedInMessage.classList.add('hidden');
        }
        console.log("Usuario logueado en formulario.html:", user.email);

        // Opcional: Rellenar los campos de Nombre y Correo si están vacíos
        const nombreInput = document.getElementById('nombre');
        const emailInput = document.getElementById('email');
        if (nombreInput && !nombreInput.value && user.displayName) {
            nombreInput.value = user.displayName;
        }
        if (emailInput && !emailInput.value && user.email) {
            emailInput.value = user.email;
        }
        
        // Mostrar el primer paso del formulario solo cuando el usuario está logueado
        showStep(currentStep); 

    } else {
        // Usuario NO está logueado: Ocultar el formulario, mostrar el mensaje y redirigir
        if (mainFormContent) {
            mainFormContent.classList.add('hidden');
        }
        if (notLoggedInMessage) {
            notLoggedInMessage.classList.remove('hidden');
        }
        console.log("Usuario no logueado en formulario.html, redirigiendo a login.html");
        // Redirigir a la página de login
        window.location.href = 'login.html'; // Redirige automáticamente
    }
});
