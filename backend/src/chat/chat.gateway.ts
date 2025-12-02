import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) { }

  async handleConnection(client: Socket) {
    console.log(`⚡ Client connecté : ${client.id}`);

    // Envoyer l'historique des messages au client qui vient de se connecter
    const messages = await this.chatService.findAll();
    client.emit('historiqueMessages', messages);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client déconnecté : ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log("Message reçu :", data);

    // Sauvegarder le message en base de données
    const savedMessage = await this.chatService.create({
      sender: data.sender,
      text: data.text,
    });

    // On renvoie le message à tout le monde
    this.server.emit('nouveauMessage', savedMessage);
  }
}