/*<!--app logic -->
<script>*/


var first = new Date();
first.setDate(first.getDate() + 1);
$('[data-toggle="datepicker"]').datepicker({'autoHide': true, 'startDate': first});
$("#time").click(function(){
  var time = new Date($("#dateChoice").val()).getTime() / 1000;
  console.log(time);
})

//web3 definition would go here ----->>

function showPortis() {
  // will only open the portis menu
  web3.currentProvider.showPortis(() => {
    web3.eth.getAccounts().then(e => { 
      web3.eth.defaultAccount = e[0];
      console.log("default: " + web3.eth.defaultAccount);
    });
  })
}

//ABI would go here ----->>

console.log(Nceno);
$("#createBtn").hide();
//show create button only if user agrees to terms
$("#checker").on('click', function() {
if($("#checker").is(':checked')) {
  $("#createBtn").show();
  
} else {
  $("#createBtn").hide();
  
}
});

var access_token
var fitbitUser 
var userID

             
//creating a competitor account
$("#makeAcctBtn").click(function() {
  Nceno.methods.createCompetitor(
    userID,
    web3.utils.padRight(web3.utils.toHex($("#wearable").val()),34),
    web3.utils.padRight(web3.utils.toHex($("#name").val()),34),
    web3.utils.padRight(web3.utils.toHex($("#email").val()),34)
  )
  .send({from: web3.eth.defaultAccount, gas: 200000, gasPrice: 15000000000},
    function(error, result) {
      if (!error){
        $("#makeAcctBtn").hide();
        console.log(result);
      }
      else
      console.error(error);
    }
  );
}); 

//creating a goal
var goalID = web3.utils.padRight(web3.utils.randomHex(3),6);
$("#hostBtn").click(function() {
  updateEthPrice();
  var msgValueHost = Math.floor($("#sliderStake").roundSlider("getValue")*1000000000000000000/ethPrice);
  var usdStakeInWei = msgValueHost.toString();
  //var start = new Date($("#dateChoice").datepicker('getDate')).getTime() / 1000 + sign*pad;
  var start = new Date($("#dateChoice").datepicker('getDate')).getTime() / 1000;
  console.log(
    goalID,
    $("#sliderMins").roundSlider("getValue"),
    usdStakeInWei,
    $("#sliderSes").roundSlider("getValue"),
    $("#sliderWks").roundSlider("getValue"),
    start,
    userID);
  
  //function call:
  Nceno.methods.createGoal(
    goalID,
    $("#sliderMins").roundSlider("getValue"),
    usdStakeInWei,
    $("#sliderSes").roundSlider("getValue"),
    $("#sliderWks").roundSlider("getValue"),
    start,
    userID
  )
  .send({from: web3.eth.defaultAccount, gas: 2000000, gasPrice: 15000000000, value: usdStakeInWei},
    function(error, result) {
      if (!error){
        $("#hostBtn").hide();
        $("#cancelBtn").hide();
        console.log(result);
      }
      else
      console.error(error);
    }
  );
});

var ethPrice;
function echoGoal(){
  //get live eth price
  updateEthPrice();
  var time = new Date($("#dateChoice").val()).getTime() / 1000;
  //echo modal
  $("#host").tab('show');
  $('#popupCreate').modal('show');

  $("#goalEcho").html(
    "You're commiting $" + $("#sliderStake").roundSlider("getValue") + " to working out for " + 
    $("#sliderMins").roundSlider("getValue") +"mins " + $("#sliderSes").roundSlider("getValue")+" times per week for "+ 
    $("#sliderWks").roundSlider("getValue")+  " weeks, starting automatically on "+ $("#dateChoice").datepicker('getDate', true) +
    ". The challenge ID is: "+ goalID+"."
  );
}

function echoJoinedGoal(){
  updateEthPrice();
  var goalid = web3.utils.padRight($("#col[i]").val(),34)
  Nceno.methods.getGoalParams(
    goalid
  )
  .call({from: web3.eth.defaultAccount},
    function(error, result) {
      if (!error){
        var tstamp = new Date(result[4]*1000);
        $("#echoSelectedGoal").html(
          "Details for challenge "+ goalid.slice(0, 12) +
          ": You commited $" + 
          Math.floor(result[1]*ethPrice/1000000000000000000) + 
          " to working out for " + 
          result[0] +
          "mins " + 
          result[2] +
          " times per week for "+ 
          result[3] +
          " weeks, starting automatically at "+ 
          tstamp + 
          "."
        );
        console.log(result);
      }
      else
      console.error(error);
    }
  );
}

