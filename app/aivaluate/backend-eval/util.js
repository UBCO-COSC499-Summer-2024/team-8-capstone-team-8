// change due date to a readable format

const { format } = require('date-fns');

function formatDueDate(dueDate) {
    return format(new Date(dueDate), "MMM dd 'at' hh:mmaaa");
}

module.exports = { formatDueDate };
