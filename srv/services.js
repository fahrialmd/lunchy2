const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    // Import all handlers
    const OrderHandler = require('./handlers/OrderHandler');
    const OrderItemsHandler = require('./handlers/OrderItemsHandler');
    const UserHandler = require('./handlers/UserHandler');
    const PaymentMethodsHandler = require('./handlers/PaymentMethodsHandler');

    // Register handlers
    OrderHandler.call(this);
    OrderItemsHandler.call(this);
    UserHandler.call(this);
    PaymentMethodsHandler.call(this);

    // Global error handling
    this.on('error', (err, req) => {
        console.error('Service error:', err);
        // Global error logic here
    });
});