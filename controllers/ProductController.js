const Product = require("../models/Product")
const Newsletter = require("../models/Newsletter")
const mailer = require("../helpers/mail")
const jwt = require("jsonwebtoken")

const fs = require("fs")

async function createRecord(req, res) {
    try {
        let data = new Product(req.body)
        if (req.files) {
            data.pic = Array.from(req.files).map((item) => item.path)
        }
        await data.save()

        let finalData = await Product.findOne({ _id: data._id })
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])
            .populate("brand", ["name"])


        let newsletters = await Newsletter.find({ active: true })
        newsletters.forEach((x) => {
            mailer.sendMail({
                from: process.env.MAIL_SENDER,
                to: x.email,
                subject: `Checkout Our Latest Product and get ${data.discount}% Off : Team Dcart`,
                text: `
                            Checkout Our Latest Product and get ${data.discount}% Off
                            Click Here to Checkout ${process.env.FRONT_END_URL}/product/${data._id}
                            Click Here to Track ${process.env.FRONT_END_URL}/profile
                            Team : Dcart
                        `
            }, (error) => {
                if (error)
                    console.log(error)
            })
        })
        res.send({ result: "Done", data: finalData })
    } catch (error) {
        console.log(error)
        let errorMessage = {}
        error.errors?.name ? errorMessage['name'] = error.errors?.name?.message : null
        error.errors?.maincategory ? errorMessage['maincategory'] = error.errors?.maincategory?.message : null
        error.errors?.subcategory ? errorMessage['subcategory'] = error.errors?.subcategory?.message : null
        error.errors?.brand ? errorMessage['brand'] = error.errors?.brand?.message : null
        error.errors?.color ? errorMessage['color'] = error.errors?.color?.message : null
        error.errors?.size ? errorMessage['size'] = error.errors?.size?.message : null
        error.errors?.basePrice ? errorMessage['basePrice'] = error.errors?.basePrice?.message : null
        error.errors?.discount ? errorMessage['discount'] = error.errors?.discount?.message : null
        error.errors?.finalPrice ? errorMessage['finalPrice'] = error.errors?.finalPrice?.message : null
        error.errors?.stockQuantity ? errorMessage['stockQuantity'] = error.errors?.stockQuantity?.message : null
        error.errors?.pic ? errorMessage['pic'] = error.errors?.pic?.message : null

        try {
            Array.from(req.files).forEach((x) => {
                fs.unlinkSync(x.path)
            })
        } catch (error) { }

        Object.values(errorMessage).length == 0 ?
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" }) :
            res.send({ result: "Fail", reason: errorMessage })
    }
}

async function getRecord(req, res) {
    try {
        let data = await Product.find().sort({ _id: -1 })
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])
            .populate("brand", ["name"])
        res.send({ result: "Done", count: data.length, data: data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Product.findOne({ _id: req.params._id })
            .populate("maincategory", ["name"])
            .populate("subcategory", ["name"])
            .populate("brand", ["name"])

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
        let data = await Product.findOne({ _id: req.params._id })
        if (data) {
            try {
                jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY_BUYER)
                data.stock = req.body.stock ?? data.stock
                data.stockQuantity = req.body.stockQuantity ?? data.stockQuantity
            } catch (error) {
                data.name = req.body.name ?? data.name
                data.maincategory = req.body.maincategory ?? data.maincategory
                data.subcategory = req.body.subcategory ?? data.subcategory
                data.brand = req.body.brand ?? data.brand
                data.color = req.body.color ?? data.color
                data.size = req.body.size ?? data.size
                data.basePrice = req.body.basePrice ?? data.basePrice
                data.discount = req.body.discount ?? data.discount
                data.finalPrice = req.body.finalPrice ?? data.finalPrice
                data.stock = req.body.stock ?? data.stock
                data.stockQuantity = req.body.stockQuantity ?? data.stockQuantity
                data.description = req.body.description ?? data.description
                data.active = req.body.active ?? data.active
                // console.log(req.body)
                if (await data.save() && req.files) {
                    let oldPics = req.body.oldPics.split(",")
                    data.pic.forEach((x) => {
                        if (!oldPics.includes(x)) {
                            try {
                                fs.unlinkSync(x)
                            } catch (error) { }
                        }
                    })
                    data.pic = oldPics.concat(Array.from(req.files).map((item) => item.path))
                    await data.save()
                }
            }

            let finalData = await Product.findOne({ _id: data._id })
                .populate("maincategory", ["name"])
                .populate("subcategory", ["name"])
                .populate("brand", ["name"])
            res.send({ result: "Done", data: finalData })
        }
        else
            res.status(404).send({ result: "Fail", reason: "Record Not Found" })
    } catch (error) {
        console.log(error)
        try {
            fs.unlinkSync(req.file.path)
        } catch (error) { }

        error.keyValue ?
            res.send({ result: "Fail", reason: "Product Name is Already Exist" }) :
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Product.findOne({ _id: req.params._id })
        if (data) {
            data.pic.forEach((x) => {
                try {
                    fs.unlinkSync(x)
                } catch (error) { }
            })
            await data.deleteOne()
            res.send({ result: "Done", message: "Record Has Been Deleted" })
        }
        else
            res.status(404).send({ result: "Fail", reason: "Record Not Found" })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}
module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}