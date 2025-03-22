const Brand = require("../models/Brand")
const fs = require("fs")

async function createRecord(req, res) {
    try {
        let data = new Brand(req.body)
        if (req.file) {
            data.pic = req.file.path
        }
        await data.save()
        res.send({ result: "Done", data: data })
    } catch (error) {
        // console.log(error)
        let errorMessage = {}
        error.keyValue ? errorMessage['name'] = "Brand Name is Already Exist" : null
        error.errors?.name ? errorMessage['name'] = error.errors?.name?.message : null
        error.errors?.pic ? errorMessage['pic'] = error.errors?.pic?.message : null

        try {
            fs.unlinkSync(req.file.path)
        } catch (error) { }

        Object.values(errorMessage).length == 0 ?
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" }) :
            res.send({ result: "Fail", reason: errorMessage })
    }
}

async function getRecord(req, res) {
    try {
        let data = await Brand.find().sort({ _id: -1 })
        res.send({ result: "Done", count: data.length, data: data })
    } catch (error) {
        res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Brand.findOne({ _id: req.params._id })
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
        let data = await Brand.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.active = req.body.active ?? data.active
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
        // console.log(error)
        try {
            fs.unlinkSync(req.file.path)
        } catch (error) { }

        error.keyValue ?
            res.send({ result: "Fail", reason: "Brand Name is Already Exist" }) :
            res.status(500).send({ result: "Fail", reason: "Internal Server Error" })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Brand.findOne({ _id: req.params._id })
        if (data){
            try {
                fs.unlinkSync(data.pic)
            } catch (error) {}
            await data.deleteOne()
            res.send({ result: "Done", message:"Record Has Been Deleted"})
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
    deleteRecord:deleteRecord
}