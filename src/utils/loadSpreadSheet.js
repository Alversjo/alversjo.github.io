import { APIKEY } from '../constants';

export const loadSpreadSheet = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data.values;
};

export const loadGoogleSpreadSheet = async (sheetId, range) => 
{
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + sheetId + '/values/' + range + '?alt=json&key=' + APIKEY);
    const data = await response.json();
    return data.values;
};

// Based on https://github.com/levinunnink/html-form-to-google-sheet
export const postDataToSheet = async (task, description, effort, prio, latlng) =>
{
  const response = await fetch('https://script.google.com/macros/s/AKfycbxOTZ9zfSjvDIF11No6BRBuL012-Dn0SKAAGlaBWgNOtQZYwuy_Sw7a7JEP8mOhGq9PZw/exec', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    // mode: 'cors', // no-cors, *cors, same-origin
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // redirect: 'follow', // manual, *follow, error
    // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: 'done=false&task=' + task + 
          '&description=' + description + 
          '&lat,lon=' + latlng +
          '&effort=' + effort +
          '&prio=' + prio
  });
  
  return response.json();
}