# WhatsApp Finance Typebot Texto

Bot de controle financeiro via WhatsApp usando Typebot.

## Comandos
- receita <valor> <descricao>
- despesa <valor> <descricao>
- saldo
- relatorio

## Como rodar localmente
```
npm install
node server.js
```

## Como rodar no Docker
```
docker build -t whatsapp-finance-typebot-texto .
docker run -p 3000:3000 whatsapp-finance-typebot-texto
```
