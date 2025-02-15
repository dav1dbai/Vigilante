// This keepAlive function periodically makes a call so that the background
// service worker remains active longer (during development/testing).
// const keepAlive = () => {
//   setInterval(() => {
//     chrome.runtime.getPlatformInfo((info) => {
//       console.log("KeepAlive: Platform Info", info);
//     });
//   }, 20e3); // every 20 seconds
// };

// chrome.runtime.onStartup.addListener(() => {
//   console.log("Extension starting up, initiating keepAlive");
//   keepAlive();
// });

// keepAlive(); // also invoke immediately on load

// chrome.runtime.onInstalled.addListener(() => {
//   console.log("Vigilante is installed");
// });

