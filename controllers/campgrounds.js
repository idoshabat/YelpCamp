const Campground = require('../models/campground');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose;


module.exports.index= async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.showCampground =async (req, res) => {
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
};

module.exports.renderEditForm = async (req, res) => {
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
}

module.exports.createCampground = async (req, res, next) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`campgrounds/${newCampground._id}`)
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "You don't have a permission to do that")
        return res.redirect(`/campgrounds/${id}`)
    }
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true })
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground =async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
};