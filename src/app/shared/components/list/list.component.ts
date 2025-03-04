import { Component, Input } from '@angular/core';
import { Group } from '../../../core/models/group';
import { Observable } from 'rxjs';
import { Participant } from '../../../core/models/participant';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ModalQuestionComponent } from '../modals/modal-question/modal-question.component';

@Component({
  selector: 'app-list',
  imports: [CommonModule, ModalQuestionComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  animations: [
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '0.5s ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '0.5s ease-in',
          style({ transform: 'translateX(-100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class ListComponent {
  @Input() public type!: string;

  @Input() public allElements: (Group | Participant)[][] = [];

  @Input() public findNext!: (
    page: number
  ) => Observable<(Group | Participant)[]>;

  @Input() public navigate!: (path: string) => void;

  @Input() public delete!: (id: string) => void;

  public currentPage: number = 0;

  public currentElement: Group | Participant | null = null;

  public modalConfig = {
    isVisible: false,
    title: 'AVISO',
    children: 'teste',
    onConfirm: () => this.deleteElement,
    onDeny: () => {
      this.modalConfig.isVisible = false;
      this.currentElement = null;
    },
  };

  public slidingDirection: 'left' | 'right' | '' = '';

  public useNext() {
    if (this.allElements[this.currentPage + 1].length == 0) return;
    this.slidingDirection = 'left';
    this.currentPage += 1;
    if (
      !this.allElements[this.currentPage + 1] ||
      this.allElements[this.currentPage + 1].length == 0
    )
      return;

    const nextPage = this.currentPage + 1;
    this.findNext(nextPage).subscribe({
      next: (result) => (this.allElements[nextPage] = result),
    });
  }

  public usePrev() {
    if (this.currentPage > 0) {
      this.slidingDirection = 'right';
      this.currentPage -= 1;
    }
  }

  public navigateToElement(path: string) {
    this.modalConfig.isVisible = false;
    this.currentPage = 0;
    this.navigate(path);
  }

  public deleteElement() {
    this.allElements[this.currentPage] = this.allElements[
      this.currentPage
    ].filter((e) => e._id != this.currentElement?._id);
    if (
      this.allElements[this.currentPage + 1] &&
      this.allElements[this.currentPage + 1].length > 0
    ) {
      this.allElements[this.currentPage].push(
        this.allElements[this.currentPage + 1][0]
      );
      this.allElements[this.currentPage + 1].shift();
    }
    if (
      this.allElements[this.currentPage].length == 0 &&
      this.currentPage > 0
    ) {
      this.currentPage -= 1;
    }
    this.delete(this.currentElement?._id as string);
    this.currentElement = null;
    this.modalConfig.isVisible = false;
  }

  public openModal(element: Group | Participant) {
    this.currentElement = element;

    this.modalConfig.children = `Deseja deletar o ${this.type} de nome '${element.name}'`;

    this.modalConfig.isVisible = true;
  }

  public animationDone() {
    this.slidingDirection = '';
  }
}
