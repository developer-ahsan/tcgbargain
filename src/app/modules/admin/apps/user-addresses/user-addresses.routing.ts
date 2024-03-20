import { Route } from '@angular/router';
import { ShopifyListComponent } from './list/user-addresses-list.component';
import { ShopifysDetailsComponents } from './details/details.component';
import { StoreProducstListComponent } from './pages/stores/stores.component';
import { ShopifyComponent } from './user-addresses.component';
import { ShopifyInfoListComponent } from './pages/information/information.component';
import { AllVendorsResolvers, ProductDetailsResolvers } from './user-addresses.resolvers';

export const storeRoutes: Route[] = [
    {
        path: '',
        component: ShopifyComponent,
        resolve: {
            vendors: AllVendorsResolvers
        },
        children: [
            {
                path: '',
                component: ShopifyListComponent
            },
            {
                path: ':id',
                component: ShopifysDetailsComponents,
                resolve: {
                    user: ProductDetailsResolvers
                },
                children: [
                    {
                        path: '',
                        redirectTo: 'information',
                        pathMatch: 'full'
                    },
                    {
                        path: 'information',
                        component: ShopifyInfoListComponent,
                        data: {
                            title: 'Product Information',
                            url: 'information'
                        }
                    },
                    {
                        path: 'store-products',
                        component: StoreProducstListComponent,
                        data: {
                            title: 'Shopify Products',
                            url: 'store-products'
                        }
                    }
                ]

            }
        ]
    }
];
