const express = require('express');
const router = express.Router();
const { Customer } =  require('../models/customers/customerModel')

//post
router.post("/customers", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).send(customer);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
