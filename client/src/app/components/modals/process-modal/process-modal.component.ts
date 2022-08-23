import {ChangeDetectorRef, Component} from '@angular/core';
import {ModalService} from '../../../services/modal.service';

@Component({
    selector: 'app-process-modal',
    templateUrl: './process-modal.component.html',
    styleUrls: ['./process-modal.component.scss'],
})
export class ProcessModalComponent {
    public isVisible = false;

    public style = {
        display: 'grid',
        placeItems: 'center',
    };
    public constructor(public changeDetectorRef: ChangeDetectorRef, public modalService: ModalService) {
        this.modalService.initProcessComponent(this);
    }

    public showModal(): void {
        this.isVisible = true;
        this.changeDetectorRef.detectChanges();
    }

    public handleOk(): void {
        this.isVisible = false;
    }

    public handleHide(): void {
        this.isVisible = false;
    }
}
