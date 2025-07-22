sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
], function (
    Controller,
    MessageToast
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
                $expand: "items,items/itemStatus,status,user"
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

        onRowActionItemDeletePress: function () {

        }
    });
});