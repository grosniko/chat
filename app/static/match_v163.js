class Carousel {

  constructor(element, results) {

    this.board = element

    // add first two cards programmatically
    results.forEach(result => this.push(result, chooser))

    // handle gestures
    this.handle()

  }

  handle() {

    // list all cards
    this.cards = this.board.querySelectorAll('.card')

    // get top card
    this.topCard = this.cards[this.cards.length - 1]

    // get next card
    this.nextCard = this.cards[this.cards.length - 2]

    // if at least one card is present
    if (this.cards.length > 0) {

      // set default top card position and scale
      this.topCard.style.transform =
        'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'

      // destroy previous Hammer instance, if present
      if (this.hammer) this.hammer.destroy()

      // listen for tap and pan gestures on top card
      this.hammer = new Hammer(this.topCard)
      this.hammer.add(new Hammer.Tap())
      this.hammer.add(new Hammer.Pan({
        position: Hammer.position_ALL,
        threshold: 0
      }))

      // pass events data to custom callbacks
      this.hammer.on('tap', (e) => {
        this.onTap(e)
      })
      this.hammer.on('pan', (e) => {
        this.onPan(e)
      })

    }

  }

  onTap(e) {

    // get finger position on top card
    let propX = (e.center.x - e.target.getBoundingClientRect().left) / e.target.clientWidth

    // get rotation degrees around Y axis (+/- 15) based on finger position
    let rotateY = 15 * (propX < 0.05 ? -1 : 1)

    // enable transform transition
    this.topCard.style.transition = 'transform 100ms ease-out'

    // apply rotation around Y axis
    this.topCard.style.transform =
      'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(' + rotateY + 'deg) scale(1)'

    // wait for transition end
    setTimeout(() => {
      // reset transform properties
      this.topCard.style.transform =
        'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
    }, 100)

  }

  onPan(e) {

    if (!this.isPanning) {

      this.isPanning = true

      // remove transition properties
      this.topCard.style.transition = null
      if (this.nextCard) this.nextCard.style.transition = null

      // get top card coordinates in pixels
      let style = window.getComputedStyle(this.topCard)
      let mx = style.transform.match(/^matrix\((.+)\)$/)
      this.startPosX = mx ? parseFloat(mx[1].split(', ')[4]) : 0
      this.startPosY = mx ? parseFloat(mx[1].split(', ')[5]) : 0

      // get top card bounds
      let bounds = this.topCard.getBoundingClientRect()

      // get finger position on top card, top (1) or bottom (-1)
      this.isDraggingFrom =
        (e.center.y - bounds.top) > this.topCard.clientHeight / 2 ? -1 : 1

    }

    // get new coordinates
    let posX = e.deltaX + this.startPosX
    let posY = e.deltaY + this.startPosY

    // get ratio between swiped pixels and the axes
    let propX = e.deltaX / this.board.clientWidth
    let propY = e.deltaY / this.board.clientHeight

    // get swipe direction, left (-1) or right (1)
    let dirX = e.deltaX < 0 ? -1 : 1

    // get degrees of rotation, between 0 and +/- 45
    let deg = this.isDraggingFrom * dirX * Math.abs(propX) * 45

    // get scale ratio, between .95 and 1
    let scale = (95 + (5 * Math.abs(propX))) / 100

    // move and rotate top card
    this.topCard.style.transform =
      'translateX(' + posX + 'px) translateY(' + posY + 'px) rotate(' + deg + 'deg) rotateY(0deg) scale(1)'

    if (card_deck) {
      //fade in and out like icon based on card position
      document.querySelector("#like").style.zIndex = 2
      document.querySelector("#like").classList.remove("fade-out")
      //document.querySelector("#like").style.backgroundImage = dirX == 1 ?
      document.querySelector("#like").style.opacity = dirX == 1 ? (1 + posX / this.board.clientWidth) : -1 * posX / this.board.clientWidth
    }

    // scale up next card
    if (this.nextCard) this.nextCard.style.transform =
      'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(' + scale + ')'

    if (e.isFinal) {

      this.isPanning = false

      let successful = false

      // set back transition properties
      this.topCard.style.transition = 'transform 200ms ease-out'
      if (this.nextCard) this.nextCard.style.transition = 'transform 100ms linear'

      // check threshold and movement direction
      if (propX > 0.25 && e.direction == Hammer.DIRECTION_RIGHT) {

        successful = true
        // get right border position
        posX = this.board.clientWidth

      } else if (propX < -0.25 && e.direction == Hammer.DIRECTION_LEFT) {

        successful = true
        // get left border position
        posX = -(this.board.clientWidth + this.topCard.clientWidth)

      } else if (propY < -0.25 && e.direction == Hammer.DIRECTION_UP) {

        successful = true
        // get top border position
        posY = -(this.board.clientHeight + this.topCard.clientHeight)

      }

      if (successful) {

        // throw card in the chosen direction
        this.topCard.style.transform =
          'translateX(' + posX + 'px) translateY(' + posY + 'px) rotate(' + deg + 'deg)'


        // wait transition end
        setTimeout(() => {
          this.board.removeChild(this.topCard)
          // remove swiped card

          // add new card
          //this.push()
          // handle gestures on new top card


          //ADD CUSTOM LOGIC HERE
          //if left

          if (dirX == 1 && card_deck) {

            selectedProfiles.push({
              "profile": results[profiles_seen],
            })
            // let getCourts_body = make_getCourts_body(chooser, results[profiles_seen])

            // document.getElementById("sorry").style.display = "none"
            // document.getElementById("loading").style.display = "block"


            // makeRequest(getCourts, getCourts_body, "getCourts", profiles_selected)
            //create loading for profile
            // createLoadingForProfile(profiles_selected)

            // let paris_body = make_paris_body(chooser, results[profiles_seen])
            // makeRequest(paris, paris_body, "paris", profiles_selected)

            swipeRight(chooser, results[profiles_seen], profiles_seen)

            profiles_selected += 1
          }
          profiles_seen += 1

          // if (profiles_seen == results.length) {
          //   loadGame()
          // }
          //ADD CUSTOM LOGIC ABOVE

          this.handle()
        }, 200)

      } else {

        // reset cards position and size
        this.topCard.style.transform =
          'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
        if (this.nextCard) this.nextCard.style.transform =
          'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(0.95)'


      }
      if (card_deck) {
        document.querySelector("#like").classList.add("fade-out")
        document.querySelector("#like").style.opacity = 0
        document.querySelector("#like").style.zIndex = 0
      }


    }

  }

  push(result, chooser) {

    let card = document.createElement('div')
    let info = document.createElement('div')
    let info_left = document.createElement('div')
    let info_right = document.createElement('div')
    card.classList.add('card')
    info.classList.add('info')
    info.classList.add('rollDown')

    card.onclick = function(event) {
      if (info.classList.contains("rollDown")) {

        info.classList.remove("rollDown")
        info.classList.add("rollUp")


      } else {
        info.classList.remove("rollUp")
        info.classList.add("rollDown")

      }
    }



    info_left.classList.add('info_left')
    info_right.classList.add('info_right')

    //name
    info_left.innerHTML = "<h1 style = 'margin-block-start:0'>" + result["first name"] + " " + result["last name"] + "</h1>"

    //next available
    let time_text = "(" + timeofday_translateFR(result["next_available_hour"]) + ")"
    info_left.innerHTML += "<h2>" + getDayFR(result["next_available"]) + " " + time_text + "</h2>"

    //correspondance
    info_left.innerHTML += "<br><h3><strong>🎾 Rapport niveau " + Math.ceil(10 * result["WC_level"] / chooser["WC_level"]) / 10 + "x</strong></h3>"
    info_left.innerHTML += "<h3>💚 " + obj_translateFR(result["objective_one"]) + "</h3>"
    info_left.innerHTML += "<h3>💜 " + obj_translateFR(result["objective_two"]) + "</h3>"
    info_left.innerHTML += "<h3>📍" + getLocs(result["locations_declared"]) + "</h3>"
    info_left.innerHTML += "<h4>" + result["bio"] + "</h4>"
    //create card information
    // info_right.innerHTML = truncate(result["bio"], 166)

    card.style.backgroundImage =
      "url('" + result["profile_pic"] + "')"
    card.style.backgroundPositionX = "center"
    card.style.backgroundPositionY = "center"
    card.style.backgroundSize = "cover"

    info.appendChild(info_left)

    card.appendChild(info)

    this.board.insertBefore(card, this.board.firstChild)

  }

}

