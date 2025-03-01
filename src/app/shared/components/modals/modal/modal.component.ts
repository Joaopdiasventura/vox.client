import { Component, Input, HostListener } from '@angular/core';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'modal',
  imports: [ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() public isVisible: boolean = false;
  @Input() public title: string | null = null;
  @Input() public children: string | null = null;

  @Input() public onClose: () => void = () => {};

  @HostListener('document:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter') this.onClose();
  }
}
