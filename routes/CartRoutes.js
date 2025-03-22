const CartRouter = require("express").Router()
const { verifyBoth } = require("../middlewares/authentication")
const { createRecord, getRecord, getSingleRecord, updateRecord, deleteRecord } = require("../controllers/CartController")


CartRouter.post("", verifyBoth, createRecord)
CartRouter.get("/user/:userid", verifyBoth, getRecord)
CartRouter.get("/:_id", verifyBoth, getSingleRecord)
CartRouter.put("/:_id", verifyBoth, updateRecord)
CartRouter.delete("/:_id", verifyBoth, deleteRecord)

module.exports = CartRouter