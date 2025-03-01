import { Component, inject } from '@angular/core';
import { AccessInputComponent } from '../../../shared/components/inputs/access-input/access-input.component';
import { CreateUserDto } from '../../../shared/dto/user/create-user.dto';
import { LoginUserDto } from '../../../shared/dto/user/login-user.dto';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../shared/components/modals/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-access',
  imports: [
    LoadingComponent,
    ModalComponent,
    AccessInputComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './access.component.html',
  styleUrl: './access.component.scss',
})
export class AccessComponent {
  public isInLogin: boolean = true;
  public isLoading: boolean = false;

  public loginUserDto: LoginUserDto = {
    email: '',
    password: '',
  };

  public createUserDto: CreateUserDto = {
    email: '',
    name: '',
    password: '',
  };

  public modalConfig = {
    isVisible: false,
    title: '',
    children: '',
    onClose: () => {},
  };

  private userService = inject(UserService);
  private router = inject(Router);

  public changeMethod() {
    this.isInLogin = !this.isInLogin;
  }

  public login() {
    if (this.loginUserDto.email.length == 0) {
      document.getElementById('login-email-input')?.focus();
      return;
    } else if (this.loginUserDto.password.length == 0) {
      document.getElementById('login-password-input')?.focus();
      return;
    }
    this.isLoading = true;
    this.userService.login(this.loginUserDto).subscribe({
      next: (result) => {
        this.modalConfig = {
          isVisible: true,
          title: 'LOGIN REALIZADO COM SUCESSO',
          children: result.message,
          onClose: () => {
            this.router.navigate(['../']);
          },
        };
        localStorage.setItem('token', result.token);
        this.userService.updateData(result.user);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.modalConfig = {
          isVisible: true,
          title: 'ERRO AO REALIZAR O LOGIN',
          children:
            typeof error.error.message == 'string'
              ? error.error.message
              : error.error.message[0],
          onClose: () => {
            this.modalConfig = { ...this.modalConfig, isVisible: false };
          },
        };
        this.isLoading = false;
      },
    });
  }

  public create() {
    if (this.createUserDto.email.length == 0) {
      document.getElementById('create-email-input')?.focus();
      return;
    } else if (this.createUserDto.name.length == 0) {
      document.getElementById('create-name-input')?.focus();
      return;
    } else if (this.createUserDto.password.length == 0) {
      document.getElementById('create-password-input')?.focus();
      return;
    }
    this.isLoading = true;
    this.userService.create(this.createUserDto).subscribe({
      next: (result) => {
        this.modalConfig = {
          isVisible: true,
          title: 'USUÁRIO CRIADO COM SUCESSO',
          children: result.message,
          onClose: () => {
            this.router.navigate(['../']);
          },
        };
        localStorage.setItem('token', result.token);
        this.userService.updateData(result.user);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.modalConfig = {
          isVisible: true,
          title: 'ERRO AO CRIAR O USUÁRIO',
          children:
            typeof error.error.message == 'string'
              ? error.error.message
              : error.error.message[0],
          onClose: () => {
            this.modalConfig = { ...this.modalConfig, isVisible: false };
          },
        };
        this.isLoading = false;
      },
    });
  }
}
