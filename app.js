const producto = "Perfume";
let precio = 850;
let descuento = 20;
let cantidad = 1;

const cantidadDescuento = precio * descuento / 100;
const precioFinal = precio - cantidadDescuento;
const lineaTotal = precioFinal * cantidad;

const subtotal = precio * cantidad;
const base = subtotal - cantidadDescuento;
const iva = base * 0.16;
const total = base + iva;

const money = (value) => '$' + value.toFixed(2);

document.getElementById('fecha').textContent = new Date().toLocaleDateString('es-MX');
document.getElementById('producto').textContent = producto;
document.getElementById('cantidad').textContent = cantidad;
document.getElementById('precio').textContent = money(precio);
document.getElementById('linea-total').textContent = money(lineaTotal);
document.getElementById('subtotal').textContent = money(subtotal);
document.getElementById('descuento').textContent = '-' + money(cantidadDescuento);
document.getElementById('base').textContent = money(base);
document.getElementById('iva').textContent = money(iva);
document.getElementById('total').textContent = money(total);