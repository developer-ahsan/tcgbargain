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
    selector: 'stores-list',
    templateUrl: './stores.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class UsersStoresListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['id', 'name', 'description', 'created_at', 'action'];
    totalUsers: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Store Products';
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
    user: any;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _toastr: ToastrService,
        private _productService: ProductsService,
        private _authService: AuthService,
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
        this._authService.user$.subscribe(res => {
            this.user = res["data"][0];
        })
        this.isLoading = true;
        this.getSelectedProduct();
    }
    calledScreen(value) {
        this.mainScreen = value;
        if (value == 'Add New Store Product') {
            if (this.storeNotProducts.length == 0) {
                this.isNotStoreLoader = true;
                this.getNotProductsStore(1);
            }
        }
    }
    getSelectedProduct() {
        this._productService.Product$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.selectedProduct = res["data"][0];
            this.getProductsStore(1, '', 'get');
        });
    }
    getProductsStore(page, msg, type) {
        let params = {
            page: page,
            is_product_id: this.selectedProduct.id,
            list: true,
            ...(this.user.role === 'vendor' && { vendor_id: this.user.vendor.id })
        }
        this._productService.getCallsStore(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.storeProducts = res["data"];
            this.totalStoreProd = res["totalRecords"];
            if (type == 'add') {
                this.storeNotProducts = [];
                this.isAddLoader = false;
                this.mainScreen = 'Store Products';
                this.showToast(msg, 'Add Store Product', 'success');
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
        this.getProductsStore(this.page, '', 'get');
    };
    getNextStoreProds() {
        this.prodNotPage++;
        this.prodNotLoadMore = true;
        this.getNotProductsStore(this.prodNotPage);
    }
    getNotProductsStore(page) {
        if (page == 1) {
            this.storeNotProducts = [];
        }
        let params = {
            page: page,
            not_product_id: this.selectedProduct.id,
            list: true,
            ...(this.user.role === 'vendor' && { vendor_id: this.user.vendor.id })
        }
        this._productService.getCallsStore(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.storeNotProducts = this.storeNotProducts.concat(res["data"]);
            this.totalNotStoreProd = res["totalRecords"]
            this.prodNotLoadMore = false;
            this.isNotStoreLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.prodNotLoadMore = false;
            this.isNotStoreLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    addNewProduct() {
        let prods = [];
        this.storeNotProducts.forEach(element => {
            if (element.checked) {
                prods.push(element.id);
            }
        });
        if (prods.length == 0) {
            this.showToast('Please select any store to add product', 'Add Store Product', 'error');
            return;
        }
        this.isAddLoader = true;
        let payload = {
            product_id: this.selectedProduct.id,
            store_id: prods,
            store_products: true
        }
        this._productService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getProductsStore(1, res["message"], 'add');
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
    deleteStore(store) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Store',
            message: 'Are you sure you want to delete this store? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                store.delLoader = true;
                this.deleteUserApi(store);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    deleteUserApi(store) {
        let payload = {
            store_id: store.id,
            product_id: this.selectedProduct.id,
            store_product: true
        }
        this._productService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Deleted', 'success');
                this.storeProducts = this.storeProducts.filter(u => u.id != store.id);
                this.totalStoreProd--;
                this._changeDetectorRef.markForCheck();
            } else {
                store.delLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            store.delLoader = false;
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
