import os
from functools import wraps

import mysql.connector
from flask import (
    Flask,
    redirect,
    send_file,
    render_template,
    render_template_string,
    request,
    session,
    flash,
    url_for,
    jsonify,
)
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.secret_key = "clave_secreta_agencia_boletos"

# Configuración de MySQL
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "root",
    "database": "agencia_boletos",
}


def get_db():
    return mysql.connector.connect(**DB_CONFIG)


def init_db():
    # Crea la base de datos si no existe
    conn = mysql.connector.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
    )
    cur = conn.cursor()
    cur.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_CONFIG['database']}`")
    conn.commit()
    cur.close()
    conn.close()

    # Crea las tablas
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(300) NOT NULL,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS boletos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            lugar VARCHAR(100) NOT NULL,
            cantidad INT NOT NULL,
            precio DECIMAL(10, 2) NOT NULL,
            estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        )
    """)
    conn.commit()
    c.close()
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
        return redirect(url_for("boletos"))
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
        c = conn.cursor()
        try:
            c.execute(
                "INSERT INTO usuarios (nombre, email, password) VALUES (%s, %s, %s)",
                (nombre, email, hash_password),
            )
            conn.commit()
            flash("Cuenta creada correctamente. Ya puedes iniciar sesión.", "exito")
            return redirect(url_for("login"))
        except mysql.connector.IntegrityError:
            flash("Ya existe una cuenta con ese correo.", "error")
        finally:
            c.close()
            conn.close()

    return render_template("registro.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        conn = get_db()
        c = conn.cursor(dictionary=True)
        c.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        usuario = c.fetchone()
        c.close()
        conn.close()

        if usuario and check_password_hash(usuario["password"], password):
            session["usuario_id"] = usuario["id"]
            session["nombre"] = usuario["nombre"]
            return redirect(url_for("boletos"))

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


@app.route("/api/boletos")
@login_required
def api_boletos():
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute(
        "SELECT id, nombre, lugar, cantidad, precio FROM boletos "
        "WHERE usuario_id = %s AND estado = 'pendiente' ORDER BY id",
        (session["usuario_id"],),
    )
    filas = c.fetchall()
    c.close()
    conn.close()
    return jsonify(filas)


@app.route("/api/boletos/confirmar", methods=["POST"])
@login_required
def api_boletos_confirmar():
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "UPDATE boletos SET estado = 'vendido' WHERE usuario_id = %s AND estado = 'pendiente'",
        (session["usuario_id"],),
    )
    conn.commit()
    actualizados = c.rowcount
    c.close()
    conn.close()
    return jsonify({"actualizados": actualizados})


@app.route("/api/boletos", methods=["POST"])
@login_required
def api_boletos_crear():
    datos = request.get_json()
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute(
        "INSERT INTO boletos (usuario_id, nombre, lugar, cantidad, precio) VALUES (%s, %s, %s, %s, %s)",
        (session["usuario_id"], datos["nombre"], datos["lugar"], datos["cantidad"], datos["precio"]),
    )
    conn.commit()
    boleto_id = c.lastrowid
    c.execute("SELECT id, nombre, lugar, cantidad, precio FROM boletos WHERE id = %s", (boleto_id,))
    boleto = c.fetchone()
    c.close()
    conn.close()
    return jsonify(boleto)


@app.route("/api/boletos/<int:id>", methods=["PUT"])
@login_required
def api_boletos_actualizar(id):
    datos = request.get_json()
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute(
        "UPDATE boletos SET cantidad = %s WHERE id = %s AND usuario_id = %s",
        (datos["cantidad"], id, session["usuario_id"]),
    )
    conn.commit()
    c.execute("SELECT id, nombre, lugar, cantidad, precio FROM boletos WHERE id = %s", (id,))
    boleto = c.fetchone()
    c.close()
    conn.close()
    return jsonify(boleto)


@app.route("/api/boletos/<int:id>", methods=["DELETE"])
@login_required
def api_boletos_borrar(id):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "DELETE FROM boletos WHERE id = %s AND usuario_id = %s",
        (id, session["usuario_id"]),
    )
    conn.commit()
    c.close()
    conn.close()
    return jsonify({"ok": True})


@app.route("/bd")
@login_required
def ver_bd():
    conn = get_db()
    c = conn.cursor(dictionary=True)
    c.execute("SELECT id, nombre, email, creado_en FROM usuarios ORDER BY id")
    usuarios = c.fetchall()
    c.execute(
        "SELECT b.id, b.nombre, b.lugar, b.cantidad, b.precio, b.estado, b.creado_en, u.email AS usuario_email "
        "FROM boletos b JOIN usuarios u ON u.id = b.usuario_id ORDER BY b.id"
    )
    boletos = c.fetchall()
    c.close()
    conn.close()
    return render_template_string(
        """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Base de datos</title>
    <style>
        body { font-family: Arial; margin: 20px; background:#f4f7fb; }
        h1 { color:#1e3a8a; }
        h2 { color:#1e3a8a; margin-top:24px; }
        table { border-collapse: collapse; background:#fff; width:100%; max-width:900px; }
        th, td { border:1px solid #ccc; padding:8px; text-align:left; }
        th { background:#1e3a8a; color:#fff; }
        tr:nth-child(even) { background:#eef3f8; }
        a { color:#2563eb; }
    </style>
</head>
<body>
    <h1>Base de datos MySQL (agencia_boletos)</h1>
    <p><a href="/boletos">Volver a la agencia</a> | <a href="/logout">Cerrar sesión</a></p>

    <h2>Usuarios ({{ usuarios|length }})</h2>
    <table>
        <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Creado</th></tr>
        {% for u in usuarios %}
        <tr><td>{{ u.id }}</td><td>{{ u.nombre }}</td><td>{{ u.email }}</td><td>{{ u.creado_en }}</td></tr>
        {% endfor %}
    </table>

    <h2>Boletos comprados ({{ boletos|length }})</h2>
    <table>
        <tr><th>ID</th><th>Nombre</th><th>Destino</th><th>Cant.</th><th>Precio</th><th>Estado</th><th>Usuario</th><th>Creado</th></tr>
        {% for b in boletos %}
        <tr><td>{{ b.id }}</td><td>{{ b.nombre }}</td><td>{{ b.lugar }}</td><td>{{ b.cantidad }}</td><td>${{ b.precio }}</td><td>{{ b.estado }}</td><td>{{ b.usuario_email }}</td><td>{{ b.creado_en }}</td></tr>
        {% endfor %}
    </table>
</body>
</html>""",
        usuarios=usuarios,
        boletos=boletos,
    )


@app.route("/<path:archivo>")
@login_required
def archivos(archivo):
    filepath = os.path.join(BASE_DIR, archivo)
    if os.path.isfile(filepath):
        return send_file(filepath)
    return "No encontrado", 404


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)