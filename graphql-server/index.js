import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';

// types and resolvers
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// Kreiraj Express aplikaciju
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Kreiraj HTTP server za rad sa Socket.IO
const httpServer = http.createServer(app);

// Kreiraj Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Omogući pristup sa svih domena
    methods: ['GET', 'POST']
  }
});

// Inicijalizuj Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use('/graphql', expressMiddleware(server));

// Socket.IO event handling
io.on('connection', (socket) => {

  socket.on('join_room', (data) => {
    socket.join(data);
    socket.to(data).emit('user_joined', { message: 'New user has joined' });
  });

  app.post('/gameLogic/sendMessage', (req, res) => {
    const { pl, sq, rm, player } = req.body;
    const data = { pl, sq, rm, player };
    res.json({ message: 'Message sent' });
    socket.broadcast.to(rm).emit('receive_message', data);
  });

  app.post('/gameLogic/sendId', (req, res) => {
    const { rm, id } = req.body;
    const data = { rm, id };
    res.json({ message: 'ID sent' });
    socket.to(rm).emit('receive_id', data);
  });

  app.post('/gameLogic/newGameCreated', (req, res) => {
    const { rm } = req.body;
    const data = { rm };
    res.json({ message: 'New Game Created sent' });
    socket.to(rm).emit('receive_newgame_created', data);
  });

  app.post('/gameLogic/canPlay', (req, res) => {
    const { rm } = req.body;
    const data = { rm };
    res.json({ message: 'Can Play sent' });
    socket.to(rm).emit('receive_canplay', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Pokreni HTTP server
const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql`);
});