function getLocs(locations_array) {
  locs_string = ""
  locations_array.forEach(function(location) {
    locs_string += location + ", "
  })
  locs_string = locs_string.substring(0, locs_string.length - 2);
  return locs_string
}

function truncate(input, maxLength) {
  if (input.length > maxLength) {
    return input.substring(0, maxLength - 3) + '...';
  }
  return input;
};



function getDayFR(date_string) {

  function dayName(day) {
    switch (day) {
      case 1:
        day = "lundi";
        break;
      case 2:
        day = "mardi";
        break;
      case 3:
        day = "mercredi"
        break;
      case 4:
        day = "jeudi"
        break;
      case 5:
        day = "vendredi"
        break;
      case 6:
        day = "samedi"
        break;
      case 0:
        day = "dimanche"
        break;
      case "mondays":
        day = "les lundis"
        break;
      case "tuesdays":
        day = "les mardis"
        break;
      case "wednesdays":
        day = "les mercredis"
        break;
      case "thursdays":
        day = "les jeudis"
        break;
      case "fridays":
        day = "les vendredis"
        break;
      case "saturdays":
        day = "les samedis"
        break;
      case "sundays":
        day = "les dimanches"
        break;
      case "weekdays":
        day = "en semaine"
        break;
      case "weekends":
        day = "les weekends"
        break;
      case "alldays":
        day = "tous les jours"
        break;
    }

    return day
  }

  let day =""
  if(date_string.includes("20")){
    //for relative dates
    let card_date = new Date(new Date(date_string).setHours(0, 0, 0, 0))
    let today = new Date(new Date().setHours(0, 0, 0, 0))
    let tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    day = dayName(card_date.getDay())

    if (today.getTime() == card_date.getTime()) {
      day = "aujourd'hui"
    }

    if (tomorrow.getTime() == card_date.getTime()) {
      day = "demain"
    }

  } else {
    day = dayName(date_string)
  }

  return "Dispo " + day
}