var populated = false;
function makeList(){
  //makes a list of active goals for a user
  if(populated === false){
    $("#chIDtoolsUpcoming").selectric();
    $("#chIDtoolsActive").selectric();
    $("#chIDtoolsCompleted").selectric(); 
    var i = 0;
    var j = 0;
    var k = 0;
    var goals = new Array();
    //implement this method
    for (i = 0; i < 15; i++){
      Nceno.methods.getUpcomingGoal(userID, i).call({from: web3.eth.defaultAccount}, function(error, result){
        if(result != undefined){
          goals[i] = result;
          console.log(goals[i]);
          $("#chIDtoolsUpcoming").append('<option>'+ goals[i].slice(0, 8) +'</option>');
          $('#chIDtoolsUpcoming').selectric('refresh');
        }
      });    
    }

    for (j = 0; j < 15; j++){
      Nceno.methods.getActiveGoal(userID, j).call({from: web3.eth.defaultAccount}, function(error, result){
        if(result != undefined){
          goals[j] = result;
          console.log(goals[j]);
          $("#chIDtoolsActive").append('<option>'+ goals[j].slice(0, 8) +'</option>');
          $('#chIDtoolsActive').selectric('refresh');
        }
      });    
    }
    //implement this method 
    for (k = 0; k < 15; k++){
      Nceno.methods.getCompletedGoal(userID, k).call({from: web3.eth.defaultAccount}, function(error, result){
        if(result != undefined){
          goals[k] = result;
          console.log(goals[k]);
          $("#chIDtoolsCompleted").append('<option>'+ goals[k].slice(0, 8) +'</option>');
          $('#chIDtoolsCompleted').selectric('refresh');
        }
      });    
    }
    populated = true;
  }
}



function echoSelectedGoal(){
  updateEthPrice();
  var goalid = web3.utils.padRight($("#chIDtools").val(),34)
  Nceno.methods.getGoalParams(goalid)
  .call({from: web3.eth.defaultAccount},
    function(error, result) {
      if (!error){
        var tstamp = new Date(result[4]*1000);
        $("#echoSelectedGoal").html(
          "Details for challenge "+ goalid.slice(0, 12) +
          ": You commited $" + 
          Math.floor(result[1]*ethPrice/1000000000000000000) + 
          " to working out for " + 
          result[0] +
          "mins " + 
          result[2] +
          " times per week for "+ 
          result[3] +
          " weeks, starting automatically at "+ 
          tstamp + 
          "."
        );
        console.log(result);
      }
      else
      console.error(error);
    }
  );
}

function populateDashboard(){
  var goalid = web3.utils.padRight($("#chIDtools").val(),34)
  Nceno.methods.getGoalParams(goalid)
  .call({from: web3.eth.defaultAccount},
    function(error, result) {
      if (!error){
        //echo challenge
        var tstamp = new Date(result[4]*1000);
        $("#echStake").html(result[1]);
        $("#echWks").html(result[3]);
        $("#echSes").html(result[2]);
        $("#echMins").html(result[0]);
        $("#echComp").html(result[6]);
        $("#echStart").html(tstamp);

        //week by week breakdown


        //charts and stats


        //leaderboard

      }
      else
      console.error(error);
    }
  );


}

$("#claimBtn").click(function() {
  var goalid = web3.utils.padRight($("#chIDtools").val(),34);
  //function call:
  Nceno.methods.claimBonus(
    goalid,
    userID
  )
  .send({from: web3.eth.defaultAccount, gas: 2000000, gasPrice: 15000000000},
    function(error, result) {
      if (!error){
        $("#claimBtn").hide();
        console.log(result);
      }
      else
      console.error(error);
    }
  );
});

$("#logBtn").click(function() {
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.fitbit.com/1/user/'+ fitbitUser +'/activities/heart/date/today/1d.json');
xhr.setRequestHeader("Authorization", 'Bearer ' + access_token);
xhr.onload = function() {
 if (xhr.status === 200) {
    //console.log(xhr.responseText);
    //document.write(xhr.responseText);
    
    var data = JSON.parse(xhr.responseText);
    var obj = [data];
    var fatBurn = obj[0]["activities-heart"][0].value.heartRateZones[1].minutes;
    var cardio = obj[0]["activities-heart"][0].value.heartRateZones[2].minutes;
    var peak = obj[0]["activities-heart"][0].value.heartRateZones[3].minutes;
    var formattedTime = Date.parse(obj[0]["activities-heart"][0].dateTime)/1000 - sign*pad;

    console.log(fitbitUser +"'s active minutes for "+ obj[0]["activities-heart"][0].dateTime);
    console.log(obj[0]["activities-heart"][0].value.heartRateZones[1].minutes);
    console.log(obj[0]["activities-heart"][0].value.heartRateZones[2].minutes);
    console.log(obj[0]["activities-heart"][0].value.heartRateZones[3].minutes);
    console.log("time stamp: "+formattedTime);

    var sessionMins = fatBurn + cardio + peak;
    //var sessionMins = 32; //debug only
    console.log("total session minutes to be logged: "+sessionMins);

  
    Nceno.methods.simplePayout(userID, sessionMins, formattedTime+2, web3.utils.padRight($("#chIDtools").val(),34)).send(
      {from: web3.eth.defaultAccount, gas: 3000000, gasPrice: 15000000000},
        function(error, result) {
          if (!error){
            $("#logBtn").hide();
            console.log(result);
          }
          else
          console.error(error);
        });
  }
  };
  xhr.send()
});//close click(function(){

