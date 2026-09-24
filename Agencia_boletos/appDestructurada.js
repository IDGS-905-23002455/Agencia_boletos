const alumnos = {
    nombre: "Paola",
    carrera: "DSM",
    cuatrimestre: 10,
    promedio: 9.0
};

const { nombre: nombreAlumno, carrera, cuatrimestre, promedio } = alumnos;

console.log(alumnos.nombre);
console.log(alumnos.carrera);
console.log(`
${nombreAlumno} estudia ${carrera}
Cuatrimestre: ${cuatrimestre}
Promedio: ${promedio}
`);

const datosAlumno = [
    `Nombre: ${nombreAlumno}`,
    `Carrera: ${carrera}`,
    `Cuatrimestre: ${cuatrimestre}`,
    `Promedio: ${promedio}`
];

const perro = {
    nombre: "Rocky",
    raza: "Golden Retriever",
    edad: 3,
    peso: 28.5
};

const { nombre: nombrePerro, raza, edad, peso } = perro;

console.log(perro.nombre);
console.log(perro.raza);
console.log(`
${nombrePerro} es un ${raza}
Edad: ${edad} años
Peso: ${peso} kg
`);

const datosPerro = [
    `Nombre: ${nombrePerro}`,
    `Raza: ${raza}`,
    `Edad: ${edad} años`,
    `Peso: ${peso} kg`
];

const listaAlumno = document.getElementById('datos-alumno');
if (listaAlumno) {
    datosAlumno.forEach((linea) => {
        const li = document.createElement('li');
        li.textContent = linea;
        listaAlumno.appendChild(li);
    });
}

const listaPerro = document.getElementById('datos-perro');
if (listaPerro) {
    datosPerro.forEach((linea) => {
        const li = document.createElement('li');
        li.textContent = linea;
        listaPerro.appendChild(li);
    });
}