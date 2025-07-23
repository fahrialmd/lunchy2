const cds = require('@sap/cds');

module.exports = function () {
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
    this.after('READ', 'Orders', async (orders, req) => {
        if (!Array.isArray(orders)) orders = [orders];

        for (const order of orders) {
            if (order.items) {
                // Calculate total amounts
                await this._calculateOrderTotals(order);
            }
        }
    });

    // Orders DELETE logic
    this.before('DELETE', 'Orders', async (req) => {
        // Check if order can be deleted
        const orderId = req.params[0];
        const order = await SELECT.one.from('Orders').where({ ID: orderId });

        if (order && order.status_code === 'C') {
            req.error(400, 'Cannot delete closed orders');
        }
    });

    this.after('CREATE', 'Orders', async (order, req) => {
        console.log('Order created successfully:', order.ID);
    });

    // Helper method for calculating totals
    this._calculateOrderTotals = async function (order) {
        if (!order.items || order.items.length === 0) return;

        let totalRaw = 0;

        // Calculate raw total from items
        for (const item of order.items) {
            totalRaw += (item.price || 0) * (item.quantity || 1);
        }

        // Apply delivery fee
        totalRaw += order.deliveryFee || 0;

        // Calculate discount
        const discountAmount = Math.min(
            totalRaw * (order.discountPercent || 0) / 100,
            order.discountLimit || 0
        );

        order.totalAmountRaw = totalRaw;
        order.totalAmount = totalRaw - discountAmount;
    };
};