function obj_translateFR(objective) {
  let translation = ""
  switch (objective) {
    case "relax":
      translation = "Taper la balle"
      break;

    case "compete":
      translation = "Faire un gros match"
      break;

    case "meet":
      translation = "Rencontrer du monde"
      break;

    case "sport":
      translation = "Brûler des calories"
      break;

    case "technique":
      translation = "Améliorer mon jeu"
      break;

    default:
      translation = "Pratiquer le tennis"
  }

  return translation

}

function timeofday_translateFR(next_available_hour) {
  let translation = next_available_hour
  switch (next_available_hour) {
    case "morning":
      translation = "matin"
      break;

    case "afternoon":
      translation = "après-midi"
      break;

    case "evening":
      translation = "soir"
      break;

    case "ASAP":
      translation = "toute heure"
      break;

  }

  if (Number.isInteger(next_available_hour)) {
    translation = next_available_hour + "h"
  }

  return translation

}

// function toggleShowHideResultsButton(showHideResultsButton_temp) {
//   let resultsButton = document.getElementById("resultsButton")
//   let loading = document.getElementById("loading")
//
//   if (showHideResultsButton_temp == false) {
//     resultsButton.style.display = "inline"
//     loading.style.display = "none"
//   }
//
//   //global
//   showHideResultsButton = true
// }
//
// function createLoadingForProfile(profile_num) {
//   let id = profile_num.toString() + profile_num.toString() + profile_num.toString()
//   document.querySelector('#listSection').innerHTML += '<ul id="' + id + '" class="cd-accordion cd-accordion--animated margin-top-lg margin-bottom-lg">' +
//     '<img style="width:50px; margin-left:45%;" src="assets/img/loading.gif" />' +
//     '</ul>'
// }

