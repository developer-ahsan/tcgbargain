import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ProductsService } from '../../categories.service';

@Component({
    selector: 'product-information-list',
    templateUrl: './information.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class CategoryInfoListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    categoryForm: FormGroup;
    isEditLoader: boolean = false;
    slectedStore: any;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _toastr: ToastrService,
        private _productService: ProductsService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.initForm();
        this.getSelectedStore();
    }
    initForm() {
        this.categoryForm = new FormGroup({
            id: new FormControl('', Validators.required),
            name: new FormControl('', Validators.required),
            slug: new FormControl('', Validators.required),
            category: new FormControl(true),
        });
    }
    getSelectedStore() {
        this._productService.Category$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.slectedStore = res["data"][0];
            this.categoryForm.patchValue(this.slectedStore);
        });
    }
    showToast(msg, title, type) {
        if (type == 'error') {
            this._toastr.error(msg, title);
        } else if (type == 'success') {
            this._toastr.success(msg, title);
        }
    }
    updateProduct() {
        const { id, name, slug, category } = this.categoryForm.getRawValue();

        if (name == '' || slug == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isEditLoader = true;
        let payload = { id, name, slug, category };
        this._productService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Updated', 'success');
            }
            this.isEditLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isEditLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
        })
    }
    /**
 * On destroy
 */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
}
