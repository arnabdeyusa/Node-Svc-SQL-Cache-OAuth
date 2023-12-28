const Sql = require('./query-builder');

const DbType = {
    SQL: 'SQL',
    NoSQL: 'NoSQL'
};

var QueryParams = function () {

}

QueryParams.prototype.params = [];

QueryParams.prototype.addParams = function (name, type, value, index) {
    var params = { name: name, type: type, value: value };
    this.params[index] = params;
}

QueryParams.prototype.clearParams = function () {
    const nullParam = [];
    this.params = [...nullParam];
}

const queryMessage = {
    insertComment: {
        "message": "Comment Successfully created"
    },

    updateComment: {
        "message": "Comment Successfully updated"
    },

    deleteComment: {
        "message": "Comment Successfully deleted"
    },
    rtsFlowComment: {
        "message": "FFFT returned to service"
    },
    etrFlowComment: {
        "message": "BTR Change successful"
    }
};

const queryErrorMessage = {
    insertComment: {
        "message": "SQL Error: while creating comment"
    },

    updateComment: {
        "message": "SQL Error: while updating comment"
    },

    deleteComment: {
        "message": "SQL Error: while deleting comment"
    }
};



module.exports = { DbType, QueryParams, getMessage, getErrorMessage, queryMessage, getUpdatedEventQuery };