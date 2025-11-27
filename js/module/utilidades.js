// Función para calcular si el proyecto está a tiempo o retrasado
export function calcularEstadoProyecto(fechaLimite, porcentaje) {
    let fechaActual = new Date();
    let fechaEntrega = new Date(fechaLimite);
    let avance = parseInt(porcentaje);

    // Lógica condicional (IF - ELSE)
    if (avance === 100) {
        return { texto: "Completado", clase: "estado-ok" };
    } 
    
    if (fechaActual > fechaEntrega) {
        return { texto: "Retrasado", clase: "estado-retraso" };
    } else {
        return { texto: "En Proceso", clase: "estado-pendiente" };
    }
}

// Función para mostrar mensajes en pantalla
export function mostrarAlerta(mensaje, esError) {
    let contenedor = document.getElementById('contenedorAlertas');
    
    // Limpiamos alertas anteriores
    contenedor.innerHTML = '';

    let div = document.createElement('div');
    div.textContent = mensaje;
    
    // Asignar clase según el tipo de mensaje
    if (esError) {
        div.className = 'alerta alerta-error';
    } else {
        div.className = 'alerta alerta-exito';
    }

    contenedor.appendChild(div);

    // Eliminar el mensaje después de 3 segundos (3000 ms)
    setTimeout(function() {
        div.remove();
    }, 3000);
}