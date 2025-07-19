sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (
    Controller
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
        }
    });
});