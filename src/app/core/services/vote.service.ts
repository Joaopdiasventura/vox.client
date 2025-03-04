import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateVoteDto } from '../../shared/dto/vote/create-vote.dto';
import { Message } from '../../shared/interfaces/message';

declare const API_URL: string;

@Injectable({
  providedIn: 'root',
})
export class VoteService {
  private apiUrl = API_URL + '/vote';
  private http = inject(HttpClient);

  public create(createVoteDto: CreateVoteDto) {
    const token = localStorage.getItem('token') as string;

    return this.http.post<Message>(`${this.apiUrl}`, createVoteDto, {
      headers: { Authorization: token },
    });
  }
}
