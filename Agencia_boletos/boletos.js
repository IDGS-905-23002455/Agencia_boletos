const sumar = (a, b) => a + b;
const restar = (a, b) => a - b;
const multiplicar = (a, b) => a * b;
const dividir = (a, b) => a / b;
const modulo = (a, b) => a % b;
const porcentaje = (valor, pct) => (valor * pct) / 100;
const mitad = (n) => n / 2;
const calcularIVA = (monto) => porcentaje(monto, 16);
const calcularTotalConIVA = (monto) => sumar(monto, calcularIVA(monto));

console.log('--- ARROW FUNCTIONS ---');
console.log('sumar(10,5) =', sumar(10, 5));
console.log('restar(10,5) =', restar(10, 5));
console.log('multiplicar(10,5) =', multiplicar(10, 5));
console.log('dividir(10,5) =', dividir(10, 5));
console.log('modulo(10,3) =', modulo(10, 3));
console.log('porcentaje(850,20) =', porcentaje(850, 20));
console.log('mitad(100) =', mitad(100));

const destinos = [
    { id: 1, lugar: "Cancún", precio: 4500 },
    { id: 2, lugar: "CDMX", precio: 2200 },
    { id: 3, lugar: "Guadalajara", precio: 1800 },
    { id: 4, lugar: "Monterrey", precio: 2600 }
];

console.log('--- DESTINOS DISPONIBLES ---');
console.table(destinos);

let boletos = [];

const mostrarDestinos = () => {
    const contenedor = document.getElementById('destinos');
    contenedor.innerHTML = '';
    destinos.forEach(({ lugar, precio }) => { // destructuración
        const li = document.createElement('li');
        li.textContent = `${lugar} - $${precio}`;
        contenedor.appendChild(li);
    });

    const nombres = destinos.map(({ lugar }) => lugar).join(', '); // map
    document.getElementById('destinos-nombres').textContent = 'Destinos: ' + nombres;

    const economicos = destinos.filter(({ precio }) => precio < 2600); // filter
    document.getElementById('destinos-economicos').textContent =
        'Económicos (menos de $2600): ' + economicos.map(({ lugar }) => lugar).join(', ');

    const tieneCaro = destinos.some(({ precio }) => precio > 4000); // some
    document.getElementById('destinos-caro').textContent =
        '¿Hay algún destino mayor a $4000? ' + (tieneCaro ? 'Sí' : 'No');

    const promedio = dividir( // reduce + arrow
        destinos.reduce((acc, { precio }) => acc + precio, 0),
        destinos.length
    );
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
    console.log('reduce + dividir → Precio promedio: $' + promedio.toFixed(2));
};

const procesarCompra = (compra) =>
    new Promise((resolve) => setTimeout(() => resolve(compra), 1500));

document.getElementById('form-compra').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const destinoId = Number(document.getElementById('destino').value);
    const cantidad = Number(document.getElementById('cantidad').value);

    const { lugar, precio } = destinos.find((d) => d.id === destinoId); // find + destructuración
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = 'Procesando compra...';

    procesarCompra({ nombre, lugar, cantidad, precio })
        .then((compra) => {
            fetch('/api/boletos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(compra)
            })
                .then((res) => res.json())
                .then((boleto) => {
                    boletos.push(boleto); // CREATE
                    mensaje.textContent = `Boleto comprado: ${boleto.nombre} va a ${boleto.lugar} (x${boleto.cantidad})`;
                    console.log('CREATE (BD) → Boleto agregado:', boleto);
                    mostrarBoletos();
                });
        });
});

