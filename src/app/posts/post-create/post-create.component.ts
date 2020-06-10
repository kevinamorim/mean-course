import { Component, OnInit } from "@angular/core";
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { mimeType } from './mime-type.validator';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

    paramsSub: Subscription;
    post: Post;
    isLoading = false;
    form: FormGroup;
    imagePreview: string;

    private editMode = false;
    private postId: string;

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
                    this.form.setValue({
                        'title': this.post.title,
                        'content': this.post.content
                    });
                });
            } else {
                this.editMode = false;
                this.postId = null;
                this.post = null;
            }
        });

        this.buildForm();
    }

    private buildForm(): void {
        this.form = new FormGroup({
            'title': new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
            'content': new FormControl(null, Validators.required),
            'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
        });
    }

    onSavePost() {
        if (!this.form.valid) {
            return;
        }

        this.isLoading = true;
        if (this.editMode) {
            const post = new Post(null, this.form.value.title, this.form.value.content);
            this.postsService.updatePost(this.postId, post);
        } else {
            const post = new Post(null, this.form.value.title, this.form.value.content);
            this.postsService.addPost(post, this.form.value['image']);
        }
        
        this.form.reset();      
    }

    onPickImage(event: Event) {
        const file = (event.target as HTMLInputElement).files[0];
        this.form.patchValue({
            'image' : file
        });
        this.form.get('image').updateValueAndValidity();
        
        const reader = new FileReader();
        reader.onload = () => { 
            this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
    }

}