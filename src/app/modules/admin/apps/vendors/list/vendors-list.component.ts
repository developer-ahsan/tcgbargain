import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";
import { VendorsService } from '../vendors.service';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'vendors-list',
    templateUrl: './vendors-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class VendorsListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['name', 'commission_rate', 'slug', 'status', 'created_at', 'action'];
    totalUsers: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Current Vendors';
    vendorForm: FormGroup;
    isAddLoader: boolean = false;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _toastr: ToastrService,
        private _vendorService: VendorsService,
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
        this.dataSource.push({ da: 1 })
        this.isLoading = true;
        this.initForm();
        this.getVendorsList(1, '', 'get');
    }
    initForm() {
        this.vendorForm = new FormGroup({
            name: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            commission_rate: new FormControl('', Validators.required),
            slug: new FormControl('', Validators.required),
            is_active: new FormControl(true),
            vendor: new FormControl(true),
        });
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getVendorsList(page, msg, type) {
        let params = {
            list: true,
            sort_order: 'ASC',
            keyword: this.keyword,
            page: page,
            size: 20
        }
        this._vendorService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.dataSource = res["data"];
            this.totalUsers = res["totalRecords"];
            if (this.keyword == '') {
                this.tempDataSource = res["data"];
                this.tempRecords = res["totalRecords"];
            }
            if (type == 'add') {
                this.showToast(msg, 'Created', 'success');
                this.vendorForm.reset();
                this.initForm();
                this.mainScreen = 'Current Vendors';
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
        this.getVendorsList(this.page, '', 'get');
    };

    searchUser(value) {
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
        this.getVendorsList(1, '', 'get');
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
    addNewVendor() {
        const { name, description, commission_rate, slug, is_active, vendor } = this.vendorForm.getRawValue();
        if (name == '' || commission_rate == '' || slug == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isAddLoader = true;
        let payload = { name, description, commission_rate, slug, is_active, vendor };
        this._vendorService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getVendorsList(1, res["message"], 'add');
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
    deleteVendor(vendors) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete vendors',
            message: 'Are you sure you want to delete this vendors? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                vendors.delLoader = true;
                this.deleteVendorApi(vendors);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    deleteVendorApi(vendor) {
        let payload = {
            id: vendor.id,
            vendor: true
        }
        this._vendorService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Deleted', 'success');
                this.dataSource = this.dataSource.filter(u => u.id != vendor.id);
                this.totalUsers--;
                this._changeDetectorRef.markForCheck();
            } else {
                vendor.delLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            vendor.delLoader = false;
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
