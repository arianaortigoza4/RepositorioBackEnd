const ticketsModel = require('../models/tickets.model.js');
const productManager = require('./ProductsManager.js');

class TicketManager {
  #tickets;

  createTicket = async (amount,email) => {

    try {
      const currentDate = new Date();
      const dateTimeString = currentDate.toISOString().slice(0, 10) + currentDate.toLocaleTimeString();
      const newTicket = {
        id : 'nose', //Aca va algo random que te lo genera mongo
        code : 'nose', //Aca va algo random que te lo genera mongo
        purchase_datetime : dateTimeString, //Aca va el datetime
        amount : amount, //Sumatoria de los productos entre price y quantity del carrito
        purchaser: email //Aca habria que ver como obtenerlo, podria ser del /current

      };

      const currentTicket = await ticketsModel.create(newTicket);
      console.log(currentTicket);
      return currentTicket;
    } catch (error) {
      throw new Error(`Error trying to create a ticket: ${error}`);
    }
  };

}

const ticketManager = new TicketManager();

module.exports = ticketManager;
