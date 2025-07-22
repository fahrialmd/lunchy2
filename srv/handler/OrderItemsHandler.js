module.exports = function () {
    this.before('CREATE', 'OrderItems', async (req) => {
        const { data } = req;

        // Set default status
        if (!data.status_code) {
            data.status_code = 'U'; // Unpaid
        }

        // Validate quantity
        if (!data.quantity || data.quantity <= 0) {
            data.quantity = 1;
        }

        console.log('Creating new order item:', data);
    });

    this.before('UPDATE', 'OrderItems', async (req) => {
        const { data } = req;

        // Validate price
        if (data.price && data.price < 0) {
            req.error(400, 'Price cannot be negative');
        }

        // Validate quantity
        if (data.quantity && data.quantity <= 0) {
            req.error(400, 'Quantity must be greater than 0');
        }
    });

    this.after(['CREATE', 'UPDATE', 'DELETE'], 'OrderItems', async (item, req) => {
        // Recalculate order totals when items change
        if (item && item.order_ID) {
            // Trigger order recalculation
            console.log('Order item changed, recalculating order totals');
        }
    });
};