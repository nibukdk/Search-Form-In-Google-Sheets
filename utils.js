
const SEARCH_STATUS = {
    SEARCH_SUCCESFULL: "Search Was Successfull!",
    SEARCH_FAILURE: "No items we found in the given given critera!",
}

/**
 * To Fill search sheet with values
 * @param {Array<Array<Srting>>}  oldData - previous search results data
 * @param {Array<Array<Srting>>}  newData - new search result to fill
 */
function fillSearchWithResults(oldData, newData) {
    // console.log("Inside fillSearchWithResults() old data:", oldData.length);
    if (oldData.length >= 8) {
        searchSheet.getRange(8, 1, oldData.length - 7, 9).clear(); // clear until last filled data
    }
    SpreadsheetApp.flush();
    Utilities.sleep(1000);
    // console.log("Inside fillSearchWithResults() new Data:", newData);
    if (newData.length < 1) return 400;
    searchSheet.getRange(8, 1, newData.length, 9).setValues(newData);
    return 200;
}


/**
 * Searches the given keyword in the given column inside the given spreadsheet tab.
 * It returns all the matching indexes of data. Indexes are index from array not row.
 * @param {Spreadsheet} sheet - sheet to search from
 * @param {String} rangeNotation - range of the column in the given spreadsheet
 * @param {String} searchVal - keyword to search
 * @returns {Array<number>} - [1,23,12,45,12] 
 */
function searchSheetByColumn(sheet, rangeNotation, searchVal) {
    const data = sheet.getRange(rangeNotation).getValues().flat().filter(String); // get data

    if (data.length < 1) return [];
    // filter only matching rows indexes
    // got from https://stackoverflow.com/a/58980987/6163929
    const allIndexes = data.map((val, index) => ({ val, index }))
        .filter(({ val, index }) => rangeNotation === quantityRangeNotation ? Number(val) === Number(searchVal) : val.toLowerCase().includes(searchVal.toLowerCase()))
        .map(({ _, index }) => index + 1) // +1 because we extract data from second row in notation later on have to match with whole data array

    // console.log("Inside searchSheetByColumn()");

    // console.log(data)
    // console.log(data.length)
    // console.log(allIndexes)
    // console.log(allIndexes.length)
    // console.log("Outside searchSheetByColumn()");

    return allIndexes;
}

/**
 * Funciton extracts the rows of provided indexes+1, from the given spreadsheet tab.
 * @param {Spreadsheet} sheet - sheet to search from
 * @param {Array<number>} indexes - indexes of row to extract values.
 * @returns {Array<Array<Srting>>} - Arrays of nested rows in the indexes from the given sheet.
 */
function fetchDataByRowIndexes(sheet = _2021Sheet, indexes = []) {
    // console.log("Inside fetchDataByRowIndexes() provided indexes are:" + indexes)

    if (indexes.length < 1) return [];

    const data = sheet.getDataRange().getValues();
    const newData = [];

    for (let i = 0; i < indexes.length; i++) {
        newData.push([...data[indexes[i]], `${sheet.getName()} - ${indexes[i] + 1}`])
    }
    // console.log("Inside fetchDataByRowIndexes() data from procvided indexes:" + newData)
    return newData;
}

/**
 * Function filters only rows that consist all three keywords provided by user input
 * @param {Array<String>} arr1 - 
 * @param {Array<String>} arr2 
 * @param {Array<String>} arr3 
 * @returns {Array<String>?} 
 */
function filterRowsIndexesWithAllSearchTerms(arr1, arr2, arr3) {
    // console.log("Inside filterRowsIndexesWithAllSearchTerms() arr1:" + arr1)
    // console.log("Inside filterRowsIndexesWithAllSearchTerms() arr2:" + arr2)
    // console.log("Inside filterRowsIndexesWithAllSearchTerms() arr3:" + arr3)

    // create a nested array
    const arr = [arr1.length > 0 ? [...arr1] : "", arr2.length > 0 ? [...arr2] : "", arr3.length > 0 ? [...arr3] : ""].filter(String);
    // console.log("new compound array arr:" + arr)
    // console.log("length of new compound array arr:" + arr.length)
    if (arr.length < 1) return [];

    const matchingIndexes = [];

    if (arr.length === 3) {

        arr[0].forEach((val) => {
            if (arr[1].includes(val) && arr[2].includes(val)) {
                matchingIndexes.push(val)
            }

        });

    }
    else if (arr.length === 2) {
        arr[0].forEach((val) => {
            if (arr[1].includes(val)) {
                matchingIndexes.push(val)
            }

        });


    }
    else {

        matchingIndexes.push(arr[0]) //just push the array thats not empty
    }

    // console.log("Inside filterRowsIndexesWithAllSearchTerms() mathcingIndexes:" + matchingIndexes)
    // console.log("Inside filterRowsIndexesWithAllSearchTerms() mathcingIndexes type is Array?:" + Array.isArray(matchingIndexes));


    return matchingIndexes.flat();

}


/**
 * Takes Duplicate data that might have resulted from different individual column searches and only returns unique rows 
 * in each column from the serach results.
 * @param {Array<String>} arr 
 * @returns {Array<String>}- [[],[]]
 */
function filterDuplicateRows(arr) {
    if (arr.length < 1) return [];
    const delimiter = "*---*--*";
    // console.log("Inside filterDuplicateRows() arr to check:" + arr)

    const strArr = arr.map(row => row.join(delimiter)).flat();
    // console.log("Inside filterDuplicateRows() strArr:" + strArr)

    const uniqueArrays = [...new Set(strArr)].map(str => str.split(delimiter))
    // console.log("Inside filterDuplicateRows() uniqueArrays:" + uniqueArrays)

    return uniqueArrays;

}