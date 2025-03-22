const ContactUs = require("../models/ContactUs")
const mailer = require("../helpers/mail")

async function createRecord(req, res) {
    try {
        let data = new ContactUs(req.body)
        await data.save()
        mailer.sendMail({
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: "Your Query Has Been Received : Team Dcart",
            text: `
                        Hello ${data.name},
                        Your Query Has Been Received
                        Our Team Will Contact You Soon
                        Team : Dcart
                    `
        }, (error) => {
            if (error)
                console.log(error)
        })
        res.send({ result: "Done", data: data })
    } catch (error) {
        // console.log(error)
        let errorMessage = {}
        error.errors?.name ? errorMessage['name'] = error.errors?.name?.message : null
        error.errors?.email ? errorMessage['email'] = error.errors?.email?.message : null
        error.errors?.phone ? errorMessage['phone'] = error.errors?.phone?.message : null
        error.errors?.subject ? errorMessage['subject'] = error.errors?.subject?.message : null
        error.errors?.message ? errorMessage['message'] = error.errors?.message?.message : null

        Object.values(errorMessage).length == 0 ?
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" }) :
            res.send({ result: "Fail", reason: errorMessage })
    }
}

async function getRecord(req, res) {
    try {
        let data = await ContactUs.find({ user: req.body.userid }).sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data: data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await ContactUs.findOne({ _id: req.params._id })
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
        let data = await ContactUs.findOne({ _id: req.params._id })
        if (data) {
            data.active = req.body.active ?? data.active
            await data.save()
            mailer.sendMail({
                from: process.env.MAIL_SENDER,
                to: data.email,
                subject: "Your Query Has Been Resolved : Team Dcart",
                text: `
                            Hello ${data.name},
                            Your Query Has Been Resolved
                            If You Still Have Any Isse Please Contact Us Again 
                            Team : Dcart
                        `
            }, (error) => {
                if (error)
                    console.log(error)
            })
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
        let data = await ContactUs.findOne({ _id: req.params._id })
        if (data) {
            if (data.active)
                res.send({ result: "Fail", message: "Can't Delete Record. Query is Still Active" })
            else {
                await data.deleteOne()
                res.send({ result: "Done", message: "Record Has Been Deleted" })
            }
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