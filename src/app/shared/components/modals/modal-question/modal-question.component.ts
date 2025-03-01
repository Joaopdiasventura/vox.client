import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'modal-question',
  imports: [],
  templateUrl: './modal-question.component.html',
  styleUrl: './modal-question.component.scss',
})
export class ModalQuestionComponent {
  @Input() public isVisible: boolean = false;
  @Input() public title: string | null = null;
  @Input() public children: string | null = null;

  @Input() public onConfirm: () => void = () => {};
  @Input() public onDeny: () => void = () => {};

  @HostListener('document:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter') this.onConfirm();
  }
}
