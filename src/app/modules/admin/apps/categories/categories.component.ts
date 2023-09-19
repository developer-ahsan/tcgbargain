import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'categories',
    templateUrl: './categories.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}
