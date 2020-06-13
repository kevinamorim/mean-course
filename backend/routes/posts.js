const express = require('express');
const multer = require('multer');

const Post = require('../models/post');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid mime type');

        if(isValid) {
            error = null;
        }

        callback(error, 'backend/images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];

        callback(null, name + '-' + Date.now() + '.' + ext);
    }
});

router.post(
    '',
    checkAuth,
    multer({storage: storage}).single("image"),
    (req, res, next) => {

    const url = req.protocol + '://' + req.get('host');
    
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename,
        creator: req.userData.userId
    });

    post.save()
        .then(createdPost => {
            res.status(201).json({
                message: 'Post added with success!',
                post: { 
                    ...createdPost,
                    id: createdPost._id
                }
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Creating a post failed!'
            });
        });
});

router.put('/:id', checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {

    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename
    }

    const post = new Post({
        _id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        router: req.userData.userId
    });

    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
        .then(result => {
            if (result.nModified > 0) {
                res.status(200).json({
                    message: 'Update successful.'
                });
            } else {
                res.status(401).json({
                    message: 'Unauthorized'
                });
            }

        })
        .catch(error => {
            res.status(500).json({
                message: 'Error updating post.'
            });
        });
});

router.get('', (req, res, next) => {

    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;

    const postQuery = Post.find();

    let fetchedPosts;

    if(pageSize && currentPage) {
        postQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }

    postQuery
        .then(documents => {
            fetchedPosts = documents;
            return Post.count();
        })
        .then(count => {
            res.status(200).json({
                message: 'Posts fetched with success!',
                posts: fetchedPosts,
                totalPosts: count
            });
        })
        .catch(error => {
            res.status(500).json(error => {
                message: 'Fetching posts failed.'
            });
        });
});

router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id)
        .then(post => {
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({
                    message: 'Post not found.'
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Could not fetch post.'
            });
        });
});

router.delete('/:id', checkAuth, (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
        .then(result => {
            if (result.n > 0) {
                res.status(200).json({
                    message: 'Delete successful.'
                });
            } else {
                res.status(401).json({
                    message: 'Unauthorized'
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Error deleting post'
            });
        });   
});

module.exports = router;