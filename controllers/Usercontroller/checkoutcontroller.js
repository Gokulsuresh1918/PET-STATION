const { productCollection } = require('../../model/productDB')
const { addressCollection } = require('../../model/addressDB')
const { orderCollection } = require('../../model/orderDB')
const { cartCollection } = require('../../model/cartDB')
const { contactCollection } = require('../../model/contactDB')
const Razorpay = require('razorpay');

exports.checkoutget = async (req, res) => {
    try {
        if (req.session.userId) {
            const user = true
            const cartdetails = await cartCollection.find({ userId: req.session.userId })

            const cartcount = cartdetails.length
            const productdetails = await productCollection.find();
            req.session.productData = productdetails
            const addressdetails = await addressCollection.find({ userId: req.session.userId });
            res.render('User/checkout', { cartdetails: cartdetails, productdetails: productdetails, addressdetails: addressdetails, user, cartcount });
        } else {
            const user = false
            res.render('User/checkout', { user })
        }
    } catch (error) {
        console.error("checkoutget  error" + "= " + error);
    }





};

exports.checkoutaddress = async (req, res) => {
    try {
        const addnewaddress = addressCollection({
            userId: req.session.userId,
            name: req.body.name,
            address: req.body.homeaddress,
            district: req.body.district,
            pincode: req.body.pincode,
            phone: req.body.phone,
            email: req.body.email,
            state: req.body.state
        })
        await addnewaddress.save()
        res.redirect('/checkout')
    } catch (error) {
        console.error("checkoutaddress  error" + "= " + error);
    }

}




exports.confirmationget = async (req, res) => {
    try {
        if (req.session.userId) {
            const user = true
            const cartdata = await cartCollection.find({ id: req.session.userId })
            const cartcount = cartdata.length
            res.render('User/confirmation', { user, cartcount })
        } else {
            const user = false
            res.render('User/confirmation', { user })
        }
    } catch (error) {
        console.error("confirmationget  error" + "= " + error);
    }
};



exports.confirmationpost = async (req, res) => {
    try {


        if (!req.body.razorpay_payment_id) {

            const userId = req.session.userId;
            const productDetails = req.body.orderDetails;
            const orderNumber = generateOrderNumber();
            const total = calculateTotal(productDetails);
            const address = await addressCollection.findById(req.body.addressid) 

            console.log(req.body);
            const newOrder = new orderCollection({
                userId,
                productdetails: productDetails,
                Ordernumber: orderNumber,
                total,
                address,
            });

            await newOrder.save();
            res.status(200).json({ success: true, message: 'Order placed successfully!' });
        } else {
            var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET })

            let data = await instance.payments.fetch(req.body.razorpay_payment_id)
            const userId = req.session.userId;
            const orderNumber = generateOrderNumber();
            const cartDetails = await cartCollection.findOne({ userId: userId })
            const address = await addressCollection.findById(data.notes.address) 
            const productDetails = cartDetails.products.map(product => ({
                productId: product.productId,
                quantity: product.quantity,
                uniquePriceTotal: Number(product.price) * Number(product.quantity)
              }));
              
            const total = productDetails.reduce((acc, product) => acc + product.uniquePriceTotal, 0);
            const newOrder = new orderCollection({
                userId: userId,
                productdetails: productDetails,
                Ordernumber: orderNumber,
                total: total,
                address: address
            });


            await newOrder.save();
            return res.redirect('/confirmation')
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error ' });
    }
};

function generateOrderNumber() {
    return 'ORD' + Date.now();
}
function calculateTotal(productDetails) {
    return productDetails.reduce((total, product) => total + parseFloat(product.uniquePriceTotal), 0).toString();
}





exports.addressremove = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const result = await addressCollection.deleteOne({ id: addressId });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Address removed successfully' });
        } else {
            res.status(404).json({ error: 'Address not found' });
        }
    } catch (error) {
        console.error('Error removing address:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



exports.razorpaypost = (req, res) => {


    try {

        var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET })

        let options = {
            amount: 50000,
            currency: "INR",
            receipt: "order_rcptid_11",
            notes: {
                key1: "value3",
                key2: "value2"
            }
        }
        // Creating the order
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.error(err);
                res.status(500).send("Error creating order");
                return;
            }

            console.log(order);
            // Add orderprice to the response object
            res.send({ orderId: order.id });


        });
    } catch (error) {
        console.error("Razorpay post error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

};

