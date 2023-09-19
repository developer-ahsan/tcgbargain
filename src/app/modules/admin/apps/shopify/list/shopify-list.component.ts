import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";
import { ProductsService } from '../shopify.service';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ImageuploadService } from 'app/imageupload.service';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'shopify-list',
    templateUrl: './shopify-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ShopifyListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['image', 'name', 'product_number', 'price', 'slug', 'status', 'created_at', 'action'];
    totalUsers: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Current Stores';
    productForm: FormGroup;
    isAddLoader: boolean = false;
    selectedFile: any;
    imgUrl = environment.imgagePathProds;
    AllCategories = [];
    isSearchLoader: boolean = false;
    bestBuyProducts: any;
    bestBuyPage = 1;
    bestBuyKeyword: string = ''
    isLoadMore: boolean = false;
    totalBestBuyProducts: any = 0;
    user: any;

    searchCategoryCtrl = new FormControl();
    selectedCategory: any = '';
    isSearchingCatefory = false;
    bestBuyCategory: any = [];
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _authService: AuthService,
        private _toastr: ToastrService,
        private _productService: ProductsService,
        private _imageUpload: ImageuploadService,
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
        this.initForm();
        this.getAllCategories();
        this.getProductsList(1, '', 'get');
        this.getBestBuyCategory();
    }
    getAllCategories() {
        this._productService.Categories$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.AllCategories = res["data"];
        });
    }
    initForm() {
        this.productForm = new FormGroup({
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
    calledScreen(value) {
        this.mainScreen = value;
    }
    getProductsList(page, msg, type) {
        this.dataSource = [];
        const params = {
            list: true,
            size: 100
        }
        this._productService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            res["data"].forEach(element => {
                this.dataSource = this.dataSource.concat(element.details);
            });
            this.totalUsers = res["totalRecords"];
            if (type == 'add') {
                this.showToast(msg, 'Created', 'success');
                this.productForm.reset();
                this.initForm();
                this.mainScreen = 'Current Stores';
                this.isAddLoader = false;
                this._changeDetectorRef.markForCheck();
            }
            this.isLoading = false;
            this.isSearching = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isSearching = false;
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
        this.getProductsList(this.page, '', 'get');
    };

    searchUser(value) {
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
        this.getProductsList(1, '', 'get');
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
    imgUpload(event) {
        const file = event.target.files[0];
        this.selectedFile = file;
    }
    addNewProduct() {
        this.isAddLoader = true;
        const { platform, title, api_key, api_secret, access_token, domain, user_id } = this.productForm.getRawValue();
        let payload = { platform, title, api_key, api_secret, access_token, domain, user_id };
        this._productService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getProductsList(1, res["message"], 'add');
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
    deleteProduct(product) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete store',
            message: 'Are you sure you want to delete this store? This action cannot be undone!',
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
            id: Number(product.id)
        }
        this._productService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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

    // Search Product
    searchProductsList(page) {
        if (page == 1) {
            this.isSearchLoader = true;
            this.bestBuyProducts = [];
            this.totalBestBuyProducts = 0;
        }
        let params = {
            products: true,
            keyword: this.bestBuyKeyword,
            categoriy_id: this.selectedCategory.id,
            page: page,
            size: 20
        }
        this._productService.getCallsBestBuy(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["data"]["success"]) {
                this.bestBuyProducts = this.bestBuyProducts.concat(res["data"]["message"]["products"]);
                this.totalBestBuyProducts = res["data"]["message"]["total"];
            }
            this.dataSource = res["data"];
            this.totalUsers = res["totalRecords"];
            this.isLoadMore = false;
            this.isSearchLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.isSearchLoader = false;
            this.isLoadMore = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    loadMoreBestBuyProduct() {
        this.bestBuyPage++;
        this.isLoadMore = true;
        this.searchProductsList(this.bestBuyPage);
    }

    addNewBestProduct(products: any) {
        const { name, longDescription, sku, regularPrice, source, url, active, affiliateUrl, shippingCost, categoryPath, productVariations, image, images, weight, width, height, lengthInMinutes } = products;
        let vendorId = null;
        if (this.user.role == 'vendor') {
            vendorId = this.user.vendor.id;
        }
        let imagesData = [];
        images.forEach(element => {
            imagesData.push(element.href);
        });
        let categories = [];
        categoryPath.forEach((element, index) => {
            if (index > 0) {
                if (categories.length < 2) {
                    categories.push(element.name);
                }
            }
        });
        let variantions = [];
        productVariations.forEach(element => {
            element.variantions.forEach(item => {
                variantions.push({
                    size: '',
                    color: item.value,
                    price_adjustment: 0,
                    stock: 0,
                    sku: element.sku
                });
            });
        });
        let payload = {
            name: name,
            description: longDescription,
            product_number: sku,
            price: regularPrice,
            source: source,
            url: url,
            image_url: image,
            "slug": "product-slug",
            is_active: active,
            product_type: "affiliate",
            affiliate_url: affiliateUrl,
            delivery_rate: shippingCost,
            categories: categories,
            variants: variantions,
            images: imagesData,
            packaging: {
                size_length: lengthInMinutes,
                size_width: width,
                size_height: height,
                weight: weight
            },
            best_buy_product: true,
            vendor_id: vendorId
        }
        products.addLoader = true;

        this._productService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getProductsList(1, res["message"], 'add');
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

    getBestBuyCategory() {
        let params;
        this.searchCategoryCtrl.valueChanges.pipe(
            filter((res: any) => {
                params = {
                    categories: true
                }
                return res !== null && res.length >= 3
            }),
            distinctUntilChanged(),
            debounceTime(300),
            tap(() => {
                this.bestBuyCategory = [];
                this.isSearchingCatefory = true;
                this._changeDetectorRef.markForCheck();
            }),
            switchMap(value => this._productService.getCallsBestBuy(params)
                .pipe(
                    finalize(() => {
                        this.isSearchingCatefory = false
                        this._changeDetectorRef.markForCheck();
                    }),
                )
            )
        ).subscribe((res: any) => {
            if (res["data"]["success"]) {
                res["data"]["message"].categories.forEach(element => {
                    this.bestBuyCategory.push(element);
                });
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    onSelected(ev) {
        this.selectedCategory = ev.option.value;
    }

    displayWith(value: any) {
        return value?.name;
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
