import {Injectable} from '@angular/core';
import {ScanCategory} from '../model/ScanMetadata';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {LabelTag} from '../model/LabelTag';

interface AvailableCategoryResponse {
    key: string;
    name: string;
}

@Injectable()
export class CategoryService {
    constructor(private http: HttpClient) {
    }

    getAvailableCategories(): Promise<ScanCategory[]> {
        return new Promise((resolve, reject) => {
            this.http.get<Array<AvailableCategoryResponse>>(environment.API_URL + '/scans/categories').toPromise().then(
                response => {
                    console.log('ScanService | getAvailableCategories | response: ', response);
                    const categories = [];
                    for (const category of response) {
                        categories.push(new ScanCategory(category.key, category.name));
                    }
                    resolve(categories);
                },
                error => {
                    console.log('ScanService | getAvailableCategories | error: ', error);
                    reject(error);
                }
            );
        });
    }
}

