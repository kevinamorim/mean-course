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
                        id: post._id,
                        imagePath: post.imagePath
                    };
                });
            }))
            .subscribe((transformedPosts) => {
                this.posts = transformedPosts;
                this.postsChanged.next([...this.posts]);
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
            .subscribe((responseData) => {
                post.id = responseData.post.id;
                this.posts.push(post);
                this.postsChanged.next([...this.posts]);
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
            .subscribe(res => {
                const updatedPosts = [...this.posts];
                const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
                const post: Post = {
                    id: id,
                    title: title,
                    content: content,
                    imagePath: ''
                };
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