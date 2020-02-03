const { DateTime } = require('luxon');

module.exports = (dateObj, format = 'd, LLL y') => {
    return DateTime.fromJSDate(dateObj, {
        zone: 'utc'
    }).toFormat(format);
};
