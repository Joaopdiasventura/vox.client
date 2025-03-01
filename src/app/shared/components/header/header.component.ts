import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  public isMenuOpen: boolean = false;

  private userService = inject(UserService);
  private router = inject(Router);

  public navigate(path: string[]) {
    this.router.navigate(path);
  }

  public logOut() {
    localStorage.removeItem('token');
    this.userService.updateData(null);
    this.router.navigate(['access']);
  }

  public viewGroupDetails(id: string) {
    const token = localStorage.getItem('token');
    this.router.navigate(['group', id, token]);
  }

  public toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
