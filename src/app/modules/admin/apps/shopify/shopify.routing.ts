import { Route } from '@angular/router';
import { ShopifyListComponent } from './list/shopify-list.component';
import { ShopifysDetailsComponents } from './details/details.component';
import { UsersStoresListComponent } from './pages/stores/stores.component';
import { ShopifyComponent } from './shopify.component';
import { ShopifyInfoListComponent } from './pages/information/information.component';
import { AllVendorsResolvers, ProductDetailsResolvers } from './shopify.resolvers';
import { ProductVariantsComponent } from './pages/product-variants/product-variants.component';
import { ProductPackagesComponent } from './pages/product-packages/product-packages.component';

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
                        path: 'stores-products',
                        component: UsersStoresListComponent,
                        data: {
                            title: 'Store Products',
                            url: 'stores-products'
                        }
                    },
                    {
                        path: 'product-variants',
                        component: ProductVariantsComponent,
                        data: {
                            title: 'Product Variants',
                            url: 'product-variants'
                        }
                    },
                    {
                        path: 'product-packages',
                        component: ProductPackagesComponent,
                        data: {
                            title: 'Product Packages',
                            url: 'product-packages'
                        }
                    },
                ]

            }
        ]
    }
];
