const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Banco de dados
const db = new sqlite3.Database('./finance.db');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS lancamentos (id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT, valor REAL, descricao TEXT, data TEXT)");
});

// Webhook do Typebot
app.post('/webhook', async (req, res) => {
  const { mensagem } = req.body;

  if (!mensagem) {
    return res.status(400).send("Mensagem inválida");
  }

  const msgLower = mensagem.toLowerCase();
  const agora = new Date().toISOString().split('T')[0];

  if (msgLower.startsWith("receita")) {
    const partes = msgLower.split(" ");
    const valor = parseFloat(partes[1]);
    const descricao = partes.slice(2).join(" ");
    db.run("INSERT INTO lancamentos (tipo, valor, descricao, data) VALUES (?, ?, ?, ?)", ['receita', valor, descricao, agora]);
    return res.json({ resposta: `Receita de R$${valor} registrada.` });
  }

  if (msgLower.startsWith("despesa")) {
    const partes = msgLower.split(" ");
    const valor = parseFloat(partes[1]);
    const descricao = partes.slice(2).join(" ");
    db.run("INSERT INTO lancamentos (tipo, valor, descricao, data) VALUES (?, ?, ?, ?)", ['despesa', valor, descricao, agora]);
    return res.json({ resposta: `Despesa de R$${valor} registrada.` });
  }

  if (msgLower.includes("saldo")) {
    db.all("SELECT tipo, SUM(valor) as total FROM lancamentos GROUP BY tipo", [], (err, rows) => {
      let saldo = 0;
      rows.forEach(row => {
        if (row.tipo === 'receita') saldo += row.total;
        if (row.tipo === 'despesa') saldo -= row.total;
      });
      return res.json({ resposta: `Saldo atual: R$${saldo.toFixed(2)}` });
    });
    return;
  }

  if (msgLower.includes("relatorio")) {
    db.all("SELECT * FROM lancamentos ORDER BY data DESC", [], (err, rows) => {
      let texto = "📊 Relatório de lançamentos:\n";
      rows.forEach(r => {
        texto += `${r.data} - ${r.tipo} R$${r.valor} (${r.descricao})\n`;
      });
      return res.json({ resposta: texto });
    });
    return;
  }

  return res.json({ resposta: "Comandos: receita <valor> <desc>, despesa <valor> <desc>, saldo, relatorio" });
});

app.listen(3000, () => console.log("Bot rodando na porta 3000"));
