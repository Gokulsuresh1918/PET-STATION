const mongoose = require('mongoose')


const categoryschema = new mongoose.Schema({
    category: {
        categoryname: {
            type: String,
            required: true
        },
        subcategory: {
            type: String,
            required: true
        }
    },
    description: {
        type: String,
        required: true

    },

    blockStatus: {
        type: Boolean,
        default: false,
        required: true
    }

});

const categoryCollection = new mongoose.model('categoryCollection', categoryschema)
module.exports = { categoryCollection }