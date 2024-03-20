import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, retry, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    // Private
    /**
     * Constructor
     */
    private _single_product: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);
    private _allVendors: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

    constructor(private _httpClient: HttpClient,
        private _authService: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get Product$(): Observable<any[]> {
        return this._single_product.asObservable();
    };
    get Categories$(): Observable<any[]> {
        return this._allVendors.asObservable();
    };
    // =
    getProductById(id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.shopifyURL, {
            params: {
                id: id,
                list: true
            }
        }).pipe(
            tap((response: any) => {
                this._single_product.next(response);
            })
        );
    };
    getCallsStore(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeUrl, {
            params: params
        }).pipe(retry(3));
    };
    getCallsBestBuy(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.bestBuyProducts, {
            params: params
        }).pipe(retry(3));
    };
    getCalls(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.shopifyURL, {
            params: params
        }).pipe(retry(3));
    };
    postCalls(payload) {
        return this._httpClient.post(
            environment.shopifyURL, payload);
    };
    putCalls(payload) {
        return this._httpClient.put(
            environment.shopifyURL, payload);
    };
    deleteCalls(payload) {
        return this._httpClient.delete(
            environment.shopifyURL, { body: payload });
    };
    postProductCalls(payload) {
        return this._httpClient.post(
            environment.productUrl, payload);
    };
    getAllVendors(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.categoryUrl, {
            params: {
                list: true,
                drop_down: true,
                is_child: true
            }
        }).pipe(
            tap((response: any) => {
                this._allVendors.next(response);
            })
        );
    };
}
