sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "lunchy2/utils/QueryHelper",
], function (
    Controller,
    MessageToast,
    MessageBox,
    QueryHelper,
) {
    "use strict";

    return Controller.extend("lunchy2.controller.OrderItemScreen", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOrderItemScreen").attachPatternMatched(this._onRouteMatched, this);
            this._oModel = this.getView().getModel();
            this._refreshOrderComputedFields();
        },

        _onRouteMatched: function (oEvent) {
            this._sOrderId = oEvent.getParameter("arguments").OrderID;
            // Bind the view to the specific order
            const sOrderPath = "/Orders(" + this._sOrderId + ")";
            this.getView().bindElement({
                path: sOrderPath,
                $expand: "items,items/itemStatus,status,user,user/paymentMethods",
                $$updateGroupId: "$auto",
                $$groupId: "$auto"
            });
        },

        onButtonAddItemPress: function () {
            // Get the current order context
            var oBindingContext = this.getView().getBindingContext();

            if (!oBindingContext) {
                MessageToast.show("No order context available");
                return;
            }

            // Prepare new item data
            var oNewItem = {
                quantity: 1,                  // Default quantity
                menu: "",                     // Empty menu
                price: 0,                     // Empty price
                status_code: "U",             // Default to Unpaid
                currency_code: "IDR"          // Default currency
            };


            // Get binding directly from the table
            var oTable = this.byId("idOrderItemTable");
            var oItemsBinding = oTable.getBinding("rows");

            if (!oItemsBinding) {
                MessageToast.show("Table binding not available yet");
                return;
            }

            // Create new item using the table's binding
            var oContext = oItemsBinding.create(oNewItem);

            oContext.created().then(() => {
                MessageToast.show("New item added successfully!");
                this._refreshOrderComputedFields();

            }).catch((oError) => {
                console.error("Error creating item:", oError);
                MessageToast.show("Failed to add new item. Please try again.");
            });
        },

        onPriceInputChange: function () {
            this._refreshOrderComputedFields();
        },

        onQuantityInputChange: function () {
            this._refreshOrderComputedFields();
        },

        onButtonRefreshPress: function () {
            this._refreshOrderComputedFields();
        },

        onRowActionItemDeletePress: function (oEvent) {
            // Step 1: Get the row that was clicked
            var oButton = oEvent.getSource();
            var oRow = oButton.getParent().getParent(); // Get the table row
            var oContext = oRow.getBindingContext();

            // Step 2: Check if we have valid data
            if (!oContext) {
                MessageToast.show("No item found to delete");
                return;
            }

            // Step 3: Get item info for confirmation
            var oData = oContext.getObject();
            var sItemName = oData.ID || "this item";

            // Step 4: Ask user to confirm
            MessageBox.confirm(`Are you sure you want to delete "${sItemName}"?`, {
                title: "Delete Item",
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        // Delete using modern V4 method
                        oContext.delete().then(() => {
                            MessageToast.show("Item deleted successfully");
                            this._refreshOrderComputedFields(); // ← Now 'this' works!
                        }).catch((oError) => {
                            MessageToast.show("Failed to delete item");
                            console.error(oError);
                        });
                    }
                }
            });
        },
        onNameGenericTagStatusPress: function () {
            var oContext = this.getView().getBindingContext();

            if (!oContext) {
                MessageToast.show("No order context available");
                return;
            }

            var sCurrentStatus = oContext.getProperty("status_code");

            // Create selection dialog
            MessageBox.show("Select new order status:", {
                icon: MessageBox.Icon.QUESTION,
                title: "Change Order Status",
                actions: [MessageBox.Action.CLOSE]

            });
        },

        formatPrimaryPaymentName: function (aPaymentMethods) {
            if (!aPaymentMethods || !Array.isArray(aPaymentMethods) || aPaymentMethods.length === 0) {
                return "No payment method";
            }

            const oPrimary = aPaymentMethods.find(pm => pm.isPrimary);
            const oPayment = oPrimary || aPaymentMethods[0];

            return oPayment ? oPayment.paymentName : "Not available";
        },

        formatPrimaryAccountNumber: function (aPaymentMethods) {
            if (!aPaymentMethods || !Array.isArray(aPaymentMethods) || aPaymentMethods.length === 0) {
                return "No account number";
            }

            const oPrimary = aPaymentMethods.find(pm => pm.isPrimary);
            const oPayment = oPrimary || aPaymentMethods[0];

            return oPayment ? oPayment.accountNumber : "Not available";
        },

        hasPaymentMethods: function (aPaymentMethods) {
            return aPaymentMethods && Array.isArray(aPaymentMethods) && aPaymentMethods.length > 0;
        },

        hasNoPaymentMethods: function (aPaymentMethods) {
            return !aPaymentMethods || !Array.isArray(aPaymentMethods) || aPaymentMethods.length === 0;
        },

        /* =========================================================== */
        /* Private Methods                                             */
        /* =========================================================== */

        _refreshOrderComputedFields: function () {
            const oModel = this.getView().getModel();
            const oBindingContext = this.getView().getBindingContext();

            if (!oBindingContext) return;

            oModel.submitBatch("$auto").then(() => {
                return oBindingContext.refresh();
            }).catch(console.error);
        },
    });
})