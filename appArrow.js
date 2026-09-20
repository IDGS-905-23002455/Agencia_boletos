const sumar = (a, b) => a + b;
const restar = (a, b) => a - b;
const multiplicar = (a, b) => a * b;
const dividir = (a, b) => a / b;

const calcularIVA = (precio) => {
    return precio * 0.16;
};
const precio = 1000;

const calcularTotal = (precio) => {
    return precio + calcularIVA(precio);
};

const modulo = (a, b) => a % b;
const porcentaje = (valor, pct) => (valor * pct) / 100;
const mitad = (n) => n / 2;

const resultados = [
    `sumar = ${sumar(10, 5)}`,
    `restar = ${restar(10, 5)}`,
    `multiplicar = ${multiplicar(10, 5)}`,
    `dividir = ${dividir(10, 5)}`,
    `IVA = $${calcularIVA(precio)}`,
    `Total = $${calcularTotal(precio)}`,
    `modulo = ${modulo(10, 3)}`,
    `porcentaje = ${porcentaje(850, 20)}`,
    `mitad = ${mitad(100)}`
];

resultados.forEach((linea) => {
    console.log(linea);
});

const lista = document.getElementById('resultados');
if (lista) {
    resultados.forEach((linea) => {
        const li = document.createElement('li');
        li.textContent = linea;
        lista.appendChild(li);
    });
}