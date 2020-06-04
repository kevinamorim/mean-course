import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsChanged = new Subject<Post[]>();
    url = 'http://localhost:3000/api/posts';

    constructor(private http: HttpClient) {}

    getPosts() {
        return this.http.get<{ message:string, posts: Post[] }>(this.url)
            .subscribe((postData) => {
                this.posts = postData.posts;
                this.postsChanged.next([...this.posts]);
            });
    }

    getPostUpdateListener() {
        return this.postsChanged.asObservable();
    }

    addPost(post: Post) {
        this.http.post<{ message: string }>(this.url, post)
            .subscribe((responseData) => {
                console.log('done');
                console.log(responseData);
                this.posts.push(post);
                this.postsChanged.next([...this.posts]);
            });
    }
}