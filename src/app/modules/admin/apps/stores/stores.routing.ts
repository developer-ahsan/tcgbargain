import { Route } from '@angular/router';
import { StoresListComponent } from './list/stores-list.component';
import { StoresDetailsComponents } from './details/details.component';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { StoresComponent } from './stores.component';
import { StoreInfoListComponent } from './pages/information/information.component';
import { StoreDetailsResolvers } from './stores.resolvers';
import { StoreProductsListComponent } from './pages/store-products/store-products.component';
import { SlidersListComponent } from './pages/sliders/sliders.component';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: StoresComponent,
        resolve: {
        },
        children: [
            {
                path: '',
                component: StoresListComponent
            },
            {
                path: ':id',
                component: StoresDetailsComponents,
                resolve: {
                    user: StoreDetailsResolvers
                },
                children: [
                    {
                        path: '',
                        redirectTo: 'information',
                        pathMatch: 'full'
                    },
                    {
                        path: 'information',
                        component: StoreInfoListComponent,
                        data: {
                            title: 'Store Information',
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
                    {
                        path: 'store-products',
                        component: StoreProductsListComponent,
                        data: {
                            title: 'Store Products',
                            url: 'store-products'
                        }
                    },
                    {
                        path: 'store-sliders',
                        component: SlidersListComponent,
                        data: {
                            title: 'Store Sliders',
                            url: 'store-sliders'
                        }
                    },
                ]
            }
        ]
    }
];
