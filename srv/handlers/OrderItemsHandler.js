module.exports = function () {
    this.before('CREATE', 'OrderItems', async (req) => {
        const { data } = req;

        if (!data.status_code) {
            data.status_code = 'U';
        }

        if (!data.quantity || data.quantity <= 0) {
            data.quantity = 1;
        }

        console.log('Creating new order item:', data);
    });

    this.before('UPDATE', 'OrderItems', async (req) => {
        const { data } = req;

        if (data.price && data.price < 0) {
            req.error(400, 'Price cannot be negative');
        }

        if (data.quantity && data.quantity <= 0) {
            req.error(400, 'Quantity must be greater than 0');
        }
    });

    this.after('READ', 'OrderItems', async (items) => {
        if (!Array.isArray(items)) items = [items];

        // for (const item of items) {
        //     await this._calculateComputedFields(item);
        // }
    });

    this.after(['CREATE', 'UPDATE', 'DELETE'], 'OrderItems', async (item, req) => {
        console.log('Order item changed, recalculating delivery fees');

        // if (item.order_ID) {
        //     await this._recalculateAllItemsInOrder(item.order_ID);
        // }
    });

    this._calculateComputedFields = async function (item) {
        if (!item) return;

        const baseAmount = (item.price || 0) * (item.quantity || 1);
        item.deliveryFee = await this._calculateDeliveryFee(item);
        item.total = baseAmount + item.deliveryFee;
    };

    this._recalculateAllItemsInOrder = async function (orderId) {
        // ✅ Use service entities instead of direct table names
        const { Orders, OrderItems } = this.entities;

        // Get the order using service entity
        const order = await SELECT.one.from(Orders).where({ ID: orderId });
        if (!order) return;

        // Get all items using service entity
        const items = await SELECT.from(OrderItems).where({ order_ID: orderId });
        if (items.length === 0) return;

        // Calculate delivery fee distribution
        const totalDeliveryFee = order.deliveryFee || 0;
        const deliveryFeePerItem = Math.floor(totalDeliveryFee / items.length);
        const remainder = totalDeliveryFee % items.length;

        // Update each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemDeliveryFee = i === 0 ?
                deliveryFeePerItem + remainder :
                deliveryFeePerItem;

            await UPDATE(OrderItems)
                .set({ deliveryFee: itemDeliveryFee })
                .where({ ID: item.ID });
        }

        console.log(`Delivery fee distributed: ${totalDeliveryFee} ÷ ${items.length} items`);
    };

    this._calculateDeliveryFee = async function (item) {
        if (!item.order_ID) return 0;

        const { Orders, OrderItems } = this.entities;

        const order = await SELECT.one.from(Orders).where({ ID: item.order_ID });
        if (!order) return 0;

        const items = await SELECT.from(OrderItems).where({ order_ID: item.order_ID });
        if (items.length === 0) return 0;

        const totalDeliveryFee = order.deliveryFee || 0;
        const deliveryFeePerItem = Math.floor(totalDeliveryFee / items.length);
        const itemIndex = items.findIndex(orderItem => orderItem.ID === item.ID);
        const remainder = totalDeliveryFee % items.length;

        return itemIndex === 0 ? deliveryFeePerItem + remainder : deliveryFeePerItem;
    };
};