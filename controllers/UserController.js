const { UserCollection } = require('../model/userDB')
const { productCollection } = require('../model/adminproduct')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');


//controller for login get
exports.loginGet = (req, res) => {
    if(!req.session.userId){
        res.render('User/login')
    }else{
           res.redirect('admin/home')
    }
     
};
//controller for login post
exports.loginPost = async (req, res) => { 
    try {
        const check = await UserCollection.findOne({ email: req.body.Email });
        if (check) {
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password)
          
            if (check && check.blockStatus) {
                console.log("acc blocked");
                res.render("User/login",{message:"account Blocked"})
            }
            else if (isPasswordMatch) {
                // session created
                req.session.userId = check._id
                res.redirect('/home')
            } else {
                res.render('User/login',{message:'wrong Credentials'})
            }
        }
    } catch (err) {
        console.error(err);
    }
};



//controller for signup get
exports.signupGet = (req, res) => {
        res.render('User/signup')
    
};




//controller for signup post
exports.signupPost = async (req, res) => {
    data = {
        name: req.body.username,
        email: req.body.email,
        mobile:req.body.mobile,
        password: req.body.password,
    };
    console.log(data);
    const existinguser = await UserCollection.findOne({ email: data.email })
    const existingusermobile = await UserCollection.findOne({mobile:data.mobile})
    if (existinguser) {
        res.render('User/signup',{message:"E mail already exists"})
    }
    if (existingusermobile) {
        res.render('User/signup',{message:"mobile already exists"})
    }
    if (data.password === req.body.confirmpass) {
        //otp generation through e mail
        otp = generateotp()
        console.log(otp);
        const emailText = `  Hi this is from PetStation you just signup 
         Your OTP is: ${otp}`;
        const mailOptions = {
            from: 'petstation2002@gmail.com',
            to: data.email,
            subject: 'OTP Verification',
            text: emailText,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending OTP:', error);
            } else {
                console.log('OTP sent:', info.response);
                res.redirect('/otppage')
            }
        });

        //hashing of pasword and adding to database
        const saltRound = 10;
        const hashedpassword = await bcrypt.hash(data.password, saltRound)
        data.password = hashedpassword
        await UserCollection.insertMany([data])
        res.render('User/otppage')

    } else {
        res.redirect('/admin/signup')
    };
};
// OTP verification
const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail', 'SMTP'
    auth: {
        user: 'petstation2002@gmail.com',
        pass: 'kgbvqcgzldlmeftf',
    },
});
let otp;
let data;
const generateotp = () => {
    return (Math.floor(100000 + Math.random() * 900000)).toString().slice(0, 6);
}





//otp get controller
exports.otpGet = (req, res) => {
    res.render('User/otppage')
};




// Otp Post Router
exports.otppost = async (req, res) => {
    const { digit1, digit2, digit3, digit4, digit5, digit6 } = req.body;
    const userEnteredOTP = digit1 + digit2 + digit3 + digit4 + digit5 + digit6;
    console.log(otp);
    if (userEnteredOTP === otp) {
        await UserCollection.insertMany(data);
        console.log("User registered successfully!!");
        res.render('User/otpsucces') 
    } else {
        res.redirect("/otppage")
    }
};





//controller for home get
exports.homeGet = (req, res) => {
    res.render('User/home')
}
exports.shopget = async(req, res) => {
    const productdata=await productCollection.find()
    res.render('User/shop',{productdata})
}
exports.productView =async (req, res) => {
    const productdata=await productCollection.find()
    res.render('User/productview',{productdata})
}




