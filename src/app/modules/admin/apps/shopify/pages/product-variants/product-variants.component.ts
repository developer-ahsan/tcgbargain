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

@Component({
    selector: 'product-variants-list',
    templateUrl: './product-variants.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ProductVariantsComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['id', 'color', 'price_adjustment', 'stock', 'size', 'created_at', 'action'];
    totalUsers: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Product Variants';
    userForm: FormGroup;
    isAddLoader: boolean = false;
    editUserForm: FormGroup;
    isEditBoolean: boolean = false;
    isEditLoader: boolean = false;

    selectedProduct: any;
    isStoreLoader: boolean = false;
    isNotStoreLoader: boolean = false;
    storeProducts: any = [];
    totalStoreProd = 0;
    prodPage = 1;
    prodLoadMore: boolean = false;
    prodNotPage = 1;
    storeNotProducts: any = [];
    totalNotStoreProd = 0;
    prodNotLoadMore: boolean = false;

    variantForm: FormGroup;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _toastr: ToastrService,
        private _productService: ProductsService,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.isLoading = true;
        this.initForm();
        this.getSelectedProduct();
    }
    initForm() {
        this.variantForm = new FormGroup({
            size: new FormControl(''),
            color: new FormControl(''),
            price_adjustment: new FormControl(''),
            stock: new FormControl(''),
            product_variant: new FormControl(true)
        });
    }
    calledScreen(value) {
        this.mainScreen = value;
        if (value == 'Add New Store Product') {
        }
    }
    getSelectedProduct() {
        this._productService.Product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.selectedProduct = res["data"][0];
            this.getProductVariants(1, '', 'get');
        });
    }
    getProductVariants(page, msg, type) {
        let params = {
            variant: true,
            sort_by: 'stock',
            sort_order: 'ASC',
            size: 20,
            page: page,
            product_id: this.selectedProduct.id
        }
        this._productService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.storeProducts = res["data"];
            this.totalStoreProd = res["totalRecords"];
            if (type == 'add') {
                this.initForm();
                this.isAddLoader = false;
                this.mainScreen = 'Product Variants';
                this.showToast(msg, 'Product Variant', 'success');
                this._changeDetectorRef.markForCheck();
            }
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    getNextData(event) {
        const { previousPageIndex, pageIndex } = event;

        if (pageIndex > previousPageIndex) {
            this.page++;
        } else {
            this.page--;
        };
        this.getProductVariants(this.page, '', 'get');
    };
    addNewVariant() {
        const { size, color, price_adjustment, stock, product_variant } = this.variantForm.getRawValue();
        this.isAddLoader = true;
        let payload = {
            product_id: this.selectedProduct.id,
            size, color, price_adjustment, stock, product_variant
        }
        this._productService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getProductVariants(1, res["message"], 'add');
            } else {
                this.isAddLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            this.isAddLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
        });
    }
    showToast(msg, title, type) {
        if (type == 'error') {
            this._toastr.error(msg, title);
        } else if (type == 'success') {
            this._toastr.success(msg, title);
        }
    }
    deleteVariant(variant) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Store',
            message: 'Are you sure you want to delete this variant? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                variant.delLoader = true;
                this.deleteUserApi(variant);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    deleteUserApi(variant) {
        let payload = {
            id: variant.id,
            product_variant: true
        }
        this._productService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Deleted', 'success');
                this.storeProducts = this.storeProducts.filter(u => u.id != variant.id);
                this.totalStoreProd--;
                this._changeDetectorRef.markForCheck();
            } else {
                variant.delLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            variant.delLoader = false;
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
