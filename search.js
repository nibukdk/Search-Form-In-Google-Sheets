var ss = SpreadsheetApp.getActiveSpreadsheet();
var searchSheet = ss.getSheetByName("search");
var _2023Sheet = ss.getSheetByName("2023");
var _2022Sheet = ss.getSheetByName("2022");
var _2021Sheet = ss.getSheetByName("2021");

var nameRangeNotation = 'A2:A'
var descriptionRangeNotation = 'F2:F'
var quantityRangeNotation = 'E2:E'

var clientName = searchSheet.getRange('B2:C2').getValue();
var quantity = searchSheet.getRange('E2').getValue();
var description = searchSheet.getRange('G2:H2').getValue();
var hasIncludeAllSelected = searchSheet.getRange('G4:G5').getValue();

var isAllSearchTermFilled = clientName != "" && description != "" && quantity != "" ? true : false;

/**
 * The main function assigned to search button in the spreadsheet. It orchestrates search opearaion.
 */
function search() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().toast("Searching Throught Your Database...", 'Searching');
    // console.log(clientName)
    // console.log(quantity)
    // console.log(description)
    // console.log(hasIncludeAllSelected)

    let status;

    if (hasIncludeAllSelected) {
      //perform AND search
      const newData = andSearch(clientName, description, quantity);



      status = fillSearchWithResults(searchSheet.getDataRange().getValues(), newData)
      // console.log(status);
      if (status === 400) { throw new Error(SEARCH_STATUS.SEARCH_FAILURE); }
    }
    else {
      //perform OR serach
      let newData = orSearch(clientName, description, quantity);

      status = fillSearchWithResults(searchSheet.getDataRange().getValues(), newData)
      // console.log(status);

      if (status === 400) { throw new Error(SEARCH_STATUS.SEARCH_FAILURE); }
    }

    if (status === 200) {
      SpreadsheetApp.getActiveSpreadsheet().toast(SEARCH_STATUS.SEARCH_SUCCESFULL, 'Success');
    }

  } catch (e) {
    // console.log(e)
    if (e.Error === SEARCH_STATUS.SEARCH_FAILURE) {
      SpreadsheetApp.getActiveSpreadsheet().toast(SEARCH_STATUS.SEARCH_FAILURE, 'Not Found!');

    } else {
      SpreadsheetApp.getActiveSpreadsheet().toast(e, 'Error!');

    }

  }
}

/**
 * Performs "AND" search for the given keywords in their respective columns Last Name, Descroption and Quantity for 
 * tabs 2021, 2022, 2023. Returns new nested arrays for search results to be filled in search spreadsheet.
 * @param {String} name 
 * @param {String} description 
 * @param {String} quantity 
 * @returns {Array<Array<String>>?} - [[],[],[]]
 */
function andSearch(name = null, description = null, quantity = null) {

  // get matching index for each sheet.
  const _2021SheetNameSearchIndexes = name === "" ? [] : searchSheetByColumn(_2021Sheet, nameRangeNotation, name);
  const _2021SheetQuantitySearchIndexes = quantity === "" ? [] : searchSheetByColumn(_2021Sheet, quantityRangeNotation, quantity);
  const _2021SheetDescriptionSearchIndexes = description === "" ? [] : searchSheetByColumn(_2021Sheet, descriptionRangeNotation, description);


  const _2022SheetNameSearchIndexes = name === "" ? [] : searchSheetByColumn(_2022Sheet, nameRangeNotation, name);
  const _2022SheetQuantitySearchIndexes = quantity === "" ? [] : searchSheetByColumn(_2022Sheet, quantityRangeNotation, quantity);
  const _2022SheetDescriptionSearchIndexes = description === "" ? [] : searchSheetByColumn(_2022Sheet, descriptionRangeNotation, description);

  const _2023SheetNameSearchIndexes = name === "" ? [] : searchSheetByColumn(_2023Sheet, nameRangeNotation, name);
  const _2023SheetQuantitySearchIndexes = quantity === "" ? [] : searchSheetByColumn(_2023Sheet, quantityRangeNotation, quantity);
  const _2023SheetDescriptionSearchIndexes = description === "" ? [] : searchSheetByColumn(_2023Sheet, descriptionRangeNotation, description);


  // matching indexes of rows in AND search
  const _2021SheetMatchingRowsIndexes = filterRowsIndexesWithAllSearchTerms(_2021SheetNameSearchIndexes, _2021SheetQuantitySearchIndexes, _2021SheetDescriptionSearchIndexes);
  const _2022SheetMatchingRowsIndexes = filterRowsIndexesWithAllSearchTerms(_2022SheetNameSearchIndexes, _2022SheetQuantitySearchIndexes, _2022SheetDescriptionSearchIndexes);
  const _2023SheetMatchingRowsIndexes = filterRowsIndexesWithAllSearchTerms(_2023SheetNameSearchIndexes, _2023SheetQuantitySearchIndexes, _2023SheetDescriptionSearchIndexes);

  // get data from row indexes
  const _2021SheetMatchingRows = fetchDataByRowIndexes(_2021Sheet, _2021SheetMatchingRowsIndexes)
  const _2022SheetMatchingRows = fetchDataByRowIndexes(_2022Sheet, _2022SheetMatchingRowsIndexes)
  const _2023SheetMatchingRows = fetchDataByRowIndexes(_2023Sheet, _2023SheetMatchingRowsIndexes)

  // filter duplicate rows
  const _2021SheetMatchingUniqueRows = filterDuplicateRows(_2021SheetMatchingRows);
  const _2022SheetMatchingUniqueRows = filterDuplicateRows(_2022SheetMatchingRows);
  const _2023SheetMatchingUniqueRows = filterDuplicateRows(_2023SheetMatchingRows);


  const andSearchResult = [..._2023SheetMatchingUniqueRows, ..._2022SheetMatchingUniqueRows, ..._2021SheetMatchingUniqueRows]

  if (andSearchResult.length < 0) return;

  return andSearchResult;

}

