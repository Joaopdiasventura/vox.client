import { Component, inject, PLATFORM_ID } from '@angular/core';
import { AccessInputComponent } from '../../../shared/components/inputs/access-input/access-input.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../shared/components/modals/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { Router } from '@angular/router';
import { CreateGroupDto } from '../../../shared/dto/group/create-group.dto';
import { User } from '../../../shared/models/user';
import { isPlatformServer } from '@angular/common';
import { GroupService } from '../../../shared/services/group.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Group } from '../../../shared/models/group';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-add-group',
  imports: [
    LoadingComponent,
    ModalComponent,
    AccessInputComponent,
    HeaderComponent,
    ButtonComponent,
    FormsModule,
  ],
  templateUrl: './add-group.component.html',
  styleUrl: './add-group.component.scss',
})
export class AddGroupComponent {
  public isLoading: boolean = true;
  public currentUser: User | null = null;
  public currentGroups: Group[] = [];

  public createGroupDto: CreateGroupDto = {
    name: '',
    user: '',
  };

  public modalConfig = {
    isVisible: false,
    title: '',
    children: '',
    onClose: () => {},
  };

  private userObservable = new BehaviorSubject<User | null>(null);

  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  public ngOnInit(): void {
    if (isPlatformServer(this.platformId)) return;
    this.userObservable.subscribe((user) => this.handleUserChange(user));
    const user = this.userService.getCurrentData();
    if (!user) return this.connectUser();
    this.userObservable.next(user);
  }

  public create() {
    if (this.createGroupDto.name.length == 0) {
      document.getElementById('create-name-input')?.focus();
      return;
    }
    if (this.createGroupDto.group == 'null') delete this.createGroupDto.group;
    this.isLoading = true;
    this.groupService.create(this.createGroupDto).subscribe({
      next: (result) => {
        this.modalConfig = {
          isVisible: true,
          title: 'SUCESSO',
          children: result.message,
          onClose: () => {
            this.createGroupDto.name = '';
            this.createGroupDto.group = 'null';
            this.createGroupDto.user = this.currentUser?._id || '';
            this.modalConfig.isVisible = false;
          },
        };
        this.findGroups(this.currentUser?._id || '');
      },
      error: (error) => {
        this.modalConfig = {
          isVisible: true,
          title: 'ERRO',
          children: error.message,
          onClose: () => (this.modalConfig.isVisible = false),
        };
      },
      complete: () => (this.isLoading = false),
    });
  }

  public changeSelect(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    this.createGroupDto.group = selectElement.value;
  }

  private connectUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['access']);
      return;
    }
    this.isLoading = true;
    this.userService.decodeToken(token).subscribe({
      next: (user: User) => {
        this.userObservable.next(user);
        this.userService.updateData(user);
      },
      error: () => this.router.navigate(['access']),
      complete: () => (this.isLoading = false),
    });
  }

  private handleUserChange(user: User | null) {
    this.currentUser = user;
    if (!user) return;
    this.findGroups(user._id);
  }

  private findGroups(user: string) {
    this.isLoading = true;
    this.groupService.findAllWithoutParticipants(user).subscribe({
      next: (result) => (this.currentGroups = result),
      complete: () => (this.isLoading = false),
    });
  }
}
