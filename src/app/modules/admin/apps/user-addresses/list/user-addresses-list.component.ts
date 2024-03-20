import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";
import { ProductsService } from '../user-addresses.service';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ImageuploadService } from 'app/imageupload.service';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';
import { UsersService } from '../../users/users.service';
import { VendorsService } from '../../vendors/vendors.service';
import moment from 'moment';

@Component({
    selector: 'user-addresses-list',
    templateUrl: './user-addresses-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class ShopifyListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['street', 'city', 'state', 'country', 'phone', 'action'];
    totalUsers: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Current Addresses';
    addressForm: FormGroup;
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
    paymentForm: any;
    isStripeLoader: boolean = false;
    accountInformation: any;
    accountDelLoader: boolean = false;
    minDate: any = new Date();

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _authService: AuthService,
        private _toastr: ToastrService,
        private _userService: UsersService,
        private _vendorService: VendorsService,
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
        this.minDate = new Date(moment().subtract(18, 'year').startOf('month').format('MM/DD/yyyy'));
        this._authService.user$.subscribe(res => {
            this.user = res["data"][0];
            if (this.user.role == 'vendor') {
                this.getStripeInformation();
            }
        })
        this.isLoading = true;
        this.initForm();
        this.getUserAddresses(1, '', 'get');
    }
    initForm() {
        this.addressForm = new FormGroup({
            street: new FormControl('', Validators.required),
            city: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            country: new FormControl('CA', Validators.required),
            phone_number: new FormControl('', Validators.required),
            postal_code: new FormControl('', Validators.required),
            company: new FormControl('', Validators.required),
            user_id: new FormControl('', Validators.required)
        });
        this.addressForm.patchValue({ user_id: this.user.id });
        this.paymentForm = new FormGroup({
            user_id: new FormControl('', Validators.required),
            type: new FormControl('express', Validators.required),
            country: new FormControl('CA', Validators.required),
            email: new FormControl('', Validators.required),
            first_name: new FormControl('', Validators.required),
            last_name: new FormControl('', Validators.required),
            dob: new FormControl('', Validators.required),
            url: new FormControl('', Validators.required)
        });
        this.paymentForm.patchValue({ user_id: this.user.id });
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getUserAddresses(page, msg, type) {
        // if (page == 1) {
        //     this.dataSource = [];
        //     this.paginator.pageIndex = 0;
        // }
        const params = {
            address: true,
            size: 10,
            page: page,
            user_id: this.user.id
        }
        this._userService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.dataSource = res["data"];
            this.totalUsers = res["totalRecords"];
            if (type == 'add') {
                this.showToast(msg, 'Created', 'success');
                this.addressForm.reset();
                this.initForm();
                this.mainScreen = 'Current Addresses';
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
        this.getUserAddresses(this.page, '', 'get');
    };

    searchUser(value) {
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
        this.getUserAddresses(1, '', 'get');
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
        const { user_id, street, city, state, country, phone_number, postal_code, company } = this.addressForm.getRawValue();
        let payload = { user_id, street, city, state, country, phone_number, postal_code, company, address: true };
        this._userService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getUserAddresses(1, res["message"], 'add');
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
    addStripeInformation() {
        this.isStripeLoader = true;
        const { user_id, country, email, type, first_name, last_name, dob, url } = this.paymentForm.getRawValue();

        let payload = {
            user_id, type, country, email,
            requested_capabilities: [
                "card_payments",
                "transfers"
            ],
            business_type: 'individual',
            individual: {
                first_name, last_name, email,
                dob: {
                    day: Number(moment(dob).format('DD')),
                    month: Number(moment(dob).format('MM')),
                    year: Number(moment(dob).format('YYYY'))
                }
            },
            business_profile: {
                url: url
            },
            connect: true
        }
        this._vendorService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Stripe Information', 'success');
                window.open(res["data"].stripe.links.url, '_blank');
            }
            this.isStripeLoader = false;
            this._changeDetectorRef.markForCheck();
        }, err => {
            this.showToast(err.error["message"], err.error["code"], 'error');
            this.isStripeLoader = false;
            this._changeDetectorRef.markForCheck();
        });
    }
    getStripeInformation() {
        let params = {
            list: true,
            user_id: this.user.id
        }
        this._vendorService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["data"]) {
                this.accountInformation = res["data"][0];
            }
        }, err => {

        });
    }
    clearStripeInformation() {
        this.accountInformation = null;

        // this.accountDelLoader = true;
        // let payload = {
        //     user_id: this.user.id,
        //     customer_id: this.accountInformation.customer_id,
        //     stripe: true
        // }
        // this._vendorService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        //     this.accountInformation = null;
        //     this.accountDelLoader = false;
        //     this._changeDetectorRef.markForCheck();
        // }, err => {
        //     this.accountDelLoader = false;
        //     this._changeDetectorRef.markForCheck();
        // })
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
            title: 'Delete address',
            message: 'Are you sure you want to delete this address? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                product.delLoader = true;
                this.deleteAddressApi(product);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    deleteAddressApi(product) {
        let payload = {
            id: Number(product.id),
            address: true
        }
        this._userService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
