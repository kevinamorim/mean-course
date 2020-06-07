import { Component, EventEmitter, Output, OnInit } from "@angular/core";
import { Post } from '../post.model';
import { NgForm } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

    paramsSub: Subscription;

    private editMode = false;
    private postId: string;
    post: Post;
    isLoading = false;

    constructor(private postsService: PostsService, 
        private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.paramsSub = this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('id')) {
                this.editMode = true;
                this.postId = paramMap.get('id');
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe(post => {
                    this.isLoading = false;
                    this.post = { id: post._id, title: post.title, content: post.content };
                });
            } else {
                this.editMode = false;
                this.postId = null;
                this.post = null;
            }
        });
    }

    onSavePost(form: NgForm) {
        if (!form.valid) {
            return;
        }

        this.isLoading = true;
        if (this.editMode) {
            const post = new Post(null, form.value.title, form.value.content);
            this.postsService.updatePost(this.postId, post);
        } else {
            const post = new Post(null, form.value.title, form.value.content);
            this.postsService.addPost(post);
        }
        
        form.resetForm();      
    }

}