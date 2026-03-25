function doGet() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  return ContentService.createTextOutput("SERVER_WIPED_CLEAN");
}
function doPost() {
  return doGet();
}
