// js/vistas/vistaReporte.js
import { obtenerProyectos, eliminarProyectoPorId, actualizarAvanceProyecto } from '../module/datos.js'; // <--- OJO: Importamos actualizarAvanceProyecto
import { calcularEstadoProyecto, mostrarAlerta } from '../module/utilidades.js';

export function renderizarTabla() {
    let cuerpoTabla = document.getElementById('cuerpoTabla');
    let listaProyectos = obtenerProyectos();

    cuerpoTabla.innerHTML = '';

    for (let i = 0; i < listaProyectos.length; i++) {
        let proyecto = listaProyectos[i];
        let estado = calcularEstadoProyecto(proyecto.fechaEntrega, proyecto.avance);

        let fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${proyecto.nombre}</td>
            <td>${proyecto.integrantes}</td>
            <td>${proyecto.fechaEntrega}</td>
            <td>
                <strong>${proyecto.avance}%</strong>
            </td>
            <td>
                <span class="etiqueta ${estado.clase}">
                    ${estado.texto}
                </span>
            </td>
            <td style="text-align: center;">
                <button class="boton-accion boton-editar" id="btn-editar-${proyecto.id}">
                    ✏️
                </button>
                
                <button class="boton-accion boton-eliminar" id="btn-borrar-${proyecto.id}">
                    🗑️
                </button>
            </td>
        `;

        cuerpoTabla.appendChild(fila);

        // --- LÓGICA DEL BOTÓN EDITAR ---
        let btnEditar = document.getElementById(`btn-editar-${proyecto.id}`);
        
        btnEditar.addEventListener('click', function() {
            // 1. Pedir el nuevo dato al usuario
            let nuevoPorcentaje = prompt(`Ingrese el nuevo porcentaje para "${proyecto.nombre}":`, proyecto.avance);

            // 2. Validar que no haya dado Cancelar y que sea un número
            if (nuevoPorcentaje !== null && nuevoPorcentaje !== "") {
                if (nuevoPorcentaje >= 0 && nuevoPorcentaje <= 100) {
                    // 3. Actualizar en BD
                    actualizarAvanceProyecto(proyecto.id, nuevoPorcentaje);
                    // 4. Refrescar tabla y avisar
                    renderizarTabla();
                    mostrarAlerta("Progreso actualizado correctamente", false);
                } else {
                    alert("Error: El porcentaje debe ser entre 0 y 100.");
                }
            }
        });

        // --- LÓGICA DEL BOTÓN ELIMINAR (Ya la tenías) ---
        let btnBorrar = document.getElementById(`btn-borrar-${proyecto.id}`);
        btnBorrar.addEventListener('click', function() {
            let confirmar = confirm(`¿Eliminar "${proyecto.nombre}"?`);
            if (confirmar) {
                eliminarProyectoPorId(proyecto.id);
                renderizarTabla();
                mostrarAlerta("Proyecto eliminado", true);
            }
        });
    }
}