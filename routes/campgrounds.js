const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose;
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')




router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        req.flash('error', 'Invalid campground ID');
        return res.redirect('/campgrounds');
    }
    const campground = await Campground.findById(id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
        
    console.log(campground);
    if (!campground) {
        req.flash('error', 'Can not find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        req.flash('error', 'Invalid campground ID');
        return res.redirect('/campgrounds');
    }
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Can not find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}))

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`campgrounds/${newCampground._id}`)
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You don't have a permission to do that")
        return res.redirect(`/campgrounds/${id}`)
    }
    // console.log(campground);
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true })
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}))


module.exports = router;