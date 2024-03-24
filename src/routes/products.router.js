const { Router } = require('express');
const productManager = require('../dao/mongo/ProductsManager');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts(req.query.limit, req.query.page, req.query.sort, req.query.query);
    res.send({ status: 'Success', payload: products });
  } catch (error) {
    res.status(500).send({ status: 'Error', payload: `${error}` });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    if (!req.params.pid) return;

    const product = await productManager.getProductById(req.params.pid);

    res.send({ status: 'Success', payload: product });
  } catch (error) {
    res.status(500).send({ status: 'Error', payload: `${error}` });
  }
});

router.post('/', async (req, res) => {
  try {
    const newProduct = {
      title: req.body.title,
      description: req.body.description,
      code: req.body.code,
      price: Number(req.body.price),
      status: req.body.status ?? true,
      stock: Number(req.body.stock),
      category: req.body.category,
      thumbnails: req.body.thumbnails || [],
    };

    const addedProduct = await productManager.addProduct(
      newProduct.title,
      newProduct.description,
      newProduct.code,
      newProduct.price,
      newProduct.status,
      newProduct.stock,
      newProduct.category,
      newProduct.thumbnails
    );

    res.send({ status: 'Success', payload: addedProduct });
  } catch (error) {
    res.status(500).send({ status: 'Error', payload: `${error}` });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    if (!req.params.pid || !req.body.field || !req.body.data) {
      res.status(400).send({ status: 'Error', payload: 'Missed required arguments' });
    }

    const current = {
      id: req.params.pid,
      field: req.body.field,
      data: req.body.data,
    };

    const updatedProduct = await productManager.updateProduct(current.id, current.field, current.data);

    res.status(200).send({ status: 'Success', payload: updatedProduct });
  } catch (error) {
    res.status(500).send({ status: 'Error', payload: `${error}` });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    if (!req.params.pid) {
      res.status(400).send({ status: 'Error', payload: 'Missed required arguments' });
    }

    const productId = req.params.pid;

    const deletedProduct = await productManager.deleteProduct(productId);

    res.status(200).send({ status: 'Success', payload: deletedProduct });
  } catch (error) {
    res.status(500).send({ status: 'Error', payload: `${error}` });
  }
});

module.exports = router;
