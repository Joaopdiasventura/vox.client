import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateParticipantDto } from '../../shared/dto/participant/create-participant.dto';
import { Message } from '../../shared/interfaces/message';
import { Participant } from '../models/participant';

declare const API_URL: string;

@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private apiUrl = API_URL + '/participant';
  private http = inject(HttpClient);

  public create(createParticipantDto: CreateParticipantDto) {
    const token = localStorage.getItem('token') as string;

    return this.http.post<Message>(this.apiUrl, createParticipantDto, {
      headers: { Authorization: token },
    });
  }

  public findAllByGroup(group: string) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<Participant[]>(
      `${this.apiUrl}/findAllByGroup/${group}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  public findManyByGroup(group: string, page: number) {
    const token = localStorage.getItem('token') as string;
    return this.http.get<Participant[]>(
      `${this.apiUrl}/findManyByGroup/${group}/${page}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  public delete(id: string) {
    const token = localStorage.getItem('token') as string;

    return this.http.delete<Message>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: token,
      },
    });
  }
}
