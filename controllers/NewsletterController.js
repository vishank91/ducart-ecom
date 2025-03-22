const Newsletter = require("../models/Newsletter")
const mailer = require("../helpers/mail")
async function createRecord(req, res) {
    try {
        let data = new Newsletter(req.body)
        await data.save()
        mailer.sendMail({
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: "Newsletter Subscribbed SuccessFully : Team Dcart",
            text: `
                        Newsletter Subscribbed SuccessFully
                        Team : Dcart
                    `
        }, (error) => {
            if (error)
                console.log(error)
        })
        res.send({ result: "Done", data: data, message: "Thanks to Subscribe Our Newsletter Service" })
    } catch (error) {
        // console.log(error)
        let errorMessage = {}
        error.keyValue ? errorMessage['email'] = "Your Email Address is Already Registered" : null
        error.errors?.email ? errorMessage['email'] = error.errors?.email?.message : null


        Object.values(errorMessage).length == 0 ?
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" }) :
            res.send({ result: "Fail", reason: errorMessage })
    }
}

async function getRecord(req, res) {
    try {
        let data = await Newsletter.find({ user: req.body.userid }).sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data: data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Newsletter.findOne({ _id: req.params._id })
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
        let data = await Newsletter.findOne({ _id: req.params._id })
        if (data) {
            data.active = req.body.active ?? data.active
            await data.save()
            res.send({ result: "Done", data: data })
        }
        else
            res.status(404).send({ result: "Fail", reason: "Record Not Found" })
    } catch (error) {
        // console.log(error)
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Newsletter.findOne({ _id: req.params._id })
        if (data) {
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