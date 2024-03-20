// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    resetPasswordUrl: 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?key=AIzaSyC8xoI2Yl_nZlQxsNIJSgZfvC8h4kNkqzM',
    signInAuth: "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyC8xoI2Yl_nZlQxsNIJSgZfvC8h4kNkqzM",
    apiUrl: 'https://sulaim-admin.azurewebsites.net/api',
    userUrl: 'https://sulaim-admin.azurewebsites.net/api/user',
    orderUrl: 'https://sulaim-admin.azurewebsites.net/api/order',
    shopifyURL: 'https://sulaim-admin.azurewebsites.net/api/shopify_import',
    storeUrl: 'https://sulaim-admin.azurewebsites.net/api/store',
    storeProductUrl: 'https://sulaim-admin.azurewebsites.net/api/store_product',
    vendorUrl: 'https://sulaim-admin.azurewebsites.net/api/vendor',
    productUrl: 'https://sulaim-admin.azurewebsites.net/api/product',
    bestBuyProducts: 'https://sulaim-admin.azurewebsites.net/api/best_buy',
    categoryUrl: 'https://sulaim-admin.azurewebsites.net/api/category',
    imgagePathProds: 'https://tgsfiles.blob.core.windows.net/products/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
