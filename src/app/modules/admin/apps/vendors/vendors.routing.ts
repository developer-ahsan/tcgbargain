import { Route } from '@angular/router';
import { VendorsListComponent } from './list/vendors-list.component';
import { VendorsDetailsComponents } from './details/details.component';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { VendorsComponent } from './vendors.component';
import { VendorInfoListComponent } from './pages/information/information.component';
import { VendorDetailsResolvers } from './vendors.resolvers';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: VendorsComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                component: VendorsListComponent
            },
            {
                path: ':id',
                component: VendorsDetailsComponents,
                resolve: {
                    user: VendorDetailsResolvers
                },
                children: [
                    {
                        path: '',
                        redirectTo: 'information',
                        pathMatch: 'full'
                    },
                    {
                        path: 'information',
                        component: VendorInfoListComponent,
                        data: {
                            title: 'Vendor Information',
                            url: 'information'
                        }
                    },
                    {
                        path: 'stores',
                        component: UsersStoresListComponent,
                        data: {
                            title: 'User Stores',
                            url: 'stores'
                        }
                    },
                ]
            }
        ]
    }
];
