// index.js

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser')

require('dotenv').config();

const app = express();

app.use(bodyParser.json());
const port = process.env.PORT || 9999;

// Configurações do banco de dados
const pool = new Pool({
  user: process.env.USERDB,
  host: process.env.HOSTDB,
  database: process.env.DB,
  password: process.env.PASSWORDDB,
  port: 5432, // Porta padrão do PostgreSQL

});

// Rota para buscar dados do banco
app.get('/clientes/:id/extrato', async (req, res) => {
  try {
    const client = await pool.query(`select * from clientes where id=$1`, [req.params.id]);
    if (client.rowCount === 0) return res.status(404);
    const saldo = await pool.query(`select * from saldos where cliente_id=$1`, [req.params.id]);
    const trans = await pool.query(`select * from transacoes where cliente_id=$1 order by  realizada_em desc limit 10`, [req.params.id]);
    const transacoes = trans.rows.map(item => ({
      valor: item.valor,
      tipo: item.tipo,
      descricao: item.descricao,
      realizada_em: item.realizada_em
    }))
    const result = {
      saldo: {
        data_extrato: new Date(),
        limite: client.rows[0].limite,
        total: saldo.rows[0].valor
      },
      ultimas_transacoes: [...transacoes]

    }

    res.status(200).json(result)
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500);
  }
});

app.post('/clientes/:id/transacoes', async (req, res) => {
  try {
    await poll.query('BEGIN');
    const client = await pool.query(`select a.limite, b.valor from clientes c inner join saldos b on a.id = b.cliente_id where a.id=$1 for update`, [req.params.id]);
    if (client.rowCount === 0) {
      await poll.query('END');
      return res.status(404);
    }
    if (req.body.params.tipo === "d"
      && Math.abs(client.rows[0].limite) < (req.body.params.valor * 1)) {
      await poll.query('END');
      return res.status(422);
    }

    const valor = req.body.params.tipo === "d" ? req.body.params.valor * -1 : req.body.params.valor * 1;
    await pool.query('UPDATE saldos VALUES saldo = saldo + $2 where cliente_id = $1', [req.params.id, valor])
    const novoSaldo = await pool.query('INSERT INTO transacoes(cliente_id, valor, tipo, descricao) values ($1, $2, $3, $4)',
      [req.params.id, req.body.params.valor * 1, req.body.params.tipo, req.body.params.descricao]);
    await poll.query('COMMIT');
    await poll.query('END');
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500);
  }

})

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
