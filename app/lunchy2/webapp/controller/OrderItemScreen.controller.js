sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "lunchy2/utils/QueryHelper",
    "lunchy2/utils/CalculateFieldsHelper"
], function (
    Controller,
    MessageToast,
    MessageBox,
    QueryHelper,
    CalculateFieldsHelper
) {
    "use strict";

    return Controller.extend("lunchy2.controller.OrderItemScreen", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOrderItemScreen").attachPatternMatched(this._onRouteMatched, this);
            this._oModel = this.getView().getModel();
        },

        _onRouteMatched: function (oEvent) {
            this._sOrderId = oEvent.getParameter("arguments").OrderID;
            // Bind the view to the specific order
            const sOrderPath = "/Orders(" + this._sOrderId + ")";
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

            // Calculate Fields
            this._calculateFields();

            console.log("Woyyyyyyyyyy");


            // Get binding directly from the table
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

        _calculateFields: async function () {
            const oModel = this.getView().getModel();
            const aOrderItems = await this._getOrderItems(oModel);
            const oOrder = await this._getOrder(oModel);
            
            aOrderItems = CalculateFieldsHelper.calculateDeliveryFee(oOrder.deliveryFee, aOrderItems)



        },

        _getOrderItems: function (oModel) {
            return QueryHelper.getByFilters(oModel, "OrderItems", { order_ID: this._sOrderId }, {})
                .then(function (aContexts) {
                    console.log("All order items:", aContexts);
                    return aContexts
                })
                .catch(function (oError) {
                    console.error("Error loading items:", oError);
                    throw oError
                });
        },

        _getOrder: function (oModel) {
            return QueryHelper.getById(oModel, "Orders", this._sOrderId, {})
                .then((oContext) => {
                    return oContext;
                })
                .catch(function (oError) {
                    console.error("Error loading order:", oError);
                    throw oError
                })
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
        },

        getAllTableRowsOData: function () {
            var oTable = this.byId("idOrderItemTable");
            var oBinding = oTable.getBinding("rows");
            var aContexts = oBinding.getContexts();

            var aAllRows = [];
            aContexts.forEach(function (oContext) {
                aAllRows.push(oContext.getObject());
            });

            return aAllRows;
        },
    });
})