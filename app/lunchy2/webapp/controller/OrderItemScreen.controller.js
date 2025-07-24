sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("lunchy2.controller.OrderItemScreen", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOrderItemScreen").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sOrderId = oEvent.getParameter("arguments").OrderID;

            // Bind the view to the specific order
            const sOrderPath = "/Orders(" + sOrderId + ")";
            this.getView().bindElement({
                path: sOrderPath,
                $expand: "items,items/itemStatus,status,user",
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

            // SOLUTION 1: Get binding directly from the table
            var oTable = this.byId("idOrderItemTable");
            var oItemsBinding = oTable.getBinding("rows");

            if (!oItemsBinding) {
                MessageToast.show("Table binding not available yet");
                return;
            }

            // Create new item using the table's binding
            var oContext = oItemsBinding.create(oNewItem);

            oContext.created().then(function () {
                MessageToast.show("New item added successfully!");

            }.bind(this)).catch(function (oError) {
                console.error("Error creating item:", oError);
                MessageToast.show("Failed to add new item. Please try again.");
            });
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
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // Step 4: Delete using modern V4 method
                        oContext.delete().then(function () {
                            MessageToast.show("Item deleted successfully");
                        }).catch(function () {
                            MessageToast.show("Failed to delete item");
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
        }
    });
})