import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'shopify',
    templateUrl: './shopify.component.html',
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
