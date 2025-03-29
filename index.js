const userTab = document.querySelector("[data-yourWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

 
const grandAccessContainer = document.querySelector(".grant-weather-location");
const searchFormContainer = document.querySelector(".search-form-container");
const loadingScreenContainer =document.querySelector(".loading-screen-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer= document.querySelector("[error-container]");


const myapikey ="cdddca5aa7fea8eea80ff3d2953f0948" ;
let currentTab = userTab;
currentTab.classList.add("current-tab");

getfromSessionStorage();    
//   switching of tab

function switchTab(clickedTab){
    errorContainer.classList.remove("active");
    if(currentTab != clickedTab){
        currentTab.classList.remove("current-tab");
        currentTab =clickedTab;
        currentTab.classList.add("current-tab");
        
        
        if(!searchFormContainer.classList.contains("active")){    //    search form container is  invisible
            searchFormContainer.classList.add("active");
            grandAccessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
        }else{
             //    search form is visible so we have to work for user tab  
            userInfoContainer.classList.remove("active");
            searchFormContainer.classList.remove("active");
            //   now we are on your weather page,here we have to render user info on UI for that we need coordinates , so let's check
            //      whether we have coordinates of user in session storage or not
            getfromSessionStorage();
        }
    }

   
    
}

userTab.addEventListener("click",()=>{
    switchTab(userTab);
});
searchTab.addEventListener("click",()=>{
    switchTab(searchTab);
});


//     get from session storage ( coordinates of user )

//    this will check whether coordinates of user is present on session storage or not
function getfromSessionStorage(){

    //  sessionStorage is web storage API that stores data for the duration of the session ( untill the browser tab is closed )

    const localCoordinate = sessionStorage.getItem("user-coordinates");  
    if(!localCoordinate){
        //    if localCoordinates of user is not available
        grandAccessContainer.classList.add("active");
    }else{
        //      localcoordinates are available in session storage

        const Coordinates = JSON.parse(localCoordinate);   //   this will convert json object ( string formatted ) to javascript object 
        fetchWeatherInfo(Coordinates);
    }

}

async function fetchWeatherInfo(Coordinates){
    const lat=Coordinates.lat;          //   we can use object distructing to fetch lat ans lon from Coordinates
    const lon=Coordinates.lon;

    //  make grandaccess containner invisible

    grandAccessContainer.classList.remove("active");
    loadingScreenContainer.classList.add("active");

    //   API call 
    try{
        let response =await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${myapikey}`)
        const data = await response.json();
        loadingScreenContainer.classList.remove("active");
        userInfoContainer.classList.add("active");
        //    rendering data on UI
        renderWeatherInfo(data);
    }
    catch(E){
        loadingScreenContainer.classList.remove("active");
    }
}

function renderWeatherInfo(data){
    //   first we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherDescriptionText = document.querySelector("[data-Weatherdesciption]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temperature = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-clouds]");

     

    cityName.innerText= data?.name;
    // countryIcon.src = `https://flagcdn.com/144*108/${}.png`;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
   
      
    weatherDescriptionText.innerText= data?.weather?.[0]?.description;
    weatherIcon.src =  `https://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temperature.innerText=`${(data?.main?.temp - 273).toFixed(1)}°C`;
    windspeed.innerText= data?.wind?.speed;
    humidity.innerText = data?.main?.humidity;
    cloud.innerText = data?.clouds?.all;


}

//   get location of user

const grantAccessButton= document.querySelector("[data-grantAccess-btn]");
grantAccessButton.addEventListener("click",getlocation) ;


function getlocation(){
    if(navigator.geolocation){           //   this will check whether your browser support geolocatioon
        console.log("geolocation is supported by this browser");
        navigator.geolocation.getCurrentPosition(showPosition,error);
    }else{
        alert("geolocation is not supported by this current browser");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }
    console.log("latitude and longitude");
    console.log(userCoordinates.lat);
    console.log(userCoordinates.lon);

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    console.log("now rendering the info");
    fetchWeatherInfo(userCoordinates);
     
}

let msg = document.querySelector(".message");

function error(e){
    switch(e.code){
        case e.PERMISSION_DENIED:
            msg.innerHTML = "You have denied the permission";
            break;
        case error.POSITION_UNAVAILABLE:
            msg.innerText = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            msg.innerText = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            msg.innerText = "An unknown error occurred.";
            break;
    }
}



const searchInput= document.querySelector("[data-serachinput]");
const searchButton = document.querySelector("[data-searchButton]");
searchButton.addEventListener("click",(e)=>{
    e.preventDefault();
    let cityname = searchInput.value;
    console.log(cityname);
    if(cityname === ""){
        return ;
    }else{
        fetchSearchWeatherInfo(cityname);
    }
})



async function fetchSearchWeatherInfo(cityname){
    loadingScreenContainer.classList.add("active");
    userInfoContainer.classList.remove("active");
    grandAccessContainer.classList.remove("active");

    try{
        const response =await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${myapikey}`);
        const data =await response.json();
        if (!data.sys) {
            throw data;
          }
        errorContainer.classList.remove("active");
        loadingScreenContainer.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }catch(E){
        loadingScreenContainer.classList.remove("active");
        userInfoContainer.classList.remove("active");
        errorContainer.classList.add("active");
    }
}