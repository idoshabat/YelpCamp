const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const {places , descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once("open" , ()=>{
    console.log('Database connected');
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0 ; i<50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 50);
        const camp = new Campground({
            author: '654fd8dde66881e3e3420f6b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Hey there, welcome to our camp!',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/djgnsibhz/image/upload/v1699870233/YelpCamp/nudiuid3z2u6n0igk9kg.jpg',     
                  filename: 'YelpCamp/nudiuid3z2u6n0igk9kg',
                },
                {
                  url: 'https://res.cloudinary.com/djgnsibhz/image/upload/v1699870233/YelpCamp/wreqx2zjrvyebdid8nuz.jpg',     
                  filename: 'YelpCamp/wreqx2zjrvyebdid8nuz',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() =>{
    mongoose.connection.close()
})