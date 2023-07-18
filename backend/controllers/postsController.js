const asyncHandler = require("express-async-handler");
const Post = require("../model/postsModel");
const Comment = require('../model/commentModel')
// const {cloudinary} = require("../utils/cloudinary")

const getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find();
    if (posts) {
        res.status(200).json(posts)
    }
    else {
        res.status(404)
        throw new Error("Can't find any Posts")
    }
});


const getPost = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(404)
        throw new Error("Can't find any Post")
    }
    const post = await Post.findById(id);
    res.status(200).json(post)
});



const getPostsUser = asyncHandler(async (req, res) => {
    if (!req.id) {
        res.status(404)
        throw new Error("Can't find any Post")
    }
    const id = req.id;
    const posts = await Post.find({ id });
    res.status(200).json(posts)
});



const createPost = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    if (!title, !content) {
        res.status(400);
        throw new Error("invalid request. All fields required");
    }
    const userId = req.user._id;
    const images = req.body.images ? req.body.images : [];

    const date = new Date().toISOString();

    const post = await Post.create({
        title, content, images, addedDate: date, userId
    });
    res.status(200).json(post);
    console.log("Post ", post)

});

const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (!post) {
        res.status(404)
        throw new Error("Post not found")
    }
    await Post.deleteOne();
    res.json(post).status(200);
})

const updatePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (!post) {
        res.status(404)
        throw new Error("comment not found")
    }
    const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    res.status(400).json(updatedPost)
})


const likePost = asyncHandler(async (req, res) => {
    if (!req.params.id) {
        res.status(400)
        throw new Error("Bad Request, can't find any comment with the give ID")
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404)
        throw new Error("comment not found")
    }
    const user = req.user.id;
    console.log(user)
    const likesArray = post.likes;
    if (likesArray.includes(user)) {
        const index = likesArray.indexOf(user);
        likesArray.splice(index, 1);
    }
    else {
        likesArray.push(user);
    }
    const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { likes: likesArray },
        { new: true }
    );
    res.status(200).json({ likes: likesArray.length, post: updatedPost })
});

const addComment = asyncHandler(async (req, res) => {
    const { content, postId } = req.body;
    if (!content || !postId) {
        res.status(400)
        throw new Error("Bad Request, can't find any comment with the give ID")
    }
    const post = await Post.findById(postId);
    if (!post) {
        res.status(404)
        throw new Error("post not found")
    }
    const userId = req.user.id;
    const date = new Date().toISOString();
    const comment = await Comment.create({
        content,
        postId,
        addedDate: date,
        userId
    });
    const comments = post.comments;
    comments.push(comment._id);
    const updatedPost = await Post.findByIdAndUpdate(userId, {
        comments: comments
    },
        { new: true })
    res.status(201).json({ message: "Comment Created successfully!", comment })
})

module.exports = { getPosts, getPost, getPostsUser, createPost, deletePost, updatePost, likePost,addComment }