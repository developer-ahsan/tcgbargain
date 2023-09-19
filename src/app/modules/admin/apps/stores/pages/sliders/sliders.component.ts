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
import { StoresService } from '../../stores.service';
import { ImageuploadService } from 'app/imageupload.service';
import { environment } from 'environments/environment';

@Component({
    selector: 'sliders-list',
    templateUrl: './sliders.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [".mat-paginator {border-radius: 16px !important}"]
})
export class SlidersListComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator: MatPaginator;
    // List
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    displayedColumns: string[] = ['image', 'title', 'subtitle', 'created_at', 'action'];
    totalRecords: number = 0;
    dataSource = [];
    tempDataSource = [];
    tempRecords: number = 0;
    page: number = 1;
    isLoading: boolean = true;
    keyword = '';
    isSearching: boolean = false;
    mainScreen: string = 'Current Sliders';
    sliderForm: FormGroup;
    isAddLoader: boolean = false;
    editUserForm: FormGroup;
    isEditBoolean: boolean = false;
    isEditLoader: boolean = false;
    slectedStore: any;
    selectedFile: any;
    imgUrl = environment.imgagePathProds;

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _toastr: ToastrService,
        private _storeService: StoresService,
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
        this.dataSource.push({ da: 1 })
        this.isLoading = true;
        this.getSelectedStore();
        this.initForm();
    }
    getSelectedStore() {
        this._storeService.Store$.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.isLoading = true;
            this.slectedStore = res["data"][0];
            this.getSlidersList(1, '', 'get');
        });
    }
    initForm() {
        this.sliderForm = new FormGroup({
            title: new FormControl('', Validators.required),
            sub_title: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required)
        });
        this.editUserForm = new FormGroup({
            id: new FormControl('', Validators.required),
            title: new FormControl('', Validators.required),
            subtitle: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            url: new FormControl('', Validators.required),
        });
    }
    calledScreen(value) {
        this.mainScreen = value;
    }
    getSlidersList(page, msg, type) {
        let params = {
            image: true,
            store_id: this.slectedStore.id,
            keyword: this.keyword,
            page: page,
            size: 20
        }
        this._storeService.getCalls(params).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.dataSource = res["data"];
            this.totalRecords = res["totalRecords"];
            if (this.keyword == '') {
                this.tempDataSource = res["data"];
                this.tempRecords = res["totalRecords"];
            }
            if (type == 'add') {
                this.showToast(msg, 'Created', 'success');
                this.selectedFile = null;
                this.sliderForm.reset();
                this.initForm();
                this.mainScreen = 'Current Sliders';
                this.isAddLoader = false;
                this._changeDetectorRef.markForCheck();
            }
            if (type == 'edit') {
                this.showToast(msg, 'Updated', 'success');
                this.selectedFile = null;
                this.isEditBoolean = false
                this.isEditLoader = false;
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
        this.getSlidersList(this.page, '', 'get');
    };

    searchUser(value) {
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.keyword = value;
        this.isSearching = true;
        this._changeDetectorRef.markForCheck();
        this.getSlidersList(1, '', 'get');
    }
    resetSearch() {
        this.keyword = '';
        if (this.dataSource.length > 0) {
            this.paginator.firstPage();
        }
        this.dataSource = this.tempDataSource;
        this.totalRecords = this.tempRecords;
        this._changeDetectorRef.markForCheck();
    }
    imgUpload(event) {
        const file = event.target.files[0];
        this.selectedFile = file;
    }
    addNewSlider() {
        const { title, sub_title, description } = this.sliderForm.getRawValue();
        let image;
        let imageName = "slider-image-" + new Date().getTime();
        if (!this.selectedFile) {
            this.showToast('Please select any image file', 'Image Required', 'error');
            return;
        }
        this.isAddLoader = true;
        this._imageUpload.uploadFile(this.selectedFile, imageName).then(img => {
            let payload = { description: description, title: title, subtitle: sub_title, store_id: this.slectedStore.id, url: imageName, store_image: true };
            this._storeService.postCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res["message"]) {
                    this.getSlidersList(1, res["message"], 'add');
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
    deleteUser(slider) {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete Slider',
            message: 'Are you sure you want to delete this slider? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });
        confirmation.afterClosed().subscribe((result) => {
            if (result == 'confirmed') {
                slider.delLoader = true;
                this.deleteSliderApi(slider);
                this._changeDetectorRef.markForCheck();
            }
        });
    }
    deleteSliderApi(slider) {
        let payload = {
            id: slider.id,
            store_image: true
        }
        this._storeService.deleteCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res["message"]) {
                this.showToast(res["message"], 'Deleted', 'success');
                this.dataSource = this.dataSource.filter(u => u.id != slider.id);
                this.totalRecords--;
                this._changeDetectorRef.markForCheck();
            } else {
                slider.delLoader = false;
                this._changeDetectorRef.markForCheck();
            }
        }, err => {
            slider.delLoader = false;
            this._changeDetectorRef.markForCheck();
            this.showToast(err.error["message"], err.error["code"], 'error');
        })
    }
    editUser(slider) {
        this.isEditBoolean = true;
        this.editUserForm.patchValue(slider);
    }
    updateUser() {
        this.isEditLoader = true;

        if (this.selectedFile) {
            let imageName = "slider-image-" + new Date().getTime();
            this._imageUpload.uploadFile(this.selectedFile, imageName).then(img => {
                const { id, title, subtitle, description } = this.editUserForm.getRawValue();
                this.isEditLoader = true;
                let payload = { id, title, subtitle, description, url: imageName, store_image: true, store_id: this.slectedStore.id };
                this._storeService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                    if (res["message"]) {
                        this.getSlidersList(1, res["message"], 'edit');
                    } else {
                        this.isEditLoader = false;
                        this._changeDetectorRef.markForCheck();
                    }

                }, err => {
                    this.isEditLoader = false;
                    this._changeDetectorRef.markForCheck();
                    this.showToast(err.error["message"], err.error["code"], 'error');
                })
            });
        } else {
            const { id, title, subtitle, description, url } = this.editUserForm.getRawValue();
            let payload = { id, title, subtitle, description, url: url, store_image: true, store_id: this.slectedStore.id };
            this._storeService.putCalls(payload).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res["message"]) {
                    this.getSlidersList(1, res["message"], 'edit');
                } else {
                    this.isEditLoader = false;
                    this._changeDetectorRef.markForCheck();
                }

            }, err => {
                this.isEditLoader = false;
                this._changeDetectorRef.markForCheck();
                this.showToast(err.error["message"], err.error["code"], 'error');
            })
        }

    }
    backToList() {
        this.isEditBoolean = false;
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
