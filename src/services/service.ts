// src/app/services/dummy-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root', 
})
export class Service {
  private apiUrl = 'https://dummyapi.io/data/v1/'; 
  private appId = '64b53aa7c89880a234d2af51'; 

  constructor(private http: HttpClient) {}

 
  getUsers(page: number = 0, limit: number = 20, created: boolean = false): Observable<any> {
    
    const headers = new HttpHeaders().set('app-id', this.appId);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (created) {
      params = params.set('created', '1'); 
    }

    return this.http.get<any>(`${this.apiUrl}user`, { headers, params });
  }
  createUser(userData: any): Observable<any> {
    const headers = new HttpHeaders().set('app-id', this.appId);
    return this.http.post<any>(`${this.apiUrl}user/create`, userData, { headers });
  }
  

  // Atualizar um post existente
  updateUser(userId: string, userData: any): Observable<any> {
    const headers = new HttpHeaders().set('app-id', this.appId);
    return this.http.put<any>(`${this.apiUrl}user/${userId}`, userData, { headers });
  }

  // Deletar um usuario
  deleteUser(userId: string): Observable<any> {
    const headers = new HttpHeaders().set('app-id', this.appId);
    return this.http.delete<any>(`${this.apiUrl}user/${userId}`, { headers });
  }
}
