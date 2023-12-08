const mongoose=require('mongoose');
const couponSchema=new mongoose.Schema({
    code:{
        type:String,
        unique:true,
        required:true,
    },
    type:{
        type:String,
        enum:['percentage','fixed'],
        required:true,
    
    },
    discount:{
    type:Number,
    required:true,
    },
    quantity:{
        type:Number,
        required:true,
    
    },
    expiryDate:{
        type:Date,
        required:true,
    },
    
});
const Coupon=mongoose.model('Coupon',couponSchema);
module.exports=Coupon;