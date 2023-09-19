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
    selector: 'product-information-list',
    templateUrl: './sub-cats.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`.mat-paginator {border-radius: 16px !important} .main-img {
         height: 200px;
    /* or whatever height you want */
    width: auto;
    object-fit: cover;
    }`]
})
export class SubCategoryComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    categoryForm: FormGroup;
    isAddLoader: boolean = false;
    selectedCategory: any;
    isLoading: boolean = false;
    page = 1;
    isLoadMore: boolean = false;
    subCatsData: any = [];
    totalcats = 0;
    isSubCatView: boolean = true;
    isProductLoader: boolean = false;
    subCatProducts: any;
    isAddProducts: boolean = false;
    selectedSubCat: any;
    user: any;
    imgUrl = environment.imgagePathProds;
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _toastr: ToastrService,
        private _authService: AuthService,
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
        this.isLoading = true;
        this.initForm();
        this.getSelectedCategory();
    }
    initForm() {
        this.categoryForm = new FormGroup({
            name: new FormControl('', Validators.required),
            slug: new FormControl('', Validators.required),
            category: new FormControl(true),
        });
    }
    getSelectedCategory() {
        this._productService.Category$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.selectedCategory = res["data"][0];
            this.getSubCategories(1);
        });
    }
    getSubCategories(page) {
        if (page == 1) {
            this.isLoading = true;
            this.subCatsData = [];
        }
        let params = {
            parent_category_id: this.selectedCategory.id,
            page: page,
            size: 20,
            list: true
        }
        this._productService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.subCatsData = this.subCatsData.concat(res["data"]);
            this.totalcats = res["totalRecords"];
            this.isAddLoader = false;
            this.isLoadMore = false;
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isLoadMore = false;
            this.isAddLoader = false;
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        })
    }
    getNextSubCats() {
        this.page++;
        this.isLoadMore = true;
        this.getSubCategories(this.page);
    }
    addNewCategory() {
        const { name, slug, category } = this.categoryForm.getRawValue();
        if (name == '' || slug == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isAddLoader = true;
        let payload = { name, slug, category, parent_category_id: this.selectedCategory.id };
        this._productService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getSubCategories(1);
            } else {
                this.isAddLoader = false;
                this._changeDetectorRef.markForCheck();
            }

        }, err => {
            this.isAddLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
        })
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
            title: 'Delete category',
            message: 'Are you sure you want to delete this category? This action cannot be undone!',
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
            category: true
        }
        this._productService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Deleted', 'success');
                this.subCatsData = this.subCatsData.filter(u => u.id != product.id);
                this.totalcats--;
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

    getSubCategoriesProds(id) {
        this.selectedSubCat = id;
        this.isSubCatView = false;
        this.isProductLoader = true;
        this.subCatProducts = [];
        let params = {
            list: true,
            sort_by: 'name',
            sort_order: 'ASC',
            not_category_id: id,
            drop_down: true,
            ...(this.user.role === 'vendor' && { vendor_id: this.user.vendor.id })
        }
        this._productService.getProductCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(prods => {
            console.log(prods);
            this.subCatProducts = prods["data"];
            this.isProductLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isProductLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    addNewProducts() {
        let prods = [];
        this.subCatProducts.forEach(element => {
            if (element.checked) {
                prods.push(Number(element.id));
            }
        });
        if (prods.length == 0) {
            this.showToast('Please select atleast 1 products', 'Required', 'error');
            return;
        }
        this.isAddProducts = true;
        let payload = {
            product_id: prods,
            category_id: Number(this.selectedSubCat),
            multi_product_category: true
        }
        this._productService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Created', 'success');
                this.isAddProducts = false;
                this._changeDetectorRef.markForCheck();
                this.getSubCategoriesProds(Number(this.selectedSubCat));
            } else {
                this.isAddProducts = false;
                this._changeDetectorRef.markForCheck();
            }

        }, err => {
            this.isAddProducts = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
        })
    }
    backToList() {
        this.isSubCatView = true;
        this._changeDetectorRef.markForCheck();
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
