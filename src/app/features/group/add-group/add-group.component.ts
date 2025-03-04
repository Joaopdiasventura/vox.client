import { Component, inject } from '@angular/core';
import { AccessInputComponent } from '../../../shared/components/inputs/access-input/access-input.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ModalComponent } from '../../../shared/components/modals/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { CreateGroupDto } from '../../../shared/dto/group/create-group.dto';
import { User } from '../../../core/models/user';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Group } from '../../../core/models/group';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GroupService } from '../../../core/services/group.service';
import { UserService } from '../../../core/services/user.service';

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
  public isLoading: boolean = false;
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

  private userService = inject(UserService);
  private groupService = inject(GroupService);

  public ngOnInit(): void {
    const user = this.userService.getCurrentData();
    this.handleUserChange(user);
  }

  public create() {
    if (this.createGroupDto.name.length == 0)
      return document.getElementById('create-name-input')?.focus();

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
