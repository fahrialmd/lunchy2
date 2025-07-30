const cds = require('@sap/cds');

/**
 * Field Calculation Service
 * Handles all computed field calculations for Orders and OrderItems
 */
class FieldCalculationService {

    constructor(entities) {
        this.entities = entities;
    }

    /**
     * Calculate all computed fields for an order
     * @param {Object} order - Order object (with or without expanded items)
     * @returns {Promise<void>}
     */
    async calculateAllComputedFields(order) {
        // Load items if not expanded
        let items = order.items;
        if (!items) {
            const { OrderItems } = this.entities;
            items = await SELECT.from(OrderItems).where({ order_ID: order.ID });
            order.items = items; // Assign for consistency
        }

        if (items.length === 0) {
            // No items - set all values to 0
            order.totalAmountRaw = 0;
            order.totalAmount = 0;
            order.extra = 0;
            console.log(`Order ${order.ID}: No items - all totals set to 0`);
            return;
        }

        const itemCount = items.length;

        // STEP 1: Calculate delivery fee per item (doesn't depend on anything else)
        const deliveryFeePerItem = this.calculateDeliveryFee(order.deliveryFee || 0, itemCount);

        // STEP 2: Calculate item discounts and basic totals (doesn't depend on order.extra)
        let totalAmountRaw = 0;
        let totalDiscount = 0;

        for (const item of items) {
            // Set delivery fee
            item.itemDeliveryFee = deliveryFeePerItem;

            // Calculate discount (always negative)
            item.itemDiscount = this.calculateItemDiscount(order.discountPercent || 0, item.price || 0);


            const itemRawAmount = (item.price || 0);
            totalAmountRaw += itemRawAmount;
            totalDiscount += item.itemDiscount;
        }

        // STEP 3: Calculate order.extra (now we have totalDiscount)
        const extra = (totalDiscount > (order.discountLimit || 0)) ?
            (totalDiscount - (order.discountLimit || 0)) : order.additionalDiscount;


        // STEP 4 & 5: Calculate item extras and final totals (per item calculation needed)
        let totalAmount = 0;

        for (const item of items) {
            // Calculate item extra using proportional formula (always negative)
            item.itemExtra = this.calculateItemExtra(extra, item.price || 0, totalAmountRaw, itemCount);

            // Calculate final item total
            item.total = this.calculateItemTotal(item);

            // Add to order total
            totalAmount += item.total;
        }

        // STEP 6: Set final order values
        order.totalAmountRaw = totalAmountRaw;
        order.totalAmount = totalAmount;
        order.extra = extra;

        console.log(`✅ Order ${order.ID}: Raw=${totalAmountRaw}, Total=${totalAmount}, Extra=${extra}, Items=${itemCount}`);
    }

    /**
     * Calculate delivery fee per item
     * @param {number} deliveryFee - Total delivery fee from order
     * @param {number} itemCount - Number of items in order
     * @returns {number} Delivery fee per item
     */
    calculateDeliveryFee(deliveryFee, itemCount) {
        switch (itemCount) {
            case 0:
                return 0;
            case 1:
                return deliveryFee;
            default:
                return deliveryFee / itemCount;
        }
    }

    /**
     * Calculate item discount (always returns negative value for easy summing)
     * @param {number} discountPercent - Discount percentage from order
     * @param {number} itemPrice - Item price
     * @returns {number} Item discount amount (negative)
     */
    calculateItemDiscount(discountPercent, itemPrice) {
        return (itemPrice * discountPercent / 100) * -1;
    }

    /**
     * Calculate item extra (returns same sign as input extra)
     * @param {number} extra - Total extra from order (already negative)
     * @param {number} itemPrice - Item price
     * @param {number} totalAmountRaw - Total raw amount of all items
     * @param {number} itemCount - Number of items in order
     * @returns {number} Item extra amount (same sign as input extra)
     */
    calculateItemExtra(extra, itemPrice, totalAmountRaw, itemCount) {
        if (extra <= 0 || extra == null || totalAmountRaw === 0) {
            return 0;
        } else {
            switch (itemCount) {
                case 0:
                    return 0;
                case 1:
                    // Return the full extra amount (preserves sign)
                    return extra * -1;
                default:
                    // Proportional distribution (preserves sign)
                    return (itemPrice / totalAmountRaw) * extra * -1;
            }
        }
    }

    /**
     * Calculate final item total
     * @param {Object} item - Order item object
     * @returns {number} Final item total
     */
    calculateItemTotal(item) {
        return (item.price || 0) +
            (item.itemDeliveryFee || 0) +
            (item.itemDiscount || 0) +
            (item.itemExtra || 0);
    }

    /**
     * Calculate order totals from items (without modifying items)
     * @param {Array} items - Array of order items
     * @returns {Object} Object containing totalAmountRaw, totalAmount, totalDiscount
     */
    calculateOrderTotals(items) {
        let totalAmountRaw = 0;
        let totalAmount = 0;
        let totalDiscount = 0;

        for (const item of items) {
            totalAmountRaw += (item.price || 0);
            totalAmount += (item.total || 0);
            totalDiscount += (item.itemDiscount || 0);
        }

        return {
            totalAmountRaw,
            totalAmount,
            totalDiscount
        };
    }

}

module.exports = FieldCalculationService;