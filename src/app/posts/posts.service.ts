import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private posts: Post[] = [];
    private postsChanged = new Subject<{ posts: Post[], totalPosts: number }>();
    url = 'http://localhost:3000/api/posts';

    constructor(private http: HttpClient,
        private router: Router) {}

    getPosts(postsPerPage: number, currentPage: number) {
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        return this.http.get<{ message:string, posts: any, totalPosts: number }>(this.url + queryParams)
            .pipe(map((postData) => {
                return { 
                    posts: postData.posts.map(post => {
                        return {
                            title: post.title,
                            content: post.content,
                            id: post._id,
                            imagePath: post.imagePath
                        };
                    }),
                    totalPosts: postData.totalPosts 
                };
            }))
            .subscribe((transformedPostsData) => {
                this.posts = transformedPostsData.posts;
                this.postsChanged.next(
                    { 
                        posts: [...this.posts], 
                        totalPosts: transformedPostsData.totalPosts 
                    });
            });
    }

    getPost(id: string) {
        return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(this.url + '/' + id);
    }

    getPostUpdateListener() {
        return this.postsChanged.asObservable();
    }

    addPost(post: Post, image: File) {
        const postData = new FormData();

        postData.append("title", post.title);
        postData.append("content", post.content);
        postData.append("image", image, post.title);

        this.http.post<{ message: string, post: Post }>(this.url, postData)
            .subscribe(() => {
                this.router.navigate(['/']);
            });
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        let postData: Post | FormData;
        if (typeof(image) === 'object') {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        } else {
            postData = { id: id, title: title, content: content, imagePath: image};
        }

        this.http.put(this.url + '/' + id, postData)
            .subscribe(() => {
                this.router.navigate(['/']);
            });
    }

    deletePost(id: string) {
        return this.http.delete(this.url + '/' + id);
    }
}