const CheckoutRouter = require("express").Router()
const { verifyAdmin, verifyBoth } = require("../middlewares/authentication")
const { createRecord, getRecord, getSingleRecord, updateRecord, deleteRecord, getUserRecord, order, verifyOrder } = require("../controllers/CheckoutController")


CheckoutRouter.post("", verifyBoth, createRecord)
CheckoutRouter.get("", verifyAdmin, getRecord)
CheckoutRouter.get("/user/:userid", verifyBoth, getUserRecord)
CheckoutRouter.get("/:_id", verifyBoth, getSingleRecord)
CheckoutRouter.put("/:_id", verifyAdmin, updateRecord)
CheckoutRouter.delete("/:_id", verifyAdmin, deleteRecord)
CheckoutRouter.post("/order", verifyBoth, order)
CheckoutRouter.post("/verify", verifyBoth, verifyOrder)


module.exports = CheckoutRouter