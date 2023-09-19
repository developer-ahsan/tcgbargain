import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, retry, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class StoresService {
    // Private
    /**
     * Constructor
     */
    private _single_store: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

    constructor(private _httpClient: HttpClient,
        private _authService: AuthService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    get Store$(): Observable<any[]> {
        return this._single_store.asObservable();
    };
    // =
    getStoreById(id): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeUrl, {
            params: {
                id: id,
                list: true
            }
        }).pipe(
            tap((response: any) => {
                this._single_store.next(response);
            })
        );
    };
    getStoreProductCalls(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeProductUrl, {
            params: params
        }).pipe(retry(3));
    };
    getCalls(params): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.storeUrl, {
            params: params
        }).pipe(retry(3));
    };
    postCalls(payload) {
        return this._httpClient.post(
            environment.storeUrl, payload);
    };
    putCalls(payload) {
        return this._httpClient.put(
            environment.storeUrl, payload);
    };
    deleteCalls(payload) {
        return this._httpClient.delete(
            environment.storeUrl, { body: payload });
    };
}
