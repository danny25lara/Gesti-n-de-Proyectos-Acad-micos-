// ==========================================================================
// 1. IMPORTACIONES
// ==========================================================================
import { inicializarRegistro } from './views/vistaRegistro.js';
import { renderizarTabla } from './views/vistaReporte.js';
import { mostrarAlerta } from './module/utilidades.js';
import { 
obtenerProyectos,guardarInformeProyecto, obtenerProyectoPorId,validarLogin,
registrarUsuario,existeAdminRegistrado,descargarRespaldo,cargarRespaldo} from './module/datos.js';

// ==========================================================================
// 2. ELEMENTOS DOM
// ==========================================================================
// Pantallas
const pantallaBienvenida = document.getElementById('pantallaBienvenida');
const aplicacionPrincipal = document.getElementById('aplicacionPrincipal');
const coheteHero = document.querySelector('.icono-hero');

// Login / Registro
const formLogin = document.getElementById('formLogin');
const formRegistro = document.getElementById('formRegistro');
const linkIrRegistro = document.getElementById('irARegistro');
const linkIrLogin = document.getElementById('irALogin');

const inputUser = document.getElementById('inputUsuario');
const inputPass = document.getElementById('inputPassword');
const btnLogin = document.getElementById('btnLogin');

const regEmail = document.getElementById('regEmail');
const regPass = document.getElementById('regPass');
const checkAdmin = document.getElementById('checkEsAdmin');
const btnRegistrar = document.getElementById('btnRegistrar');
const infoAdmin = document.getElementById('infoAdmin');

// Navegación
const btnReporte = document.getElementById('btnVerReporte');
const btnRegistro = document.getElementById('btnVerRegistro');
const btnInformes = document.getElementById('btnVerInformes'); 
const btnLogout = document.getElementById('btnCerrarSesion'); 

// Nuevos botones de respaldo
const btnExportar = document.getElementById('btnExportar');
const btnImportar = document.getElementById('btnImportar');
const inputArchivo = document.getElementById('inputCargaArchivo');

// Secciones
const secReporte = document.getElementById('seccionReporte');
const secRegistro = document.getElementById('seccionRegistro');
const secInformes = document.getElementById('seccionInformes');

// Informes
const selectProyectos = document.getElementById('selProyectoInforme');
const txtInforme = document.getElementById('txtCuerpoInforme');
const btnGuardarInf = document.getElementById('btnGuardarInforme');

// Impresión
const btnImprimir = document.getElementById('btnImprimir');
const fechaImpresion = document.getElementById('fechaImpresion');


// ==========================================================================
// 3. LÓGICA DE AUTENTICACIÓN (CON ALERTAS FLOTANTES)
// ==========================================================================

// Alternar formularios
linkIrRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    formLogin.classList.add('oculto');
    formRegistro.classList.remove('oculto');
    
    if (existeAdminRegistrado()) {
        checkAdmin.disabled = true;
        checkAdmin.checked = false;
        infoAdmin.style.display = 'block';
    } else {
        checkAdmin.disabled = false;
        infoAdmin.style.display = 'none';
    }
});

linkIrLogin.addEventListener('click', (e) => {
    e.preventDefault();
    formRegistro.classList.add('oculto');
    formLogin.classList.remove('oculto');
});

// REGISTRO
// js/app.js - Reemplaza el bloque del evento btnRegistrar

