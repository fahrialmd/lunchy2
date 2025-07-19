sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("lunchy2.controller.OrderScreen", {
        onInit: function () {
            // Controller initialization
        },

        onOrderPress: function (oEvent) {
            // Handle order selection if needed
            var oBindingContext = oEvent.getSource().getBindingContext();
            var sOrderId = oBindingContext.getProperty("ID");
            console.log("Selected Order ID:", sOrderId);
        }
    });
});