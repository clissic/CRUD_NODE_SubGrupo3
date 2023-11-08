const express = require("express");
const mariadb = require("mariadb");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "taller19",
  connectionLimit: 5,
});

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT id, name, lastname FROM people");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ msg: "Pasaron cosas... " + error });
  } finally {
    if (conn) conn.release();
  }
});

app.post("/crear", async (req, res) => {
  const { name, lastname } = req.body;

  if (!name || !lastname) {
    return res.status(400).json({
      msg: "Se requieren name y lastname en el cuerpo de la solicitud.",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      "INSERT INTO people (name, lastname) VALUES (?, ?)",
      [name, lastname]
    );
    res.status(201).json({ msg: "Registro creado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Ocurrió un error al crear el registro: " + error });
  } finally {
    if (conn) conn.release();
  }
});

app.put("/actualizar/:id", async (req, res) => {
  const { name, lastname } = req.body;
  const id = req.params.id;

  if (!name || !lastname || !id) {
    return res.status(400).json({
      msg: "Se requieren name, lastname y un ID válido en la solicitud.",
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      "UPDATE people SET name = ?, lastname = ? WHERE id = ?",
      [name, lastname, id]
    );
    res.json({ msg: "Registro actualizado exitosamente" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Ocurrió un error al actualizar el registro: " + error });
  } finally {
    if (conn) conn.release();
  }
});

app.delete("/eliminar/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res
      .status(400)
      .json({ msg: "Se requiere un ID válido en la solicitud." });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query("DELETE FROM people WHERE id = ?", [id]);
    res.json({ msg: `Registro ID: ${id} eliminado exitosamente` });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Ocurrió un error al eliminar el registro: " + error });
  } finally {
    if (conn) conn.release();
  }
});
