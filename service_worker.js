
const vkliveSite = new RegExp(/^(https:\/\/)live\.vkvideo\.ru/);
const vkliveStream = new RegExp(/^(https:\/\/)live\.vkvideo\.ru\/([-a-zA-Z0-9%_&.]*?)$/);

const vkliveKeys = [
  { key: 'vklivePointsKey', value: 'on' },
  { key: 'vkliveHeartsKey', value: 'on' },
  { key: 'vkliveRecommendationsKey', value: 'off' },
  { key: 'vklivePortalKey', value: 'off' },
  { key: 'vkliveUnfixedKey', value: 'off' }
];

Promise.all(vkliveKeys.map(({key,value}) =>
  chrome.storage.local.get([key]).then((r) => {
    if(r[key] == null) chrome.storage.local.set({[key]:value});
  })
));

function vkliveFunc(dUrl,dTab){
  if(vkliveSite.test(dUrl) === true){
    chrome.scripting.executeScript({
      target: {tabId: dTab},
      func: vkliveSiteHelper
    });
  };

  if(vkliveStream.test(dUrl) === true){
    chrome.scripting.executeScript({
      target: {tabId: dTab},
      func: vkliveStreamHelper
    });
  };
};

const filter = {url: [{hostContains: 'live.vkvideo.ru'}]};
const transition = ['typed','link','reload','generated','start_page','other'];

chrome.webNavigation.onHistoryStateUpdated.addListener(details=>{
  vkliveFunc(details.url,details.tabId);
},filter);

chrome.webNavigation.onCommitted.addListener(details=>{
  if(transition.includes(details.transitionType)){
    vkliveFunc(details.url,details.tabId);
  };
},filter);

function vkliveSiteHelper(){

  chrome.storage.local.get(['vkliveUnfixedKey']).then((r)=>{
    if(r.vkliveUnfixedKey === 'on'){
      let appWidth = document.querySelector('[class*="App_appChannelPage"]');
      if(appWidth) appWidth.style.setProperty('min-width','100%','important');
    };
  });

  let channelsRoot = document.querySelector('[class*="Channels_root"]');
  if(channelsRoot){

    let channelsPanel=()=>{

      // рекомендации
      chrome.storage.local.get(['vkliveRecommendationsKey']).then((r)=>{
        if(r.vkliveRecommendationsKey === 'on'){
          let channelsRecommendations = channelsRoot.querySelector('[class*="ChannelsRecommendations_root"]');
          if(channelsRecommendations) channelsRecommendations.style.display = "none";
          let channelsDelimiter = channelsRoot.querySelector('[class*="Channels_delimiter"]');
          if(channelsDelimiter) channelsDelimiter.style.display = "none";
        };
      });

      // кнопка портала
      chrome.storage.local.get(['vklivePortalKey']).then((r)=>{
        if(r.vklivePortalKey === 'on'){
          let channelsPortalButton = channelsRoot.querySelector('[class*="ChannelsPortalButton_root"]');
          if(channelsPortalButton) channelsPortalButton.style.display = "none";
        };
      });
    };
    channelsPanel();

    let observerChannels = new MutationObserver((m) => {
      m.forEach((mutation) => {
        if(mutation.type === 'childList') channelsPanel();
      });
    });
    observerChannels.observe(channelsRoot,{subtree:true,childList:true});
  };
};

function vkliveStreamHelper(){
  // баллы
  let pointsInterval = setInterval(()=>{
    let pointsButton = document.querySelector('[class*="PointActions_root"]');
    if(pointsButton){
      if(pointsInterval) clearInterval(pointsInterval);

      chrome.storage.local.get(['vklivePointsKey']).then((r)=>{
        if(r.vklivePointsKey === 'on'){
          let pointsCollecting=()=>{
            let bonus = document.querySelector('[class*="PointActions_buttonBonus"]');
            if(bonus)bonus.click();
          };
          pointsCollecting();

          let observerPoints = new MutationObserver((m) => {
            m.forEach((mutation) => {
              if(mutation.type === 'childList') pointsCollecting();
            });
          });
          observerPoints.observe(pointsButton,{subtree:true,childList:true});

        };
      });

    };
  },500);

  // сердечко
  let heartsInterval = setInterval(()=>{
    let heartsButton = document.querySelector('[class*="LikeButton_container"]');
    if(heartsButton){
      if(heartsInterval) clearInterval(heartsInterval)
      chrome.storage.local.get(['vkliveHeartsKey']).then((r)=>{
        if(r.vkliveHeartsKey === 'on'){
          let heartStatus = heartsButton.querySelector('[class*="LikeButton_iconLiked"]');
          if(heartStatus == null) heartsButton.click();
        };
      });
    };
  },500);

  setTimeout(()=>{
    if(pointsInterval) clearInterval(pointsInterval);
    if(heartsInterval) clearInterval(heartsInterval);
  },5000);

};
