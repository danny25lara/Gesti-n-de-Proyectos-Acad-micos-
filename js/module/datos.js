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
// js/modules/datos.js (Agrega al final)

// Actualizar SOLO el texto del informe
export function guardarInformeProyecto(idProyecto, textoInforme) {
    let listaProyectos = obtenerProyectos();
    
    for (let i = 0; i < listaProyectos.length; i++) {
        if (listaProyectos[i].id === parseInt(idProyecto)) { // Importante: parseInt para asegurar coincidencia
            listaProyectos[i].informe = textoInforme;
            break;
        }
    }
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(listaProyectos));
}

// Buscar un proyecto específico (para cargar el texto en el textarea)
export function obtenerProyectoPorId(idProyecto) {
    let lista = obtenerProyectos();
    // find es un método moderno de arrays, más corto que el for
    return lista.find(p => p.id === parseInt(idProyecto)); 
}
//registro y login de usuarios
// Clave para guardar usuarios en el navegador

const CLAVE_USUARIOS = 'sistema_usuarios_db';

// 1. Obtener lista de usuarios
export function obtenerUsuarios() {
    const users = localStorage.getItem(CLAVE_USUARIOS);
    return users ? JSON.parse(users) : [];
}

// 2. Registrar un nuevo usuario
export function registrarUsuario(email, password, esAdmin) {
    let usuarios = obtenerUsuarios();
    
    // Validar que el correo no exista ya
    if (usuarios.some(u => u.email === email)) {
        return { exito: false, msj: "Este correo ya está registrado." };
    }

    // Crear objeto usuario
    const nuevoUsuario = {
        email: email,
        password: password, // En un sistema real, esto iría encriptado
        rol: esAdmin ? 'admin' : 'usuario'
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    return { exito: true, msj: "Registro exitoso." };
}

// 3. Validar Login (Buscar si coincide correo y contraseña)
export function validarLogin(email, password) {
    let usuarios = obtenerUsuarios();
    const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuarioEncontrado) {
        return { exito: true, rol: usuarioEncontrado.rol };
    } else {
        return { exito: false };
    }
}

// 4. Verificar si YA existe un Admin en el sistema
export function existeAdminRegistrado() {
    let usuarios = obtenerUsuarios();
    return usuarios.some(u => u.rol === 'admin');
}

// 5. Exportar toda la base de datos a un archivo JSON
export function descargarRespaldo() {
    // Obtenemos todo lo que hay en localStorage
    const proyectos = localStorage.getItem('sistema_universitario_db') || '[]';
    const usuarios = localStorage.getItem('sistema_usuarios_db') || '[]';
    
    // Creamos un objeto con todo
    const backup = {
        proyectos: JSON.parse(proyectos),
        usuarios: JSON.parse(usuarios),
        fecha: new Date().toLocaleString()
    };

    // Convertimos a texto y creamos un "blob" (archivo virtual)
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "respaldo_proyectos.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// 6. Importar datos desde un archivo JSON
export function cargarRespaldo(contenidoJson) {
    try {
        const datos = JSON.parse(contenidoJson);
        
        // Validamos que sea un archivo de nuestro sistema
        if (datos.proyectos && datos.usuarios) {
            localStorage.setItem('sistema_universitario_db', JSON.stringify(datos.proyectos));
            localStorage.setItem('sistema_usuarios_db', JSON.stringify(datos.usuarios));
            return { exito: true };
        } else {
            return { exito: false, msj: "El archivo no tiene el formato correcto." };
        }
    } catch (e) {
        return { exito: false, msj: "Error al leer el archivo JSON." };
    }
}

// 7. Guardar un archivo en un proyecto
export function subirArchivoAProyecto(idProyecto, nombreArchivo, tipoArchivo, datosBase64) {
    let listaProyectos = obtenerProyectos();
    
    // Buscamos el proyecto
    const index = listaProyectos.findIndex(p => p.id === parseInt(idProyecto));
    if (index !== -1) {
        // Si la propiedad archivos no existe (proyectos viejos), la creamos
        if (!listaProyectos[index].archivos) {
            listaProyectos[index].archivos = [];
        }
        // Creamos el objeto archivo
        const nuevoArchivo = {
            id: Date.now(),
            nombre: nombreArchivo,
            tipo: tipoArchivo,
            datos: datosBase64, // El contenido del archivo en texto
            fecha: new Date().toLocaleDateString()
        };
        listaProyectos[index].archivos.push(nuevoArchivo);
        localStorage.setItem('sistema_universitario_db', JSON.stringify(listaProyectos));
        return true;
    }
    return false;
}
// Eliminar archivo (Solo admin podrá hacerlo)
export function eliminarArchivoDeProyecto(idProyecto, idArchivo) {
    let listaProyectos = obtenerProyectos();
    const index = listaProyectos.findIndex(p => p.id === parseInt(idProyecto));
    if (index !== -1 && listaProyectos[index].archivos) {
        listaProyectos[index].archivos = listaProyectos[index].archivos.filter(a => a.id !== idArchivo);
        localStorage.setItem('sistema_universitario_db', JSON.stringify(listaProyectos));
    }
}
