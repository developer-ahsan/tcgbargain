import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as moment from 'moment';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { userRoutes } from './users.routing';
import { UsersComponent } from './users.component';
import { UsersListComponent } from './list/users-list.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FuseAlertModule } from '@fuse/components/alert';
import { FuseConfirmationModule } from '@fuse/services/confirmation';
import { UserDetailsComponents } from './details/details.component';
import { FuseDrawerModule } from '@fuse/components/drawer';
import { FuseHighlightModule } from '@fuse/components/highlight';
import { FuseMasonryModule } from '@fuse/components/masonry';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { FuseScrollResetModule } from '@fuse/directives/scroll-reset';
import { FuseCardModule } from '@fuse/components/card';
import { FuseDateRangeModule } from '@fuse/components/date-range';
import { UsersAddressesListComponent } from './pages/addresses/addresses.component';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { UserInfoListComponent } from './pages/information/information.component';

@NgModule({
    declarations: [
        UsersComponent,
        UsersListComponent,
        UserDetailsComponents,
        UserInfoListComponent,
        UsersAddressesListComponent,
        UsersStoresListComponent
    ],
    imports: [
        RouterModule.forChild(userRoutes),
        CommonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatProgressBarModule,
        MatRadioModule,
        MatRippleModule,
        MatPaginatorModule,
        MatTableModule,
        MatSelectModule,
        MatSidenavModule,
        MatTooltipModule,
        NgxSkeletonLoaderModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        SharedModule,
        MatTooltipModule,
        MatSnackBarModule,
        ToastrModule.forRoot(),
        FuseAlertModule,
        FuseCardModule,
        FuseDateRangeModule,
        FuseDrawerModule,
        FuseHighlightModule,
        FuseMasonryModule,
        FuseNavigationModule,
        FuseScrollResetModule,
    ],
    providers: [
        ToastrService,
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: moment.ISO_8601
                },
                display: {
                    dateInput: 'll',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ]
})
export class UsersModule {
}
