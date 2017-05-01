let mongoose = require('mongoose');
let config = require('../config');

module.exports = function (wagner) {
    //'mongodb://localhost:27017/test'
    //config.database.host + config.database.port +'/' + config.database.dbname;
    mongoose.connect(config.database.host + config.database.port +'/' + config.database.dbname);

    let models = {
        Category: mongoose.model('Category', require('./category'), 'categories'),
        Product: mongoose.model('Product', require('./product'), 'products'),
        User: mongoose.model('User', require('./user'), 'users')
    };


    Object.keys(models).forEach(function(key){
         wagner.factory(key, function () {
            return models[key];
        });
	});

    return models;
};