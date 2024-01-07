import request from "../utils/http"

export const saveData = (actionCode,data) =>
  request.post(`/save_data/${actionCode}`, data)

export const requestActionRec = (data) => 
  request.post('/', data)  