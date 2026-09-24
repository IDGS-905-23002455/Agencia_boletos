const verificarUsuario = new Promise((resolve, reject) => {

    const usuarioExiste = true;

    setTimeout(() => {

        if (usuarioExiste) {

            resolve("Usuario encontrado");

        } else {

            reject("Usuario no encontrado");

        }

    }, 2000);

});


verificarUsuario
    .then(resultado => {

        console.log(resultado);

    })
    .catch(error => {

        console.log(error);

    });
