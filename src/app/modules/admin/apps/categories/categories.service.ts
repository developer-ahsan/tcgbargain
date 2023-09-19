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
    private _single_category: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

    constructor(private _httpClient: HttpClient,
        private _authService: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get Category$(): Observable<any[]> {
        return this._single_category.asObservable();
    };
    // =
    getCategoryById(id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.categoryUrl, {
            params: {
                id: id,
                list: true
            }
        }).pipe(
            tap((response: any) => {
                this._single_category.next(response);
            })
        );
    };
    getCalls(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.categoryUrl, {
            params: params
        }).pipe(retry(3));
    };
    postCalls(payload) {
        return this._httpClient.post(
            environment.categoryUrl, payload);
    };
    putCalls(payload) {
        return this._httpClient.put(
            environment.categoryUrl, payload);
    };
    deleteCalls(payload) {
        return this._httpClient.delete(
            environment.categoryUrl, { body: payload });
    };
    getProductCalls(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.productUrl, {
            params: params
        }).pipe(retry(3));
    };
}
