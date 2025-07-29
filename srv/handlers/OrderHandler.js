const cds = require('@sap/cds');
const FieldCalculationService = require('../services/FieldCalculationService');

module.exports = function () {
    // Initialize the calculation service
    let calculationService;

    // Initialize service after entities are available
    this.on('served', () => {
        calculationService = new FieldCalculationService(this.entities);
    });

    // Orders CREATE logic
    this.before('CREATE', 'Orders', async (req) => {
        const { data } = req;

        // Add timestamp
        data.createdAt = new Date().toISOString();

        // Validate required fields
        if (!data.orderNumber) {
            req.error(400, 'Order number is required');
        }

        // Set default status if not provided
        if (!data.status_code) {
            data.status_code = 'O'; // Open
        }

        console.log('Creating new order:', data);
    });

    // Orders UPDATE logic
    this.before('UPDATE', 'Orders', async (req) => {
        const { data } = req;

        // Update modified timestamp
        data.modifiedAt = new Date().toISOString();

        console.log('Updating order:', data);
    });

    // Orders READ logic (for calculated fields)
    this.after(['READ'], 'Orders', async (orders, req) => {
        if (!Array.isArray(orders)) orders = [orders];

        // Ensure calculation service is available
        if (!calculationService) {
            calculationService = new FieldCalculationService(this.entities);
        }

        for (const order of orders) {
            // Use the calculation service
            await calculationService.calculateAllComputedFields(order);
        }
    });

    this.after('CREATE', 'Orders', async (order, req) => {
        console.log('Order created successfully:', order.ID);
    });

    // Expose calculation service methods for potential use by other handlers
    this.getCalculationService = function () {
        if (!calculationService) {
            calculationService = new FieldCalculationService(this.entities);
        }
        return calculationService;
    };
};