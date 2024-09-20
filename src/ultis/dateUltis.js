// src/utils/dateUtils.js

import moment from 'moment';

export const formatDate = (dateString) => {
    const date = moment(dateString, 'DD/MM/YYYY');
    return date.isValid() ? date.format('YYYY-MM-DD') : null;
};
