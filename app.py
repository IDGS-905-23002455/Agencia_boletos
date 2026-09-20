import os

from flask import Flask, redirect, send_file

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


@app.route("/")
def inicio():
    return redirect("/ticket")


@app.route("/ticket")
def ticket():
    return send_file(os.path.join(BASE_DIR, "ticket.html"))


@app.route("/arrow")
def arrow():
    return send_file(os.path.join(BASE_DIR, "appArrowFuction.html"))


@app.route("/destructurada")
def destructurada():
    return send_file(os.path.join(BASE_DIR, "objectDestruction.html"))

@app.route("/arreglos")
def arreglos():
    return send_file(os.path.join(BASE_DIR, "appArreglos.html"))

@app.route("/intervalo")
def intervalo():
    return send_file(os.path.join(BASE_DIR, "appInterval.html"))

@app.route("/promesa")
def promesa():
    return send_file(os.path.join(BASE_DIR, "appPrometida.html"))


@app.route("/boletos")
def boletos():
    return send_file(os.path.join(BASE_DIR, "boletos.html"))


@app.route("/<path:archivo>")
def archivos(archivo):
    filepath = os.path.join(BASE_DIR, archivo)
    if os.path.isfile(filepath):
        return send_file(filepath)
    return "No encontrado", 404


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)