sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Filter, FilterOperator) {
    "use strict";

    /**
     * QueryHelper - Universal OData V4 Query Utility
     * Works with OData V4 models (no more .read() method!)
     */
    const QueryHelper = {

        // =================================================================
        // BASIC QUERY METHODS FOR ODATA V4
        // =================================================================

        /**
         * Get all records from any entity (OData V4 way)
         * @param {object} oModel - OData V4 model
         * @param {string} sEntity - Entity name like "Orders", "OrderItems", "Users"
         * @param {object} oOptions - Optional: expand, select, top, skip
         */
        getAll: function (oModel, sEntity, oOptions) {
            oOptions = oOptions || {};

            return new Promise(function (resolve, reject) {
                // OData V4 uses bindList instead of read
                const oListBinding = oModel.bindList("/" + sEntity);

                // Apply options
                if (oOptions.expand) {
                    oListBinding.changeParameters({ $expand: oOptions.expand });
                }
                if (oOptions.select) {
                    oListBinding.changeParameters({ $select: oOptions.select });
                }
                if (oOptions.top) {
                    oListBinding.changeParameters({ $top: oOptions.top });
                }
                if (oOptions.skip) {
                    oListBinding.changeParameters({ $skip: oOptions.skip });
                }
                if (oOptions.orderby) {
                    oListBinding.changeParameters({ $orderby: oOptions.orderby });
                }

                // Request contexts (this is like the old .read())
                oListBinding.requestContexts().then(function (aContexts) {
                    const aResults = aContexts.map(function (oContext) {
                        return oContext.getObject();
                    });

                    resolve(aResults);

                }).catch(function (oError) {
                    console.error("❌ Failed to load " + sEntity + ":", oError);
                    reject(oError);
                });
            });
        },

        /**
         * Get single record by ID (OData V4 way)
         * @param {object} oModel - OData V4 model
         * @param {string} sEntity - Entity name
         * @param {string} sId - Record ID
         * @param {object} oOptions - Optional: expand, select
         */
        getById: function (oModel, sEntity, sId, oOptions) {
            oOptions = oOptions || {};

            return new Promise(function (resolve, reject) {
                const sPath = "/" + sEntity + "(" + sId + ")";
                const oContextBinding = oModel.bindContext(sPath);

                // Apply options
                if (oOptions.expand) {
                    oContextBinding.changeParameters({ $expand: oOptions.expand });
                }
                if (oOptions.select) {
                    oContextBinding.changeParameters({ $select: oOptions.select });
                }

                // Request the context
                oContextBinding.requestObject().then(function (oData) {
                    resolve(oData);

                }).catch(function (oError) {
                    console.error("❌ Failed to load " + sEntity + " " + sId + ":", oError);
                    reject(oError);
                });
            });
        },

        // =================================================================
        // FILTER QUERY METHODS FOR ODATA V4
        // =================================================================

        /**
         * Query with simple filters (OData V4 way)
         * @param {object} oModel - OData V4 model
         * @param {string} sEntity - Entity name
         * @param {object} oFilters - Simple filter object like { status_code: "A", user_ID: "123" }
         * @param {object} oOptions - Optional: expand, select, etc.
         */
        getByFilters: function (oModel, sEntity, oFilters, oOptions) {
            oOptions = oOptions || {};

            return new Promise(function (resolve, reject) {
                const aFilters = QueryHelper._buildFilters(oFilters);

                // Create list binding
                const oListBinding = oModel.bindList("/" + sEntity);

                // Apply filters
                if (aFilters.length > 0) {
                    oListBinding.filter(aFilters);
                }

                // Apply other options
                const oParams = {};
                if (oOptions.expand) oParams.$expand = oOptions.expand;
                if (oOptions.select) oParams.$select = oOptions.select;
                if (oOptions.top) oParams.$top = oOptions.top;
                if (oOptions.orderby) oParams.$orderby = oOptions.orderby;

                if (Object.keys(oParams).length > 0) {
                    oListBinding.changeParameters(oParams);
                }

                // Request the filtered contexts
                oListBinding.requestContexts().then(function (aContexts) {
                    const aResults = aContexts.map(function (oContext) {
                        return oContext.getObject();
                    });
                    resolve(aResults);
                }).catch(function (oError) {
                    console.error("❌ Failed to filter " + sEntity + ":", oError);
                    reject(oError);
                });
            });
        },

        /**
         * Search records with text (OData V4 way)
         * @param {object} oModel - OData V4 model
         * @param {string} sEntity - Entity name
         * @param {string} sSearchText - Text to search for
         * @param {array} aSearchFields - Fields to search in like ["name", "description"]
         * @param {object} oOptions - Optional options
         */
        search: function (oModel, sEntity, sSearchText, aSearchFields, oOptions) {
            oOptions = oOptions || {};

            if (!sSearchText || !aSearchFields || aSearchFields.length === 0) {
                return QueryHelper.getAll(oModel, sEntity, oOptions);
            }

            return new Promise(function (resolve, reject) {
                // Create OR filters for search fields
                const aSearchFilters = aSearchFields.map(function (sField) {
                    return new Filter(sField, FilterOperator.Contains, sSearchText);
                });

                const oSearchFilter = new Filter({
                    filters: aSearchFilters,
                    and: false // OR condition
                });

                // Use getByFilters with the search filter
                const oSearchFilters = {};
                QueryHelper.getByFilters(oModel, sEntity, oSearchFilters, oOptions)
                    .then(function (aResults) {
                        // Filter results manually for now (can be optimized)
                        const aFilteredResults = aResults.filter(function (oItem) {
                            return aSearchFields.some(function (sField) {
                                const sValue = oItem[sField];
                                return sValue && sValue.toString().toLowerCase().includes(sSearchText.toLowerCase());
                            });
                        });
                        resolve(aFilteredResults);
                    })
                    .catch(reject);
            });
        },

        // =================================================================
        // HELPER METHODS
        // =================================================================

        /**
         * Build filters from simple object
         * @private
         */
        _buildFilters: function (oFilters) {
            const aFilters = [];

            if (!oFilters) return aFilters;

            Object.keys(oFilters).forEach(function (sKey) {
                const vValue = oFilters[sKey];

                if (vValue !== null && vValue !== undefined && vValue !== "") {
                    // Handle different filter types
                    if (typeof vValue === "object" && vValue.operator) {
                        // Advanced filter: { operator: "GT", value: 100 }
                        aFilters.push(new Filter(sKey, FilterOperator[vValue.operator], vValue.value));
                    } else if (Array.isArray(vValue)) {
                        // Array filter: [value1, value2] becomes IN filter
                        const aInFilters = vValue.map(function (v) {
                            return new Filter(sKey, FilterOperator.EQ, v);
                        });
                        aFilters.push(new Filter({
                            filters: aInFilters,
                            and: false // OR condition for IN
                        }));
                    } else {
                        // Simple filter: field: value
                        aFilters.push(new Filter(sKey, FilterOperator.EQ, vValue));
                    }
                }
            });

            return aFilters;
        },
    };

    return QueryHelper;
});