const mostrarBoletos = () => {
    const contenedor = document.getElementById('lista-boletos');
    contenedor.innerHTML = '';
    boletos.forEach(({ id, nombre, lugar, cantidad, precio }) => { // destructuración
        const fila = document.createElement('div');
        fila.className = 'boleto';
        const totalLinea = multiplicar(precio, cantidad); // arrow
        fila.innerHTML =
            `<div><strong>${nombre}</strong> a ${lugar} x${cantidad} = $${totalLinea}</div> ` +
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

    const subtotal = boletos.reduce((acc, { precio, cantidad }) => acc + precio * cantidad, 0);
    const descuentoTotal = porcentaje(subtotal, 20); // arrow
    const base = restar(subtotal, descuentoTotal); // arrow
    const iva = calcularIVA(base); // arrow
    const total = calcularTotalConIVA(base); // arrow

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('descuento').textContent = '-$' + descuentoTotal.toFixed(2);
    document.getElementById('base').textContent = '$' + base.toFixed(2);
    document.getElementById('iva').textContent = '$' + iva.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
    document.getElementById('mitad').textContent = '$' + mitad(total).toFixed(2);

    console.log('READ (BD) → Boletos:');
    console.table(boletos);
    console.log('reduce → Subtotal: $' + subtotal.toFixed(2));
    console.log('restar → Base: $' + base.toFixed(2));
    console.log('calcularIVA → IVA 16%: $' + iva.toFixed(2));
    console.log('sumar → TOTAL: $' + total.toFixed(2));
};

const editarBoleto = (id) => {
    const nuevaCantidad = Number(prompt('Nueva cantidad:'));
    if (nuevaCantidad > 0) {
        fetch('/api/boletos/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: nuevaCantidad })
        })
            .then((res) => res.json())
            .then((actualizado) => {
                boletos = boletos.map((boleto) =>
                    boleto.id === id ? actualizado : boleto
                );
                console.log('UPDATE (BD) → Boleto #' + id + ' actualizado:', actualizado);
                mostrarBoletos();
            });
    }
};

const borrarBoleto = (id) => {
    fetch('/api/boletos/' + id, { method: 'DELETE' })
        .then(() => {
            boletos = boletos.filter((boleto) => boleto.id !== id);
            console.log('DELETE (BD) → Boleto #' + id + ' eliminado. Quedan: ' + boletos.length);
            mostrarBoletos();
        });
};

// --- TICKET: genera y muestra el recibo con todos los boletos comprados ---
const comprarResumen = () => {
    if (boletos.length === 0) {
        alert('Aún no hay boletos para comprar.');
        return;
    }

    const subtotal = boletos.reduce((acc, { precio, cantidad }) => acc + precio * cantidad, 0);
    const descuentoTotal = porcentaje(subtotal, 20);
    const base = restar(subtotal, descuentoTotal);
    const iva = calcularIVA(base);
    const total = calcularTotalConIVA(base);

    const fecha = new Date().toLocaleString('es-MX');

    let lineas = '';
    boletos.forEach(({ nombre, lugar, cantidad, precio }) => {
        lineas +=
            `<tr><td>${nombre} a ${lugar}</td><td class="amt">x${cantidad}</td><td class="amt">$${multiplicar(precio, cantidad).toFixed(2)}</td></tr>`;
    });

    document.getElementById('ticket-contenido').innerHTML = `
        <div class="recibo">
            <div class="centro">
                <strong>AGENCIA DE BOLETOS</strong><br>
                Ticket de compra<br>
                ${fecha}
            </div>
            <div class="divider"></div>
            <table>
                <tr><td><strong>Boletos: ${boletos.length}</strong></td></tr>
            </table>
            <div class="divider"></div>
            <table>
                ${lineas}
            </table>
            <div class="divider"></div>
            <table>
                <tr><td>Subtotal</td><td class="amt">$${subtotal.toFixed(2)}</td></tr>
                <tr><td>Descuento 20%</td><td class="amt">-$${descuentoTotal.toFixed(2)}</td></tr>
                <tr><td>Base (sin IVA)</td><td class="amt">$${base.toFixed(2)}</td></tr>
                <tr><td>IVA 16%</td><td class="amt">$${iva.toFixed(2)}</td></tr>
                <tr class="grande"><td>TOTAL</td><td class="amt">$${total.toFixed(2)}</td></tr>
            </table>
            <div class="divider"></div>
            <div class="centro">¡Gracias por su compra!</div>
        </div>`;

    document.getElementById('modal-ticket').style.display = 'flex';
    console.log('TICKET RESUMEN → Generado con', boletos.length, 'boletos');
    console.table(boletos);
    console.log('TOTAL: $' + total.toFixed(2));

    document.getElementById('nombre').value = '';
    document.getElementById('cantidad').value = 1;
    document.getElementById('destino').selectedIndex = 0;
    document.getElementById('mensaje').textContent = '';

    boletos = [];
    mostrarBoletos();
    console.log('RESET → Formulario y lista de boletos limpiados');

    fetch('/api/boletos/confirmar', { method: 'POST' })
        .then((res) => res.json())
        .then((d) => console.log('BD → Boletos confirmados como vendidos:', d.actualizados));
};

const cerrarTicket = () => {
    document.getElementById('modal-ticket').style.display = 'none';
};

let segundos = 10;
const contador = document.getElementById('contador');

const intervalo = setInterval(() => {
    segundos--;
    contador.textContent = segundos;

    if (segundos <= 0) {
        console.log('INTERVALO → Tiempo agotado, reiniciando la página...');
        location.reload();
    }
}, 1000);

document.getElementById('bienvenida').textContent = 'Bienvenido';

fetch('/api/boletos')
    .then((res) => res.json())
    .then((datos) => {
        boletos = datos;
        console.log('READ inicial (BD) → Boletos guardados:');
        console.table(boletos);
        mostrarBoletos();
    });

mostrarDestinos();