import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";
import { display } from "display";
import { today as activity } from "user-activity";
import * as messaging from "messaging";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
const displayTime = document.getElementById("time");
const hour0 = document.getElementById("hour0");
const hour1 = document.getElementById("hour1");
const minute0 = document.getElementById("minute0");
const minute1 = document.getElementById("minute1");
const ampm = document.getElementById("ampm");
const dayofweek = document.getElementById("dayofweek");
const day0 = document.getElementById("day0");
const day1 = document.getElementById("day1");
const hrtext = document.getElementById("hr-text");
const hricon = document.getElementById("hr-icon");
const stepsicon = document.getElementById("steps-icon");
const stepstext = document.getElementById("steps-text");

const weekdays = {
  0: "days/sun.png",
  1: "days/mon.png",
  2: "days/tue.png",
  3: "days/wed.png",
  4: "days/thu.png",
  5: "days/fri.png",
  6: "days/sat.png"
};

if ( HeartRateSensor && appbit.permissions.granted( "access_heart_rate" ) ) {
  var hrm = new HeartRateSensor();
  hrm.addEventListener("reading", () => {
    console.log(`Current heart rate: ${ hrm.heartRate }`);
  });
  display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    display.on ? hrm.start() : hrm.stop();
  });
  hrtext.text = "???";
  hrm.start();
  hrtext.text = `${ hrm.heartRate }`;
} else {
  hrtext.text = "---";
}

function updateFace( evt ) {
  let today = evt.date;
  fetchVos(); 
  updateClock( today );
  updateHr();
  dayofweek.image = weekdays[ today.getDay() ];
  updateDay( today );
  updateSteps( activity );
}

function updateHr() {
  if ( HeartRateSensor && appbit.permissions.granted( "access_heart_rate" ) ) {
    hrtext.text = `${ hrm.heartRate }`;
  } else {
    hrtext.text = "";
    hricon.image = "";
  }
}

function updateSteps( activity ) {
  if ( appbit.permissions.granted( "access_activity" ) ) {
    stepstext.text = `${ activity.adjusted.steps }`;
  } else {
    stepstext.text = "";
    stepsicon.image = "";
  }
}

function updateDay( today ) {
  const todaysDay = util.zeroPad( today.getDate() );
  day0.image = `nums/${ `${ todaysDay }`[ 0 ] }.png`;
  day1.image = `nums/${ `${ todaysDay }`[ 1 ] }.png`;
}

function updateClock( today ) {
  
  let hours = today.getHours();
  
  if ( preferences.clockDisplay === "12h" ) {
    // 12h format
    if ( today.getHours() >= 12 ) {
      ampm.image = 'pm.png';
    } else {
      ampm.image = 'am.png';
    }
    
    hours = hours % 12 || 12;
    if ( hours <= 9 ) {
      hour0.image = '';
      hour1.image = `nums/${ `${ hours }`[ 0 ] }.png`;
    } else {
      hour0.image = `nums/${ `${ hours }`[ 0 ] }.png`;
      hour1.image = `nums/${ `${ hours }`[ 1 ] }.png`;
    }
    
  } else {
    // 24h format
    ampm.image = '';
    hours = util.zeroPad( hours );
    hour0.image = `nums/${ `${ hours }`[ 0 ] }.png`;
    hour1.image = `nums/${ `${ hours }`[ 1 ] }.png`;
  }
  let mins = util.zeroPad( today.getMinutes() );
  minute0.image = `nums/${ `${ mins }`[ 0 ] }.png`;
  minute1.image = `nums/${ `${ mins }`[ 1 ] }.png`;
  
}

function fetchVos() {
  console.log( "Fetching Vos" );
  
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send a command to the companion
    messaging.peerSocket.send({
      command: 'vos'
    });
  }
}

function displayVos( data ) {
  if ( data ) {
    for ( const key in data ) {
      console.log( key )
    }
    //console.log( data.query.allmessages[ 0 ].content );  
  }
}

// Listen for messages from the companion
messaging.peerSocket.onmessage = function( evt ) {
  if ( evt.data ) {
    displayVos( evt.data );
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function( err ) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

// setInterval( fetchVos, 5 * 1000 * 60 );

// Update the <text> element every tick with the current time
clock.ontick = ( evt ) => {
  updateFace( evt );
}