// function handleGetCourtsResponse(response, profile_num = 0) {
//   if (response == "error") {
//     return "error"
//   }
//
//   response = JSON.parse(response)
//   if (!("getCourts" in selectedProfiles)) {
//     selectedProfiles[profile_num]["getCourts"] = []
//   }
//
//   selectedProfiles[profile_num]["getCourts"].push(response)
//
//
//   toggleShowHideResultsButton(showHideResultsButton)
//   unfade(document.getElementById('resultsButton'))
//   let id = profile_num.toString() + profile_num.toString() + profile_num.toString()
//   document.getElementById(id).innerHTML = buildAccordion(profile_num)
//
//
// }
//
// function handleParisResponse(response, profile_num = 0) {
//   if (response == "error") {
//     return "error"
//   }
//   response = JSON.parse(response)
//   if (!("paris" in selectedProfiles)) {
//     selectedProfiles[profile_num]["paris"] = []
//   }
//
//   selectedProfiles[profile_num]["paris"].push(response)
//
// }
function hideMatch(e) {
  let match = e.parentNode
  match.classList.remove("floatDown")
  match.classList.add("floatUp")
  setTimeout(function() {

    let board = document.querySelector("#board")
    board.removeChild(match)

  }, 1000)
}

function itsAmatch(chooser, candidate, url) {
  confetti.start();
  let board = document.querySelector("#board")
  let match = document.createElement('div')
  match.classList.add('itsAmatch')
  board.appendChild(match)

  profiles = document.createElement('div')
  profiles.classList.add('match_profiles')

  match.classList.remove("floatUp")
  match.classList.add("floatDown")
  profiles.innerHTML += '<div class="match_text">C\'est un <strong>match</strong> 🎾</div>'
  profiles.innerHTML += '<div class="photoContainer">'+
                        '<img class="matchCircle leftprofile" src="' + chooser["profile_pic"] + '"/>'+
                        '<img class="matchCircle rightprofile" src="' + candidate["profile_pic"] + '"/>'+
                        '</div>'
  profiles.innerHTML += '<a target="blank" class="match_button" href="' + url + '">CHATTER</a><br>'
  profiles.innerHTML += '<a class="match_button" onclick=hideMatch(this.parentNode)>CONTINUER</a><br>'
  profiles.innerHTML += '<div class="sub_text">Tu pourras toujours retrouver ce profil dans ton espace sur messenger</div>'
  match.appendChild(profiles)
  setTimeout(function() {
    confetti.stop();
  }, 3000)
}

function handleGetUIResponse(data, profile_num) {
  if (profile_num == 999) {
    chooser = data
    makeRequest(getUI, results, "getUI", 998, card_deck)
  } else {
    results = data
    loadUI()
  }
}

function handleSwipeRightResponse(status, text, profile_num) {
  if (status != 200) {
    alert("Swipe right problem")
  } else {

    if (text.includes("htt")) {
      //http://wildcard-chat.herokuapp.com/?d=eydyb29tSWQnOiAnMzU4ODE0MzQwNDU3MjUxN18zNjM4NTMzMDQ5NTczMzEyJywgJ21pZCc6IDM1ODgxNDM0MDQ1NzI1MTcsICdvdGhlcl9taWQnOiAzNjM4NTMzMDQ5NTczMzEyLCAnbmFtZSc6ICdOaWtvbGFpJywgJ290aGVyX25hbWUnOiAnS3NlbmlhJywgJ2NyZWF0ZVJvb20nOiAwfQ==
      // handleSwipeRightResponse(200, "http://wildcard-chat.herokuapp.com/?d=eydyb29tSWQnOiAnMzU4ODE0MzQwNDU3MjUxN18zNjM4NTMzMDQ5NTczMzEyJywgJ21pZCc6IDM1ODgxNDM0MDQ1NzI1MTcsICdvdGhlcl9taWQnOiAzNjM4NTMzMDQ5NTczMzEyLCAnbmFtZSc6ICdOaWtvbGFpJywgJ290aGVyX25hbWUnOiAnS3NlbmlhJywgJ2NyZWF0ZVJvb20nOiAwfQ==", 0)

      itsAmatch(chooser, results[profile_num], text)

    }
  }
}

