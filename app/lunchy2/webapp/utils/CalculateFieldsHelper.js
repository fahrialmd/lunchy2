sap.ui.define([], function () {
    "use strict";

    const CalculateFields = {
        onInit: function () {

        },

        /**
         * Calculate delivery fee per item and update each item
         * @param {number} iDeliveryFee - Total delivery fee from order
         * @param {array} aOrderItems - Array of order items (will be modified)
         * @returns {array} Updated items array with new delivery fees
         */
        calculateDeliveryFee: function (iDeliveryFee, aOrderItems) {
            // ✅ Validate inputs
            if (typeof iDeliveryFee !== 'number' || iDeliveryFee < 0) {
                console.warn("Invalid delivery fee:", iDeliveryFee);
                return aOrderItems || [];
            }

            if (!aOrderItems || !Array.isArray(aOrderItems)) {
                console.warn("Invalid order items array");
                return [];
            }

            const iItemCount = aOrderItems.length;

            // ✅ Edge case: no items
            if (iItemCount === 0) {
                console.log("No items found, returning empty array");
                return [];
            }

            // ✅ STEP 1: Calculate delivery fee per item BEFORE the loop
            let iDeliveryFeePerItem;

            if (iItemCount === 1) {
                // Single item: full delivery fee (not divided)
                iDeliveryFeePerItem = iDeliveryFee;
                console.log(`Single item: full delivery fee ${iDeliveryFee}`);
            } else {
                // Multiple items: divide delivery fee
                iDeliveryFeePerItem = iDeliveryFee / iItemCount;
                console.log(`${iItemCount} items: delivery fee ${iDeliveryFee} / ${iItemCount} = ${iDeliveryFeePerItem}`);
            }

            // ✅ STEP 2: Loop through each item and replace old delivery fee with new one
            aOrderItems.forEach(function (oItem, iIndex) {
                // Replace old delivery fee with calculated delivery fee
                oItem.deliveryFee = iDeliveryFeePerItem;

                console.log(`Item ${iIndex + 1}: Updated delivery fee to ${iDeliveryFeePerItem}`);

                // Optional: Calculate total item cost including delivery fee
                const iItemSubtotal = (oItem.quantity || 0) * (oItem.price || 0);
                oItem.totalWithDelivery = iItemSubtotal + iDeliveryFeePerItem;
            });

            console.log("✅ All items updated with delivery fees");
            return aOrderItems;
        },
    };

    return CalculateFields;
}); 
