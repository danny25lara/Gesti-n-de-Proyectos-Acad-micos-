
import { inicializarRegistro } from './views/vistaRegistro.js';
import { renderizarTabla } from './views/vistaReporte.js';
// --- LÓGICA DE LA PANTALLA DE BIENVENIDA (NUEVO) ---
const btnIngresar = document.getElementById('btnIngresarSistema');
const pantallaBienvenida = document.getElementById('pantallaBienvenida');
const aplicacionPrincipal = document.getElementById('aplicacionPrincipal');
// Buscamos el elemento del cohete (el div con el emoji)
const coheteHero = document.querySelector('.icono-hero');

btnIngresar.addEventListener('click', function() {
    // 1. ¡Activar el despegue del cohete!
    // Le añadimos la clase que tiene la animación loca
    coheteHero.classList.add('cohete-despegando');
    // 2. Desvanecer el fondo (el contenedor de bienvenida)
    pantallaBienvenida.classList.add('desaparecer');
    // 3. Esperar a que termine la animación del cohete antes de cambiar de pantalla.
    // La animación CSS dura 1.2 segundos (1200ms). Esperamos ese tiempo exacto.
    setTimeout(() => {
        pantallaBienvenida.style.display = 'none'; // Quitamos la bienvenida del todo
        aplicacionPrincipal.classList.remove('app-oculta');
        aplicacionPrincipal.classList.add('mostrar-app-animado'); // Entra la app suavemente
    }, 3000);
});
// Referencias a los elementos del menú al dar click en cada boton se ejecuta una función para cambiar la vista de registro a reporte y viceversa
let btnReporte = document.getElementById('VerReporte');
let btnRegistro = document.getElementById('VerRegistro');
let secReporte = document.getElementById('seccionReporte');
let secRegistro = document.getElementById('seccionRegistro');

// Función para cambiar entre pestañas dentro de la aplicación
function cambiarVista(vista) {
    if (vista === 'registro') {
        secReporte.classList.add('oculto');
        secRegistro.classList.remove('oculto');
        
        btnReporte.classList.remove('activo');
        btnRegistro.classList.add('activo');
    } else {
        secRegistro.classList.add('oculto');
        secReporte.classList.remove('oculto');
        
        btnRegistro.classList.remove('activo');
        btnReporte.classList.add('activo');
        
        // Cada vez que volvemos al reporte, actualizamos la tabla
        renderizarTabla();
    }
}
// Eventos de los botones del menú
btnReporte.addEventListener('click', function() {
    cambiarVista('reporte');
});

btnRegistro.addEventListener('click', function() {
    cambiarVista('registro');
});

// Inicializar la aplicación cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Activar lógica del formulario
    inicializarRegistro();
    
    // Cargar tabla inicial
    renderizarTabla();
    
    console.log("Sistema Académico Iniciado Correctamente");
});

// Lógica del Botón Imprimir
const btnImprimir = document.getElementById('btnImprimir');

if (btnImprimir) {
    btnImprimir.addEventListener('click', function() {
        // Poner la fecha y hora exacta en el encabezado de papel
        const fechaHoy = new Date().toLocaleString();
        document.getElementById('fechaImpresion').textContent = fechaHoy;
        
        // Abrir el panel de impresión del navegador
        window.print();
    });

}