function makeRequest(url, data, requestName, profile_num = 0, card_deck = false) {
  var httpRequest = new XMLHttpRequest(); // Initiatlization of XMLHttpRequest
  if (!httpRequest) {
    alert('Cannot create an XMLHTTP instance');
    return false;
  }


  httpRequest.onreadystatechange = function() { // ready state event, will be executed once the server send back the data
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        if (requestName == "getCourts") {
          // handleGetCourtsResponse(httpRequest.responseText, profile_num)
        } else if (requestName == "paris") {
          // handleParisResponse(httpRequest.responseText, profile_num)
        } else if (requestName == "getUI") {
          handleGetUIResponse(httpRequest.responseText, profile_num)
        } else {
          // handleEmailsResponse(httpRequest.responseText, profile_num)
        }
      } else {
        if (requestName == "getCourts") {
          alert('There was a problem with the getCourts request.');
          // handleGetCourtsResponse("error")
        } else if (requestName == "paris") {
          alert('There was a problem with the paris request.');
          // handleParisResponse("error")
        } else if (requestName == "getUI") {
          alert('There was a problem with the getUI request.');
          handleGetUIResponse("error")
        } else {
          alert('There was a problem to send the message.');
          // handleEmailsResponse("error")
        }


      }
    }
  };

  if (profile_num == 998) {
    data["chooserMid"] = JSON.parse(chooser)["mrs"][0]["messenger user id"]
  }
  
  data["card_deck"] = card_deck
  httpRequest.open("POST", url);
  httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  httpRequest.send(JSON.stringify(data));
}

function swipeRight(chooser, candidate, profile_num) {
  var httpRequest = new XMLHttpRequest(); // Initiatlization of XMLHttpRequest
  if (!httpRequest) {
    alert('Cannot create an XMLHTTP instance');
    return false;
  }


  httpRequest.onreadystatechange = function() { // ready state event, will be executed once the server send back the data
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      handleSwipeRightResponse(httpRequest.status, httpRequest.responseText, profile_num)
    };
  }

  data = {
    "chooserFirstName": chooser['first name'],
    "chooserLastName": chooser['last name'],
    "chooserId": chooser['messenger user id'],
    "candidateId": candidate['messenger user id'],
    "firstName": candidate['first name'],
    "lastName": candidate['last name'],
    "photo": chooser['profile_pic'],
    "objective_one": obj_translateFR(chooser['objective_one']),
    "objective_two": obj_translateFR(chooser['objective_two']),
    "bio": chooser["bio"],
    "declared_gender": chooser["declared_gender"],
    "level_correspondance": (Math.ceil(10 * chooser["WC_level"] / candidate["WC_level"]) / 10)
  }

  url = "https://europe-west1-wildcard-b00.cloudfunctions.net/swipe_right"

  httpRequest.open("POST", url);
  httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  httpRequest.send(JSON.stringify(data));

}
//
// function selectHours(chooser_hours, candidate_hours) {
//   //Convert morning afternoon evening strings
//   function convertToHours(morning_afternoon_or_evening_string) {
//     let hourRange = []
//     switch (morning_afternoon_or_evening_string) {
//       case "morning":
//         hourRange = [6, 7, 8, 9, 10, 11]
//         break;
//       case "afternoon":
//         hourRange = [12, 13, 14, 15, 16, 17]
//         break;
//       case "evening":
//         hourRange = [18, 19, 20, 21, 22, 23]
//         break;
//     }
//     return hourRange
//   }
//
//   if (chooser_hours != "ASAP" && typeof chooser_hours != "number") {
//     chooser_hours = convertToHours(chooser_hours)
//   } else {
//     chooser_hours = [chooser_hours]
//   }
//   if (candidate_hours != "ASAP" && typeof candidate_hours != "number") {
//     candidate_hours = convertToHours(candidate_hours)
//   } else {
//     candidate_hours = [candidate_hours]
//   }
//
//   let hours_to_return = ""
//   if (candidate_hours == "ASAP") {
//     hours_to_return = chooser_hours
//   } else {
//     hours_to_return = candidate_hours
//   }
//   return hours_to_return
// }
//
// function selectPostCodesToSearch(chooserLocs, candidateLocs) {
//   result = []
//
//   for (var x = 0; x < chooserLocs.length; x++) {
//     for (var y = 0; y < candidateLocs.length; y++) {
//       //exact match
//       if (chooserLocs[x] == candidateLocs[y]) {
//         result.push(chooserLocs[x])
//       } else
//         //wide match - if match precise with wide, save the precise match
//         if (chooserLocs[x].substring(0, 2) == candidateLocs[y].substring(0, 2)) {
//           if (chooserLocs[x].length > candidateLocs[y].length) {
//             result.push(chooserLocs[x])
//           } else {
//             result.push(candidateLocs[y])
//           }
//         }
//     }
//   }
//
//   return result
// }

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

