let tiempo = 10;

const intervalo = setInterval(() => {

    console.log(tiempo);

    tiempo--;

    if (tiempo <= 0) {

        clearInterval(intervalo);

        console.log("Tiempo terminado");

    }

}, 1000);
