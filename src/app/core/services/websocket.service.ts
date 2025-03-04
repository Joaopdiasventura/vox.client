import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  public connect(): Socket {
    return io(API_URL);
  }
}
