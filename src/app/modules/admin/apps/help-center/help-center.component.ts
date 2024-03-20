import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HelpCenterService } from 'app/modules/admin/apps/help-center/help-center.service';
import { FaqCategory } from 'app/modules/admin/apps/help-center/help-center.type';

@Component({
    selector: 'help-center',
    templateUrl: './help-center.component.html',
    encapsulation: ViewEncapsulation.None
})
export class HelpCenterComponent implements OnInit, OnDestroy {
    faqCategory: any;
    private _unsubscribeAll: Subject<any> = new Subject();

    /**
     * Constructor
     */
    constructor(private _helpCenterService: HelpCenterService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.faqCategory = [
            {
                name: 'Dashboard sign-In',
                images: ['1.jpg'],
                desc: 'Dashboard Sign-in: We have two types of accounts. One is for the super admin who can control the entire system. The other type is for vendors who can manage their own stores, products, and users.'
            },
            {
                name: 'User Management',
                images: ['2.jpg', '3.jpg'],
                desc: 'User Management: After successfully logging in with your credentials, you can easily manage your users and other functionalities. If you are an admin, you can add vendors and other admins. However, if you are a vendor, you cannot add new users; you can only manage your customers'
            },
            {
                name: 'Product Management',
                images: ['4.jpg'],
                desc: 'Product Management: Product management includes four features. You can easily import products from a third-party like Best Buy, import products from an Excel sheet using your own template, and manually add products.'
            },
            {
                name: 'Product Store Management',
                images: ['5.jpg'],
                desc: 'Add Product to Store: Now that we know we need to add products to our stores for them to be visible to customers on our smart sites. First, create a store. If your store already exists, click on the product name and go to the Store Versions tab. Select the stores in which you want to add your products.'
            },
            {
                name: 'Store Management',
                images: ['6.jpg'],
                desc: 'Store Management: You can create, edit, and delete stores. In the details section, you can also see which products are assigned to these stores. Additionally, you can update the sliders that you want to show on the customer side for each store. Each store is a single entity smart site.'
            },
            {
                name: 'Shopify Management',
                images: ['7.jpg'],
                desc: 'Shopify Management: You can create, edit, and delete Shopify stores. In the "Generate API Key" tab, you can generate Shopify APIs and integrate them with our system. The purpose of integrating Shopify into our system is to import the store products into our system.'
            },
            {
                name: 'Categories Management',
                images: ['8.jpg'],
                desc: 'Categories Management: You can create, edit, and delete categories. After creating a category, you are able to assign it to products.'
            },
            {
                name: 'User Addresses',
                images: ['9.jpg'],
                desc: 'User Addresses: User addresses are required to integrate Stripe payment. On these addresses, we can validate the users accounts and send them commissions according to their rates.'
            },
            {
                name: 'Smart site',
                images: ['10.jpg', '11.jpg'],
                desc: 'There, you can browse through different products like clothes, electronics, or anything else they sell. When you find something you like, you can add it to your virtual cart. Once you are done shopping, you go to the checkout, where you pay for your items.'
            },
            {
                name: 'Smart site',
                images: ['12.jpg'],
                desc: 'Cart and Checkout: You can figure out your shipping charges based on the product weights and your location. Payment can be made using a Stripe account.'
            },
        ]
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

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
