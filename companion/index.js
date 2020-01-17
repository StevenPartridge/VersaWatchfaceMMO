import * as messaging from "messaging";





function getVos()  {

  fetch( `https://runescape.wiki/api.php?action=query&format=json&meta=allmessages&ammessages=VoS&amlang=en-gb&formatversion=2`, {
    method: "GET"
  })
  .then( function( res ) {
    console.log( res.json() )
    returnVos( res.json() );
  })
  .catch(err => console.log('[FETCH]: ' + err));

}

// Send the weather data to the device
function returnVos( data ) {
  if ( messaging.peerSocket.readyState === messaging.peerSocket.OPEN ) {
    // Send a command to the device
    messaging.peerSocket.send( data );
  } else {
    console.log("Error: Connection is not open");
  }
}

// Listen for messages from the device
messaging.peerSocket.onmessage = function( evt ) {
  if (evt.data && evt.data.command == "vos") {
    // The device requested weather data
    getVos();
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function( err ) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}