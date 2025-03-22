const fs = require("fs")
const passwordValidator = require('password-validator')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const mailer = require("../helpers/mail")

const User = require("../models/User")

var schema = new passwordValidator();

// Add properties to it
schema
    .is().min(8)
    .is().max(100)
    .has().uppercase(1)
    .has().lowercase(1)
    .has().digits(1)
    .has().not().spaces()
    .is().not().oneOf(['Passw0rd', 'Password123']);

async function createRecord(req, res) {
    if (schema.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 12, async (error, hash) => {
            if (error)
                res.status(500).send({ result: "Fail", reason: "Internal Server Error During Creatig Has Password" })
            else {
                try {
                    let data = new User(req.body)
                    if (req.headers.authorization)
                        data.role = req.body.role
                    else
                        data.role = "Buyer"
                    data.password = hash
                    await data.save()

                    mailer.sendMail({
                        from: process.env.MAIL_SENDER,
                        to: data.email,
                        subject: "Account Has Been Created  : Team Dcart",
                        text: `
                                    Account Has Been Created 
                                    Hello ${data.name},
                                    Your Account Has Been Created,
                                    Now You Can Checkout Our Products of Top Brands and Get Discount Upto 90%
                                    Team : Dcart
                                `
                    }, (error) => {
                        if (error)
                            console.log(error)
                    })
                    res.send({ result: "Done", data: data })
                } catch (error) {
                    console.log(error)
                    let errorMessage = {}
                    error.keyValue?.username ? errorMessage['username'] = "User Name is Already Taken" : null
                    error.keyValue?.email ? errorMessage['email'] = "Email Address is Already Registered" : null
                    error.errors?.name ? errorMessage['name'] = error.errors?.name?.message : null
                    error.errors?.email ? errorMessage['email'] = error.errors?.email?.message : null
                    error.errors?.username ? errorMessage['username'] = error.errors?.username?.message : null
                    error.errors?.phone ? errorMessage['phone'] = error.errors?.phone?.message : null
                    error.errors?.password ? errorMessage['password'] = error.errors?.password?.message : null

                    Object.values(errorMessage).length == 0 ?
                        res.status(500).send({ result: "Fail", reason: "Internal Server Error" }) :
                        res.send({ result: "Fail", reason: errorMessage })
                }
            }
        })
    }
    else
        res.send({ result: "Fail", reason: "Invalid Password. It Must Contains Atleas 1 Upper Case Chracter, 1 Lower Case Character, 1 Digit, Should Not User Space and Length Must be 8-100" })
}

async function getRecord(req, res) {
    try {
        let data = await User.find().sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data: data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data)
            res.send({ result: "Done", data: data })
        else
            res.status(404).send({ result: "Fail", reason: "Record Not Found" })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.username = req.body.username ?? data.username
            data.email = req.body.email ?? data.email
            data.phone = req.body.phone ?? data.phone
            data.address = req.body.address ?? data.address
            data.pin = req.body.pin ?? data.pin
            data.city = req.body.city ?? data.city
            data.state = req.body.state ?? data.state
            data.active = req.body.active ?? data.active
            if (req.headers.authorization)
                data.role = req.body.role ?? data.role

            if (await data.save() && req.file) {
                try {
                    fs.unlinkSync(data.pic)
                } catch (error) {
                    // console.log("Error", error)
                }
                data.pic = req.file.path
                await data.save()
            }
            res.send({ result: "Done", data: data })
        }
        else
            res.status(404).send({ result: "Fail", reason: "Record Not Found" })
    } catch (error) {
        let errorMessage = {}
        error.keyValue?.username ? errorMessage['username'] = "User Name is Already Taken" : null
        error.keyValue?.email ? errorMessage['email'] = "Email Address is Already Registered" : null

        Object.values(errorMessage).length == 0 ?
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" }) :
            res.send({ result: "Fail", reason: errorMessage })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            try {
                fs.unlinkSync(data.pic)
            } catch (error) { }
            await data.deleteOne()
            res.send({ result: "Done", message: "Record Has Been Deleted" })
        }
        else
            res.status(404).send({ result: "Fail", reason: "Record Not Found" })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function login(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username }
            ]
        })
        if (data) {
            if (await bcrypt.compare(req.body.password, data.password)) {
                let key = data.role === 'Buyer' ? process.env.JWT_SECRET_KEY_BUYER : process.env.JWT_SECRET_KEY_ADMIN
                jwt.sign({ data }, key, { expiresIn: "15 days" }, (error, token) => {
                    if (error)
                        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
                    else
                        res.send({ result: "Done", data: data, token: token })
                })
            }
            else
                res.status(404).send({ result: "Fail", reason: "Invalid Username or Password" })
        }
        else
            res.status(404).send({ result: "Fail", reason: "Invalid Username or Password" })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function forgetPassword1(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username }
            ]
        })
        if (data) {
            let diff = (new Date() - data.otpTime) / (1000 * 60 * 60)
            if (diff < 24 && data.otpCounter === 5)
                res.status(404).send({ result: "Fail", reason: "Maximum OTP Request Limit Exceed. Please Try After 24 Hours" })
            else {
                let otp = Number(parseInt(Math.random() * 10000000000000 % 1000000).toString().padEnd(6, "1"))
                data.otp = otp
                data.otpTime = new Date()
                data.otpCounter = data.otpCounter ? data.otpCounter + 1 : 1
                await data.save()
                res.send({ result: "Done", message: "OTP Has Been Sent On Your Registered Email Address" })

                mailer.sendMail({
                    from: process.env.MAIL_SENDER,
                    to: data.email,
                    subject: "OTP for Password Reset : Team Dcart",
                    text: `
                            Hello ${data.name},
                            OTP for Password Reset of ${otp}
                            OTP Valid for 5 Minutes Only
                            Please Never Share OTPs With Anyone
                            Team : Dcart
                        `
                }, (error) => {
                    if (error)
                        console.log(error)
                })
            }
        }
        else
            res.status(404).send({ result: "Fail", reason: "User Not Found" })
    } catch (error) {
        console.log(error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}


async function forgetPassword2(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username }
            ]
        })
        if (data) {
            let diff = (new Date() - data.otpTime) / 1000
            console.log(diff)
            if (diff > 300)
                res.send({ result: "Fail", reason: "OTP Has Been Expired. Please Try Again" })
            else if (data.otp == req.body.otp)
                res.send({ result: "Done" })
            else
                res.status(404).send({ result: "Fail", reason: "Invalid OTP" })
        }
        else
            res.status(404).send({ result: "Fail", reason: "UnAuthroized Activity" })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function forgetPassword3(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username }
            ]
        })
        if (data) {
            if (schema.validate(req.body.password)) {
                bcrypt.hash(req.body.password, 12, async (error, hash) => {
                    if (error)
                        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
                    else {
                        data.password = hash
                        await data.save()
                        res.send({ result: "Done", reason: "Password Has Been Reset" })
                    }
                })
            }
            else
                res.send({ result: "Fail", reason: "Invalid Password. It Must Contains Atleas 1 Upper Case Chracter, 1 Lower Case Character, 1 Digit, Should Not User Space and Length Must be 8-100" })
        }
        else
            res.status(404).send({ result: "Fail", reason: "UnAuthroized Activity" })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    login: login,
    forgetPassword1: forgetPassword1,
    forgetPassword2: forgetPassword2,
    forgetPassword3: forgetPassword3
}