function get_dates_from_dayOfWeek(dayOfWeek, candidate_info = false) {
  let today = new Date()
  let tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  function getDateFromDay(day) {
    var dates = {}
    start_day = today
    for (var i = 1; i < 8; i++) {

      dates[start_day.getDay()] = formatDate(start_day)
      start_day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
    }

    date_to_return = ""
    switch (day) {
      case "monday":
        date_to_return = dates[1];
        break;
      case "tuesday":
        date_to_return = dates[2];
        break;
      case "wednesday":
        date_to_return = dates[3];
        break;
      case "thursday":
        date_to_return = dates[4];
        break;
      case "friday":
        date_to_return = dates[5];
        break;
      case "saturday":
        date_to_return = dates[6];
        break;
      case "sunday":
        date_to_return = dates[0];
        break;
    }

    return date_to_return

  }

  switch (dayOfWeek) {
    case "alldays":
      day = today;

      if (candidate_info == true) {

        day = new Date(chooser['next_available'])
      }
      break;
    case "weekdays":
      if (today.getDay() > 0 && today.getDay() < 6) {
        //if monday thru friday
        day = today;
      } else if (tomorrow.getDay() > 0 && tomorrow.getDay() < 6) {
        //if sunday
        day = tomorrow;
      } else {
        //otherwise its a saturday, so coming monday
        day = getDateFromDay("monday")
      }

      if (candidate_info && new Date(chooser['next_available']).getDay() > 0 && new Date(chooser['next_available']).getDay() < 6) {
        day = new Date(chooser['next_available'])
      }
      break;
    case "weekends":
      if (today.getDay() < 1 && today.getDay() > 5) {
        //if saturday thru sunday
        day = today;
      } else if (tomorrow.getDay() < 1 && tomorrow.getDay() > 5) {
        //if friday
        day = tomorrow;
      } else {
        //otherwise its a Mon thru Thurs, so coming saturday
        day = getDateFromDay("saturday")
      }
      break;
    case "mondays":
      if (today.getDay() == 1) {
        day = today;
      } else if (tomorrow.getDay() == 1) {
        day = tomorrow;
      } else {
        day = getDateFromDay("monday")
      }
      break;
    case "tuesdays":
      if (today.getDay() == 2) {
        day = today;
      } else if (tomorrow.getDay() == 2) {
        day = tomorrow;
      } else {
        day = getDateFromDay("tuesday")
      }
      break;
    case "wednesdays":
      if (today.getDay() == 3) {
        day = today;
      } else if (tomorrow.getDay() == 3) {
        day = tomorrow;
      } else {
        day = getDateFromDay("wednesday")
      }
      break;
    case "thursdays":
      if (today.getDay() == 4) {
        day = today;
      } else if (tomorrow.getDay() == 4) {
        day = tomorrow;
      } else {
        day = getDateFromDay("thursday")
      }
      break;
    case "fridays":
      if (today.getDay() == 5) {
        day = today;
      } else if (tomorrow.getDay() == 5) {
        day = tomorrow;
      } else {
        day = getDateFromDay("friday")
      }
      break;
    case "saturdays":
      if (today.getDay() == 6) {
        day = today;
      } else if (tomorrow.getDay() == 6) {
        day = tomorrow;
      } else {
        day = getDateFromDay("saturday")
      }
      break;
    case "sundays":
      if (today.getDay() == 0) {
        day = today;
      } else if (tomorrow.getDay() == 0) {
        day = tomorrow;
      } else {
        day = getDateFromDay("sunday")
      }
      break;
  }
  return day
}
//
// function make_getCourts_body(chooser, candidate) {
//   let req = {
//     "params": [],
//     "date": {},
//     "practice": ["TENNIS"],
//     "surface": [],
//     "roof": []
//   }
//   //geography
//   //Pick the locations to search
//
//   // postcodes = selectPostCodesToSearch(chooser["locations_declared"], candidate["locations_declared"])
//   postcodes = []
//   for (var i = 0; i < chooser["locations_declared"].length; i++) {
//     postcodes.push(chooser["locations_declared"][i])
//     postcodes.push(chooser["locations_declared"][i].substring(0, 2))
//   }
//   for (var i = 0; i < candidate["locations_declared"].length; i++) {
//     postcodes.push(candidate["locations_declared"][i])
//     postcodes.push(candidate["locations_declared"][i].substring(0, 2))
//   }
//   // console.log(postcodes)
//   postcodes = postcodes.filter(onlyUnique)
//
//   for (var i = 0; i < postcodes.length; i++) {
//     req["params"].push({
//       "city": postcodes[i],
//       "distance": "30"
//     })
//   }
//   // console.log(req["params"])
//
//   //Remove ile de France - all postcodes within 92, 93, 94, 75 are considered the same location, so just keep the first one
//   let inParis = false
//   for(var i = 0; i < req["params"].length; i++){
//     let dep = req["params"][i]["city"].substring(0,2)
//     if(dep == "92" || dep == "93" || dep =="94" || dep == "75"){
//       if(inParis){
//         req["params"].splice(i, 1)
//       }
//       inParis = true
//     }
//   }
//   // console.log(req["params"])
//   // Pick the date of the request
//
//   let date_split = candidate["next_available"].split("-")
//   req["date"] = {
//     "day": parseInt(date_split[2]),
//     "month": parseInt(date_split[1]),
//     "year": parseInt(date_split[0])
//   }
//
//   req["hours_to_show"] = selectHours(chooser["next_available_hour"], candidate["next_available_hour"])
//
//   return req
// }
//
// function make_paris_body(chooser, candidate) {
//   let req = {
//     "locations": []
//   }
//
//   //geography
//   //Pick the locations to search
//   let postCodes = selectPostCodesToSearch(chooser["locations_declared"], candidate["locations_declared"])
//   let inParis = false
//   //retain only paris postcodes (72, 92, 93)
//   for (var i = 0; i < postCodes.length; i++) {
//     if (postCodes[i].substring(0, 2) != "75") {
//       if (postCodes[i].substring(0, 2) != "92") {
//         if (postCodes[i].substring(0, 2) != "93") {
//           postCodes.splice(i, 1)
//         } else {
//           postCodes[i] = "93"
//           inParis = true
//         }
//       } else {
//         postCodes[i] = "92"
//         inParis = true
//       }
//     } else {
//       postCodes[i] = "75"
//       inParis = true
//     }
//   }
//
//   if (inParis) {postCodes = postCodes.concat(["75", "92", "93"])}
//   postCodes = postCodes.filter(onlyUnique)
//
//   //if no Paris codes, end function
//   if (postCodes == []) {
//     return "STOP"
//   } else {
//
//     //create hour range
//     // let hours = selectHours(chooser["next_available_hour"], candidate["next_available_hour"])
//     // let hourRange = ""
//     // //if ASAP
//     // if (hours[0] = "ASAP") {
//     //   hourRange = "8-22"
//     //   //if precise hour
//     // } else if (len(hours) == 1) {
//     //   hourRange = hours[0] + "-" + (parseInt(hours[0]) + 1)
//     //   //if time of day, constricting between 8 and 22
//     // } else {
//     //   hours[0] = hours[0] < 8 ? 8 : hours[0]
//     //   hours[hours.length - 1] = hours[hours.length - 1] > 22 ? 22 : hours[hours.length - 1]
//     //   hourRange = hours[0] + "-" + hours[hours.length - 1]
//     // }
//
//     let hourRange = "8-22" //complete hour range for more flexibility
//
//     //manage date
//     let date_split = candidate["next_available"].split("-")
//     let date = date_split[2] + "/" + date_split[1] + "/" + date_split[0]
//
//     //create body
//     for (var i = 0; i < postCodes.length; i++) {
//       req["locations"].push({
//         "location": postCodes[i],
//         "hourRange": hourRange,
//         "when": date
//       })
//     }
//
//     return req
//   }
//
// }

