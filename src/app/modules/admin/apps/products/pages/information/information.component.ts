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
import { ProductsService } from '../../products.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'product-information-list',
    templateUrl: './information.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ProductInfoListComponent implements OnInit, OnDestroy {
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
        this.getAllVendors();
        this.getSelectedStore();
    }
    getAllVendors() {
        this._productService.Vendors$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.allVendors = res["data"];
        });
    }
    initForm() {
        this.productForm = new FormGroup({
            id: new FormControl('', Validators.required),
            name: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            price: new FormControl('', Validators.required),
            product_number: new FormControl('', Validators.required),
            source: new FormControl('', Validators.required),
            url: new FormControl('', Validators.required),
            product_type: new FormControl('', Validators.required),
            affiliate_url: new FormControl(''),
            vendor_id: new FormControl('', Validators.required),
            image_url: new FormControl('', Validators.required),
            slug: new FormControl('', Validators.required),
            is_active: new FormControl(true),
            product: new FormControl(true),
        });
    }
    getSelectedStore() {
        this._productService.Product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.slectedStore = res["data"][0];
            this.productForm.patchValue(this.slectedStore);
            this.productForm.patchValue({ vendor_id: String(this.slectedStore.vendor_id) });
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
        const { id, name, url, description, price, slug, is_active, product_number, product, image_url, vendor_id, source, product_type, affiliate_url } = this.productForm.getRawValue();

        if (name == '' || price == '' || product_number == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isEditLoader = true;
        let payload = { id, name, url, description, price, slug, is_active, product_number, product, image_url, product_type, affiliate_url, vendor_id: Number(vendor_id), source };
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
