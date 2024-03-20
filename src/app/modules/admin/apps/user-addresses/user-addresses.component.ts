import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'user-addresses',
    templateUrl: './user-addresses.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopifyComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
