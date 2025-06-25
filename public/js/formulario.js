document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.form-step');
    let currentStep = 0;

    function showStep(index) {
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });
    }

    document.querySelectorAll('.next').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll('.prev').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    });

    // Modificamos el evento submit para enviar a Firebase
    document.getElementById('multiStepForm').addEventListener('submit', async (e) => { // Agregamos 'async' aquí
        e.preventDefault(); // Evita el envío tradicional y la recarga de la página

        if (validateStep(currentStep)) {
            // Recolectar todos los datos del formulario
            const formData = {
                nombre: document.getElementById('nombre').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                email: document.getElementById('email').value.trim(),
                origen: document.getElementById('origen').value.trim(),
                destino: document.getElementById('destino').value.trim(),
                fecha: document.getElementById('fecha').value,
                tipoVivienda: document.getElementById('tipo').value,
                detallesAdicionales: document.getElementById('detalles').value.trim(),
                timestamp: new Date() // Para saber cuándo se envió
            };

            try {
                // Acceder a la instancia de Firestore expuesta globalmente por formulario.html
                // Asegúrate de que window.firebaseDb, window.firebaseCollection y window.firebaseAddDoc
                // estén definidos en tu <script type="module"> en formulario.html
                const db = window.firebaseDb;
                const collection = window.firebaseCollection;
                const addDoc = window.firebaseAddDoc;

                if (!db || !collection || !addDoc) {
                    console.error("Error: Las funciones de Firebase Firestore no están disponibles globalmente. Asegúrate de que el script de inicialización de Firebase esté correcto en formulario.html.");
                    alert("Error de configuración de Firebase. Por favor, revisa la consola del navegador.");
                    return;
                }

                // Guardar los datos en Firestore en la colección 'solicitudes_mudanza'
                const docRef = await addDoc(collection(db, "solicitudes_mudanza"), formData);
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
        } else {
            // Si la validación del último paso falla, el preventDefault ya se aplicó.
            // La función validateStep ya muestra un alert con el error específico.
        }
    });

    function validateStep(step) {
        // Validar que todos los campos requeridos del paso actual no estén vacíos
        const currentInputs = steps[step].querySelectorAll('[required]');
        let allFilled = true;
        currentInputs.forEach(input => {
            if (input.type === 'email' && !input.value.trim().match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
                alert(`Por favor, introduce un correo electrónico válido.`);
                input.focus();
                allFilled = false;
            } else if (input.value.trim() === '' || (input.tagName === 'SELECT' && input.value === '')) {
                alert('Por favor, completa todos los campos requeridos.');
                input.focus();
                allFilled = false;
            }
        });
        if (!allFilled) return false;

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
            // Regex ajustada para permitir números, letras, espacios, puntos, guiones, barras, etc.
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

        // Si se llega aquí, todas las validaciones del paso actual pasaron
        return true;
    }

    // Establecer la fecha mínima para el input de fecha (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        fechaInput.min = hoy;
    }

    showStep(currentStep); // Mostrar el primer paso al cargar la página
});