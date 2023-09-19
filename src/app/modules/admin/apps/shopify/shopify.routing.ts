import { Route } from '@angular/router';
import { ShopifyListComponent } from './list/shopify-list.component';
import { ShopifysDetailsComponents } from './details/details.component';
import { StoreProducstListComponent } from './pages/stores/stores.component';
import { ShopifyComponent } from './shopify.component';
import { ShopifyInfoListComponent } from './pages/information/information.component';
import { AllVendorsResolvers, ProductDetailsResolvers } from './shopify.resolvers';

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
                            title: 'Store Products',
                            url: 'store-products'
                        }
                    }
                ]

            }
        ]
    }
];
