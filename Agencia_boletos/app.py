import os
import sqlite3
from functools import wraps

from flask import Flask, redirect, send_file, render_template, request, session, flash, url_for
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.secret_key = "clave_secreta_agencia_boletos"
DB_PATH = os.path.join(BASE_DIR, "usuarios.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


init_db()


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if "usuario_id" not in session:
            return redirect(url_for("login"))
        return func(*args, **kwargs)
    return wrapper


@app.route("/")
def inicio():
    if "usuario_id" in session:
        return redirect(url_for("ticket"))
    return redirect(url_for("login"))


@app.route("/registro", methods=["GET", "POST"])
def registro():
    if request.method == "POST":
        nombre = request.form.get("nombre", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirmar = request.form.get("confirmar", "")

        if not nombre or not email or not password:
            flash("Todos los campos son obligatorios.", "error")
            return render_template("registro.html")

        if password != confirmar:
            flash("Las contraseñas no coinciden.", "error")
            return render_template("registro.html")

        hash_password = generate_password_hash(password)

        conn = get_db()
        try:
            conn.execute(
                "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
                (nombre, email, hash_password),
            )
            conn.commit()
            flash("Cuenta creada correctamente. Ya puedes iniciar sesión.", "exito")
            return redirect(url_for("login"))
        except sqlite3.IntegrityError:
            flash("Ya existe una cuenta con ese correo.", "error")
        finally:
            conn.close()

    return render_template("registro.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        conn = get_db()
        usuario = conn.execute(
            "SELECT * FROM usuarios WHERE email = ?", (email,)
        ).fetchone()
        conn.close()

        if usuario and check_password_hash(usuario["password"], password):
            session["usuario_id"] = usuario["id"]
            session["nombre"] = usuario["nombre"]
            return redirect(url_for("ticket"))

        flash("Correo o contraseña incorrectos.", "error")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("Sesión cerrada correctamente.", "exito")
    return redirect(url_for("login"))


@app.route("/ticket")
@login_required
def ticket():
    return send_file(os.path.join(BASE_DIR, "ticket.html"))


@app.route("/arrow")
@login_required
def arrow():
    return send_file(os.path.join(BASE_DIR, "appArrowFuction.html"))


@app.route("/destructurada")
@login_required
def destructurada():
    return send_file(os.path.join(BASE_DIR, "objectDestruction.html"))


@app.route("/arreglos")
@login_required
def arreglos():
    return send_file(os.path.join(BASE_DIR, "appArreglos.html"))


@app.route("/intervalo")
@login_required
def intervalo():
    return send_file(os.path.join(BASE_DIR, "appInterval.html"))


@app.route("/promesa")
@login_required
def promesa():
    return send_file(os.path.join(BASE_DIR, "appPrometida.html"))


@app.route("/boletos")
@login_required
def boletos():
    return send_file(os.path.join(BASE_DIR, "boletos.html"))


@app.route("/<path:archivo>")
@login_required
def archivos(archivo):
    filepath = os.path.join(BASE_DIR, archivo)
    if os.path.isfile(filepath):
        return send_file(filepath)
    return "No encontrado", 404


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)