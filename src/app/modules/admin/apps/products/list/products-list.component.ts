import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";
import { ProductsService } from '../products.service';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ImageuploadService } from 'app/imageupload.service';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import * as XLSX from 'xlsx';

@Component({
    selector: 'products-list',
    templateUrl: './products-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ProductsListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    @ViewChild('fileExcel') fileExcel: ElementRef;
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
    mainScreen: string = 'Current Products';
    productForm: FormGroup;
    isAddLoader: boolean = false;
    selectedFile: any;
    imgUrl = environment.imgagePathProds;
    allVendors = [];
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
    excelData: any = [];
    isBulkUploadLoader: boolean = false;
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
        this.getAllVendors();
        this.getProductsList(1, '', 'get');
        this.getBestBuyCategory();
    }
    getAllVendors() {
        this._productService.Vendors$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.allVendors = res["data"];
        });
    }
    initForm() {
        this.productForm = new FormGroup({
            name: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            price: new FormControl('', Validators.required),
            product_number: new FormControl('', Validators.required),
            source: new FormControl('', Validators.required),
            url: new FormControl('', Validators.required),
            vendor_id: new FormControl('', Validators.required),
            image_url: new FormControl('', Validators.required),
            product_type: new FormControl('normal', Validators.required),
            affiliate_url: new FormControl(''),
            slug: new FormControl(''),
            is_active: new FormControl(true),
            product: new FormControl(true),
        });
        if (this.user.role == 'vendor') {
            this.productForm.patchValue({ vendor_id: this.user.vendor.id });
        }
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getProductsList(page, msg, type) {
        const params = {
            list: true,
            sort_by: 'created_at',
            sort_order: 'DESC',
            keyword: this.keyword,
            page: page,
            size: 50,
            ...(this.user.role === 'vendor' && { vendor_id: this.user.vendor.id })
        }
        this._productService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.dataSource = res["data"];
            this.totalUsers = res["totalRecords"];
            if (this.keyword == '') {
                this.tempDataSource = res["data"];
                this.tempRecords = res["totalRecords"];
            }
            if (type == 'add') {
                this.showToast(msg, 'Created', 'success');
                this.productForm.reset();
                this.initForm();
                this.mainScreen = 'Current Products';
                this.isAddLoader = false;
                this.isBulkUploadLoader = false;
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
        let image;
        let imageName = "prod-image-" + new Date().getTime();
        if (!this.selectedFile) {
            this.showToast('Please select any image file', 'Image Required', 'error');
            return;
        }
        this.isAddLoader = true;
        this._imageUpload.uploadFile(this.selectedFile, imageName).then(img => {
            const { name, url, description, price, slug, is_active, product_number, product, image_url, vendor_id, source, product_type, affiliate_url } = this.productForm.getRawValue();
            if (name == '' || price == '' || product_number == '' || vendor_id == '') {
                this.showToast('Please fill out the required fields', 'Required', 'error');
                return;
            }
            let payload = { name, url, description, price, slug, is_active, product_number, product, image_url: imageName, vendor_id, source, product_type, affiliate_url };
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
    onFileChange(event: any) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e: any) => {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            this.excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
            this._changeDetectorRef.markForCheck();
        };

        reader.readAsBinaryString(file);
    }
    bulkUploadProducts() {
        this.isBulkUploadLoader = true;
        let products = [];
        this.excelData.forEach(element => {
            products.push({
                name: element.Name,
                description: element.Description,
                product_number: element.Product_Number,
                price: element.Price,
                source: element.Source,
                url: element.Url,
                ...(this.user.role === 'vendor' && { vendor_id: this.user.vendor.id }),
                image_url: element.Image_Url,
                slug: element.Slug,
                is_active: true,
                product_type: 'normal',
                affiliate_url: ''
            })
        });
        let payload = {
            products: products,
            bulk_import: true
        }
        this._productService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getProductsList(1, res["message"], 'add');
                this.excelData = [];
                this.fileExcel.nativeElement.value = '';
            } else {
                this.isBulkUploadLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            this.isBulkUploadLoader = false;
            this._changeDetectorRef.markForCheck();
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
