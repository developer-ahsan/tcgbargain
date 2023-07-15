import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'tasks',
    templateUrl: './stores.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoresComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
