sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function (Controller, Filter, FilterOperator, JSONModel, MessageToast, MessageBox, Fragment) {
    "use strict";

    return Controller.extend("lunchy2.controller.OrderScreen", {

        onInit: function () {
            // Initialize view model for local data
            var oViewModel = new JSONModel({
                headerExpanded: true,
                filters: {
                    orderNumber: "",
                    status: [],
                    dateRange: null,
                    users: []
                },
                filtersActive: 0,
                formData: {
                    OrderNumber: "",
                    Description: "",
                    Buyer: "",
                    OrderDate: null,
                    OrderTime: null,
                    DeliveryFee: 0,
                    Discount: 0,
                    DiscountLimit: 0
                }
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Get reference to the main model
            this._oMainModel = this.getOwnerComponent().getModel();
        },

        /* =========================================================== */
        /* Filter Bar Event Handlers                                  */
        /* =========================================================== */

        onFilterBarSearch: function (oEvent) {
            this._applyFilters();
        },

        onFilterBarFilterChange: function (oEvent) {
            // Optional: Auto-apply filters on change
        },

        onOrderNumberInputLiveChange: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/filters/orderNumber", sValue);
        },

        onOrderStatusesMultiComboBoxSelectionChange: function (oEvent) {
            var aSelectedKeys = oEvent.getSource().getSelectedKeys();
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/filters/status", aSelectedKeys);
            this._applyFilters();
        },

        onDateRangeSelectionChange: function (oEvent) {
            var oDateRangeSelection = oEvent.getSource();
            var oFromDate = oDateRangeSelection.getDateValue();
            var oToDate = oDateRangeSelection.getSecondDateValue();

            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/filters/dateRange", {
                from: oFromDate,
                to: oToDate
            });
            this._applyFilters();
        },

        onUsersMultiComboBoxSelectionChange: function (oEvent) {
            var aSelectedKeys = oEvent.getSource().getSelectedKeys();
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/filters/users", aSelectedKeys);
            this._applyFilters();
        },

        /* =========================================================== */
        /* Table Event Handlers                                       */
        /* =========================================================== */

        onColumnListItemOrderPress: function (oEvent) {
            var oBindingContext = oEvent.getSource().getBindingContext();
            if (!oBindingContext) {
                MessageToast.show("No order data available");
                return;
            }

            var sOrderId = oBindingContext.getProperty("ID");
            var sOrderNumber = oBindingContext.getProperty("orderNumber");

            console.log("Navigating to order:", sOrderId, sOrderNumber);

            // Navigate to order details
            this.getRouter().navTo("RouteOrderItemScreen", {
                OrderID: sOrderId
            });
        },

        onOrdersTableDelete: function (oEvent) {
            var oListItem = oEvent.getParameter("listItem");
            var oContext = oListItem.getBindingContext();

            // Step 4: Ask user to confirm
            MessageBox.confirm(`Are you sure you want to delete this order?`, {
                title: "Delete Order",
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // Step 4: Delete using modern V4 method
                        oContext.delete().then(function () {
                            MessageToast.show("Order deleted successfully");
                        }).catch(function () {
                            MessageToast.show("Failed to delete order");
                        });
                    }
                }
            });
        },

        /* =========================================================== */
        /* Create Order Dialog Methods                                 */
        /* =========================================================== */

        onCreateOrderButtonPress: function () {
            if (!this._oCreateOrderDialog) {
                // Fragment.load returns a Promise - handle it properly
                Fragment.load({
                    name: 'lunchy2.view.fragments.CreateOrderDialog',
                    controller: this,
                }).then((oDialog) => {
                    this._oCreateOrderDialog = oDialog;
                    this.getView().addDependent(this._oCreateOrderDialog);
                    this._setDefaultValues();
                    this._oCreateOrderDialog.open();
                });
            } else {
                // Dialog already exists, just open it
                this._setDefaultValues();
                this._oCreateOrderDialog.open();
            }
        },

        _setDefaultValues: async function () {
            const oViewModel = this.getView().getModel("viewModel");
            const oDate = new Date();

            // 1. Set Order Date as 'yyyy-MM-dd' string
            const sFormattedDate =
                oDate.getFullYear() + "-" +
                String(oDate.getMonth() + 1).padStart(2, '0') + "-" +
                String(oDate.getDate()).padStart(2, '0');

            oViewModel.setProperty("/formData/OrderDate", sFormattedDate);

            // 2. Set Order Time (format as 'HH:mm:ss')
            const hours = String(oDate.getHours()).padStart(2, '0');
            const minutes = String(oDate.getMinutes()).padStart(2, '0');
            const seconds = String(oDate.getSeconds()).padStart(2, '0');
            const sTime = `${hours}:${minutes}:${seconds}`;

            oViewModel.setProperty("/formData/OrderTime", sTime);

            // 3. Generate Order Number
            const sDate = oDate.getFullYear() + "-" + String(oDate.getMonth() + 1).padStart(2, '0') + "-" + String(oDate.getDate()).padStart(2, '0');
            const sDateClean = oDate.getFullYear() + String(oDate.getMonth() + 1).padStart(2, '0') + String(oDate.getDate()).padStart(2, '0');

            const sCount = await this._getOrdersCountByDate(sDate);
            const sOrderNumber = sDateClean + sCount;

            oViewModel.setProperty("/formData/OrderNumber", sOrderNumber);
        },


        _getOrdersCountByDate: function (sDate) {
            const oModel = this.getOwnerComponent().getModel();

            const aFilters = [
                new Filter("createdAt", FilterOperator.Contains, sDate),
            ];
            const oBinding = oModel.bindList("/Orders", null, null, aFilters);

            // RETURN the promise
            return oBinding.requestContexts().then((aContexts) => {
                const sCount = String(aContexts.length + 1).padStart(4, '0');
                return sCount;
            }).catch(function (oError) {
                console.error("Error getting orders count:", oError);
                MessageToast.show("Error loading orders count, Please try again");
                return; // Return default on error
            });
        },

        onCancelButtonPress: function () {
            this._oCreateOrderDialog.close();
        },

        onSaveButtonPress: async function () {
            var oViewModel = this.getView().getModel("viewModel");
            var oFormData = oViewModel.getProperty("/formData");

            // Check if buyer has payment methods registered?
            if (!(await this.checkPaymentMethodsExist(oFormData.Buyer))) {
                MessageBox.error("Selected buyer didn't have payment methods");
                return;
            }

            // Show busy indicator
            this._oCreateOrderDialog.setBusy(true);

            // Prepare the data for backend
            var oNewOrder = {
                orderNumber: oFormData.OrderNumber,
                description: oFormData.Description,
                user: { ID: oFormData.Buyer },
                orderDate: oFormData.OrderDate,
                orderTime: oFormData.OrderTime,
                deliveryFee: parseFloat(oFormData.DeliveryFee) || 0,
                discountPercent: parseFloat(oFormData.Discount) || 0,
                discountLimit: parseFloat(oFormData.DiscountLimit) || 0,
                status_code: "O"
            };


            // Create new entry in the backend
            var oBinding = this._oMainModel.bindList("/Orders");

            // FIXED: OData V4 way to handle creation
            var oContext = oBinding.create(oNewOrder);

            oContext.created().then(function () {
                // Success - data saved on server
                MessageToast.show("Order created successfully!");

                // Close Dialog
                this._oCreateOrderDialog.close();
                this._oCreateOrderDialog.setBusy(false);

                // Optional: Refresh the table to show new order
                var oTable = this.byId("idOrdersTable");
                oTable.getBinding("items").refresh();

                // Clear form data
                this._clearFormData();

            }.bind(this)).catch(function (oError) {
                // Error handling
                console.error("Error creating order:", oError);

                oDialog.setBusy(false);

                // Show error message
                MessageBox.error("Failed to create order. Please try again.\n\nError: " +
                    (oError.message || "Unknown error"));
            }.bind(this));
        },

        _getUsers: function (userEmpID) {
            const oModel = this.getOwnerComponent().getModel();

            const aFilters = [
                new Filter("userEmpID", FilterOperator.EQ, userEmpID),
            ];
            const oBinding = oModel.bindList("/Users", null, null, aFilters);

            // RETURN the promise
            return oBinding.requestContexts().then((aContexts) => {
                console.log(aContexts);
                return aContexts[0];
            }).catch(function (oError) {
                console.error("Error getting orders count:", oError);
                MessageToast.show("Something went wrong, Please try again");
                return;
            });
        },

        _clearFormData: function () {
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/formData", {
                OrderNumber: "",
                Description: "",
                Buyer: "",
                OrderDate: null,
                OrderTime: null,
                DeliveryFee: 0,
                Discount: 0,
                DiscountLimit: 0
            });
        },

        /* =========================================================== */
        /* Private Methods                                             */
        /* =========================================================== */

        // Most efficient - server only counts, doesn't send data
        checkPaymentMethodsExist: function (sUserID) {
            var oModel = this.getView().getModel();

            // Use $count=true to get count without data
            var oBinding = oModel.bindList("/PaymentMethods", null, null, [
                new Filter("user_ID", FilterOperator.EQ, sUserID)
            ], {
                $count: true
            });

            return oBinding.requestContexts(0, 0).then(function (aContexts) {
                console.log(aContexts);
                return aContexts.length > 0;
            });
        },

        _applyFilters: function () {
            var oTable = this.byId("idOrdersTable");
            var oBinding = oTable.getBinding("items");
            var oViewModel = this.getView().getModel("viewModel");
            var oFilters = oViewModel.getProperty("/filters");

            var aFilters = [];
            var iFilterCount = 0;

            // Order Number filter
            if (oFilters.orderNumber && oFilters.orderNumber.trim()) {
                aFilters.push(new Filter("orderNumber", FilterOperator.Contains, oFilters.orderNumber.trim()));
                iFilterCount++;
            }

            // Status filter
            if (oFilters.status && oFilters.status.length > 0) {
                var aStatusFilters = oFilters.status.map(function (sStatus) {
                    return new Filter("status_code", FilterOperator.EQ, sStatus);
                });
                aFilters.push(new Filter(aStatusFilters, false)); // OR condition
                iFilterCount++;
            }

            // Date range filter
            if (oFilters.dateRange && oFilters.dateRange.from && oFilters.dateRange.to) {
                aFilters.push(new Filter("orderDate", FilterOperator.BT,
                    oFilters.dateRange.from, oFilters.dateRange.to));
                iFilterCount++;
            }

            // Users filter
            if (oFilters.users && oFilters.users.length > 0) {
                var aUserFilters = oFilters.users.map(function (sUserId) {
                    return new Filter("user_ID", FilterOperator.EQ, sUserId);
                });
                aFilters.push(new Filter(aUserFilters, false)); // OR condition
                iFilterCount++;
            }

            // Apply filters to binding
            oBinding.filter(aFilters);

            // Update filter count
            oViewModel.setProperty("/filtersActive", iFilterCount);

            // Show message
            var sMessage = iFilterCount > 0 ?
                "Applied " + iFilterCount + " filter(s)" :
                "All filters cleared";
            MessageToast.show(sMessage);
        },

        /* =========================================================== */
        /* Formatters                                                  */
        /* =========================================================== */

        formatStatusState: function (sStatusCode) {
            switch (sStatusCode) {
                case "O":
                    return "Information"; // Open orders - blue
                case "C":
                    return "Success";     // Closed orders - green
                default:
                    return "None";
            }
        },

        /* =========================================================== */
        /* Helper Methods                                              */
        /* =========================================================== */

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /* =========================================================== */
        /* Lifecycle Methods                                           */
        /* =========================================================== */

        onBeforeRendering: function () {
            // Called every time before the view is rendered
        },

        onAfterRendering: function () {
            // Called every time after the view is rendered
        },

        onExit: function () {
            // Cleanup when controller is destroyed
            if (this._oViewModel) {
                this._oViewModel.destroy();
            }
            if (this._oCreateOrderDialog) {
                this._oCreateOrderDialog.destroy();
            }
        }
    });
});