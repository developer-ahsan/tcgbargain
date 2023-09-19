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
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'categories-products',
    templateUrl: './categories-products.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class CategoriesProductsListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['image', 'name', 'product_number', 'price', 'slug', 'status', 'created_at'];
    totalUsers: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Current Products';
    productForm: FormGroup;
    isAddLoader: boolean = false;
    selectedCategory: any;
    imgUrl = environment.imgagePathProds;
    dtOptions: any = {};
    user: any;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _toastr: ToastrService,
        private _categoriesService: ProductsService,
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
        this.dtOptions = {
            pagingType: 'full_numbers'
        };
        this.getSelectedCategory();
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getSelectedCategory() {
        this._categoriesService.Category$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.selectedCategory = res["data"][0];
            this.getProductsList();
        });
    }
    getProductsList() {
        let params = {
            list: true,
            sort_order: 'ASC',
            drop_down: true,
            category_id: this.selectedCategory.id,
            ...(this.user.role === 'vendor' && { vendor_id: this.user.vendor.id })
        }
        this._categoriesService.getProductCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.dataSource = res["data"];
            this.totalUsers = res["totalRecords"];
            this.isLoading = false;
            this.isSearching = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isSearching = false;
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        });
    }

    searchUser(value) {
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
    }
    resetSearch() {
        this.keyword = '';
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.dataSource = this.tempDataSource;
        this.totalUsers = this.tempRecords;
        this._changeDetectorRef.markForCheck();
    }
    showToast(msg, title, type) {
        if (type == 'error') {
            this._toastr.error(msg, title);
        } else if (type == 'success') {
            this._toastr.success(msg, title);
        }
    }
    deleteProduct(product) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete product',
            message: 'Are you sure you want to delete this product? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                product.delLoader = true;
                this.deleteProductApi(product);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    deleteProductApi(product) {
        let payload = {
            id: Number(product.id),
            product: true
        }
        this._categoriesService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Deleted', 'success');
                this.dataSource = this.dataSource.filter(u => u.id != product.id);
                this.totalUsers--;
                this._changeDetectorRef.markForCheck();
            } else {
                product.delLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            product.delLoader = false;
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
