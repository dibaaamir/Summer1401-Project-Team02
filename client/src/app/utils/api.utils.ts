export const BASE_URL = 'https://localhost:7113/';

export const API_UPLOAD_FILE = BASE_URL + 'DataInventory/AddSourceByFile';
export const API_SEND_DESTINATION_NAME = BASE_URL + 'DataInventory/AddDestination';

export const DEFAULT_POST_REQUEST_INIT: RequestInit = {
    method: 'post',
    headers: {},
};
