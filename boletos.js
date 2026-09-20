const destinos = [
    { id: 1, lugar: "Cancún", precio: 4500 },
    { id: 2, lugar: "CDMX", precio: 2200 },
    { id: 3, lugar: "Guadalajara", precio: 1800 },
    { id: 4, lugar: "Monterrey", precio: 2600 }
];

console.log('--- DESTINOS DISPONIBLES ---');
console.table(destinos);

let boletos = [];
let cuenta = 1;


const mostrarDestinos = () => {
    const contenedor = document.getElementById('destinos');
    contenedor.innerHTML = '';
    destinos.forEach(({ lugar, precio }) => {
        const li = document.createElement('li');
        li.textContent = `${lugar} - $${precio}`;
        contenedor.appendChild(li);
    });

    const nombres = destinos.map(({ lugar }) => lugar).join(', ');
    document.getElementById('destinos-nombres').textContent = 'Destinos: ' + nombres;

    const economicos = destinos.filter(({ precio }) => precio < 2600);
    document.getElementById('destinos-economicos').textContent =
        'Económicos (menos de $2600): ' + economicos.map(({ lugar }) => lugar).join(', ');

    const tieneCaro = destinos.some(({ precio }) => precio > 4000);
    document.getElementById('destinos-caro').textContent =
        '¿Hay algún destino mayor a $4000? ' + (tieneCaro ? 'Sí' : 'No');

    const promedio = destinos.reduce((acc, { precio }) => acc + precio, 0) / destinos.length;
    document.getElementById('destinos-promedio').textContent =
        'Precio promedio: $' + promedio.toFixed(2);

    const select = document.getElementById('destino');
    select.innerHTML = '';
    destinos.forEach(({ id, lugar }) => {
        const opcion = document.createElement('option');
        opcion.value = id;
        opcion.textContent = lugar;
        select.appendChild(opcion);
    });

    console.log('map → Destinos:', nombres);
    console.log('filter → Económicos:', economicos);
    console.log('some → ¿Hay uno mayor a $4000?', tieneCaro);
    console.log('reduce → Precio promedio: $' + promedio.toFixed(2));
};

const procesarCompra = (compra) =>
    new Promise((resolve) => setTimeout(() => resolve(compra), 1500));

document.getElementById('form-compra').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const destinoId = Number(document.getElementById('destino').value);
    const cantidad = Number(document.getElementById('cantidad').value);

    const { lugar, precio } = destinos.find((d) => d.id === destinoId);
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = 'Procesando compra...';

    procesarCompra({ id: cuenta++, nombre, lugar, cantidad, precio })
        .then((boleto) => {
            boletos.push(boleto); // CREATE
            mensaje.textContent = `Boleto comprado: ${boleto.nombre} va a ${boleto.lugar} (x${boleto.cantidad})`;
            console.log('CREATE → Boleto creado:', boleto);
            mostrarBoletos();
        });
});

const mostrarBoletos = () => {
    const contenedor = document.getElementById('lista-boletos');
    contenedor.innerHTML = '';
    boletos.forEach(({ id, nombre, lugar, cantidad, precio }) => {
        const fila = document.createElement('div');
        fila.className = 'boleto';
        fila.innerHTML =
            `<div><strong>${nombre}</strong> a ${lugar} x${cantidad} = $${precio * cantidad}</div> ` +
            `<div>` +
            `<button class="btn btn-editar" onclick="editarBoleto(${id})">Editar</button> ` +
            `<button class="btn btn-borrar" onclick="borrarBoleto(${id})">Borrar</button>` +
            `</div>`;
        contenedor.appendChild(fila);
    });

    if (boletos.length === 0) {
        const vacio = document.createElement('div');
        vacio.className = 'vacio';
        vacio.textContent = 'Aún no hay boletos comprados.';
        contenedor.appendChild(vacio);
    }

    const total = boletos.reduce((acc, { precio, cantidad }) => acc + precio * cantidad, 0);
    document.getElementById('total-boletos').textContent = 'Total de la compra: $' + total;

    console.log('READ → Boletos comprados:');
    console.table(boletos);
    console.log('reduce → Total de la compra: $' + total);
};

const editarBoleto = (id) => { 
    const nuevaCantidad = Number(prompt('Nueva cantidad:'));
    if (nuevaCantidad > 0) {
        boletos = boletos.map((boleto) =>
            boleto.id === id ? { ...boleto, cantidad: nuevaCantidad } : boleto
        );
        const actualizado = boletos.find((boleto) => boleto.id === id);
        console.log('UPDATE → Boleto #' + id + ' actualizado:', actualizado);
        mostrarBoletos();
    }
};

const borrarBoleto = (id) => { // DELETE
    boletos = boletos.filter((boleto) => boleto.id !== id);
    console.log('DELETE → Boleto #' + id + ' eliminado. Quedan: ' + boletos.length);
    mostrarBoletos();
};


let segundos = 10;
const contador = document.getElementById('contador');

const intervalo = setInterval(() => {
    segundos--;
    contador.textContent = segundos;

    if (segundos <= 0) {
        segundos = 10;
        const { lugar, precio } = destinos[Math.floor(Math.random() * destinos.length)];
        boletos.push({ id: cuenta++, nombre: 'Cliente automático', lugar, cantidad: 1, precio });
        document.getElementById('mensaje').textContent = `Venta automática: ${lugar} por $${precio}`;
        console.log('INTERVALO → Venta automática:', lugar, '$' + precio);
        mostrarBoletos();
    }
}, 1000);

mostrarDestinos();
mostrarBoletos();