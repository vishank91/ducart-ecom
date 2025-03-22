const NewsletterRouter = require("express").Router()
const { verifyAdmin } = require("../middlewares/authentication")
const { createRecord, getRecord, getSingleRecord, updateRecord, deleteRecord } = require("../controllers/NewsletterController")


NewsletterRouter.post("", createRecord)
NewsletterRouter.get("/",verifyAdmin, getRecord)
NewsletterRouter.get("/:_id",verifyAdmin, getSingleRecord)
NewsletterRouter.put("/:_id",verifyAdmin, updateRecord)
NewsletterRouter.delete("/:_id",verifyAdmin, deleteRecord)

module.exports = NewsletterRouter