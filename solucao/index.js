// index.js

const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
//var morgan = require('morgan')

require('dotenv').config();

const app = express();
//app.use(morgan("combined"));

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

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500);
  }
});

const validateRequest = (req) => {
  const valor = parseInt(req.body.valor);
  const descricao = req.body.descricao; 
  if(valor === undefined || valor < 0 || descricao === undefined || descricao === null || descricao.length > 10  ) return false;
  
  return true;

}

app.post('/clientes/:id/transacoes', async (req, res) => {
  if(!validateRequest(req)){
    return res.send(422).json();
  }
  try {
    await pool.query('BEGIN');
    const client = await pool.query(`select c.limite, b.valor from clientes c inner join saldos b on c.id = b.cliente_id where c.id=$1 for update`, [req.params.id]);
    if (client.rowCount === 0) {
      await pool.query('ROLLBACK').json();
      return res.status(404);
    }
    if (req.body.tipo === "d"
      && Math.abs(client.rows[0].valor) < (req.body.valor * 1)) {
      await pool.query('ROLLBACK');
      return res.status(422).json();
    }

    const valor = req.body.tipo === "d" ? req.body.valor * -1 : req.body.valor * 1;
    const novoSaldo = await pool.query('UPDATE saldos SET valor = valor + $2 where cliente_id = $1 RETURNING valor', [req.params.id, valor])
    await pool.query('INSERT INTO transacoes(cliente_id, valor, tipo, descricao) values ($1, $2, $3, $4)',
      [req.params.id, req.body.valor * 1, req.body.tipo, req.body.descricao]);
    await pool.query('COMMIT');
    return res.status(200).json({ limite: client.rows[0].limite, saldo: novoSaldo.rows[0].valor })
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erro ao buscar dados:', error);
    return res.status(500).json();
  }

})

// Inicie o servidor
app.listen(port, async () => {

  console.log(`Servidor rodando na porta ${port}`);
});
