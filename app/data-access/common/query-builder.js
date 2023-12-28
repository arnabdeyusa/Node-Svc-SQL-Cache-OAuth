var Sql = function () {
    this.query = '';
    this.fields = '*';
    this.whereCount = 0;
    this.setCount = 0;
    this.addCount = 0;
    this.queryType = '';
    this.keyWordValue = '';
};

Sql.prototype.select = function () {
    this.query += 'SELECT [keyword=] [columns=]';
    this.queryType = 'Select';
    return this;
}

Sql.prototype.keyword = function (keyWord) {
    this.keyWordValue = keyWord;
    return this;
}

Sql.prototype.from = function (tableName, join = '') {
    this.query += ' from [' + tableName + ']' + join;
    return this;
}

/* columns takes array of column, for Select */
Sql.prototype.columns = function (columnValues) {
    const columnNames = [...columnValues];
    if (columnNames !== undefined && columnNames.length > 0)
        this.fields = columnNames.join(', ');
    return this;
}

/* params takes array of param, for SP*/ 
Sql.prototype.params = function (columnValues) {
    const columnNames = [...columnValues];
    if (columnNames !== undefined && columnNames.length > 0)
        this.fields = columnNames.join(', ');
    return this;
}

Sql.prototype.update = function () {
    this.query += 'UPDATE';
    return this;
}

Sql.prototype.table = function (tableName) {
    this.query += ' [' + tableName + '] SET ';
    return this;
}

Sql.prototype.insert = function () {
    this.query += 'INSERT';
    this.queryType = 'Insert';
    return this;
}

Sql.prototype.into = function (tableName) {
    this.query += ' INTO ' + tableName;
    return this;
}

Sql.prototype.delete = function () {
    this.query += 'DELETE';
    this.queryType = 'Delete';
    return this;
}

Sql.prototype.exec = function () {
    this.query += 'EXEC';
    this.queryType = 'SP';
    return this;
}

Sql.prototype.storedProc = function (spName) {
    this.query += ' [' + spName + '] [params=]';
    return this;
}
Sql.prototype.output = function(columnName)
{
    // the syntax for this command is as follows:
    /*  INSERT INTO MyTable(Name, Address, PhoneNo)
    OUTPUT INSERTED.ID
    VALUES ('Fyre Fesitval', 'Remote Island', '555-5555') */
    // this command can be implemented for Insert, Deletes and updates 
    // this implementation is for the INSERT command only 
    if( this.query.indexOf('VALUES')) {
        this.query = this.query.replace('VALUES', 'OUTPUT Inserted.' + columnName + ' VALUES');
    }  
    return this;

}
Sql.prototype.add = function (key, value, option) {
    let newOption ={noQuote: true};
    option = option === undefined? newOption: option;
    if (this.addCount === 0) {
        this.query += ' (' + key + ', [columnName])';
        if (option.noQuote === false)
            this.query += ' VALUES (' + "\'" + value + "\'" + ', [columnValue])';
        else if (option.noQuote === true)
            this.query += ' VALUES (' + value + ', [columnValue])';

    }
    else {
        this.query = this.query.replace('[columnName]', key + ', [columnName]');
        if (option === undefined || option.noQuote === false)
            this.query = this.query.replace('[columnValue]', "\'" + value + "\'" + ', [columnValue]');
        else if (option.noQuote === true)
            this.query = this.query.replace('[columnValue]', value + ', [columnValue]');
    }

    this.addCount++;
    return this;
}

Sql.prototype.where = function (condition) {
    // Don't try to do anything if the condition is invalid
    if(condition === null)
        return this;
    if(this.whereCount === 0)
        this.query+= ' where '+ condition;
    else
        this.query+= ' And '+ condition;
    this.whereCount++;
    return this;
}

Sql.prototype.set = function (key, value, option) {
    let newOption ={noQuote: true};
    option = option === undefined? newOption: option;
    let returnObj = mapKeyValue(key, value, option, this.query, this.setCount, 'set');
    this.setCount = returnObj.count;
    this.query = returnObj.query;
    return this;
}

Sql.prototype.orderBy = function (columnName, desc) {
    this.query += ' Order By ' + columnName + (desc === true? ' DESC' : '');
    return this;
}

Sql.prototype.groupBy = function (columnNames) {
    this.query += ' Group By ' + columnNames.join(', ');
    return this;
}

Sql.prototype.limit = function (number) {
    this.query += ' ' + number;
    return this;
}

var mapKeyValue = (key, value, option, query, count, operator) => {
    let prefix = operator === 'where' ? (count === 0 ? ' where ' : ' And ') :
        (operator === 'set' ? (count === 0 ? '' : ', ')
            : '');

    if (key !== '' && key !== undefined) {
        if (count === 0) {
            if (option.noQuote === false)
                query += prefix + key + ' = ' + "\'" + value + "\'";
            else {
                if (option.noQuote === true)
                    query += prefix + key + ' = ' + value;
            }
        }
        else {

            if (option.noQuote === false)
                query += prefix + key + ' = ' + "\'" + value + "\'";
            else {
                if (option.noQuote === true)
                    query += prefix + key + ' = ' + value;
            }
        }

        count++;
    }

    return { count: count, query: query };
}

Sql.prototype.toQuery = function () {
    if (this.queryType === 'Insert') {
        this.query = this.query.replace(', [columnName]', '').replace(', [columnValue]', '');
    }
    else if (this.queryType === 'Select') {
        this.query = this.query.replace('[columns=]', this.fields).replace('[keyword=]', this.keyWordValue);        
    }
    else if(this.queryType === 'SP'){
        this.query = this.query.replace('[params=]', this.fields === '*'? '': this.fields);
    }

    return this.query;
}


const instance = () => new Sql();

module.exports = { instance, Sql };