/*function updateEthPrice() {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      var resp = JSON.parse(xhr.responseText);
      //var obj = [resp];
      ethPrice = resp[0].price_usd;
      console.log(this.responseText);
      console.log(ethPrice);
    }
  });
  xhr.open("GET", "https://cors-escape.herokuapp.com/https://api.coinmarketcap.com/v1/ticker/ethereum/");

  xhr.send();
}*/

function updateEthPrice() {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      var resp = JSON.parse(xhr.responseText);
      //var obj = [resp];
      ethPrice = resp.USD;
      console.log(this.responseText);
      console.log(ethPrice);
    }
  });
  xhr.open("GET", "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD");
  xhr.send();
}


$("#stuff").click(function() {
  console.log($("#dateChoice").val());
});
//$("#sliderMins").roundSlider("getValue")

window.onload = function() {
  var ctx1 = document.getElementById('canvas1').getContext('2d');
  window.myLine1 = new Chart(ctx1, config1);

  var ctx2 = document.getElementById('canvas2').getContext('2d');
  window.myLine2 = new Chart(ctx2, config2);

  var ctx3 = document.getElementById('canvas3').getContext('2d');
  window.myLine3 = new Chart(ctx3, config3);

  $("#sliderMins").roundSlider({
    editableTooltip: false,
    radius: 75,
    width: 14,
    handleSize: "24,12",
    handleShape: "square",
    min: 20,
    max: 120,
    step: 1,
    value: 45,
    sliderType: "min-range",
    tooltipFormat: "tooltipVal1"
  });
  $("#sliderSes").roundSlider({
    editableTooltip: false,
    radius: 75,
    width: 14,
    handleSize: "24,12",
    handleShape: "square",
    min: 2,
    max: 7,
    step: 1,
    value: 3,
    sliderType: "min-range",
    tooltipFormat: "tooltipVal2"
  });
  $("#sliderWks").roundSlider({
    editableTooltip: false,
    radius: 75,
    width: 14,
    handleSize: "24,12",
    handleShape: "square",
    min: 2,
    max: 12,
    step: 2,
    value: 6,
    sliderType: "min-range",
    tooltipFormat: "tooltipVal3"
  });
  $("#sliderStake").roundSlider({
    editableTooltip: false,
    radius: 75,
    width: 14,
    handleSize: "24,12",
    handleShape: "square",
    min: 10,
    max: 300,
    step: 1,
    value: 55,
    sliderType: "min-range",
    tooltipFormat: "tooltipVal4"
  });

  if (window.location.href != 'https://www.nceno.app/app.html'){
    //call fitbit api with user creds
    //getting the access token from url
    access_token = window.location.href.split('#')[1].split('=')[1].split('&')[0];
    // get the userID
    fitbitUser = window.location.href.split('#')[1].split('=')[2].split('&')[0];
    userID = web3.utils.padRight(web3.utils.toHex(fitbitUser),34);
    //log them
    console.log(access_token);
    console.log(fitbitUser);
  }
};
//</script>
// end chart3

function tooltipVal1(args) {
    return args.value + " mins";
}

function tooltipVal2(args) {
    return args.value + "x per week";
}

function tooltipVal3(args) {
    return "for "+args.value + " weeks";
}

function tooltipVal4(args) {
    return "$"+args.value + " at stake";
}



var pad;
var sign;
$.getJSON("https://api.ipdata.co/?api-key=test", function(data) {
  var countryName = data.country_name;
  var timezone = data.time_zone.offset;
  var flag = data.country_code;
  console.log("Country Name: " + countryName);
  console.log("Time Zone: " + timezone);
  sign = parseInt(timezone.slice(0, 1)+1);
  pad = parseInt(timezone.slice(1, 3)*60*60 + timezone.slice(3, 5)*60)
  //pad = parseInt(timezone.slice(0, 1)+1)
  console.log(pad);
  console.log("Flag URL: " + flag);
});             



/*</script>
<!-- / app logic -->*/