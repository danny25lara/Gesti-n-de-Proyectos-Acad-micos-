// js/vistas/vistaReporte.js
import { obtenerProyectos, eliminarProyectoPorId, actualizarAvanceProyecto, subirArchivoAProyecto, eliminarArchivoDeProyecto } from '../module/datos.js'; 
import { calcularEstadoProyecto, mostrarAlerta } from '../module/utilidades.js';

// --- REFERENCIAS AL MODAL DE INFORME (El viejo) ---
const modal = document.getElementById('modalVisualizar');
const btnCerrar = document.getElementById('btnCerrarModal');
const tituloModal = document.getElementById('tituloModal');
const textoModal = document.getElementById('textoModal');

// --- REFERENCIAS AL MODAL DE ARCHIVOS (El nuevo) ---
const modalArchivos = document.getElementById('modalArchivos');
const btnCerrarArchivos = document.getElementById('btnCerrarModalArchivos');
const tituloModalArchivos = document.getElementById('tituloModalArchivos');
const zonaSubida = document.getElementById('zonaSubidaAdmin');
const inputFile = document.getElementById('inputFileProyecto');
const btnSubir = document.getElementById('btnSubirArchivo');
const listaArchivosUI = document.getElementById('listaArchivosContainer');
const msgArchivo = document.getElementById('msgArchivo');

// Variable para saber qué proyecto estamos editando en el modal
let idProyectoActual = null;


// --- CIERRE DE MODALES ---
if (btnCerrar) btnCerrar.addEventListener('click', () => modal.classList.add('oculto'));
if (btnCerrarArchivos) btnCerrarArchivos.addEventListener('click', () => modalArchivos.classList.add('oculto'));

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('oculto');
    if (e.target === modalArchivos) modalArchivos.classList.add('oculto');
});


