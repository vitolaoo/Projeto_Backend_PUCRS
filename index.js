const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const { Client, Application, Subscription } = require('./models');
const ServicoCadastramento = require('./api/cadastro/servicocadastro');
const ServicoPagamentos = require('./api/pagamentos/servicopgtos');
const ServicoAssinaturasValidas = require('./api/assinaturas/servicoassinaturas');
const { publishEvent, subscribeToEvents } = require('./services/eventbroker');

const app = express();
app.use(cors());

// Connect to the database
sequelize.authenticate().then(() => {
  console.log('Connected to the database');
}).catch((err) => {
  console.error('Failed to connect to the database:', err);
  process.exit(1);
});

// Synchronize models with the database
sequelize.sync().then(() => {
  console.log('Database synchronized');
});

// Initialize microservices
const servicoCadastramento = new ServicoCadastramento(Client, Application, Subscription);
const servicoPagamentos = new ServicoPagamentos(Subscription, publishEvent);
const servicoAssinaturasValidas = new ServicoAssinaturasValidas(Subscription, Payment);

// Register microservices routes
app.use('/api/cadastro', servicoCadastramento.router);
app.use('/api/pagamentos', servicoPagamentos.router);
app.use('/api/assinaturas', servicoAssinaturasValidas.router);

// Start the application
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Subscribe to events
subscribeToEvents((event) => {
  console.log('Received event:', event);
  // Process events here
});
