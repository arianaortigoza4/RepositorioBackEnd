const { userService } = require("../repositories")
const { faker } = require('@faker-js/faker')


class MockController {
    constructor(){
        this.userService = userService 
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
}

module.exports = MockController