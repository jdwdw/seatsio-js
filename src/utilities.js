const Account = require('./Accounts/Account.js');
const AccountSettings = require('./Accounts/AccountSettings.js');
const ChartValidationSettings = require('./Accounts/ChartValidationSettings.js');
const Event = require('./Events/Event.js');
const ObjectStatus = require('./Events/ObjectStatus.js');
const BestAvailableObjects = require('./Events/BestAvailableObjects.js');
const ChangeObjectStatusResult = require('./Events/ChangeObjectStatusResult.js');
const Chart = require('./Charts/Chart.js');
const HoldToken = require('./HoldTokens/HoldToken.js');
const EventReportItem = require('./Reports/EventReportItem.js');
const ChartReportItem = require('./Reports/ChartReportItem.js');
const Subaccount = require('./Subaccounts/Subaccount.js');
const LabelClasses = require('./Common/Labels.js');

module.exports = {
    labelsCreator(data) {
        let labels = {};
        for (const key of Object.keys(data.labels)) {
            if (data.labels[key].parent) {
                labels[key] = new LabelClasses.Labels(new LabelClasses.LabelAndType(data.labels[key].own.label, data.labels[key].own.type), new LabelClasses.LabelAndType(data.labels[key].parent.label, data.labels[key].parent.type));
            } else {
                labels[key] = new LabelClasses.Labels(new LabelClasses.LabelAndType(data.labels[key].own.label, data.labels[key].own.type));
            }
            if (data.labels[key].section) {
                labels[key].section = data.labels[key].section;
            }
            if (data.labels[key].entrance) {
                labels[key].entrance = data.labels[key].entrance;
            }

        }
        return labels;
    },

    createObjectStatus(data) {
        return new ObjectStatus(data.status, data.ticketType, data.holdToken, data.orderId, data.extraData, data.quantity)
    },

    createBestAvailableObjects(data) {
        let labels = this.labelsCreator(data);
        return new BestAvailableObjects(data.objects, labels, data.nextToEachOther);
    },

    createChangeObjectStatusResult(data) {
        let labels = this.labelsCreator(data);
        return new ChangeObjectStatusResult(labels);
    },

    createEvent(data) {
        let updatedOn = data.updatedOn ? new Date(data.updatedOn) : null;

        return new Event(data.id, data.key, data.bookWholeTables,
            data.supportsBestAvailable, data.forSaleConfig, data.tableBookingModes, data.chartKey,
            new Date(data.createdOn), updatedOn);
    },

    createMultipleEvents(eventsData) {
        return eventsData.map(eventData => this.createEvent(eventData));
    },

    createChart(data) {
        let events = data.events ? this.createMultipleEvents(data.events) : null;

        let draftVersionThumbnailUrl = data.draftVersionThumbnailUrl || null;
        return new Chart(data.name, data.id, data.key, data.status, data.tags,
            data.publishedVersionThumbnailUrl, draftVersionThumbnailUrl, events, data.archived);
    },

    createAccount(data) {
        let chartValidation = data.settings.chartValidation;
        let settings = new AccountSettings(data.settings.draftChartDrawingsEnabled, new ChartValidationSettings(chartValidation.VALIDATE_DUPLICATE_LABELS, chartValidation.VALIDATE_OBJECTS_WITHOUT_CATEGORIES, chartValidation.VALIDATE_UNLABELED_OBJECTS));
        return new Account(data.secretKey, data.designerKey, data.publicKey, settings, data.email);
    },

    createHoldToken(data) {
        return new HoldToken(data.holdToken, new Date(data.expiresAt), data.expiresInSeconds);
    },

    createEventReport(reportsData){
        let reportObjects = {};
        for(const key of Object.keys(reportsData)){
            reportObjects[key] = reportsData[key].map (data => {
                    return new EventReportItem(data.label, data.labels, data.status, data.categoryLabel, data.categoryKey, data.ticketType,
                        data.entrance, data.objectType, data.section, data.orderId, data.forSale, data.holdToken,
                        data.capacity, data.numBooked, data.extraData);
                }
            );
        }
        return reportObjects;
    },

    createChartReport(reportsData){
        let reportObjects = {};
        for(const key of Object.keys(reportsData)){
            reportObjects[key] = reportsData[key].map (data => {
                    return new ChartReportItem(data.label, data.labels, data.categoryLabel, data.categoryKey, data.entrance,
                        data.objectType, data.section,
                        data.capacity);
                }
            );
        }
        return reportObjects;
    },

    createSubaccount(data){
        return new Subaccount(data.id, data.secretKey, data.designerKey, data.publicKey, data.name, data.email, data.active);
    }

};