// --- FUNCIÓN PRINCIPAL ---
export function renderizarTabla() {
    let cuerpoTabla = document.getElementById('cuerpoTabla');
    let listaProyectos = obtenerProyectos();
    const esUsuarioInvitado = document.body.classList.contains('rol-usuario');

    cuerpoTabla.innerHTML = '';

    for (let i = 0; i < listaProyectos.length; i++) {
        let proyecto = listaProyectos[i];
        let estado = calcularEstadoProyecto(proyecto.fechaEntrega, proyecto.avance);
        let fila = document.createElement('tr');

        // Estilo para ocultar botones de admin
        const estiloOculto = esUsuarioInvitado ? 'style="display: none !important;"' : '';

        fila.innerHTML = `
            <td>${proyecto.nombre}</td>
            <td>${proyecto.integrantes}</td>
            <td>${proyecto.fechaEntrega}</td>
            <td><strong>${proyecto.avance}%</strong></td>
            <td><span class="etiqueta ${estado.clase}">${estado.texto}</span></td>
            
            <td class="columna-acciones" style="text-align: center;">
                <button class="boton-accion boton-ver" id="btn-ver-${proyecto.id}" title="Ver Informe" style="background-color: #f59e0b;">📄</button>
                
                <button class="boton-accion" id="btn-archivos-${proyecto.id}" title="Ver Archivos" style="background-color: #3b82f6; color: white;">📎</button>

                <button class="boton-accion boton-editar solo-admin" id="btn-editar-${proyecto.id}" ${estiloOculto}>✏️</button>
                <button class="boton-accion boton-eliminar solo-admin" id="btn-borrar-${proyecto.id}" ${estiloOculto}>🗑️</button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);

        // 1. LOGICA VER INFORME
        document.getElementById(`btn-ver-${proyecto.id}`).addEventListener('click', () => {
            tituloModal.textContent = proyecto.nombre;
            textoModal.textContent = (proyecto.informe && proyecto.informe.trim() !== "") 
                ? proyecto.informe 
                : "No hay informes registrados.";
            modal.classList.remove('oculto');
        });

        // 2. LOGICA VER ARCHIVOS (NUEVO)
        document.getElementById(`btn-archivos-${proyecto.id}`).addEventListener('click', () => {
            abrirModalArchivos(proyecto, esUsuarioInvitado);
        });

        // 3. LOGICA EDITAR
        document.getElementById(`btn-editar-${proyecto.id}`).addEventListener('click', () => {
            let nuevo = prompt(`Nuevo porcentaje para "${proyecto.nombre}":`, proyecto.avance);
            if (nuevo !== null && nuevo !== "" && !isNaN(nuevo) && nuevo >= 0 && nuevo <= 100) {
                actualizarAvanceProyecto(proyecto.id, nuevo);
                renderizarTabla();
                mostrarAlerta("Progreso actualizado", false);
            }
        });

        // 4. LOGICA BORRAR
        document.getElementById(`btn-borrar-${proyecto.id}`).addEventListener('click', () => {
            if(confirm("¿Eliminar proyecto?")) {
                eliminarProyectoPorId(proyecto.id);
                renderizarTabla();
                mostrarAlerta("Proyecto eliminado", true);
            }
        });
    }
}


// --- LÓGICA INTERNA DEL GESTOR DE ARCHIVOS ---

// En js/vistas/vistaReporte.js

function abrirModalArchivos(proyectoInfoBasica, esInvitado) {
    idProyectoActual = proyectoInfoBasica.id;
    tituloModalArchivos.textContent = `Archivos: ${proyectoInfoBasica.nombre}`;
    msgArchivo.textContent = "";
    inputFile.value = ""; 
    // Ocultar zona de subida si es invitado
    if (esInvitado) {
        zonaSubida.style.display = 'none';
    } else {
        zonaSubida.style.display = 'block';
    }
    // --- CORRECCIÓN CLAVE AQUÍ ---
    // En lugar de usar la info básica, pedimos la info FRESCA a la base de datos
    const listaTotal = obtenerProyectos(); // Vamos al localStorage
    const proyectoActualizado = listaTotal.find(p => p.id === idProyectoActual);
    // Si el proyecto existe, mostramos sus archivos REALES guardados
    if (proyectoActualizado) {
        renderizarListaArchivos(proyectoActualizado, esInvitado);
    } else {
        // Por si acaso no lo encuentra
        renderizarListaArchivos(proyectoInfoBasica, esInvitado);
    }
    modalArchivos.classList.remove('oculto');
}

function renderizarListaArchivos(proyecto, esInvitado) {
    listaArchivosUI.innerHTML = '';
    
    // Si no existe el array de archivos o está vacío
    if (!proyecto.archivos || proyecto.archivos.length === 0) {
        listaArchivosUI.innerHTML = '<p style="color: #999; text-align:center; padding:10px;">Carpeta vacía 📂</p>';
        return;
    }

    // Dibujar cada archivo
    proyecto.archivos.forEach(archivo => {
        let div = document.createElement('div');
        div.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:10px; margin-bottom:5px; border-radius:6px; border:1px solid #e2e8f0;";
        
        // Icono según tipo (simple)
        let icono = "📄";
        if(archivo.tipo.includes('pdf')) icono = "📕";
        if(archivo.tipo.includes('word') || archivo.tipo.includes('document')) icono = "📘";
        if(archivo.tipo.includes('image')) icono = "🖼️";

        // Botón de borrar (solo si NO es invitado)
        let btnBorrarHTML = esInvitado ? '' : `<button class="btn-borrar-archivo" data-id="${archivo.id}" style="border:none; background:none; cursor:pointer; font-size:1.1rem;">❌</button>`;

        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
                <span style="font-size:1.5rem;">${icono}</span>
                <div style="display:flex; flex-direction:column;">
                    <a href="${archivo.datos}" download="${archivo.nombre}" style="color:#2563eb; font-weight:bold; text-decoration:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:250px;">
                        ${archivo.nombre}
                    </a>
                    <small style="color:#64748b; font-size:0.75rem;">${archivo.fecha}</small>
                </div>
            </div>
            ${btnBorrarHTML}
        `;
        
        listaArchivosUI.appendChild(div);
    });

    // Agregar eventos a los botones de borrar archivos
    if (!esInvitado) {
        document.querySelectorAll('.btn-borrar-archivo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm("¿Borrar este archivo permanentemente?")) {
                    const idArchivo = parseInt(e.target.getAttribute('data-id'));
                    eliminarArchivoDeProyecto(idProyectoActual, idArchivo);
                    
                    // Recargar la lista visualmente (Truco: obtener proyecto actualizado)
                    const proyectosActualizados = obtenerProyectos();
                    const proyActualizado = proyectosActualizados.find(p => p.id === idProyectoActual);
                    renderizarListaArchivos(proyActualizado, false);
                }
            });
        });
    }
}

// --- EVENTO SUBIR ARCHIVO (BOTÓN) ---
btnSubir.addEventListener('click', () => {
    const archivo = inputFile.files[0];

    if (!archivo) {
        msgArchivo.textContent = "⚠️ Selecciona un archivo primero.";
        msgArchivo.style.color = "red";
        return;
    }

    // VALIDACIÓN DE TAMAÑO (IMPORTANTE PARA LOCALSTORAGE)
    // 1MB = 1024 * 1024 bytes.
    if (archivo.size > 1000000) { 
        msgArchivo.textContent = "⚠️ Archivo muy pesado. Máximo 1MB.";
        msgArchivo.style.color = "red";
        return;
    }

    // LEER ARCHIVO Y CONVERTIR A BASE64
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        
        // Guardar en Base de Datos
        const exito = subirArchivoAProyecto(idProyectoActual, archivo.name, archivo.type, base64Data);
        
        if (exito) {
            msgArchivo.textContent = "✅ Subido correctamente.";
            msgArchivo.style.color = "green";
            inputFile.value = "";
            
            // Recargar lista
            const proyectosActualizados = obtenerProyectos();
            const proyActualizado = proyectosActualizados.find(p => p.id === idProyectoActual);
            renderizarListaArchivos(proyActualizado, false);
        } else {
            alert("Error al guardar.");
        }
    };
    reader.readAsDataURL(archivo);
});
