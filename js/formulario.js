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

  document.getElementById('multiStepForm').addEventListener('submit', (e) => {
    if (!validateStep(currentStep)) {
      e.preventDefault();
    } else {
      alert("Formulario enviado correctamente.");
    }
  });

  function validateStep(step) {
    if (step === 0) {
      const nombre = document.getElementById('nombre').value.trim();
      const telefono = document.getElementById('telefono').value.trim();
      if (/\d/.test(nombre)) {
        alert('El nombre no puede contener números.');
        return false;
      }
      if (!/^\d{6,15}$/.test(telefono)) {
        alert('El teléfono no puede contener símbolos, espacios ni letras.');
        return false;
      }
    }

if (step === 1) {
  const origen = document.getElementById('origen').value.trim();
  const destino = document.getElementById('destino').value.trim();
  const fecha = document.getElementById('fecha').value;
  const direccionRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]{2,}\s+\d+[a-zA-Z0-9\-\/]{0,}$/;

  if (!direccionRegex.test(origen)) {
    alert('La dirección de origen no es válida.');
    return false;
  }
  if (!direccionRegex.test(destino)) {
    alert('La dirección de destino no es válida.');
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
    return false;
  }
}

    return true;
  }

  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha').min = hoy;

  showStep(currentStep);
});
