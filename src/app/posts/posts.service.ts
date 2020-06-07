import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsChanged = new Subject<Post[]>();
    url = 'http://localhost:3000/api/posts';

    constructor(private http: HttpClient,
        private router: Router) {}

    getPosts() {
        return this.http.get<{ message:string, posts: any }>(this.url)
            .pipe(map((postData) => {
                return postData.posts.map(post => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id
                    };
                });
            }))
            .subscribe((transformedPosts) => {
                this.posts = transformedPosts;
                this.postsChanged.next([...this.posts]);
            });
    }

    getPost(id: string) {
        return this.http.get<{ _id: string, title: string, content: string }>(this.url + '/' + id);
    }

    getPostUpdateListener() {
        return this.postsChanged.asObservable();
    }

    addPost(post: Post) {
        this.http.post<{ message: string, id: string }>(this.url, post)
            .subscribe((responseData) => {
                post.id = responseData.id;
                this.posts.push(post);
                this.postsChanged.next([...this.posts]);
                this.router.navigate(['/']);
            });
    }

    updatePost(id: string, postData: Post) {
        const post: Post = { id: id, title: postData.title, content: postData.content};
        this.http.put(this.url + '/' + id, post)
            .subscribe(res => {
                const updatedPosts = [...this.posts];
                const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
                updatedPosts[oldPostIndex] = post;
                this.posts = updatedPosts;
                this.postsChanged.next([...this.posts]);
                this.router.navigate(['/']);
            });
    }

    deletePost(id: string) {
        this.http.delete(this.url + '/' + id)
            .subscribe(() => {
                const updatedPosts = this.posts.filter(post => post.id !== id);
                this.posts = updatedPosts;
                this.postsChanged.next([...this.posts]);
            });
    }
}