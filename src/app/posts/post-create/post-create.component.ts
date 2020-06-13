import { Component, OnInit, OnDestroy } from "@angular/core";
import { Post } from '../post.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { mimeType } from './mime-type.validator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
    selector: 'app-post-create',
    templateUrl: './post-create.component.html',
    styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {

    paramsSub: Subscription;
    post: Post;
    isLoading = false;
    form: FormGroup;
    imagePreview: string;

    private editMode = false;
    private postId: string;
    private authStatusSub: Subscription;

    constructor(private postsService: PostsService, 
        private route: ActivatedRoute,
        private authService: AuthService) {}

    ngOnInit(): void {
        this.buildForm();
        this.authStatusSub = this.authService.getAuthStatusListener()
            .subscribe(() => {
                this.isLoading = false;
            });

        this.paramsSub = this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('id')) {
                this.editMode = true;
                this.postId = paramMap.get('id');
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe(post => {
                    this.isLoading = false;
                    this.post = { id: post._id, title: post.title, content: post.content, imagePath: post.imagePath, creator: post.creator };
                    this.form.setValue({
                        'title': this.post.title,
                        'content': this.post.content,
                        'image': this.post.imagePath
                    });
                });
            } else {
                this.editMode = false;
                this.postId = null;
                this.post = null;
            }
        });
    }

    ngOnDestroy(): void {
        this.authStatusSub.unsubscribe();
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
            this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
        } else {
            const post = new Post(null, this.form.value.title, this.form.value.content, null, null);
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