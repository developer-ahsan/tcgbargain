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
    // =
    getProductById(id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.productUrl, {
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
    getCalls(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.productUrl, {
            params: params
        }).pipe(retry(3));
    };
    postCalls(payload) {
        return this._httpClient.post(
            environment.productUrl, payload);
    };
    putCalls(payload) {
        return this._httpClient.put(
            environment.productUrl, payload);
    };
    deleteCalls(payload) {
        return this._httpClient.delete(
            environment.productUrl, { body: payload });
    };
}
