const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

const app = express();
app.use(express.json());

// Crear tabla al arrancar
pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT false
    )
`).then(() => console.log('Tabla tasks lista'))
  .catch(err => console.error('Error creando tabla:', err.message));

// Listar tareas
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Crear tarea
app.post('/tasks', async (req, res) => {
    const { title } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
            [title]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Marcar como completada
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE tasks SET completed = true WHERE id = $1 RETURNING *',
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Eliminar tarea
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ status: 'deleted' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(3000, () => {
    console.log('App corriendo en puerto 3000');
});