/**
 * Performs "OR" search for the given keywords in their respective columns Last Name, Descroption and Quantity for 
 * tabs 2021, 2022, 2023. Returns new nested arrays for search results to be filled in search spreadsheet.
 * @param {String} name 
 * @param {String} description 
 * @param {String} quantity 
 * @returns {Array<Array<String>>?} - [[],[],[]]
 */
function orSearch(name = null, description = null, quantity = null) {
  // get matching index for each sheet.
  const _2021SheetNameSearchIndexes = name === "" ? [] : searchSheetByColumn(_2021Sheet, nameRangeNotation, name);
  const _2021SheetQuantitySearchIndexes = quantity === "" ? [] : searchSheetByColumn(_2021Sheet, quantityRangeNotation, quantity);
  const _2021SheetDescriptionSearchIndexes = description === "" ? [] : searchSheetByColumn(_2021Sheet, descriptionRangeNotation, description);


  const _2022SheetNameSearchIndexes = name === "" ? [] : searchSheetByColumn(_2022Sheet, nameRangeNotation, name);
  const _2022SheetQuantitySearchIndexes = quantity === "" ? [] : searchSheetByColumn(_2022Sheet, quantityRangeNotation, quantity);
  const _2022SheetDescriptionSearchIndexes = description === "" ? [] : searchSheetByColumn(_2022Sheet, descriptionRangeNotation, description);

  const _2023SheetNameSearchIndexes = name === "" ? [] : searchSheetByColumn(_2023Sheet, nameRangeNotation, name);
  const _2023SheetQuantitySearchIndexes = quantity === "" ? [] : searchSheetByColumn(_2023Sheet, quantityRangeNotation, quantity);
  const _2023SheetDescriptionSearchIndexes = description === "" ? [] : searchSheetByColumn(_2023Sheet, descriptionRangeNotation, description);

  // get values from those indexes
  const _2021SheetNameSearch = fetchDataByRowIndexes(_2021Sheet, _2021SheetNameSearchIndexes);
  const _2021SheetQuantitySearch = fetchDataByRowIndexes(_2021Sheet, _2021SheetQuantitySearchIndexes);
  const _2021SheetDescriptionSearch = fetchDataByRowIndexes(_2021Sheet, _2021SheetDescriptionSearchIndexes);

  const _2022SheetNameSearch = fetchDataByRowIndexes(_2022Sheet, _2022SheetNameSearchIndexes);
  const _2022SheetQuantitySearch = fetchDataByRowIndexes(_2022Sheet, _2022SheetQuantitySearchIndexes);
  const _2022SheetDescriptionSearch = fetchDataByRowIndexes(_2022Sheet, _2022SheetDescriptionSearchIndexes);

  const _2023SheetNameSearch = fetchDataByRowIndexes(_2023Sheet, _2023SheetNameSearchIndexes);
  const _2023SheetQuantitySearch = fetchDataByRowIndexes(_2023Sheet, _2023SheetQuantitySearchIndexes);
  const _2023SheetDescriptionSearch = fetchDataByRowIndexes(_2023Sheet, _2023SheetDescriptionSearchIndexes);



  // filter duplicate rows
  const _2021SheetMatchingUniqueRows = filterDuplicateRows([..._2021SheetNameSearch, ..._2021SheetQuantitySearch, ..._2021SheetDescriptionSearch]);
  const _2022SheetMatchingUniqueRows = filterDuplicateRows([..._2022SheetNameSearch, ..._2022SheetQuantitySearch, ..._2022SheetDescriptionSearch]);
  const _2023SheetMatchingUniqueRows = filterDuplicateRows([..._2023SheetNameSearch, ..._2023SheetQuantitySearch, ..._2023SheetDescriptionSearch]);

  const orSearchResult = [..._2021SheetMatchingUniqueRows, ..._2022SheetMatchingUniqueRows, ..._2023SheetMatchingUniqueRows]

  if (orSearchResult.length < 0) return;

  return orSearchResult;

}

