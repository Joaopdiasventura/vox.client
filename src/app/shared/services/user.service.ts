import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { User } from '../models/user';
import { LoginUserDto } from '../dto/user/login-user.dto';
import { BehaviorSubject } from 'rxjs';

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
    return this.http.post<{ user: User; message: string; token: string }>(
      this.apiUrl,
      createUserDto
    );
  }

  public login(loginUserDto: LoginUserDto) {
    return this.http.post<{ user: User; message: string; token: string }>(
      this.apiUrl + '/login',
      loginUserDto
    );
  }

  public decodeToken(token: string) {
    return this.http.get<User>(this.apiUrl + '/decodeToken/' + token);
  }
}
