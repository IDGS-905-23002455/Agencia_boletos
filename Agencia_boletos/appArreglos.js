const productos = [
{
    id:1,
    nombre:"Perfume",
    precio: 850
},
{
    id:2,
    nombre:"Crema",
    precio: 250
},
{
    id:3,
    nombre:"Labial",
    precio: 180
},
{
    id:4,
    nombre:"Shampoo",
    precio: 320
}
];

productos.forEach(producto => {
    console.log(producto.nombre);
});

const nombres = productos.map(producto => producto.nombre);

console.log(nombres);

const economicos = productos.filter(producto => producto.precio < 300);

console.log(economicos);

const encontrado = productos.find(producto => producto.nombre === "Crema");

console.log(encontrado)

const existe = productos.some(producto => producto.precio > 800);

console.log(existe);

const total = productos.reduce((acumulador, producto) => acumulador + producto.precio);

console.log(`Total: $${total}`)