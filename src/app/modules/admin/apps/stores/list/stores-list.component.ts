import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, map, distinctUntilChanged, filter } from "rxjs/operators";
import { StoresService } from '../stores.service';
import { MatPaginator } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'stores-list',
    templateUrl: './stores-list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class StoresListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['title', 'url', 'primary', 'secondary', 'status', 'created_at', 'action'];
    totalUsers: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Current Stores';
    storeForm: FormGroup;
    isAddLoader: boolean = false;
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _toastr: ToastrService,
        private _storeService: StoresService,
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
        this.getStoresList(1, '', 'get');
    }
    initForm() {
        this.storeForm = new FormGroup({
            title: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            url: new FormControl('', Validators.required),
            primary_color: new FormControl('#00000', Validators.required),
            secondary_color: new FormControl('#FFFFF', Validators.required),
            is_active: new FormControl(true),
            store: new FormControl(true),
        });
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getStoresList(page, msg, type) {
        let params = {
            list: true,
            sort_order: 'ASC',
            keyword: this.keyword,
            page: page,
            size: 20
        }
        this._storeService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.dataSource = res["data"];
            this.totalUsers = res["totalRecords"];
            if (this.keyword == '') {
                this.tempDataSource = res["data"];
                this.tempRecords = res["totalRecords"];
            }
            if (type == 'add') {
                this.showToast(msg, 'Created', 'success');
                this.storeForm.reset();
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
        this.getStoresList(this.page, '', 'get');
    };

    searchUser(value) {
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
        this.getStoresList(1, '', 'get');
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
    addNewStore() {
        const { title, url, description, primary_color, secondary_color, is_active, store } = this.storeForm.getRawValue();
        if (title == '' || url == '' || description == '') {
            this.showToast('Please fill out the required fields', 'Required', 'error');
            return;
        }
        this.isAddLoader = true;
        let payload = { title, url, description, primary_color, secondary_color, is_active, store };
        this._storeService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.getStoresList(1, res["message"], 'add');
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
    deleteStore(store) {
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
                store.delLoader = true;
                this.deleteStoreApi(store);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    deleteStoreApi(user) {
        let payload = {
            id: user.id,
            store: true
        }
        this._storeService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Deleted', 'success');
                this.dataSource = this.dataSource.filter(u => u.id != user.id);
                this.totalUsers--;
                this._changeDetectorRef.markForCheck();
            } else {
                user.delLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            user.delLoader = false;
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
