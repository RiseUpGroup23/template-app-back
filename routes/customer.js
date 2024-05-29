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

//get
router.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find()
    res.status(200).send(customers);
  } catch (error) {
    res.status(500).send(error);
console.log(error);
}
});

//ID
router.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send();
    }
    res.status(200).send(customer);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Actualizar
router.put("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) {
      return res.status(404).send();
    }
    res.status(200).send(customer);
  } catch (error) {
    res.status(400).send(error);
  }
});

//delete
router.delete("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).send();
    }
    res.status(200).send(customer);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
