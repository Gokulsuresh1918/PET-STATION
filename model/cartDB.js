const mongoose = require('mongoose')


const cartschema = new mongoose.Schema({
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
   },
   products:[{
      quantity:{
         type: Number,
         required: true
      },
      productId:{
         type:mongoose.Schema.Types.ObjectId,
         required:true
      },
      price:{
         type:Number,
         required:true
      }

   }],
 
   subtotal:{
      type: Number,
      required: true
   }
});

const cartCollection = new mongoose.model('cartCollection', cartschema)
module.exports = { cartCollection }