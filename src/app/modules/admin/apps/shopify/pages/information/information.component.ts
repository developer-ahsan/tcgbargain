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
import { ProductsService } from '../../shopify.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'product-information-list',
    templateUrl: './information.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ShopifyInfoListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    productForm: FormGroup;
    isEditLoader: boolean = false;
    slectedStore: any;
    allVendors = [];
    user: any;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _authService: AuthService,
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
        this._authService.user$.subscribe(res => {
            this.user = res["data"][0];
        })
        this.initForm();
        this.getSelectedStore();
    }
    initForm() {
        this.productForm = new FormGroup({
            id: new FormControl('', Validators.required),
            platform: new FormControl('', Validators.required),
            title: new FormControl('', Validators.required),
            api_key: new FormControl('', Validators.required),
            api_secret: new FormControl('', Validators.required),
            domain: new FormControl('', Validators.required),
            access_token: new FormControl('', Validators.required),
            user_id: new FormControl('', Validators.required)
        });
        this.productForm.patchValue({ user_id: this.user.id });
    }
    getSelectedStore() {
        this._productService.Product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.slectedStore = res["data"][0].details[0];
            this.productForm.patchValue(this.slectedStore);
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
        const { id, platform, title, api_key, api_secret, access_token, domain, user_id } = this.productForm.getRawValue();
        this.isEditLoader = true;
        let payload = { id, platform, title, api_key, api_secret, access_token, domain, user_id };
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
