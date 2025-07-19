sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, Filter, FilterOperator, JSONModel, MessageToast, MessageBox) {
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
                filtersActive: 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            // Get reference to the main model
            this._oMainModel = this.getOwnerComponent().getModel();

            // Initialize the page
            this._initializePage();
        },

        _initializePage: function () {
            // Any additional initialization logic can go here
            console.log("OrderScreen initialized");
        },

        /* =========================================================== */
        /* Filter Bar Event Handlers                                  */
        /* =========================================================== */

        onFilterBarSearch: function (oEvent) {
            this._applyFilters();
        },

        onFilterBarFilterChange: function (oEvent) {
            // Optional: Auto-apply filters on change
            // this._applyFilters();
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

            // Optional: Auto-apply filters
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

            // Optional: Auto-apply filters
            this._applyFilters();
        },

        onUsersMultiComboBoxSelectionChange: function (oEvent) {
            var aSelectedKeys = oEvent.getSource().getSelectedKeys();
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/filters/users", aSelectedKeys);

            // Optional: Auto-apply filters
            this._applyFilters();
        },

        /* =========================================================== */
        /* Table Event Handlers                                       */
        /* =========================================================== */

        onOrdersTableItemPress: function (oEvent) {
            // This might be for table-level events if needed
            console.log("Table item pressed", oEvent);
        },

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

        onCreateOrderButtonPress: function () {
            MessageBox.information("Create Order functionality will be implemented soon.", {
                title: "Feature Coming Soon"
            });

            // TODO: Implement create order functionality
            // This could open a dialog or navigate to a create order page
        },

        /* =========================================================== */
        /* Private Methods                                             */
        /* =========================================================== */

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
                `Applied ${iFilterCount} filter(s)` :
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
        }
    });
});