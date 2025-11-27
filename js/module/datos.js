// Clave para guardar en el navegador
const CLAVE_LOCAL = 'sistema_universitario_db';

// Función para obtener la lista de proyectos guardados
export function obtenerProyectos() {
    let proyectosGuardados = localStorage.getItem(CLAVE_LOCAL);
    
    // Verificamos si existe información previa
    if (proyectosGuardados) {
        return JSON.parse(proyectosGuardados);
    } else {
        return []; // Retorna arreglo vacío si no hay nada
    }
}

// Función para agregar un nuevo proyecto a la lista
export function guardarProyectoEnMemoria(nuevoProyecto) {
    // 1. Traemos lo que ya existe
    let listaProyectos = obtenerProyectos();
    
    // 2. Agregamos el nuevo al final del arreglo
    listaProyectos.push(nuevoProyecto);
    
    // 3. Guardamos todo de nuevo convirtiéndolo a texto
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(listaProyectos));
}

// Función para eliminar un proyecto por su ID
export function eliminarProyectoPorId(idParaBorrar) {
    let listaActual = obtenerProyectos();
    let listaNueva = [];

    // Usamos un ciclo FOR clásico para filtrar
    // Si el ID NO es el que queremos borrar, lo guardamos en la nueva lista
    for (let i = 0; i < listaActual.length; i++) {
        if (listaActual[i].id !== idParaBorrar) {
            listaNueva.push(listaActual[i]);
        }
    }

    // Guardamos la lista actualizada (sin el eliminado)
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(listaNueva));
}
// Función para editar solo el avance de un proyecto
export function actualizarAvanceProyecto(idProyecto, nuevoAvance) {
    let listaProyectos = obtenerProyectos();
    
    // Recorremos la lista para encontrar el proyecto
    for (let i = 0; i < listaProyectos.length; i++) {
        if (listaProyectos[i].id === idProyecto) {
            // Encontramos el proyecto y actualizamos su valor
            listaProyectos[i].avance = parseInt(nuevoAvance);
            break; // Terminamos el bucle porque ya lo encontramos
        }
    }

    // Guardamos la lista modificada
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(listaProyectos));
}