// B. Proceso de Registro (Crear Cuenta)
btnRegistrar.addEventListener('click', () => {
    const email = regEmail.value.trim();
    const pass = regPass.value.trim();
    const quiereSerAdmin = checkAdmin.checked;

    if (!email || !pass) {
        mostrarAlerta("Por favor, llena todos los campos", true); // Alerta Roja
        return;
    }

    const resultado = registrarUsuario(email, pass, quiereSerAdmin);

    if (resultado.exito) {
        // 1. Mostrar la ventana flotante de éxito con el visto ✅
        mostrarAlerta("¡Registro Exitoso! ✅ Redirigiendo...", false); 
        
        // 2. Limpiar los campos del formulario inmediatamente
        regEmail.value = "";
        regPass.value = "";
        checkAdmin.checked = false;
        // 3. ESPERAR 2 SEGUNDOS antes de cambiar al Login
        setTimeout(() => {
            formRegistro.classList.add('oculto');   // Ocultar Registro
            formLogin.classList.remove('oculto');   // Mostrar Login
            
            // Pre-llenar el correo en el login para facilitar la vida al usuario
            inputUser.value = email; 
        }, 2000); // 2000 milisegundos = 2 segundos
    } else {
        mostrarAlerta(resultado.msj, true); // Alerta Roja (Error)
    }
});
// LOGIN
btnLogin.addEventListener('click', function() {
    const user = inputUser.value.trim();
    const pass = inputPass.value.trim();

    const resultado = validarLogin(user, pass);

    if (resultado.exito) {
        mostrarAlerta(`Bienvenido, ${resultado.rol.toUpperCase()}`, false);
        entrarAlSistema(resultado.rol);
    } else {
        mostrarAlerta("Credenciales incorrectas ❌", true);
        // Temblor visual
        document.querySelector('.login-form').animate([
            { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, 
            { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }
        ], { duration: 300 });
    }
});


// ==========================================================================
// 4. FUNCIONALIDAD DE RESPALDO (NUEVO)
// ==========================================================================

// A. Exportar (Descargar JSON)
if (btnExportar) {
    btnExportar.addEventListener('click', () => {
        if(confirm("¿Quieres descargar una copia de seguridad de todos los datos?")) {
            descargarRespaldo();
            mostrarAlerta("Copia de seguridad descargada 💾", false);
        }
    });
}

// B. Importar (Subir JSON) - Paso 1: Click en botón activa el input invisible
if (btnImportar) {
    btnImportar.addEventListener('click', () => {
        inputArchivo.click(); // Simula click en el input type="file"
    });
}

// Paso 2: Cuando se selecciona un archivo
if (inputArchivo) {
    inputArchivo.addEventListener('change', function(e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = function(evento) {
            const contenido = evento.target.result;
            const resultado = cargarRespaldo(contenido);

            if (resultado.exito) {
                alert("Datos restaurados correctamente. El sistema se reiniciará.");
                location.reload(); // Recargar para ver los cambios
            } else {
                mostrarAlerta(resultado.msj, true);
            }
        };
        lector.readAsText(archivo);
    });
}


// ==========================================================================
// 5. TRANSICIÓN Y NAVEGACIÓN
// ==========================================================================

// En js/app.js - Función entrarAlSistema

function entrarAlSistema(rol) {
    document.body.className = ''; 
    
    // Seleccionamos SOLO los botones del menú de navegación que sean de admin
    // Usamos el selector específico 'nav .solo-admin' para no confundirnos con la tabla
    const botonesMenuAdmin = document.querySelectorAll('nav .solo-admin');
    if (rol === 'usuario') {
        document.body.classList.add('rol-usuario');
        // Ocultar menú admin
        botonesMenuAdmin.forEach(btn => btn.style.display = 'none');
    } else {
        document.body.classList.add('rol-admin');
        // Mostrar menú admin
        botonesMenuAdmin.forEach(btn => btn.style.display = '');
    }
    // Animación y cambio de pantalla...
    coheteHero.classList.add('cohete-despegando');
    pantallaBienvenida.classList.add('desaparecer');
    setTimeout(() => {
        pantallaBienvenida.style.display = 'none'; 
        aplicacionPrincipal.classList.remove('app-oculta');
        aplicacionPrincipal.classList.add('mostrar-app-animado');
        
        // AQUÍ es donde se crea la tabla. 
        // Como ya pusimos la clase 'rol-usuario' en el body arriba,
        // la función renderizarTabla sabrá que tiene que ocultar los botones.
        renderizarTabla(); 
    }, 3000);
}

// Logout
btnLogout.addEventListener('click', function() {
    if(confirm("¿Cerrar sesión?")) location.reload();
});

// Cambiar Vistas
function cambiarVista(vista) {
    secReporte.classList.add('oculto');
    secRegistro.classList.add('oculto');
    secInformes.classList.add('oculto');
    
    btnReporte.classList.remove('activo');
    btnRegistro.classList.remove('activo');
    btnInformes.classList.remove('activo');

    if (vista === 'registro') {
        secRegistro.classList.remove('oculto');
        btnRegistro.classList.add('activo');
    } else if (vista === 'informes') {
        secInformes.classList.remove('oculto');
        btnInformes.classList.add('activo');
        cargarSelectProyectos(); 
    } else {
        secReporte.classList.remove('oculto');
        btnReporte.classList.add('activo');
        renderizarTabla();
    }
}

btnReporte.addEventListener('click', () => cambiarVista('reporte'));
btnRegistro.addEventListener('click', () => cambiarVista('registro'));
btnInformes.addEventListener('click', () => cambiarVista('informes'));


// ==========================================================================
// 6. OTRAS FUNCIONALIDADES (Informes, Impresión)
// ==========================================================================

function cargarSelectProyectos() {
    const proyectos = obtenerProyectos();
    // Limpiamos el select y dejamos la opción por defecto
    selectProyectos.innerHTML = '<option value="">-- Elija un proyecto --</option>';
    for (let i = 0; i < proyectos.length; i++) {
        let p = proyectos[i]; // Obtenemos el proyecto actual usando el índice
        let option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.nombre;       
        selectProyectos.appendChild(option);
    }
}

selectProyectos.addEventListener('change', function() {
    const id = this.value;
    if (id) {
        const proyecto = obtenerProyectoPorId(id);
        if (proyecto) txtInforme.value = proyecto.informe || ""; 
    } else {
        txtInforme.value = "";
    }
});

btnGuardarInf.addEventListener('click', function() {
    const id = selectProyectos.value;
    const texto = txtInforme.value;
    if (!id) {
        mostrarAlerta("Seleccione un proyecto primero", true);
        return;
    }
    guardarInformeProyecto(id, texto);
    mostrarAlerta("Informe actualizado correctamente 📝", false);
    txtInforme.value = "";
    selectProyectos.value = "";
});

if (btnImprimir) {
    btnImprimir.addEventListener('click', function() {
        if (fechaImpresion) {
            fechaImpresion.textContent = new Date().toLocaleString();
        }
        window.print();
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarRegistro();
});
