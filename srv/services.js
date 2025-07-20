const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    // Handle Orders entity
    this.before('CREATE', 'Orders', async (req) => {
        // You can add validation or data processing here
        const { data } = req;

        // Example: Add created timestamp
        data.createdAt = new Date().toISOString();

        // Example: Validate required fields
        if (!data.orderNumber) {
            req.error(400, 'Order number is required');
        }

        console.log('Creating new order:', data);
    });

    this.after('CREATE', 'Orders', async (order, req) => {
        console.log('Order created successfully:', order.ID);
        // You can add any post-creation logic here
    });

    // Handle any errors
    this.on('error', (err, req) => {
        console.error('Service error:', err);
        // You can customize error handling here
    });

});