//game
// var id = null
//
// function loadGame() {
//   var canvas = document.getElementById("game"),
//     ctx = canvas.getContext("2d");
//
//   var width = 300;
//   var height = 400;
//
//   canvas.width = width;
//   canvas.height = height;
//
//   // var bg=document.getElementById("bg");
//   // bg.width=width;
//   // bg.height=height;
//   //
//   // var bCtx=bg.getContext("2d");
//   //
//   // bCtx.fillStyle="#222";
//   // bCtx.fillRect(0,0,width,height);
//   //
//   // bCtx.setLineDash([6,12]);
//   // bCtx.moveTo(width/2,0);
//   // bCtx.lineTo(width/2,height);
//   // bCtx.strokeStyle="#fff";
//   // bCtx.lineWidth=4;
//   // bCtx.stroke();
//
//   var view = document.getElementById("view");
//
//   function scaleView() {
//     var scale = Math.min(innerWidth / (width + 50), innerHeight / (height + 50));
//     var transform = "translate(-50%,-50%) scale(" + scale + ")";
//     view.style.WebkitTransform = transform;
//     view.style.MozTransform = transform;
//     view.style.MsTransform = transform;
//     view.style.transform = transform;
//   }
//   scaleView();
//   window.onresize = scaleView;
//
//   function Rect(x, y, w, h) {
//     this.x = x;
//     this.y = y;
//     this.w = w;
//     this.h = h;
//     this.dx = 0;
//     this.dy = 1;
//   }
//   Rect.prototype.move = function(v) {
//     this.x += this.dx * v;
//     this.y += this.dy * v;
//   }
//   Rect.prototype.bounce = function() {
//     var dx = 0;
//     if (this.y < 10 || this.y > height - this.h - 10) this.dy *= -1;
//     if (this.x < 10 || this.x > width - this.w - 10) {
//       dx = this.dx;
//       this.dx *= -1;
//     }
//     return dx;
//   }
//   Rect.prototype.border = function() {
//     this.x = Math.min(Math.max(10, this.x),
//       width - this.w - 10);
//     this.y = Math.min(Math.max(10, this.y),
//       height - this.h - 10);
//   }
//   Rect.prototype.AABB = function(rect) {
//     return this.x < rect.x + rect.w &&
//       this.x + this.w > rect.x &&
//       this.y < rect.y + rect.h &&
//       this.y + this.h > rect.y;
//   }
//   Rect.prototype.draw = function() {
//     ctx.fillStyle = "#fff";
//     ctx.fillRect(this.x, this.y,
//       this.w, this.h);
//   }
//
//   var paddle = new Rect(10, 170, 20, 60);
//   var ai = new Rect(width - 10 - 20, 170, 20, 60);
//
//   var ball = new Rect(140, 190, 20, 20);
//   ball.dx = 1;
//
//
//   var ai_score = 0;
//   var paddle_score = 0;
//
//   var framerate = 1000 / 40;
//   var id;
//
//   function listener() {
//     if (id == null) {
//       id = setInterval(loop, framerate);
//     } else {
//       paddle.dy *= -1;
//     }
//   }
//
//   if (navigator.userAgent.match(/(Android|webOs|iPhone|iPad|BlackBerry|Windows Phone)/i))
//     document.ontouchstart = listener;
//   else document.onclick = listener;
//
//   function loop() {
//     paddle.move(4);
//     paddle.border();
//
//     if (ball.AABB(paddle)) ball.dx = 1;
//     if (ball.AABB(ai)) ball.dx = -1;
//     ball.move(4);
//     var ball_bounce_dx = ball.bounce();
//     ball.border();
//
//     if (ball_bounce_dx == 1) paddle_score++;
//     if (ball_bounce_dx == -1) ai_score++;
//
//     if (ai.y > ball.y + ball.h) ai.dy = -1;
//     if (ai.y + ai.height < ball.y) ai.dy = 1;
//     ai.move(4);
//     ai.bounce();
//     ai.border();
//
//     draw();
//   }
//
//   function draw() {
//     ctx.clearRect(0, 0, width, height);
//     paddle.draw();
//     ai.draw();
//     ball.draw();
//
//     ctx.font = "bold 32px Monospace";
//     ctx.fillStyle = "white";
//     ctx.textBaseline = "top";
//     ctx.textAlign = "right";
//     ctx.fillText(paddle_score, 140, 50);
//     ctx.textAlign = "left";
//     ctx.fillText(ai_score, 160, 50);
//   }
//
//
//   draw();
//
// }
