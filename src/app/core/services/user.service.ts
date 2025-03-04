import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CreateUserDto } from '../../shared/dto/user/create-user.dto';
import { LoginUserDto } from '../../shared/dto/user/login-user.dto';
import { User } from '../models/user';
import { AuthMessage } from '../../shared/interfaces/auth-message';

declare const API_URL: string;

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = API_URL + '/user';

  private userDataSource = new BehaviorSubject<User | null>(null);

  public getCurrentData(): User | null {
    return this.userDataSource.value;
  }

  public updateData(data: User | null) {
    this.userDataSource.next(data);
  }

  public create(createUserDto: CreateUserDto) {
    return this.http.post<AuthMessage>(this.apiUrl, createUserDto);
  }

  public login(loginUserDto: LoginUserDto) {
    return this.http.post<AuthMessage>(this.apiUrl + '/login', loginUserDto);
  }

  public decodeToken(token: string) {
    return this.http.get<User>(this.apiUrl + '/decodeToken/' + token);
  }
}
