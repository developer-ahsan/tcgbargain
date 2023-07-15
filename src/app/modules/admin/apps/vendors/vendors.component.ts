import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'vendors',
    templateUrl: './vendors.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VendorsComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
