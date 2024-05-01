const { userService, productService } = require("../repositories")
const { faker } = require('@faker-js/faker')


class MockController {
    constructor(){
        this.userService = userService 
        this.productService = productService 
    }

    newUser(){
        return {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email(),
            age: 50,
            password: faker.internet.password()
        }
    }

    generateUsers = async (req, res)=>{
        let user = "";
        console.log("creating users...")
        for (let i = 0; i < 100; i++) {
            user = await this.newUser();
            console.log(user)
            const result = await this.userService.createUser(user)    
        }
    }


    newProduct(){
        return {
            title: faker.commerce.product(),
            description: faker.commerce.productDescription(),
            code: faker.commerce.isbn(),
            price: faker.commerce.price(),
            status: faker.datatype.boolean(),
            stock: faker.datatype.number(),
            category: faker.commerce.department(),
            owner: faker.database.email(),
            thumbnails: [faker.image.imageUrl()]
        }
    }

    generateProducts = async (req, res)=>{
        let product = "";
        console.log("creating products...")
        for (let i = 0; i < 100; i++) {
            product = await this.newProduct();
            console.log(product)
            const result = await this.productService.createProduct(product);    
        }
    }

    
}

module.exports = MockController