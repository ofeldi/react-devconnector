const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Validator = require('validator');

const Post = require('../../models/post');
const validatePostInput = require('../../validation/post.js');
const Profile = require('../../models/Profile');

// @route GET api/posts/test
// @desc Tests posts route
// @access Public


router.get('/test', (req, res) => {
    res.json({
        msg: "Posts works"
    })
});


// @route POST api/posts/
// @desc create a post
// @access Private


router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log(req.body)
    const {errors, isValid} = validatePostInput(req.body);
//check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }


    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });
    newPost.save().then(post => res.json(post))

});


// @route GET api/posts/
// @desc get posts
// @access Public

router.get('/', (req, res) => {

    Post.find()
        .sort({date: -1})
        .then(posts => {
            if (posts.length != 0) {
                res.json(posts)
            } else {
                res.status(404).json({msg: 'no posts were found'})
            }
            ;console.log(posts)
        })
        .catch(err => res.status(404))
});


// @route GET api/posts/:id
// @desc get post by id
// @access Public


router.get('/:id', (req, res) => {

    Post.findById(req.params.id)
        .then(post => {
            if (!post) {
                res.status(404).json({msg: 'no post was found'})
            } else {
                res.json(post)
            }
        })
        .catch(err => res.status(404).json({msg: 'no post was found'}))
});


// @route DELETE api/posts/:id
// @desc delete post by id
// @access private


router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {

    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({unauthorized: "User is not allowed to delete this post"})
                    }
                    //Delete
                    post.remove().then(() => res.json({success: `post ${req.params.id} was deleted`}));
                })
                .catch(err => res.status(404).json({msg: 'Post was not found'}))
        })
});


// @route POST api/posts/like/:id
// @desc Like post
// @access private


router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id}).then(profile => {
        Post.findById(req.params.id)
            .then(post => {
                if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                    return res.status(400).json({msg: 'You already liked this post'})
                }
                //Add the user id to the likes array
                post.likes.unshift({user: req.user.id});
                post.save().then(post => res.json({success: true, post}))
            })
            .catch(err => res.status(404).json({msg: 'The post was not found'}))
    })
});


// @route POST api/posts/unlike/:id
// @desc Like post
// @access private


router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id}).then(profile => {
        Post.findById(req.params.id)
            .then(post => {
                if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                    return res.status(400).json({error: 'The user never liked this post'});
                }
                //Remove the like from the likes array
                const removeIndex = post.likes
                    .map(item => item.user.toString())
                    .indexOf(req.user.id);

                //Splice
                post.likes.splice(removeIndex,1);
                post.save().then(post => res.json({success: true, post}))
            })
            .catch(err => res.status(404).json({msg: 'The post was not found'}))
    })
});




// @route POST api/post/comment/:id
// @desc Add comment
// @access private

router.post('/comment/:id',passport.authenticate('jwt', {session:false}),(req,res) =>{

    const {errors, isValid} = validatePostInput(req.body);
//check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then((post) =>{
            const newComment = {
                text:req.body.text,
                name:req.user.name,
                avatar:req.body.avatar,
                user:req.user.id
            }
            // Add to comments array
            post.comments.unshift(newComment);
            //Save
            post.save().then(post => res.json(post))
                .catch(err => res.status(404).json({err:'Post was not found'}))
        })
});




// @route DELETE api/post/comment/:id/:comment_id
// @desc Delete comment from post
// @access private

router.delete('/comment/:id/:comment_id',passport.authenticate('jwt', {session:false}),(req,res) =>{

    const {errors, isValid} = validatePostInput(req.body);
//check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
        .then((post) =>{
            //Check if the comment exists
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
                return res.status(404).json({commentdoenotexist:'Invalid comment id'});
            }

            // Remove the comment
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);
            //Splice
            post.comments.splice(removeIndex,1);

            //Save
            post.save().then(post => res.json({success: true, post}))
                .catch(err => res.status(404).json({err:'Post was not found'}))
        })
});



module.exports = router;